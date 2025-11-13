/**
 * Health Check Controller
 * System health and status endpoints
 */

const { sequelize } = require('../config/database');
const { isOpenAIConfigured } = require('../config/llm');

/**
 * Basic health check
 */
exports.health = async (req, res) => {
  try {
    // Check database connection
    await sequelize.authenticate();
    const dbStatus = 'connected';
    
    // Check OpenAI
    const openaiStatus = isOpenAIConfigured() ? 'configured' : 'not_configured';
    
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: dbStatus,
        openai: openaiStatus
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
};

/**
 * Detailed health check
 */
exports.healthDetailed = async (req, res) => {
  try {
    // Database check
    const dbStart = Date.now();
    await sequelize.authenticate();
    const dbLatency = Date.now() - dbStart;
    
    // OpenAI check
    const openaiConfigured = isOpenAIConfigured();
    
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        database: {
          status: 'connected',
          latency_ms: dbLatency
        },
        openai: {
          status: openaiConfigured ? 'configured' : 'not_configured'
        }
      },
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
};

