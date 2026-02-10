const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth.routes');
const businessRoutes = require('./business.routes');
const queueRoutes = require('./queue.routes');
const counterRoutes = require('./counter.routes');

// API version prefix
const API_PREFIX = '/api/v1';

// Health check endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'QNow API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API status endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Mount all routes with version prefix
router.use(`${API_PREFIX}/auth`, authRoutes);
router.use(`${API_PREFIX}/business`, businessRoutes);
router.use(`${API_PREFIX}/queue`, queueRoutes);
router.use(`${API_PREFIX}/counters`, counterRoutes);

// API documentation endpoint
router.get(`${API_PREFIX}/docs`, (req, res) => {
  const apiDocs = {
    endpoints: {
      auth: {
        register: 'POST /api/v1/auth/register',
        login: 'POST /api/v1/auth/login',
        logout: 'POST /api/v1/auth/logout',
        profile: 'GET /api/v1/auth/me',
        updateProfile: 'PUT /api/v1/auth/profile',
        changePassword: 'PUT /api/v1/auth/change-password'
      },
      business: {
        profile: 'GET /api/v1/business/profile',
        updateProfile: 'PUT /api/v1/business/profile',
        dashboard: 'GET /api/v1/business/dashboard',
        analytics: 'GET /api/v1/business/analytics',
        regenerateCode: 'POST /api/v1/business/regenerate-code',
        public: 'GET /api/v1/business/public/:businessCode'
      },
      queue: {
        join: 'POST /api/v1/queue/join',
        status: 'GET /api/v1/queue/status/:businessCode/:queueNumber',
        current: 'GET /api/v1/queue/business/current',
        callNext: 'POST /api/v1/queue/business/call-next',
        serve: 'POST /api/v1/queue/business/serve/:queueId',
        complete: 'POST /api/v1/queue/business/complete/:queueId',
        skip: 'POST /api/v1/queue/business/skip/:queueId',
        transfer: 'POST /api/v1/queue/business/transfer'
      },
      counters: {
        create: 'POST /api/v1/counters',
        list: 'GET /api/v1/counters',
        get: 'GET /api/v1/counters/:counterId',
        update: 'PUT /api/v1/counters/:counterId',
        delete: 'DELETE /api/v1/counters/:counterId',
        status: 'POST /api/v1/counters/:counterId/status',
        break: 'POST /api/v1/counters/:counterId/break',
        endBreak: 'POST /api/v1/counters/:counterId/end-break',
        analytics: 'GET /api/v1/counters/:counterId/analytics'
      }
    },
    authentication: 'Use Bearer token in Authorization header for protected routes',
    rateLimiting: 'API is rate limited. Check X-RateLimit headers for limits.',
    support: 'For support, contact support@qnow.com'
  };
  
  res.json(apiDocs);
});

module.exports = router;