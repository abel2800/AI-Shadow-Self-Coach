/**
 * Rate Limiter Utilities
 * Custom rate limiting configurations
 */

const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Strict rate limiter for authentication endpoints
 * Disabled in test environment
 */
const authLimiter = process.env.NODE_ENV === 'test' 
  ? (req, res, next) => next() // No-op in test
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // Limit each IP to 5 requests per windowMs
      message: {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many authentication attempts, please try again later.'
        }
      },
      skipSuccessfulRequests: true
    });

/**
 * Session creation rate limiter
 * Disabled in test environment
 */
const sessionLimiter = process.env.NODE_ENV === 'test'
  ? (req, res, next) => next() // No-op in test
  : rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // Limit to 10 sessions per hour
      message: {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many sessions created, please try again later.'
        }
      }
    });

module.exports = {
  apiLimiter,
  authLimiter,
  sessionLimiter
};

