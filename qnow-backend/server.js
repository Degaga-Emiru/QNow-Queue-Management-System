const { httpServer } = require('./src/app');

const PORT = process.env.PORT || 5000;
const ENVIRONMENT = process.env.NODE_ENV || 'development';

// Start server
httpServer.listen(PORT, () => {
  console.log(`
    🚀 QNow Backend Server Started!
    
    Environment: ${ENVIRONMENT}
    Server URL: http://localhost:${PORT}
    API Base URL: http://localhost:${PORT}/api/v1
    Health Check: http://localhost:${PORT}/api/v1/health
    API Docs: http://localhost:${PORT}/api/v1/docs
    
    ⚡ Server running on port ${PORT}
    📅 ${new Date().toLocaleString()}
  `);
});

// Graceful shutdown
const shutdown = () => {
  console.log('\n🛑 Received shutdown signal, closing server gracefully...');
  
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('❌ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // Don't exit immediately, let the server handle it
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});