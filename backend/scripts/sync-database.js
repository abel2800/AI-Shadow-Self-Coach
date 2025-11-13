/**
 * Database Sync Script
 * Creates all tables automatically using Sequelize models
 * Run: node scripts/sync-database.js
 */

require('dotenv').config();
const { sequelize } = require('../src/config/database');
const User = require('../src/models/User');
const Session = require('../src/models/Session');
const Message = require('../src/models/Message');

async function syncDatabase() {
  try {
    console.log('🔄 Connecting to database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    console.log('🔄 Syncing database models...');
    
    // Sync all models (creates tables if they don't exist)
    // force: false - won't drop existing tables
    // alter: true - will alter tables to match models
    await sequelize.sync({ 
      force: false,  // Set to true to drop and recreate tables (DANGEROUS!)
      alter: true    // Alters tables to match models
    });
    
    console.log('✅ Database tables created/updated successfully!');
    console.log('');
    console.log('📊 Created tables:');
    console.log('  - users');
    console.log('  - sessions');
    console.log('  - messages');
    console.log('');
    
    // Close connection
    await sequelize.close();
    console.log('✅ Database connection closed.');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error syncing database:', error);
    process.exit(1);
  }
}

// Run sync
syncDatabase();

