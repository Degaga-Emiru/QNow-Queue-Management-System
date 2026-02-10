const Counter = require('../models/Counter.model');
const Business = require('../models/Business.model');

// Create new counter
exports.createCounter = async (req, res) => {
  try {
    const { name, number, serviceType, settings } = req.body;
    const businessId = req.user.businessId;
    
    // Check if business exists
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }
    
    // Create counter
    const counter = await Counter.create({
      businessId,
      name,
      number: number || 1,
      serviceType: serviceType || 'general',
      settings: settings || {}
    });
    
    res.status(201).json({
      success: true,
      message: 'Counter created successfully',
      counter
    });
  } catch (error) {
    console.error('Create counter error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating counter',
      error: error.message
    });
  }
};

// Get all counters for business
exports.getCounters = async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const { activeOnly } = req.query;
    
    let counters = await Counter.findByBusinessId(businessId);
    
    if (activeOnly === 'true') {
      counters = counters.filter(c => c.isActive);
    }
    
    res.status(200).json({
      success: true,
      counters,
      stats: {
        total: counters.length,
        active: counters.filter(c => c.isActive).length,
        busy: counters.filter(c => c.status === 'busy').length,
        available: counters.filter(c => c.status === 'active').length
      }
    });
  } catch (error) {
    console.error('Get counters error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching counters',
      error: error.message
    });
  }
};

// Get counter by ID
exports.getCounter = async (req, res) => {
  try {
    const { counterId } = req.params;
    const businessId = req.user.businessId;
    
    const counter = await Counter.findById(counterId);
    
    if (!counter || counter.businessId !== businessId) {
      return res.status(404).json({
        success: false,
        message: 'Counter not found'
      });
    }
    
    res.status(200).json({
      success: true,
      counter
    });
  } catch (error) {
    console.error('Get counter error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching counter',
      error: error.message
    });
  }
};

// Update counter
exports.updateCounter = async (req, res) => {
  try {
    const { counterId } = req.params;
    const { name, serviceType, settings, isActive, staffId, staffName } = req.body;
    const businessId = req.user.businessId;
    
    // Check if counter exists and belongs to business
    const counter = await Counter.findById(counterId);
    if (!counter || counter.businessId !== businessId) {
      return res.status(404).json({
        success: false,
        message: 'Counter not found'
      });
    }
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (serviceType !== undefined) updateData.serviceType = serviceType;
    if (settings !== undefined) updateData.settings = { ...settings };
    if (isActive !== undefined) updateData.isActive = isActive;
    if (staffId !== undefined) updateData.staffId = staffId;
    if (staffName !== undefined) updateData.staffName = staffName;
    
    const updatedCounter = await Counter.update(counterId, updateData);
    
    res.status(200).json({
      success: true,
      message: 'Counter updated successfully',
      counter: updatedCounter
    });
  } catch (error) {
    console.error('Update counter error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating counter',
      error: error.message
    });
  }
};

// Delete counter
exports.deleteCounter = async (req, res) => {
  try {
    const { counterId } = req.params;
    const businessId = req.user.businessId;
    
    // Check if counter exists and belongs to business
    const counter = await Counter.findById(counterId);
    if (!counter || counter.businessId !== businessId) {
      return res.status(404).json({
        success: false,
        message: 'Counter not found'
      });
    }
    
    // Check if counter is currently serving
    if (counter.status === 'busy') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete counter while serving customer'
      });
    }
    
    await Counter.delete(counterId);
    
    res.status(200).json({
      success: true,
      message: 'Counter deleted successfully'
    });
  } catch (error) {
    console.error('Delete counter error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting counter',
      error: error.message
    });
  }
};

// Set counter status
exports.setCounterStatus = async (req, res) => {
  try {
    const { counterId } = req.params;
    const { status } = req.body;
    const businessId = req.user.businessId;
    
    // Check if counter exists and belongs to business
    const counter = await Counter.findById(counterId);
    if (!counter || counter.businessId !== businessId) {
      return res.status(404).json({
        success: false,
        message: 'Counter not found'
      });
    }
    
    // Validate status
    const validStatuses = ['active', 'inactive', 'busy', 'break'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    // Update counter status
    const updateData = { status };
    
    // If setting to break, also set next available time
    if (status === 'break') {
      const breakDuration = counter.settings.breakDuration || 15;
      const nextAvailableAt = new Date();
      nextAvailableAt.setMinutes(nextAvailableAt.getMinutes() + breakDuration);
      updateData.nextAvailableAt = nextAvailableAt;
    } else {
      updateData.nextAvailableAt = null;
    }
    
    const updatedCounter = await Counter.update(counterId, updateData);
    
    // Broadcast status change
    req.io.to(`business:${businessId}`).emit('counter-status-changed', {
      counterId,
      status,
      counter: updatedCounter
    });
    
    res.status(200).json({
      success: true,
      message: 'Counter status updated successfully',
      counter: updatedCounter
    });
  } catch (error) {
    console.error('Set counter status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating counter status',
      error: error.message
    });
  }
};

