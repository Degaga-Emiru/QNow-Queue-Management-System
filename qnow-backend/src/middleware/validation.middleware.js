const { body, param, query, validationResult } = require('express-validator');

// Common validation rules
exports.validateRegistration = [
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .matches(/\d/).withMessage('Password must contain at least one number')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter'),
  
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  
  body('phone')
    .optional()
    .matches(/^[+]?[\d\s\-()]+$/).withMessage('Please provide a valid phone number'),
  
  body('role')
    .optional()
    .isIn(['customer', 'business_owner', 'business_staff', 'admin'])
    .withMessage('Invalid role specified'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

exports.validateLogin = [
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

exports.validateQueueJoin = [
  body('businessId')
    .notEmpty().withMessage('Business ID is required'),
  
  body('serviceType')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('Service type must be at least 2 characters'),
  
  body('customerName')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('Customer name must be at least 2 characters'),
  
  body('customerPhone')
    .optional()
    .matches(/^[+]?[\d\s\-()]+$/).withMessage('Please provide a valid phone number'),
  
  body('customerEmail')
    .optional()
    .isEmail().withMessage('Please provide a valid email'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

exports.validateBusinessCode = [
  param('businessCode')
    .trim()
    .notEmpty().withMessage('Business code is required')
    .isLength({ min: 4, max: 10 }).withMessage('Business code must be between 4 and 10 characters'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

exports.validateQueueNumber = [
  param('queueNumber')
    .trim()
    .notEmpty().withMessage('Queue number is required')
    .matches(/^[A-Za-z]?\d+$/).withMessage('Invalid queue number format'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

exports.validateCounterCreation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Counter name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Counter name must be between 2 and 50 characters'),
  
  body('number')
    .optional()
    .isInt({ min: 1 }).withMessage('Counter number must be a positive integer'),
  
  body('serviceType')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Service type must be between 2 and 50 characters'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

// Generic validation middleware
exports.validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    
    res.status(400).json({
      success: false,
      errors: errors.array()
    });
  };
};

// Sanitize input data
exports.sanitizeInput = (req, res, next) => {
  // Sanitize string inputs
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .trim();
  };
  
  // Recursively sanitize object
  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return typeof obj === 'string' ? sanitizeString(obj) : obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeObject(item));
    }
    
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  };
  
  // Sanitize request body, query, and params
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  
  next();
};