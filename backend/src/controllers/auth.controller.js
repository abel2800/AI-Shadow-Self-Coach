const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { v4: uuidv4 } = require('uuid');

// Generate JWT token
function generateToken(userId) {
  return jwt.sign(
    { user_id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// Register new user
exports.register = async (req, res, next) => {
  try {
    const { email, password, consent_for_research, preferences } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_REQUIRED_FIELD',
          message: 'Email and password are required'
        }
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        error: {
          code: 'DUPLICATE_ENTRY',
          message: 'Email already registered'
        }
      });
    }

    // Create user
    const user = await User.create({
      id: uuidv4(),
      email,
      password,
      consent_for_research: consent_for_research || false,
      preferences: preferences || {
        session_length: 'medium',
        notifications_enabled: true
      }
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      user_id: user.id,
      token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    });
  } catch (error) {
    next(error);
  }
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_REQUIRED_FIELD',
          message: 'Email and password are required'
        }
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        error: {
          code: 'AUTH_INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: {
          code: 'AUTH_INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.status(200).json({
      user_id: user.id,
      token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  } catch (error) {
    next(error);
  }
};

// Refresh token
exports.refresh = async (req, res, next) => {
  try {
    // Token should be in Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          code: 'AUTH_MISSING_TOKEN',
          message: 'Missing authorization token'
        }
      });
    }

    const token = authHeader.substring(7);

    // Verify token (even if expired, we'll allow refresh)
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      // If token expired, try to decode without verification
      decoded = jwt.decode(token);
      if (!decoded) {
        return res.status(401).json({
          error: {
            code: 'AUTH_INVALID_TOKEN',
            message: 'Invalid token'
          }
        });
      }
    }

    // Check if user still exists and is active
    const user = await User.findByPk(decoded.user_id);
    if (!user || !user.is_active) {
      return res.status(401).json({
        error: {
          code: 'AUTH_INVALID_TOKEN',
          message: 'Invalid or inactive user'
        }
      });
    }

    // Generate new token
    const newToken = generateToken(user.id);

    res.status(200).json({
      token: newToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  } catch (error) {
    next(error);
  }
};

