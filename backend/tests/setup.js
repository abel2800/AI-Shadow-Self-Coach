/**
 * Test Setup
 * Configuration for Jest tests
 */

// Load environment variables
require('dotenv').config();

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// Set database configuration for tests
process.env.DB_PASSWORD = process.env.DB_PASSWORD || '1992';
process.env.DB_NAME = process.env.DB_NAME || 'shadow_coach';
process.env.DB_USER = process.env.DB_USER || 'postgres';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';

const { sequelize } = require('../src/config/database');

// Setup before all tests
beforeAll(async () => {
  // Connect to test database
  await sequelize.authenticate();
});

// Cleanup after all tests
afterAll(async () => {
  // Close database connection
  await sequelize.close();
});

// Clear database between tests
beforeEach(async () => {
  // Optionally clear test data
  // await sequelize.query('TRUNCATE TABLE users, sessions, messages, moods CASCADE');
});

module.exports = {
  sequelize
};

