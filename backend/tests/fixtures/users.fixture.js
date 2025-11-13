/**
 * User Test Fixtures
 * Reusable user data for tests
 */

const bcrypt = require('bcryptjs');

const userFixtures = {
  /**
   * Standard test user
   */
  standard: {
    email: 'testuser@example.com',
    password: 'testpassword123',
    consent_for_research: false,
    preferences: {
      session_length: 'medium',
      notifications_enabled: true
    }
  },

  /**
   * User with research consent
   */
  withConsent: {
    email: 'consentuser@example.com',
    password: 'testpassword123',
    consent_for_research: true,
    preferences: {
      session_length: 'long',
      notifications_enabled: false
    }
  },

  /**
   * Minimal user (only required fields)
   */
  minimal: {
    email: 'minimal@example.com',
    password: 'password123'
  },

  /**
   * User with all preferences
   */
  fullPreferences: {
    email: 'fullprefs@example.com',
    password: 'testpassword123',
    consent_for_research: true,
    preferences: {
      session_length: 'long',
      notifications_enabled: true,
      theme: 'dark',
      language: 'en'
    }
  }
};

/**
 * Generate unique user email
 */
function generateUniqueEmail(prefix = 'test') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
}

/**
 * Create user data with hashed password
 */
async function createUserData(fixture = 'standard', overrides = {}) {
  const baseData = userFixtures[fixture] || userFixtures.standard;
  const email = overrides.email || generateUniqueEmail();
  const password = overrides.password || baseData.password;
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  return {
    ...baseData,
    ...overrides,
    email,
    password: hashedPassword
  };
}

module.exports = {
  userFixtures,
  generateUniqueEmail,
  createUserData
};

