const rateLimit = require('express-rate-limit');

// General API rate limiter
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false
});

// Auth rate limiter (stricter)
exports.authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 login attempts per hour
  message: 'Too many login attempts, please try again after an hour',
  skipSuccessfulRequests: true // Don't count successful requests
});

// Queue join rate limiter
exports.queueJoinLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // Limit each IP to 10 queue joins per 10 minutes
  message: 'Too many queue join attempts, please try again later'
});

// Business API rate limiter
exports.businessLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Limit each business to 60 requests per minute
  keyGenerator: (req) => req.user?.businessId || req.ip,
  message: 'Too many requests for this business, please try again later'
});