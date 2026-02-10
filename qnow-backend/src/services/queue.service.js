const Queue = require('../models/Queue.model');
const Counter = require('../models/Counter.model');
const Business = require('../models/Business.model');
const { QUEUE_STATUS } = require('../config/constants');
const { sendNotification } = require('./notification.service');

// Queue management service
class QueueService {
  
  // Calculate estimated wait time
  static async calculateEstimatedWaitTime(businessId, position) {
    try {
      const business = await Business.findById(businessId);
      if (!business) return 0;
      
      const counters = await Counter.findByBusinessId(businessId);
      const activeCounters = counters.filter(c => 
        c.isActive && (c.status === 'active' || c.status === 'busy')
      );
      
      if (activeCounters.length === 0) return 0;
      
      const avgServingTime = business.stats.avgServingTime || 5; // Default 5 minutes
      return Math.ceil(position / activeCounters.length * avgServingTime);
    } catch (error) {
      console.error('Calculate estimated wait time error:', error);
      return 0;
    }
  }
  
  // Update positions after queue changes
  static async updateQueuePositions(businessId) {
    try {
      const waitingQueue = await Queue.findByBusinessId(businessId, {
        status: QUEUE_STATUS.WAITING
      });
      
      // Sort by join time
      const sortedQueue = waitingQueue.sort((a, b) => 
        a.joinedAt.toDate() - b.joinedAt.toDate()
      );
      
      // Update positions
      const updatePromises = sortedQueue.map((queue, index) => 
        Queue.update(queue.id, { position: index + 1 })
      );
      
      await Promise.all(updatePromises);
      
      // Check for customers who need to be notified
      await QueueService.checkForNotifications(businessId, sortedQueue);
      
      return sortedQueue;
    } catch (error) {
      throw new Error(`Update queue positions error: ${error.message}`);
    }
  }
  
  // Check and send notifications for customers near the front
  static async checkForNotifications(businessId, queue) {
    try {
      const business = await Business.findById(businessId);
      if (!business || !business.settings.notifyBeforePositions) return;
      
      const notifyPosition = business.settings.notifyBeforePositions;
      
      for (const customer of queue) {
        if (customer.position <= notifyPosition && 
            !customer.notifiedPositions.includes(customer.position)) {
          
          // Send notification
          await sendNotification({
            type: 'near_turn',
            customerId: customer.customerId,
            customerPhone: customer.customerPhone,
            customerEmail: customer.customerEmail,
            data: {
              queueNumber: customer.queueNumber,
              customerName: customer.customerName,
              positionsAhead: customer.position - 1,
              estimatedTime: await QueueService.calculateEstimatedWaitTime(
                businessId, 
                customer.position - 1
              )
            }
          });
          
          // Update notified positions
          const updatedPositions = [...customer.notifiedPositions, customer.position];
          await Queue.update(customer.id, {
            notifiedPositions: updatedPositions
          });
        }
      }
    } catch (error) {
      console.error('Check for notifications error:', error);
    }
  }
  
  // Get queue statistics
  static async getQueueStats(businessId) {
    try {
      const queue = await Queue.findByBusinessId(businessId);
      
      const stats = {
        total: queue.length,
        waiting: queue.filter(q => q.status === QUEUE_STATUS.WAITING).length,
        called: queue.filter(q => q.status === QUEUE_STATUS.CALLED).length,
        serving: queue.filter(q => q.status === QUEUE_STATUS.SERVING).length,
        completed: queue.filter(q => q.status === QUEUE_STATUS.COMPLETED).length,
        skipped: queue.filter(q => q.status === QUEUE_STATUS.SKIPPED).length,
        cancelled: queue.filter(q => q.status === QUEUE_STATUS.CANCELLED).length
      };
      
      // Calculate average wait times
      const completedQueues = queue.filter(q => q.status === QUEUE_STATUS.COMPLETED);
      if (completedQueues.length > 0) {
        const totalWaitTime = completedQueues.reduce((sum, q) => {
          if (q.calledAt && q.joinedAt) {
            return sum + (q.calledAt.toDate() - q.joinedAt.toDate());
          }
          return sum;
        }, 0);
        
        const totalServingTime = completedQueues.reduce((sum, q) => {
          if (q.completedAt && q.servingAt) {
            return sum + (q.completedAt.toDate() - q.servingAt.toDate());
          }
          return sum;
        }, 0);
        
        stats.avgWaitTime = Math.round(totalWaitTime / (completedQueues.length * 60000)); // in minutes
        stats.avgServingTime = Math.round(totalServingTime / (completedQueues.length * 60000)); // in minutes
      } else {
        stats.avgWaitTime = 0;
        stats.avgServingTime = 0;
      }
      
      return stats;
    } catch (error) {
      throw new Error(`Get queue stats error: ${error.message}`);
    }
  }
  
