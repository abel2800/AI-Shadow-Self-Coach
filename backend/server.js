require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { sequelize } = require('./src/config/database');
const WebSocketService = require('./src/services/websocket.service');

const PORT = process.env.PORT || 3000;

// Test database connection
sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connection established successfully.');
    
    // Create HTTP server
    const server = http.createServer(app);
    
    // Initialize WebSocket service
    if (process.env.ENABLE_WEBSOCKET !== 'false') {
      const wsService = new WebSocketService(server);
      console.log('✅ WebSocket service initialized');
    }
    
    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 API Base URL: ${process.env.API_BASE_URL || `http://localhost:${PORT}/api/v1`}`);
      if (process.env.ENABLE_WEBSOCKET !== 'false') {
        console.log(`🔌 WebSocket URL: ws://localhost:${PORT}/ws`);
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

