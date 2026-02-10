const Queue = require('../models/Queue.model');
const Counter = require('../models/Counter.model');
const Business = require('../models/Business.model');
const { QUEUE_STATUS } = require('../config/constants');
const { sendNotification } = require('../services/notification.service');

// Join queue as customer
exports.joinQueue = async (req, res) => {
  try {
    const { businessId, serviceType, customerName, customerPhone, customerEmail, notes } = req.body;
    
    // Check if business exists and is active
    const business = await Business.findById(businessId);
    if (!business || !business.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Business not found or inactive'
      });
    }
    
    // Check if business allows remote joining
    if (!business.settings.allowRemoteJoin) {
      return res.status(403).json({
        success: false,
        message: 'Remote queue joining is not allowed by this business'
      });
    }
    
    // Check if business is open
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const hours = business.operatingHours[day];
    
    if (!hours || !hours.isOpen) {
      return res.status(400).json({
        success: false,
        message: 'Business is currently closed'
      });
    }
    
    // Check current time against operating hours
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMinute] = hours.open.split(':').map(Number);
    const [closeHour, closeMinute] = hours.close.split(':').map(Number);
    const openTime = openHour * 60 + openMinute;
    const closeTime = closeHour * 60 + closeMinute;
    
    if (currentTime < openTime || currentTime > closeTime) {
      return res.status(400).json({
        success: false,
        message: 'Business is currently closed'
      });
    }
    
    // Check queue length limit
    const waitingCount = await Queue.getWaitingCount(businessId);
    if (waitingCount >= business.settings.maxQueueLength) {
      return res.status(400).json({
        success: false,
        message: 'Queue is full. Please try again later.'
      });
    }
    
    // Calculate estimated wait time
    const counters = await Counter.findByBusinessId(businessId);
    const activeCounters = counters.filter(c => 
      c.isActive && (c.status === 'active' || c.status === 'busy')
    );
    
    let estimatedTime = 0;
    if (activeCounters.length > 0) {
      const avgServingTime = business.stats.avgServingTime || 5; // Default 5 minutes
      estimatedTime = Math.ceil((waitingCount + 1) / activeCounters.length * avgServingTime);
    }
    
    // Create queue entry
    const queueData = {
      businessId,
      serviceType,
      customerName: customerName || 'Walk-in Customer',
      customerPhone: customerPhone || '',
      customerEmail: customerEmail || '',
      customerId: req.user?.userId || null,
      waitTime: estimatedTime,
      estimatedTime,
      notes: notes || '',
      status: QUEUE_STATUS.WAITING
    };
    
    const queue = await Queue.create(queueData);
    
    // Send notification to business (if enabled)
    if (business.settings.enablePushNotifications) {
      await sendNotification({
        type: 'customer_joined',
        businessId,
        data: {
          queueNumber: queue.queueNumber,
          customerName: queue.customerName,
          position: queue.position,
          serviceType: queue.serviceType
        }
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Successfully joined the queue',
      queue: {
        id: queue.id,
        queueNumber: queue.queueNumber,
        position: queue.position,
        estimatedTime: queue.estimatedTime,
        businessName: business.name,
        serviceType: queue.serviceType,
        joinedAt: queue.joinedAt
      }
    });
  } catch (error) {
    console.error('Join queue error:', error);
    res.status(500).json({
      success: false,
      message: 'Error joining queue',
      error: error.message
    });
  }
};

// Get current queue for business
exports.getCurrentQueue = async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const { status, serviceType, limit = 50 } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (serviceType) filters.serviceType = serviceType;
    if (limit) filters.limit = parseInt(limit);
    
    const queue = await Queue.findByBusinessId(businessId, filters);
    
    // Sort by position for waiting customers
    const sortedQueue = [...queue].sort((a, b) => {
      if (a.status === QUEUE_STATUS.WAITING && b.status === QUEUE_STATUS.WAITING) {
        return a.position - b.position;
      }
      return 0;
    });
    
    res.status(200).json({
      success: true,
      queue: sortedQueue,
      stats: {
        total: queue.length,
        waiting: queue.filter(q => q.status === QUEUE_STATUS.WAITING).length,
        serving: queue.filter(q => q.status === QUEUE_STATUS.SERVING).length,
        completed: queue.filter(q => q.status === QUEUE_STATUS.COMPLETED).length
      }
    });
  } catch (error) {
    console.error('Get current queue error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching queue',
      error: error.message
    });
  }
};

