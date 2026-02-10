const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queue.controller');
const { 
  authenticate, 
  authorize,
  businessAccess 
} = require('../middleware/auth.middleware');
const { 
  validateQueueJoin,
  validateBusinessCode,
  validateQueueNumber 
} = require('../middleware/validation.middleware');
const { asyncHandler } = require('../middleware/error.middleware');
const { queueJoinLimiter, businessLimiter } = require('../middleware/rateLimiter');

// Public routes (no authentication required)
router.get(
  '/status/:businessCode/:queueNumber',
  validateBusinessCode,
  validateQueueNumber,
  asyncHandler(queueController.getQueueStatus)
);

// Customer routes (requires authentication)
router.post(
  '/join',
  authenticate,
  queueJoinLimiter,
  validateQueueJoin,
  asyncHandler(queueController.joinQueue)
);

// Business routes (requires business authentication)
router.use('/business', authenticate, authorize('business_owner', 'business_staff', 'admin'));

// Get current queue
router.get(
  '/business/current',
  businessLimiter,
  asyncHandler(queueController.getCurrentQueue)
);

// Call next customer
router.post(
  '/business/call-next',
  businessLimiter,
  asyncHandler(queueController.callNextCustomer)
);

// Start serving customer
router.post(
  '/business/serve/:queueId',
  businessLimiter,
  asyncHandler(queueController.startServing)
);

// Complete service
router.post(
  '/business/complete/:queueId',
  businessLimiter,
  asyncHandler(queueController.completeService)
);

// Skip customer
router.post(
  '/business/skip/:queueId',
  businessLimiter,
  asyncHandler(queueController.skipCustomer)
);

// Transfer queue
router.post(
  '/business/transfer',
  businessLimiter,
  asyncHandler(queueController.transferQueue)
);

// Get queue analytics
router.get(
  '/business/analytics',
  businessLimiter,
  asyncHandler(async (req, res) => {
    // Implementation for queue analytics
    res.json({ message: 'Queue analytics route' });
  })
);

// Customer history (for business)
router.get(
  '/business/customers',
  businessLimiter,
  asyncHandler(async (req, res) => {
    // Implementation for customer history
    res.json({ message: 'Customer history route' });
  })
);

module.exports = router;