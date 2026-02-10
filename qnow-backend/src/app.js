const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import middleware
const { errorHandler, notFound } = require('./middleware/error.middleware');
const { sanitizeInput } = require('./middleware/validation.middleware');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const apiRoutes = require('./routes/api.routes');

// Import Firebase configuration
require('./config/firebase-admin.config');

// Initialize Express app
const app = express();

// Create HTTP server for Socket.IO
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join business room
  socket.on('join-business', (businessId) => {
    socket.join(`business:${businessId}`);
    console.log(`Socket ${socket.id} joined business:${businessId}`);
  });

  // Join customer room
  socket.on('join-customer', (customerId) => {
    socket.join(`customer:${customerId}`);
    console.log(`Socket ${socket.id} joined customer:${customerId}`);
  });

  // Join queue room
  socket.on('join-queue', (queueId) => {
    socket.join(`queue:${queueId}`);
    console.log(`Socket ${socket.id} joined queue:${queueId}`);
  });

  // Handle queue updates
  socket.on('queue-update', (data) => {
    const { businessId, queueId } = data;
    
    // Broadcast to business room
    if (businessId) {
      socket.to(`business:${businessId}`).emit('queue-updated', data);
    }
    
    // Broadcast to queue room
    if (queueId) {
      socket.to(`queue:${queueId}`).emit('queue-updated', data);
    }
  });

  // Handle counter updates
  socket.on('counter-update', (data) => {
    const { businessId, counterId } = data;
    
    if (businessId) {
      socket.to(`business:${businessId}`).emit('counter-updated', data);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // Error handling
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

// Rate limiting
app.use(apiLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Input sanitization
app.use(sanitizeInput);

// API routes
app.use(apiRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Export both app and httpServer for testing
module.exports = { app, httpServer, io };