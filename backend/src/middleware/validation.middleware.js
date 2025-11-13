/**
 * Validation Middleware
 * Request validation using Joi
 */

const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors,
          request_id: req.id
        }
      });
    }

    req.body = value;
    next();
  };
};

// Validation schemas
const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    consent_for_research: Joi.boolean().default(false),
    preferences: Joi.object({
      session_length: Joi.string().valid('short', 'medium', 'long').default('medium'),
      notifications_enabled: Joi.boolean().default(true)
    }).optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  startSession: Joi.object({
    session_type: Joi.string().valid('check-in', 'gentle_deep', 'micro_practice').required(),
    mood_score: Joi.number().integer().min(1).max(10).optional(),
    initial_message: Joi.string().optional(),
    consent_for_deep_exploration: Joi.boolean().default(false)
  }),

  sendMessage: Joi.object({
    message_text: Joi.string().required().min(1).max(5000),
    timestamp: Joi.date().optional()
  }),

  submitMood: Joi.object({
    mood_score: Joi.number().integer().min(1).max(10).required(),
    timestamp: Joi.date().optional(),
    notes: Joi.string().max(1000).optional()
  }),

  exportEntries: Joi.object({
    format: Joi.string().valid('text', 'pdf').default('text'),
    session_ids: Joi.array().items(Joi.string().uuid()).optional(),
    date_range: Joi.object({
      start: Joi.date().optional(),
      end: Joi.date().optional()
    }).optional(),
    include_transcript: Joi.boolean().default(true),
    include_highlights: Joi.boolean().default(true)
  }),

  updatePreferences: Joi.object({
    session_length: Joi.string().valid('short', 'medium', 'long').optional(),
    notifications_enabled: Joi.boolean().optional(),
    preferred_name: Joi.string().max(100).optional(),
    timezone: Joi.string().optional()
  }),

  refreshToken: Joi.object({
    refresh_token: Joi.string().required()
  })
};

module.exports = {
  validate,
  schemas
};
