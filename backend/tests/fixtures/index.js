/**
 * Test Fixtures Index
 * Central export for all test fixtures
 */

const userFixtures = require('./users.fixture');
const sessionFixtures = require('./sessions.fixture');
const messageFixtures = require('./messages.fixture');
const moodFixtures = require('./moods.fixture');

module.exports = {
  ...userFixtures,
  ...sessionFixtures,
  ...messageFixtures,
  ...moodFixtures
};

