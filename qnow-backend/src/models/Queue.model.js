const { db, FieldValue, Timestamp } = require('../config/firebase-admin.config');
const { COLLECTIONS, QUEUE_STATUS } = require('../config/constants');

class Queue {
  constructor(data) {
    this.id = data.id || null;
    this.queueNumber = data.queueNumber || '';
    this.businessId = data.businessId || '';
    this.customerId = data.customerId || '';
    this.customerName = data.customerName || '';
    this.customerPhone = data.customerPhone || '';
    this.customerEmail = data.customerEmail || '';
    this.serviceType = data.serviceType || 'general';
    this.status = data.status || QUEUE_STATUS.WAITING;
    this.position = data.position || 1;
    this.waitTime = data.waitTime || 0; // in minutes
    this.estimatedTime = data.estimatedTime || 0; // in minutes
    this.counterId = data.counterId || null;
    this.calledAt = data.calledAt || null;
    this.servingAt = data.servingAt || null;
    this.completedAt = data.completedAt || null;
    this.joinedAt = data.joinedAt || Timestamp.now();
    this.notes = data.notes || '';
    this.priority = data.priority || false;
    this.notifiedPositions = data.notifiedPositions || [];
    this.metadata = data.metadata || {};
  }

  toFirestore() {
    return {
      queueNumber: this.queueNumber,
      businessId: this.businessId,
      customerId: this.customerId,
      customerName: this.customerName,
      customerPhone: this.customerPhone,
      customerEmail: this.customerEmail,
      serviceType: this.serviceType,
      status: this.status,
      position: this.position,
      waitTime: this.waitTime,
      estimatedTime: this.estimatedTime,
      counterId: this.counterId,
      calledAt: this.calledAt,
      servingAt: this.servingAt,
      completedAt: this.completedAt,
      joinedAt: this.joinedAt,
      notes: this.notes,
      priority: this.priority,
      notifiedPositions: this.notifiedPositions,
      metadata: this.metadata
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Queue({
      id: doc.id,
      ...data
    });
  }

  // Static methods
  static async create(queueData) {
    try {
      // Generate queue number
      const business = await require('./Business.model').findById(queueData.businessId);
      if (!business) {
        throw new Error('Business not found');
      }

      // Get last queue number for this business
      const lastQueue = await Queue.getLastQueueNumber(queueData.businessId);
      const nextNumber = lastQueue ? parseInt(lastQueue.queueNumber.substr(1)) + 1 : 1;
      queueData.queueNumber = `Q${nextNumber.toString().padStart(3, '0')}`;

      // Calculate position
      const waitingCount = await Queue.getWaitingCount(queueData.businessId);
      queueData.position = waitingCount + 1;

      const queue = new Queue(queueData);
      const queueRef = db.collection(COLLECTIONS.QUEUES).doc();
      queue.id = queueRef.id;
      
      await queueRef.set(queue.toFirestore());
      
      // Update business stats
      await require('./Business.model').updateStats(queueData.businessId, {
        totalCustomersServed: FieldValue.increment(0),
        avgWaitTime: 0 // Will be calculated separately
      });
      
      return queue;
    } catch (error) {
      throw new Error(`Error creating queue: ${error.message}`);
    }
  }

  static async findById(queueId) {
    try {
      const queueRef = db.collection(COLLECTIONS.QUEUES).doc(queueId);
      const doc = await queueRef.get();
      
      if (!doc.exists) {
        return null;
      }
      
      return Queue.fromFirestore(doc);
    } catch (error) {
      throw new Error(`Error finding queue: ${error.message}`);
    }
  }

  static async findByBusinessId(businessId, filters = {}) {
    try {
      let query = db.collection(COLLECTIONS.QUEUES)
        .where('businessId', '==', businessId)
        .orderBy('joinedAt', 'desc');
      
      // Apply filters
      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }
      
      if (filters.serviceType) {
        query = query.where('serviceType', '==', filters.serviceType);
      }
      
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      const snapshot = await query.get();
      
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map(doc => Queue.fromFirestore(doc));
    } catch (error) {
      throw new Error(`Error finding queues by business: ${error.message}`);
    }
  }

  static async findByCustomerId(customerId) {
    try {
      const queuesRef = db.collection(COLLECTIONS.QUEUES);
      const snapshot = await queuesRef
        .where('customerId', '==', customerId)
        .orderBy('joinedAt', 'desc')
        .limit(10)
        .get();
      
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map(doc => Queue.fromFirestore(doc));
    } catch (error) {
      throw new Error(`Error finding queues by customer: ${error.message}`);
    }
  }

  static async findByQueueNumber(businessId, queueNumber) {
    try {
      const queuesRef = db.collection(COLLECTIONS.QUEUES);
      const snapshot = await queuesRef
        .where('businessId', '==', businessId)
        .where('queueNumber', '==', queueNumber)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      return Queue.fromFirestore(doc);
    } catch (error) {
      throw new Error(`Error finding queue by number: ${error.message}`);
    }
  }

