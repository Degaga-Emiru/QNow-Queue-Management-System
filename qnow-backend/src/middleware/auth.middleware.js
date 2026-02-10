const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

// Authentication middleware
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found'
      });
    }
    
    // Attach user to request
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      businessId: user.businessId
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

// Role-based authorization middleware
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }
    
    next();
  };
};

// Business ownership/access middleware
exports.businessAccess = async (req, res, next) => {
  try {
    const businessId = req.params.businessId || req.body.businessId || req.user.businessId;
    
    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: 'Business ID is required'
      });
    }
    
    // Admin can access all businesses
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Check if user has access to this business
    if (req.user.businessId !== businessId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this business'
      });
    }
    
    next();
  } catch (error) {
    console.error('Business access check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking business access',
      error: error.message
    });
  }
};

// API key authentication for external integrations
exports.authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.header('X-API-Key');
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key is required'
      });
    }
    
    // In a real implementation, you would validate the API key against your database
    // For now, we'll use a simple check
    const Business = require('../models/Business.model');
    const business = await Business.findByApiKey(apiKey);
    
    if (!business) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key'
      });
    }
    
    // Attach business to request
    req.business = business;
    
    next();
  } catch (error) {
    console.error('API key authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'API key authentication failed',
      error: error.message
    });
  }
};