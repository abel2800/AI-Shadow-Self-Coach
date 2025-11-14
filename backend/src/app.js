const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');

// Initialize Sentry before other imports
const { initSentry } = require('./config/sentry');
initSentry();

// Import routes
const authRoutes = require('./routes/auth.routes');
const sessionRoutes = require('./routes/session.routes');
const conversationRoutes = require('./routes/conversation.routes');
const journalRoutes = require('./routes/journal.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const safetyRoutes = require('./routes/safety.routes');
const vectorstoreRoutes = require('./routes/vectorstore.routes');
const mlModelRoutes = require('./routes/ml-model.routes');
const abTestRoutes = require('./routes/ab-test.routes');
const consentRoutes = require('./routes/consent.routes');
const betaRoutes = require('./routes/beta.routes');
const adminRoutes = require('./routes/admin.routes');
const swaggerRoutes = require('./routes/swagger.routes');

// Import middleware
const errorMiddleware = require('./middleware/error.middleware');
const requestIdMiddleware = require('./middleware/requestId.middleware');
const monitoringMiddleware = require('./middleware/monitoring.middleware');
const { Sentry } = require('./config/sentry');

const app = express();

// Sentry request handler (must be first)
if (process.env.ENABLE_SENTRY === 'true' && process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

// Request ID middleware (should be early in the chain)
app.use(requestIdMiddleware);

// Performance monitoring
if (process.env.ENABLE_SENTRY === 'true' && process.env.SENTRY_DSN) {
  app.use(monitoringMiddleware);
}

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
app.use('/api/v1/ml-models', mlModelRoutes);
app.use('/api/v1/ab-tests', abTestRoutes);
app.use('/api/v1/consent', consentRoutes);
app.use('/api/v1/beta', betaRoutes);
app.use('/api/v1/admin', adminRoutes);

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

// Sentry error handler (before custom error handler)
if (process.env.ENABLE_SENTRY === 'true' && process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

// Error handling middleware (must be last)
app.use(errorMiddleware);

// Log unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  if (process.env.ENABLE_SENTRY === 'true' && process.env.SENTRY_DSN) {
    const { captureException } = require('./config/sentry');
    captureException(reason, { component: 'unhandled-rejection' });
  }
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  if (process.env.ENABLE_SENTRY === 'true' && process.env.SENTRY_DSN) {
    const { captureException } = require('./config/sentry');
    captureException(error, { component: 'uncaught-exception' });
  }
  process.exit(1);
});

module.exports = app;

