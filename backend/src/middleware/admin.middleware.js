/**
 * Admin Middleware
 * Checks if the authenticated user has admin privileges
 */

const { ForbiddenError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Middleware to check if user is admin
 * Currently checks for is_admin flag on user object
 * In production, use role-based access control (RBAC)
 */
const requireAdmin = (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      logger.warn('Admin check attempted without authentication');
      return next(new ForbiddenError('Authentication required'));
    }

    // Check if user has admin flag
    // In production, this would check a roles/permissions system
    if (!req.user.is_admin) {
      logger.warn(`User ${req.user.id} attempted to access admin-only endpoint`);
      return next(new ForbiddenError('Admin privileges required'));
    }

    next();
  } catch (error) {
    logger.error('Error in admin middleware:', error);
    next(new ForbiddenError('Failed to verify admin status'));
  }
};

module.exports = requireAdmin;

