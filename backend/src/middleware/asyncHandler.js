/**
 * Async Handler Middleware
 * Wraps async route handlers to catch errors automatically
 */

const logger = require('../utils/logger');

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      logger.error('Async handler error:', {
        message: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method
      });
      next(error);
    });
  };
}

module.exports = asyncHandler;

