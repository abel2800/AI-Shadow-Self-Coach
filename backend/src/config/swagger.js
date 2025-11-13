/**
 * Swagger/OpenAPI Configuration
 * API documentation setup
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Shadow-Self Coach API',
      version: '1.0.0',
      description: 'RESTful API for the AI Shadow-Self Coach mobile application. Provides endpoints for authentication, session management, conversation, journaling, analytics, and safety features.',
      contact: {
        name: 'API Support',
        email: 'support@shadowcoach.app'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3000/api/v1',
        description: 'Development server'
      },
      {
        url: 'https://api.shadowcoach.app/v1',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /auth/login or /auth/register'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  description: 'Error code'
                },
                message: {
                  type: 'string',
                  description: 'Error message'
                },
                details: {
                  type: 'array',
                  items: {
                    type: 'object'
                  },
                  description: 'Additional error details'
                },
                request_id: {
                  type: 'string',
                  description: 'Request ID for tracking'
                }
              },
              required: ['code', 'message']
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'User ID'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            consent_for_research: {
              type: 'boolean',
              description: 'Consent for research participation'
            },
            preferences: {
              type: 'object',
              properties: {
                session_length: {
                  type: 'string',
                  enum: ['short', 'medium', 'long'],
                  description: 'Preferred session length'
                },
                notifications_enabled: {
                  type: 'boolean',
                  description: 'Notification preferences'
                }
              }
            },
            is_active: {
              type: 'boolean',
              description: 'User account status'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Session: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Session ID'
            },
            user_id: {
              type: 'string',
              format: 'uuid',
              description: 'User ID'
            },
            session_type: {
              type: 'string',
              enum: ['check-in', 'gentle_deep', 'micro_practice'],
              description: 'Type of session'
            },
            state: {
              type: 'string',
              enum: ['active', 'paused', 'completed'],
              description: 'Current session state'
            },
            mood_score: {
              type: 'integer',
              minimum: 1,
              maximum: 10,
              description: 'Initial mood score (1-10)'
            },
            summary: {
              type: 'object',
              description: 'Session summary (available after completion)'
            },
            started_at: {
              type: 'string',
              format: 'date-time'
            },
            ended_at: {
              type: 'string',
              format: 'date-time',
              nullable: true
            },
            duration_minutes: {
              type: 'integer',
              description: 'Session duration in minutes'
            }
          }
        },
        Message: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            session_id: {
              type: 'string',
              format: 'uuid'
            },
            role: {
              type: 'string',
              enum: ['user', 'assistant']
            },
            text: {
              type: 'string',
              description: 'Message text content'
            },
            metadata: {
              type: 'object',
              description: 'Additional message metadata'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Mood: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            user_id: {
              type: 'string',
              format: 'uuid'
            },
            mood_score: {
              type: 'integer',
              minimum: 1,
              maximum: 10,
              description: 'Mood score (1-10)'
            },
            notes: {
              type: 'string',
              nullable: true,
              description: 'Optional notes'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and registration'
      },
      {
        name: 'Sessions',
        description: 'Session management and conversation'
      },
      {
        name: 'Journal',
        description: 'Journal entries and session history'
      },
      {
        name: 'Analytics',
        description: 'Mood tracking and insights'
      },
      {
        name: 'Safety',
        description: 'Safety detection and crisis resources'
      },
      {
        name: 'Vector Store',
        description: 'Session memory and context retrieval'
      },
      {
        name: 'Health',
        description: 'System health checks'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './server.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