  // Clean up old completed queues (30 days old)
  static async cleanupOldQueues(businessId, daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      const oldQueues = await Queue.findByBusinessId(businessId);
      const toDelete = oldQueues.filter(q => 
        q.status === QUEUE_STATUS.COMPLETED && 
        q.completedAt && 
        q.completedAt.toDate() < cutoffDate
      );
      
      const deletePromises = toDelete.map(queue => Queue.delete(queue.id));
      await Promise.all(deletePromises);
      
      return { deleted: toDelete.length };
    } catch (error) {
      throw new Error(`Cleanup old queues error: ${error.message}`);
    }
  }
  
  // Transfer all queues from one counter to another
  static async transferAllQueues(businessId, fromCounterId, toCounterId) {
    try {
      const queue = await Queue.findByBusinessId(businessId, {
        status: QUEUE_STATUS.CALLED
      });
      
      const queuesToTransfer = queue.filter(q => q.counterId === fromCounterId);
      
      const transferPromises = queuesToTransfer.map(q => 
        Queue.update(q.id, { counterId: toCounterId })
      );
      
      await Promise.all(transferPromises);
      
      // Update counters
      const fromCounter = await Counter.findById(fromCounterId);
      const toCounter = await Counter.findById(toCounterId);
      
      if (fromCounter) {
        await Counter.update(fromCounterId, {
          currentQueueId: null,
          currentQueueNumber: '',
          status: 'active'
        });
      }
      
      if (toCounter && queuesToTransfer.length > 0) {
        const firstQueue = queuesToTransfer[0];
        await Counter.assignQueue(toCounterId, firstQueue.id, firstQueue.queueNumber);
      }
      
      return {
        transferred: queuesToTransfer.length,
        fromCounter: fromCounterId,
        toCounter: toCounterId
      };
    } catch (error) {
      throw new Error(`Transfer all queues error: ${error.message}`);
    }
  }
  
  // Get queue by customer ID with business info
  static async getCustomerQueues(customerId) {
    try {
      const queues = await Queue.findByCustomerId(customerId);
      
      const enrichedQueues = await Promise.all(
        queues.map(async (queue) => {
          const business = await Business.findById(queue.businessId);
          return {
            ...queue,
            businessName: business ? business.name : 'Unknown Business',
            businessLogo: business ? business.logo : ''
          };
        })
      );
      
      return enrichedQueues;
    } catch (error) {
      throw new Error(`Get customer queues error: ${error.message}`);
    }
  }
  
  // Check if business is currently open
  static async isBusinessOpen(businessId) {
    try {
      const business = await Business.findById(businessId);
      if (!business) return false;
      
      const now = new Date();
      const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const hours = business.operatingHours[day];
      
      if (!hours || !hours.isOpen) return false;
      
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [openHour, openMinute] = hours.open.split(':').map(Number);
      const [closeHour, closeMinute] = hours.close.split(':').map(Number);
      const openTime = openHour * 60 + openMinute;
      const closeTime = closeHour * 60 + closeMinute;
      
      return currentTime >= openTime && currentTime <= closeTime;
    } catch (error) {
      console.error('Check business open error:', error);
      return false;
    }
  }
}

module.exports = QueueService;