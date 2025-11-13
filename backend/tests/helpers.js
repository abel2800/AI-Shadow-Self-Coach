/**
 * Test Helpers
 * Utility functions for tests
 */

const { User, Session } = require('../src/models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Create a test user
 */
async function createTestUser(email = 'test@example.com', password = 'password123') {
  const hashedPassword = await bcrypt.hash(password, 10);
  return await User.create({
    email,
    password: hashedPassword
  });
}

/**
 * Generate auth token for a user
 */
function generateAuthToken(user) {
  return jwt.sign(
    { user_id: user.id },
    process.env.JWT_SECRET || 'test-secret-key',
    { expiresIn: '1h' }
  );
}

/**
 * Create a test session
 */
async function createTestSession(userId, sessionType = 'gentle_deep') {
  return await Session.create({
    user_id: userId,
    session_type: sessionType,
    state: 'active'
  });
}

/**
 * Clean up test data
 */
async function cleanupTestData() {
  await Session.destroy({ where: {}, truncate: true, cascade: true });
  await User.destroy({ where: {}, truncate: true, cascade: true });
}

module.exports = {
  createTestUser,
  generateAuthToken,
  createTestSession,
  cleanupTestData
};

