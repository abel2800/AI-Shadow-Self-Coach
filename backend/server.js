require('dotenv').config();

const http = require('http');
const app = require('./src/app');
const { sequelize } = require('./src/config/database');
const WebSocketService = require('./src/services/websocket.service');
const { config, validateConfig, getEnvironment } = require('./src/config/environment');

// Validate configuration on startup
try {
  validateConfig();
  console.log('✅ Configuration validated');
} catch (error) {
  console.error('❌ Configuration validation failed:', error.message);
  if (getEnvironment() === 'production' || getEnvironment() === 'staging') {
    process.exit(1);
  } else {
    console.warn('⚠️  Continuing with invalid configuration (development mode)');
  }
}

const PORT = config.app.port;

// Test database connection
sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connection established successfully.');
    
    // Create HTTP server
    const server = http.createServer(app);
    
    // Initialize WebSocket service
    if (config.websocket.enabled) {
      const wsService = new WebSocketService(server);
      console.log('✅ WebSocket service initialized');
    }
    
    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${getEnvironment()}`);
      console.log(`🔗 API Base URL: ${config.app.apiBaseUrl}`);
      if (config.websocket.enabled) {
        console.log(`🔌 WebSocket URL: ws://localhost:${PORT}/ws`);
      }
      if (config.sentry.enabled) {
        console.log(`📊 Sentry: Enabled`);
      }
    });
  })
  .catch((error) => {
    console.error('❌ Unable to connect to database:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await sequelize.close();
  process.exit(0);
});

