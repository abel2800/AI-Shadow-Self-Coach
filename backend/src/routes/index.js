/**
 * Routes Index
 * Central export for all routes
 */

const authRoutes = require('./auth.routes');
const sessionRoutes = require('./session.routes');
const conversationRoutes = require('./conversation.routes');
const journalRoutes = require('./journal.routes');
const analyticsRoutes = require('./analytics.routes');
const safetyRoutes = require('./safety.routes');

module.exports = {
  authRoutes,
  sessionRoutes,
  conversationRoutes,
  journalRoutes,
  analyticsRoutes,
  safetyRoutes,
};