// Call next customer
exports.callNextCustomer = async (req, res) => {
  try {
    const { counterId, serviceType } = req.body;
    const businessId = req.user.businessId;
    
    // Get counter
    let counter;
    if (counterId) {
      counter = await Counter.findById(counterId);
      if (!counter || counter.businessId !== businessId) {
        return res.status(404).json({
          success: false,
          message: 'Counter not found'
        });
      }
    } else {
      // Find first available counter for the service type
      const counters = await Counter.findByBusinessId(businessId);
      counter = counters.find(c => 
        c.isActive && 
        c.status === 'active' && 
        (!serviceType || c.serviceType === serviceType || c.serviceType === 'general')
      );
      
      if (!counter) {
        return res.status(400).json({
          success: false,
          message: 'No available counters for this service'
        });
      }
    }
    
    // Get next customer in queue
    const filters = {
      status: QUEUE_STATUS.WAITING,
      limit: 1
    };
    
    if (serviceType && serviceType !== 'all') {
      filters.serviceType = serviceType;
    }
    
    const waitingQueue = await Queue.findByBusinessId(businessId, filters);
    
    if (waitingQueue.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No customers waiting in queue'
      });
    }
    
    const nextCustomer = waitingQueue[0];
    
    // Update queue status
    const updatedQueue = await Queue.update(nextCustomer.id, {
      status: QUEUE_STATUS.CALLED,
      counterId: counter.id,
      calledAt: new Date()
    });
    
    // Update counter
    await Counter.assignQueue(counter.id, nextCustomer.id, nextCustomer.queueNumber);
    
    // Send notification to customer
    await sendNotification({
      type: 'call_next',
      customerId: nextCustomer.customerId,
      customerPhone: nextCustomer.customerPhone,
      customerEmail: nextCustomer.customerEmail,
      data: {
        queueNumber: nextCustomer.queueNumber,
        counterName: counter.name,
        counterNumber: counter.number,
        message: `Please proceed to ${counter.name}`
      }
    });
    
    // Broadcast to all connected clients
    req.io.to(`business:${businessId}`).emit('queue-updated', {
      type: 'customer_called',
      queue: updatedQueue,
      counter: counter
    });
    
    res.status(200).json({
      success: true,
      message: 'Customer called successfully',
      customer: updatedQueue,
      counter
    });
  } catch (error) {
    console.error('Call next customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calling next customer',
      error: error.message
    });
  }
};

// Start serving customer
exports.startServing = async (req, res) => {
  try {
    const { queueId } = req.params;
    const businessId = req.user.businessId;
    
    // Get queue
    const queue = await Queue.findById(queueId);
    if (!queue || queue.businessId !== businessId) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found'
      });
    }
    
    if (queue.status !== QUEUE_STATUS.CALLED) {
      return res.status(400).json({
        success: false,
        message: 'Customer must be called first'
      });
    }
    
    // Update queue status
    const updatedQueue = await Queue.update(queueId, {
      status: QUEUE_STATUS.SERVING,
      servingAt: new Date()
    });
    
    // Broadcast update
    req.io.to(`business:${businessId}`).emit('queue-updated', {
      type: 'customer_serving',
      queue: updatedQueue
    });
    
    res.status(200).json({
      success: true,
      message: 'Started serving customer',
      queue: updatedQueue
    });
  } catch (error) {
    console.error('Start serving error:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting service',
      error: error.message
    });
  }
};

// Complete service
exports.completeService = async (req, res) => {
  try {
    const { queueId } = req.params;
    const businessId = req.user.businessId;
    
    // Get queue
    const queue = await Queue.findById(queueId);
    if (!queue || queue.businessId !== businessId) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found'
      });
    }
    
    // Update queue status
    const updatedQueue = await Queue.update(queueId, {
      status: QUEUE_STATUS.COMPLETED,
      completedAt: new Date()
    });
    
    // Update counter if assigned
    if (queue.counterId) {
      await Counter.completeQueue(queue.counterId);
    }
    
    // Update business stats
    const business = await Business.findById(businessId);
    if (business) {
      const servingTime = queue.servingAt ? 
        (new Date() - queue.servingAt.toDate()) / (1000 * 60) : 0; // in minutes
      
      const newTotal = business.stats.totalCustomersServed + 1;
      const newAvg = (business.stats.avgServingTime * business.stats.totalCustomersServed + servingTime) / newTotal;
      
      await Business.updateStats(businessId, {
        totalCustomersServed: newTotal,
        avgServingTime: newAvg
      });
    }
    
    // Send notification to customer
    await sendNotification({
      type: 'service_completed',
      customerId: queue.customerId,
      customerPhone: queue.customerPhone,
      customerEmail: queue.customerEmail,
      data: {
        queueNumber: queue.queueNumber,
        message: 'Thank you for your visit. We hope to see you again!'
      }
    });
    
    // Broadcast update
    req.io.to(`business:${businessId}`).emit('queue-updated', {
      type: 'customer_completed',
      queue: updatedQueue
    });
    
    res.status(200).json({
      success: true,
      message: 'Service completed successfully',
      queue: updatedQueue
    });
  } catch (error) {
    console.error('Complete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing service',
      error: error.message
    });
  }
};

