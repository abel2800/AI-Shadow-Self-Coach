const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
async function authenticate(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          code: 'AUTH_MISSING_TOKEN',
          message: 'Missing or invalid authorization token'
        }
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findByPk(decoded.user_id);

    if (!user || !user.is_active) {
      return res.status(401).json({
        error: {
          code: 'AUTH_INVALID_TOKEN',
          message: 'Invalid or inactive user'
        }
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: {
          code: 'AUTH_INVALID_TOKEN',
          message: 'Invalid or expired token'
        }
      });
    }
    next(error);
  }
}

module.exports = authenticate;

