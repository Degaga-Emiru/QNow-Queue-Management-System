const express = require('express');
const router = express.Router();
const businessController = require('../controllers/business.controller');
const { 
  authenticate, 
  authorize,
  businessAccess 
} = require('../middleware/auth.middleware');
const { asyncHandler } = require('../middleware/error.middleware');
const { businessLimiter } = require('../middleware/rateLimiter');

// All business routes require authentication
router.use(authenticate);

// Get business profile
router.get(
  '/profile',
  businessLimiter,
  asyncHandler(businessController.getBusinessProfile)
);

// Update business profile
router.put(
  '/profile',
  businessLimiter,
  asyncHandler(businessController.updateBusinessProfile)
);

// Get dashboard stats
router.get(
  '/dashboard',
  businessLimiter,
  asyncHandler(businessController.getDashboardStats)
);

// Get analytics
router.get(
  '/analytics',
  businessLimiter,
  asyncHandler(businessController.getAnalytics)
);

// Regenerate business code
router.post(
  '/regenerate-code',
  businessLimiter,
  asyncHandler(businessController.regenerateBusinessCode)
);

// Public route to get business by code
router.get(
  '/public/:businessCode',
  asyncHandler(businessController.getBusinessByCode)
);

// Staff management routes (business owner only)
router.get(
  '/staff',
  authorize('business_owner', 'admin'),
  businessLimiter,
  asyncHandler(async (req, res) => {
    // Implementation for getting business staff
    res.json({ message: 'Get staff route' });
  })
);

router.post(
  '/staff',
  authorize('business_owner', 'admin'),
  businessLimiter,
  asyncHandler(async (req, res) => {
    // Implementation for adding staff
    res.json({ message: 'Add staff route' });
  })
);

// Business settings routes
router.get(
  '/settings',
  businessLimiter,
  asyncHandler(async (req, res) => {
    // Implementation for getting business settings
    res.json({ message: 'Get settings route' });
  })
);

router.put(
  '/settings',
  businessLimiter,
  asyncHandler(async (req, res) => {
    // Implementation for updating business settings
    res.json({ message: 'Update settings route' });
  })
);

module.exports = router;