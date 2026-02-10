const Business = require('../models/Business.model');
const Counter = require('../models/Counter.model');
const Queue = require('../models/Queue.model');
const User = require('../models/User.model');

// Get business profile
exports.getBusinessProfile = async (req, res) => {
  try {
    const business = await Business.findById(req.params.businessId || req.user.businessId);
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Check if user has access to this business
    if (req.user.role !== 'admin' && business.ownerId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this business'
      });
    }

    res.status(200).json({
      success: true,
      business
    });
  } catch (error) {
    console.error('Get business error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching business',
      error: error.message
    });
  }
};

// Update business profile
exports.updateBusinessProfile = async (req, res) => {
  try {
    const { 
      name, phone, address, category, description, 
      logo, website, settings, operatingHours 
    } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (category) updateData.category = category;
    if (description) updateData.description = description;
    if (logo) updateData.logo = logo;
    if (website) updateData.website = website;
    if (settings) updateData.settings = { ...settings };
    if (operatingHours) updateData.operatingHours = { ...operatingHours };

    const business = await Business.update(req.user.businessId, updateData);

    res.status(200).json({
      success: true,
      message: 'Business profile updated successfully',
      business
    });
  } catch (error) {
    console.error('Update business error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating business',
      error: error.message
    });
  }
};

// Get business by code (public)
exports.getBusinessByCode = async (req, res) => {
  try {
    const { businessCode } = req.params;
    
    const business = await Business.findByCode(businessCode);
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Get active counters
    const counters = await Counter.findByBusinessId(business.id);
    const activeCounters = counters.filter(c => c.isActive);

    // Get current queue stats
    const waitingCount = await Queue.getWaitingCount(business.id);

    // Return public business info
    const publicInfo = {
      id: business.id,
      name: business.name,
      businessCode: business.businessCode,
      category: business.category,
      description: business.description,
      logo: business.logo,
      operatingHours: business.operatingHours,
      settings: {
        allowRemoteJoin: business.settings.allowRemoteJoin,
        requireCustomerInfo: business.settings.requireCustomerInfo
      },
      stats: {
        waitingCount,
        activeCounters: activeCounters.length,
        estimatedWaitTime: waitingCount * 5 // Simple estimation
      },
      counters: activeCounters.map(counter => ({
        id: counter.id,
        name: counter.name,
        number: counter.number,
        serviceType: counter.serviceType,
        status: counter.status,
        currentQueueNumber: counter.currentQueueNumber
      }))
    };

    res.status(200).json({
      success: true,
      business: publicInfo
    });
  } catch (error) {
    console.error('Get business by code error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching business',
      error: error.message
    });
  }
};

// Get business dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const businessId = req.user.businessId;
    
    // Get business
    const business = await Business.findById(businessId);
    
    // Get current queue
    const currentQueue = await Queue.getCurrentQueue(businessId);
    
    // Get waiting count
    const waitingCount = await Queue.getWaitingCount(businessId);
    
    // Get active counters
    const counters = await Counter.findByBusinessId(businessId);
    const activeCounters = counters.filter(c => c.isActive && c.status === 'active');
    
    // Get today's analytics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayAnalytics = await Queue.getAnalytics(businessId, today, tomorrow);
    
    // Get staff members
    const staff = await User.findByBusinessId(businessId);
    
    const stats = {
      business: {
        name: business.name,
        businessCode: business.businessCode,
        isActive: business.isActive
      },
      queue: {
        waitingCount,
        currentQueue: currentQueue.slice(0, 5), // First 5 in queue
        estimatedWaitTime: waitingCount * business.settings.avgServingTime || 5
      },
      counters: {
        total: counters.length,
        active: activeCounters.length,
        busy: counters.filter(c => c.status === 'busy').length,
        inactive: counters.filter(c => !c.isActive).length
      },
      analytics: {
        servedToday: todayAnalytics.completed,
        cancelledToday: todayAnalytics.cancelled,
        avgWaitTime: todayAnalytics.avgWaitTime,
        avgServingTime: todayAnalytics.avgServingTime
      },
      staff: {
        total: staff.length,
        active: staff.filter(s => s.isActive).length
      }
    };

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
};

// Get business analytics
exports.getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query;
    const businessId = req.user.businessId;
    
    let start, end;
    
    if (period === 'today') {
      start = new Date();
      start.setHours(0, 0, 0, 0);
      end = new Date();
      end.setHours(23, 59, 59, 999);
    } else if (period === 'week') {
      end = new Date();
      start = new Date();
      start.setDate(start.getDate() - 7);
    } else if (period === 'month') {
      end = new Date();
      start = new Date();
      start.setMonth(start.getMonth() - 1);
    } else if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      // Default to last 30 days
      end = new Date();
      start = new Date();
      start.setDate(start.getDate() - 30);
    }
    
    const analytics = await Queue.getAnalytics(businessId, start, end);
    
    // Get peak hours
    const peakHours = Object.entries(analytics.byHour)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour, count]) => ({ hour: `${hour}:00`, count }));
    
    // Get service type distribution
    const serviceDistribution = Object.entries(analytics.byServiceType)
      .map(([type, count]) => ({ type, count, percentage: (count / analytics.total * 100).toFixed(1) }));
    
    res.status(200).json({
      success: true,
      analytics: {
        ...analytics,
        peakHours,
        serviceDistribution,
        efficiency: analytics.total > 0 ? 
          ((analytics.completed / analytics.total) * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
};

// Generate new business code
exports.regenerateBusinessCode = async (req, res) => {
  try {
    const business = await Business.findById(req.user.businessId);
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }
    
    // Generate new code
    const newBusiness = new Business({});
    const newCode = newBusiness.generateBusinessCode();
    
    // Check if code already exists
    const existing = await Business.findByCode(newCode);
    if (existing) {
      // Try again
      const newBusiness2 = new Business({});
      newCode = newBusiness2.generateBusinessCode();
    }
    
    // Update business
    const updatedBusiness = await Business.update(business.id, { businessCode: newCode });
    
    res.status(200).json({
      success: true,
      message: 'Business code regenerated successfully',
      businessCode: newCode,
      business: {
        id: updatedBusiness.id,
        name: updatedBusiness.name,
        businessCode: updatedBusiness.businessCode
      }
    });
  } catch (error) {
    console.error('Regenerate business code error:', error);
    res.status(500).json({
      success: false,
      message: 'Error regenerating business code',
      error: error.message
    });
  }
};