  static async update(queueId, updateData) {
    try {
      const queueRef = db.collection(COLLECTIONS.QUEUES).doc(queueId);
      
      // If status is changing to completed, set completedAt
      if (updateData.status === QUEUE_STATUS.COMPLETED && !updateData.completedAt) {
        updateData.completedAt = Timestamp.now();
      }
      
      // If status is changing to serving, set servingAt
      if (updateData.status === QUEUE_STATUS.SERVING && !updateData.servingAt) {
        updateData.servingAt = Timestamp.now();
      }
      
      await queueRef.update(updateData);
      return await Queue.findById(queueId);
    } catch (error) {
      throw new Error(`Error updating queue: ${error.message}`);
    }
  }

  static async delete(queueId) {
    try {
      const queueRef = db.collection(COLLECTIONS.QUEUES).doc(queueId);
      await queueRef.delete();
      return true;
    } catch (error) {
      throw new Error(`Error deleting queue: ${error.message}`);
    }
  }

  static async getWaitingCount(businessId) {
    try {
      const queuesRef = db.collection(COLLECTIONS.QUEUES);
      const snapshot = await queuesRef
        .where('businessId', '==', businessId)
        .where('status', '==', QUEUE_STATUS.WAITING)
        .get();
      
      return snapshot.size;
    } catch (error) {
      throw new Error(`Error getting waiting count: ${error.message}`);
    }
  }

  static async getLastQueueNumber(businessId) {
    try {
      const queuesRef = db.collection(COLLECTIONS.QUEUES);
      const snapshot = await queuesRef
        .where('businessId', '==', businessId)
        .orderBy('queueNumber', 'desc')
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return null;
      }
      
      return Queue.fromFirestore(snapshot.docs[0]);
    } catch (error) {
      throw new Error(`Error getting last queue number: ${error.message}`);
    }
  }

  static async getCurrentQueue(businessId) {
    try {
      const queues = await Queue.findByBusinessId(businessId, {
        status: QUEUE_STATUS.WAITING,
        limit: 50
      });
      
      // Sort by position
      return queues.sort((a, b) => a.position - b.position);
    } catch (error) {
      throw new Error(`Error getting current queue: ${error.message}`);
    }
  }

  static async getAnalytics(businessId, startDate, endDate) {
    try {
      const queuesRef = db.collection(COLLECTIONS.QUEUES);
      let query = queuesRef.where('businessId', '==', businessId);
      
      if (startDate) {
        query = query.where('joinedAt', '>=', Timestamp.fromDate(new Date(startDate)));
      }
      
      if (endDate) {
        query = query.where('joinedAt', '<=', Timestamp.fromDate(new Date(endDate)));
      }
      
      const snapshot = await query.get();
      
      const analytics = {
        total: 0,
        completed: 0,
        cancelled: 0,
        avgWaitTime: 0,
        avgServingTime: 0,
        byHour: {},
        byServiceType: {}
      };
      
      let totalWaitTime = 0;
      let totalServingTime = 0;
      let completedCount = 0;
      
      snapshot.forEach(doc => {
        const queue = Queue.fromFirestore(doc);
        analytics.total++;
        
        // Count by status
        if (queue.status === QUEUE_STATUS.COMPLETED) {
          analytics.completed++;
          completedCount++;
          
          // Calculate wait time
          if (queue.calledAt && queue.joinedAt) {
            const waitTime = queue.calledAt.toDate() - queue.joinedAt.toDate();
            totalWaitTime += waitTime / (1000 * 60); // Convert to minutes
          }
          
          // Calculate serving time
          if (queue.completedAt && queue.servingAt) {
            const servingTime = queue.completedAt.toDate() - queue.servingAt.toDate();
            totalServingTime += servingTime / (1000 * 60); // Convert to minutes
          }
        } else if (queue.status === QUEUE_STATUS.CANCELLED) {
          analytics.cancelled++;
        }
        
        // Count by hour
        const hour = queue.joinedAt.toDate().getHours();
        analytics.byHour[hour] = (analytics.byHour[hour] || 0) + 1;
        
        // Count by service type
        analytics.byServiceType[queue.serviceType] = (analytics.byServiceType[queue.serviceType] || 0) + 1;
      });
      
      // Calculate averages
      if (completedCount > 0) {
        analytics.avgWaitTime = Math.round(totalWaitTime / completedCount);
        analytics.avgServingTime = Math.round(totalServingTime / completedCount);
      }
      
      return analytics;
    } catch (error) {
      throw new Error(`Error getting queue analytics: ${error.message}`);
    }
  }
}

module.exports = Queue;