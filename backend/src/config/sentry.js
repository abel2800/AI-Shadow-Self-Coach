/**
 * Sentry Configuration
 * Error tracking and performance monitoring
 */

const Sentry = require('@sentry/node');

// Profiling integration (optional - requires native compilation)
let ProfilingIntegration = null;
try {
  ProfilingIntegration = require('@sentry/profiling-node').ProfilingIntegration;
} catch (error) {
  // Profiling not available (native module not compiled)
  console.log('⚠️  Profiling integration not available (optional)');
}

/**
 * Initialize Sentry
 */
function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  const environment = process.env.NODE_ENV || 'development';
  const enabled = process.env.ENABLE_SENTRY === 'true' && dsn;

  if (!enabled) {
    console.log('Sentry disabled (ENABLE_SENTRY=false or SENTRY_DSN not set)');
    return;
  }

  const integrations = [];
  
  // Add profiling integration if available
  if (ProfilingIntegration) {
    integrations.push(new ProfilingIntegration());
  }

  Sentry.init({
    dsn,
    environment,
    integrations,
    // Performance Monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev
    // Profiling sample rate (only if profiling is enabled)
    ...(ProfilingIntegration && {
      profilesSampleRate: environment === 'production' ? 0.1 : 1.0,
    }),
    // Release tracking
    release: process.env.APP_VERSION || '1.0.0',
    // Filter sensitive data
    beforeSend(event, hint) {
      // Remove sensitive data from events
      if (event.request) {
        // Remove passwords from request body
        if (event.request.data) {
          if (typeof event.request.data === 'object') {
            const sanitized = { ...event.request.data };
            if (sanitized.password) sanitized.password = '[REDACTED]';
            if (sanitized.token) sanitized.token = '[REDACTED]';
            if (sanitized.api_key) sanitized.api_key = '[REDACTED]';
            event.request.data = sanitized;
          }
        }
        // Remove sensitive headers
        if (event.request.headers) {
          const sanitized = { ...event.request.headers };
          if (sanitized.authorization) sanitized.authorization = '[REDACTED]';
          if (sanitized['x-api-key']) sanitized['x-api-key'] = '[REDACTED]';
          event.request.headers = sanitized;
        }
      }
      return event;
    },
    // Ignore certain errors
    ignoreErrors: [
      'ValidationError',
      'UnauthorizedError',
      'ForbiddenError',
      'NotFoundError',
    ],
  });

  console.log('✅ Sentry initialized for error tracking');
}

/**
 * Capture exception
 */
function captureException(error, context = {}) {
  if (process.env.ENABLE_SENTRY === 'true' && process.env.SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context,
      tags: {
        component: context.component || 'unknown',
      },
    });
  }
}

/**
 * Capture message
 */
function captureMessage(message, level = 'info', context = {}) {
  if (process.env.ENABLE_SENTRY === 'true' && process.env.SENTRY_DSN) {
    Sentry.captureMessage(message, {
      level,
      extra: context,
      tags: {
        component: context.component || 'unknown',
      },
    });
  }
}

/**
 * Set user context
 */
function setUser(user) {
  if (process.env.ENABLE_SENTRY === 'true' && process.env.SENTRY_DSN) {
    Sentry.setUser({
      id: user.id || user.user_id,
      email: user.email,
      // Don't include sensitive data
    });
  }
}

/**
 * Add breadcrumb
 */
function addBreadcrumb(breadcrumb) {
  if (process.env.ENABLE_SENTRY === 'true' && process.env.SENTRY_DSN) {
    Sentry.addBreadcrumb(breadcrumb);
  }
}

/**
 * Start transaction for performance monitoring
 */
function startTransaction(name, op) {
  if (process.env.ENABLE_SENTRY === 'true' && process.env.SENTRY_DSN) {
    return Sentry.startTransaction({
      name,
      op,
    });
  }
  return null;
}

module.exports = {
  initSentry,
  captureException,
  captureMessage,
  setUser,
  addBreadcrumb,
  startTransaction,
  Sentry,
};

