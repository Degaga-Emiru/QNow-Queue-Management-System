const express = require('express');
const router = express.Router();
const counterController = require('../controllers/counter.controller');
const { 
  authenticate, 
  authorize 
} = require('../middleware/auth.middleware');
const { 
  validateCounterCreation 
} = require('../middleware/validation.middleware');
const { asyncHandler } = require('../middleware/error.middleware');
const { businessLimiter } = require('../middleware/rateLimiter');

// All counter routes require business authentication
router.use(authenticate, authorize('business_owner', 'business_staff', 'admin'));

// Create new counter
router.post(
  '/',
  businessLimiter,
  validateCounterCreation,
  asyncHandler(counterController.createCounter)
);

// Get all counters
router.get(
  '/',
  businessLimiter,
  asyncHandler(counterController.getCounters)
);

// Get single counter
router.get(
  '/:counterId',
  businessLimiter,
  asyncHandler(counterController.getCounter)
);

// Update counter
router.put(
  '/:counterId',
  businessLimiter,
  asyncHandler(counterController.updateCounter)
);

// Delete counter
router.delete(
  '/:counterId',
  businessLimiter,
  asyncHandler(counterController.deleteCounter)
);

// Set counter status
router.post(
  '/:counterId/status',
  businessLimiter,
  asyncHandler(counterController.setCounterStatus)
);

// Set counter break
router.post(
  '/:counterId/break',
  businessLimiter,
  asyncHandler(counterController.setCounterBreak)
);

// End counter break
router.post(
  '/:counterId/end-break',
  businessLimiter,
  asyncHandler(counterController.endCounterBreak)
);

// Get counter analytics
router.get(
  '/:counterId/analytics',
  businessLimiter,
  asyncHandler(counterController.getCounterAnalytics)
);

// Assign staff to counter
router.post(
  '/:counterId/assign',
  businessLimiter,
  asyncHandler(async (req, res) => {
    // Implementation for assigning staff
    res.json({ message: 'Assign staff route' });
  })
);

// Unassign staff from counter
router.post(
  '/:counterId/unassign',
  businessLimiter,
  asyncHandler(async (req, res) => {
    // Implementation for unassigning staff
    res.json({ message: 'Unassign staff route' });
  })
);

module.exports = router;