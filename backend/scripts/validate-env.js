#!/usr/bin/env node
/**
 * Environment Validation Script
 * Validates environment configuration before deployment
 */

require('dotenv').config();

const { validateConfig, getEnvironment, config } = require('../src/config/environment');

console.log('🔍 Validating environment configuration...\n');
console.log(`Environment: ${getEnvironment()}\n`);

try {
  validateConfig();
  console.log('✅ Configuration is valid!\n');
  
  // Display key configuration (without secrets)
  console.log('📋 Configuration Summary:');
  console.log(`  - App Name: ${config.app.name}`);
  console.log(`  - App Version: ${config.app.version}`);
  console.log(`  - Port: ${config.app.port}`);
  console.log(`  - Database: ${config.database.name}@${config.database.host}:${config.database.port}`);
  console.log(`  - Database SSL: ${config.database.ssl ? 'Enabled' : 'Disabled'}`);
  console.log(`  - Logging Level: ${config.logging.level}`);
  console.log(`  - Sentry: ${config.sentry.enabled ? 'Enabled' : 'Disabled'}`);
  console.log(`  - Vector Store: ${config.vectorStore.enabled ? 'Enabled' : 'Disabled'}`);
  console.log(`  - WebSocket: ${config.websocket.enabled ? 'Enabled' : 'Disabled'}`);
  console.log(`  - CORS Origin: ${config.cors.origin}`);
  
  process.exit(0);
} catch (error) {
  console.error('❌ Configuration validation failed:\n');
  console.error(error.message);
  console.error('\nPlease fix the errors above and try again.');
  process.exit(1);
}