// Skip customer
exports.skipCustomer = async (req, res) => {
  try {
    const { queueId } = req.params;
    const { reason } = req.body;
    const businessId = req.user.businessId;
    
    // Get queue
    const queue = await Queue.findById(queueId);
    if (!queue || queue.businessId !== businessId) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found'
      });
    }
    
    // Update queue status
    const updatedQueue = await Queue.update(queueId, {
      status: QUEUE_STATUS.SKIPPED,
      notes: reason ? `Skipped: ${reason}` : queue.notes
    });
    
    // Free counter if assigned
    if (queue.counterId) {
      await Counter.update(queue.counterId, {
        currentQueueId: null,
        currentQueueNumber: '',
        status: 'active'
      });
    }
    
    // Send notification to customer
    await sendNotification({
      type: 'customer_skipped',
      customerId: queue.customerId,
      customerPhone: queue.customerPhone,
      customerEmail: queue.customerEmail,
      data: {
        queueNumber: queue.queueNumber,
        message: 'Your turn has been skipped. Please rejoin the queue if needed.',
        reason: reason || 'Unknown reason'
      }
    });
    
    // Broadcast update
    req.io.to(`business:${businessId}`).emit('queue-updated', {
      type: 'customer_skipped',
      queue: updatedQueue
    });
    
    res.status(200).json({
      success: true,
      message: 'Customer skipped',
      queue: updatedQueue
    });
  } catch (error) {
    console.error('Skip customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error skipping customer',
      error: error.message
    });
  }
};

// Get customer queue status
exports.getQueueStatus = async (req, res) => {
  try {
    const { businessCode, queueNumber } = req.params;
    
    // Get business by code
    const business = await Business.findByCode(businessCode);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }
    
    // Get queue
    const queue = await Queue.findByQueueNumber(business.id, queueNumber);
    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found'
      });
    }
    
    // Get waiting count
    const waitingCount = await Queue.getWaitingCount(business.id);
    
    // Get counters
    const counters = await Counter.findByBusinessId(business.id);
    
    // Calculate position
    const allWaiting = await Queue.findByBusinessId(business.id, {
      status: QUEUE_STATUS.WAITING
    });
    
    const position = allWaiting
      .sort((a, b) => a.position - b.position)
      .findIndex(q => q.id === queue.id) + 1;
    
    // Calculate estimated time
    const activeCounters = counters.filter(c => 
      c.isActive && (c.status === 'active' || c.status === 'busy')
    );
    
    let estimatedTime = 0;
    if (activeCounters.length > 0) {
      const avgServingTime = business.stats.avgServingTime || 5;
      estimatedTime = Math.ceil(position / activeCounters.length * avgServingTime);
    }
    
    res.status(200).json({
      success: true,
      queue: {
        ...queue,
        position,
        estimatedTime,
        businessName: business.name,
        waitingCount,
        activeCounters: activeCounters.length
      }
    });
  } catch (error) {
    console.error('Get queue status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching queue status',
      error: error.message
    });
  }
};

// Transfer queue to another counter
exports.transferQueue = async (req, res) => {
  try {
    const { queueId, toCounterId } = req.body;
    const businessId = req.user.businessId;
    
    // Get queue
    const queue = await Queue.findById(queueId);
    if (!queue || queue.businessId !== businessId) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found'
      });
    }
    
    // Get target counter
    const toCounter = await Counter.findById(toCounterId);
    if (!toCounter || toCounter.businessId !== businessId) {
      return res.status(404).json({
        success: false,
        message: 'Target counter not found'
      });
    }
    
    // Free current counter
    if (queue.counterId) {
      await Counter.update(queue.counterId, {
        currentQueueId: null,
        currentQueueNumber: '',
        status: 'active'
      });
    }
    
    // Assign to new counter
    await Counter.assignQueue(toCounter.id, queue.id, queue.queueNumber);
    
    // Update queue
    const updatedQueue = await Queue.update(queue.id, {
      counterId: toCounter.id
    });
    
    // Send notification
    await sendNotification({
      type: 'queue_transferred',
      customerId: queue.customerId,
      customerPhone: queue.customerPhone,
      customerEmail: queue.customerEmail,
      data: {
        queueNumber: queue.queueNumber,
        fromCounter: queue.counterId,
        toCounter: toCounter.name,
        message: `Your queue has been transferred to ${toCounter.name}`
      }
    });
    
    // Broadcast update
    req.io.to(`business:${businessId}`).emit('queue-updated', {
      type: 'queue_transferred',
      queue: updatedQueue,
      fromCounterId: queue.counterId,
      toCounterId: toCounter.id
    });
    
    res.status(200).json({
      success: true,
      message: 'Queue transferred successfully',
      queue: updatedQueue,
      fromCounterId: queue.counterId,
      toCounter: toCounter
    });
  } catch (error) {
    console.error('Transfer queue error:', error);
    res.status(500).json({
      success: false,
      message: 'Error transferring queue',
      error: error.message
    });
  }
};