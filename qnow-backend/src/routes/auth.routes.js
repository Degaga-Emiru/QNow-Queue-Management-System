const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { 
  authenticate, 
  authorize 
} = require('../middleware/auth.middleware');
const { 
  validateRegistration, 
  validateLogin,
  validate 
} = require('../middleware/validation.middleware');
const { authLimiter } = require('../middleware/rateLimiter');
const { asyncHandler } = require('../middleware/error.middleware');

// Public routes
router.post(
  '/register',
  authLimiter,
  validateRegistration,
  asyncHandler(authController.register)
);

router.post(
  '/login',
  authLimiter,
  validateLogin,
  asyncHandler(authController.login)
);

router.post(
  '/logout',
  asyncHandler(authController.logout)
);

// Protected routes
router.get(
  '/me',
  authenticate,
  asyncHandler(authController.getCurrentUser)
);

router.put(
  '/profile',
  authenticate,
  asyncHandler(authController.updateProfile)
);

router.put(
  '/change-password',
  authenticate,
  validate([
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 })
  ]),
  asyncHandler(authController.changePassword)
);

// Admin only routes
router.get(
  '/users',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    // Implementation for admin to get all users
    res.json({ message: 'Get all users route' });
  })
);

module.exports = router;