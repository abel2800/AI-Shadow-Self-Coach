/**
 * Logger Utility
 * Centralized logging using Winston
 * Integrated with Sentry for error tracking
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');
const { captureException, captureMessage } = require('../config/sentry');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'shadow-coach-api' },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Write all logs to file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error'
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log')
    })
  ],
  // Don't log in test environment
  silent: process.env.NODE_ENV === 'test'
});

// Custom log method that also sends to Sentry
const originalError = logger.error;
logger.error = function(...args) {
  originalError.apply(this, args);
  
  // Send errors to Sentry
  if (args[0] instanceof Error) {
    captureException(args[0], { component: 'logger' });
  } else if (typeof args[0] === 'string') {
    captureMessage(args[0], 'error', args[1] || {});
  }
};

// If not in production, log to console with simple format
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;