// Set counter break
exports.setCounterBreak = async (req, res) => {
  try {
    const { counterId } = req.params;
    const { duration } = req.body;
    const businessId = req.user.businessId;
    
    // Check if counter exists and belongs to business
    const counter = await Counter.findById(counterId);
    if (!counter || counter.businessId !== businessId) {
      return res.status(404).json({
        success: false,
        message: 'Counter not found'
      });
    }
    
    // Check if counter is currently serving
    if (counter.status === 'busy') {
      return res.status(400).json({
        success: false,
        message: 'Cannot set break while serving customer'
      });
    }
    
    const breakDuration = duration || counter.settings.breakDuration || 15;
    const updatedCounter = await Counter.setBreak(counterId, breakDuration);
    
    // Broadcast break status
    req.io.to(`business:${businessId}`).emit('counter-break-started', {
      counterId,
      duration: breakDuration,
      nextAvailableAt: updatedCounter.nextAvailableAt
    });
    
    res.status(200).json({
      success: true,
      message: 'Counter break set successfully',
      counter: updatedCounter
    });
  } catch (error) {
    console.error('Set counter break error:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting counter break',
      error: error.message
    });
  }
};

// End counter break
exports.endCounterBreak = async (req, res) => {
  try {
    const { counterId } = req.params;
    const businessId = req.user.businessId;
    
    // Check if counter exists and belongs to business
    const counter = await Counter.findById(counterId);
    if (!counter || counter.businessId !== businessId) {
      return res.status(404).json({
        success: false,
        message: 'Counter not found'
      });
    }
    
    if (counter.status !== 'break') {
      return res.status(400).json({
        success: false,
        message: 'Counter is not on break'
      });
    }
    
    const updatedCounter = await Counter.endBreak(counterId);
    
    // Broadcast break ended
    req.io.to(`business:${businessId}`).emit('counter-break-ended', {
      counterId,
      counter: updatedCounter
    });
    
    res.status(200).json({
      success: true,
      message: 'Counter break ended successfully',
      counter: updatedCounter
    });
  } catch (error) {
    console.error('End counter break error:', error);
    res.status(500).json({
      success: false,
      message: 'Error ending counter break',
      error: error.message
    });
  }
};

// Get counter analytics
exports.getCounterAnalytics = async (req, res) => {
  try {
    const { counterId } = req.params;
    const businessId = req.user.businessId;
    
    // Check if counter exists and belongs to business
    const counter = await Counter.findById(counterId);
    if (!counter || counter.businessId !== businessId) {
      return res.status(404).json({
        success: false,
        message: 'Counter not found'
      });
    }
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get queues served by this counter today
    const Queue = require('../models/Queue.model');
    const queues = await Queue.findByBusinessId(businessId, {
      status: 'completed'
    });
    
    const counterQueues = queues.filter(q => q.counterId === counterId);
    const todayQueues = counterQueues.filter(q => 
      q.completedAt && q.completedAt.toDate() >= today
    );
    
    // Calculate stats
    const stats = {
      totalServed: counter.stats.totalServed || 0,
      servedToday: todayQueues.length,
      avgServingTime: counter.stats.avgServingTime || 0,
      efficiency: counter.stats.efficiency || 0,
      todayStats: {
        startTime: todayQueues.length > 0 ? 
          todayQueues[0].completedAt.toDate().toLocaleTimeString() : 'N/A',
        endTime: todayQueues.length > 0 ? 
          todayQueues[todayQueues.length - 1].completedAt.toDate().toLocaleTimeString() : 'N/A',
        totalTime: todayQueues.reduce((total, queue) => {
          if (queue.servingAt && queue.completedAt) {
            return total + (queue.completedAt.toDate() - queue.servingAt.toDate());
          }
          return total;
        }, 0) / (1000 * 60) // Convert to minutes
      }
    };
    
    res.status(200).json({
      success: true,
      counter: {
        ...counter,
        stats
      }
    });
  } catch (error) {
    console.error('Get counter analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching counter analytics',
      error: error.message
    });
  }
};