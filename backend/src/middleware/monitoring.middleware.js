/**
 * Monitoring Middleware
 * Performance monitoring and metrics collection
 */

const { startTransaction, addBreadcrumb } = require('../config/sentry');
const logger = require('../utils/logger');

/**
 * Performance monitoring middleware
 */
function monitoringMiddleware(req, res, next) {
  // Start transaction for performance tracking
  const transaction = startTransaction({
    name: `${req.method} ${req.path}`,
    op: 'http.server',
  });

  if (transaction) {
    req._sentryTransaction = transaction;
  }

  // Add breadcrumb for request
  addBreadcrumb({
    category: 'http',
    message: `${req.method} ${req.path}`,
    level: 'info',
    data: {
      method: req.method,
      path: req.path,
      query: req.query,
    },
  });

  // Track response time
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        path: req.path,
        duration: `${duration}ms`,
        statusCode: res.statusCode,
      });
    }

    // Finish transaction
    if (transaction) {
      transaction.setHttpStatus(res.statusCode);
      transaction.finish();
    }
  });

  next();
}

module.exports = monitoringMiddleware;

