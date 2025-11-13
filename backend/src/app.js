const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth.routes');
const sessionRoutes = require('./routes/session.routes');
const conversationRoutes = require('./routes/conversation.routes');
const journalRoutes = require('./routes/journal.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const safetyRoutes = require('./routes/safety.routes');
const vectorstoreRoutes = require('./routes/vectorstore.routes');
const swaggerRoutes = require('./routes/swagger.routes');

// Import middleware
const errorMiddleware = require('./middleware/error.middleware');
const requestIdMiddleware = require('./middleware/requestId.middleware');

const app = express();

// Request ID middleware (should be early in the chain)
app.use(requestIdMiddleware);

// Security middleware
app.use(helmet());
const corsOptions = require('./config/cors');
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Rate limiting (disabled in test environment)
if (process.env.NODE_ENV !== 'test') {
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Too many requests from this IP, please try again later.'
  });
  app.use('/api/', limiter);
}

// Health check endpoints
const healthRoutes = require('./routes/health.routes');
app.use('/health', healthRoutes);

// API Documentation
app.use('/api-docs', swaggerRoutes);

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/session', sessionRoutes);
app.use('/api/v1/conversation', conversationRoutes);
app.use('/api/v1/journal', journalRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/safety', safetyRoutes);
app.use('/api/v1/vectorstore', vectorstoreRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
      path: req.path
    }
  });
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

// Log unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

module.exports = app;

