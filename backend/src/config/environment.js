/**
 * Environment Configuration
 * Centralized configuration for different environments
 */

const path = require('path');

const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Environment types
 */
const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  TEST: 'test',
  STAGING: 'staging',
  PRODUCTION: 'production',
};

/**
 * Base configuration
 */
const baseConfig = {
  // Application
  app: {
    name: 'AI Shadow-Self Coach API',
    version: process.env.APP_VERSION || '1.0.0',
    port: parseInt(process.env.PORT) || 3000,
    apiBaseUrl: process.env.API_BASE_URL || `http://localhost:${parseInt(process.env.PORT) || 3000}/api/v1`,
  },

  // Database
  database: {
    name: process.env.DB_NAME || 'shadow_coach',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    ssl: process.env.DB_SSL === 'true',
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 5,
      min: parseInt(process.env.DB_POOL_MIN) || 0,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
    },
  },

  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    encryptionKey: process.env.ENCRYPTION_KEY || 'change-me-in-production',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    authMaxRequests: parseInt(process.env.RATE_LIMIT_AUTH_MAX) || 5,
    sessionMaxRequests: parseInt(process.env.RATE_LIMIT_SESSION_MAX) || 10,
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableFileLogging: process.env.ENABLE_FILE_LOGGING !== 'false',
    logDir: path.join(__dirname, '../../logs'),
  },

  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 1000,
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
  },

  // Vector Store
  vectorStore: {
    enabled: process.env.ENABLE_VECTOR_STORE !== 'false',
    provider: process.env.VECTOR_STORE_PROVIDER || 'memory', // memory, pinecone, weaviate
    pinecone: {
      apiKey: process.env.PINECONE_API_KEY || '',
      environment: process.env.PINECONE_ENVIRONMENT || '',
      indexName: process.env.PINECONE_INDEX_NAME || 'shadow-coach',
    },
    weaviate: {
      url: process.env.WEAVIATE_URL || 'http://localhost:8080',
      apiKey: process.env.WEAVIATE_API_KEY || '',
    },
  },

  // WebSocket
  websocket: {
    enabled: process.env.ENABLE_WEBSOCKET !== 'false',
  },

  // Sentry
  sentry: {
    enabled: process.env.ENABLE_SENTRY === 'true',
    dsn: process.env.SENTRY_DSN || '',
    environment: NODE_ENV,
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.1,
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
};

/**
 * Development configuration
 */
const developmentConfig = {
  ...baseConfig,
  app: {
    ...baseConfig.app,
    apiBaseUrl: process.env.API_BASE_URL || `http://localhost:${baseConfig.app.port}/api/v1`,
  },
  database: {
    ...baseConfig.database,
    logging: console.log,
  },
  logging: {
    ...baseConfig.logging,
    level: 'debug',
  },
  sentry: {
    ...baseConfig.sentry,
    tracesSampleRate: 1.0, // 100% in development
  },
};

/**
 * Test configuration
 */
const testConfig = {
  ...baseConfig,
  database: {
    ...baseConfig.database,
    name: process.env.DB_NAME || 'shadow_coach_test',
    logging: false,
  },
  logging: {
    ...baseConfig.logging,
    level: 'error',
    enableFileLogging: false,
  },
  rateLimit: {
    ...baseConfig.rateLimit,
    maxRequests: 10000, // High limit for tests
  },
  sentry: {
    ...baseConfig.sentry,
    enabled: false, // Disable in tests
  },
};

/**
 * Staging configuration
 */
const stagingConfig = {
  ...baseConfig,
  app: {
    ...baseConfig.app,
    apiBaseUrl: process.env.API_BASE_URL || 'https://staging-api.shadow-coach.com/api/v1',
  },
  database: {
    ...baseConfig.database,
    ssl: true, // Require SSL in staging
    pool: {
      ...baseConfig.database.pool,
      max: 10, // Higher pool for staging
    },
  },
  security: {
    ...baseConfig.security,
    // Staging should use strong secrets
  },
  logging: {
    ...baseConfig.logging,
    level: 'info',
  },
  sentry: {
    ...baseConfig.sentry,
    enabled: true,
    tracesSampleRate: 0.5, // 50% in staging
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'https://staging.shadow-coach.com',
    credentials: true,
  },
};

/**
 * Production configuration
 */
const productionConfig = {
  ...baseConfig,
  app: {
    ...baseConfig.app,
    apiBaseUrl: process.env.API_BASE_URL || 'https://api.shadow-coach.com/api/v1',
  },
  database: {
    ...baseConfig.database,
    ssl: true, // Require SSL in production
    pool: {
      ...baseConfig.database.pool,
      max: 20, // Higher pool for production
    },
  },
  security: {
    ...baseConfig.security,
    // Production MUST use strong secrets from env
    jwtSecret: process.env.JWT_SECRET, // Required
    encryptionKey: process.env.ENCRYPTION_KEY, // Required
  },
  logging: {
    ...baseConfig.logging,
    level: 'warn', // Less verbose in production
  },
  rateLimit: {
    ...baseConfig.rateLimit,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 200,
  },
  sentry: {
    ...baseConfig.sentry,
    enabled: true,
    tracesSampleRate: 0.1, // 10% in production
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'https://shadow-coach.com',
    credentials: true,
  },
};

/**
 * Get environment-specific configuration
 */
function getConfig() {
  switch (NODE_ENV) {
    case ENVIRONMENTS.TEST:
      return testConfig;
    case ENVIRONMENTS.STAGING:
      return stagingConfig;
    case ENVIRONMENTS.PRODUCTION:
      return productionConfig;
    case ENVIRONMENTS.DEVELOPMENT:
    default:
      return developmentConfig;
  }
}

/**
 * Validate required environment variables
 */
function validateConfig() {
  const config = getConfig();
  const errors = [];

  // Production requires strong secrets
  if (NODE_ENV === ENVIRONMENTS.PRODUCTION) {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change-me-in-production') {
      errors.push('JWT_SECRET must be set in production');
    }
    if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY === 'change-me-in-production') {
      errors.push('ENCRYPTION_KEY must be set in production');
    }
    if (!process.env.DB_PASSWORD) {
      errors.push('DB_PASSWORD must be set in production');
    }
  }

  // Staging and production require database password
  if ((NODE_ENV === ENVIRONMENTS.STAGING || NODE_ENV === ENVIRONMENTS.PRODUCTION) && !process.env.DB_PASSWORD) {
    errors.push('DB_PASSWORD must be set in staging/production');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

/**
 * Get current environment
 */
function getEnvironment() {
  return NODE_ENV;
}

/**
 * Check if environment is production
 */
function isProduction() {
  return NODE_ENV === ENVIRONMENTS.PRODUCTION;
}

/**
 * Check if environment is staging
 */
function isStaging() {
  return NODE_ENV === ENVIRONMENTS.STAGING;
}

/**
 * Check if environment is development
 */
function isDevelopment() {
  return NODE_ENV === ENVIRONMENTS.DEVELOPMENT;
}

/**
 * Check if environment is test
 */
function isTest() {
  return NODE_ENV === ENVIRONMENTS.TEST;
}

module.exports = {
  getConfig,
  validateConfig,
  getEnvironment,
  isProduction,
  isStaging,
  isDevelopment,
  isTest,
  ENVIRONMENTS,
  config: getConfig(), // Export current config
};

