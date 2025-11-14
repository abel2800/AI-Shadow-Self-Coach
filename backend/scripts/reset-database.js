#!/usr/bin/env node
/**
 * Reset Database Script
 * Drops all tables and recreates them (USE WITH CAUTION)
 */

const { sequelize } = require('../src/config/database');
const logger = require('../src/utils/logger');

async function resetDatabase() {
  try {
    console.log('⚠️  WARNING: This will DROP ALL TABLES and recreate them!');
    console.log('Press Ctrl+C within 5 seconds to cancel...\n');
    
    // Wait 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('Starting database reset...');
    
    // Drop all tables
    await sequelize.drop({ cascade: true });
    console.log('✅ Dropped all tables');
    
    // Run migrations
    const { execSync } = require('child_process');
    console.log('Running migrations...');
    execSync('npm run migrate', { stdio: 'inherit', cwd: __dirname + '/..' });
    console.log('✅ Migrations completed');
    
    console.log('\n✅ Database reset complete!');
    process.exit(0);
  } catch (error) {
    logger.error('Database reset failed:', error);
    console.error('❌ Database reset failed:', error.message);
    process.exit(1);
  }
}

// Only run if called directly
if (require.main === module) {
  resetDatabase();
}

module.exports = { resetDatabase };

