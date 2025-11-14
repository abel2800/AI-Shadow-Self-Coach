#!/usr/bin/env node
/**
 * Health Check Script
 * Checks system health (database, environment, dependencies)
 */

const { sequelize } = require('../src/config/database');
const { config } = require('../src/config/environment');
const logger = require('../src/utils/logger');

async function checkDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database: Connected');
    return true;
  } catch (error) {
    console.log('❌ Database: Connection failed');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

function checkEnvironment() {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'OPENAI_API_KEY'
  ];
  
  const missing = [];
  const present = [];
  
  for (const key of required) {
    if (process.env[key]) {
      present.push(key);
    } else {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    console.log('❌ Environment: Missing required variables');
    missing.forEach(key => console.log(`   - ${key}`));
    return false;
  } else {
    console.log('✅ Environment: All required variables present');
    present.forEach(key => {
      const value = process.env[key];
      // Mask sensitive values
      if (key.includes('SECRET') || key.includes('KEY') || key.includes('PASSWORD')) {
        console.log(`   - ${key}: ${value.substring(0, 4)}...${value.substring(value.length - 4)}`);
      } else {
        console.log(`   - ${key}: ${value}`);
      }
    });
    return true;
  }
}

function checkConfig() {
  try {
    const dbConfig = config.database;
    console.log('✅ Configuration: Valid');
    console.log(`   Database: ${dbConfig.name}@${dbConfig.host}:${dbConfig.port}`);
    console.log(`   Environment: ${config.environment}`);
    return true;
  } catch (error) {
    console.log('❌ Configuration: Invalid');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function checkDependencies() {
  try {
    const required = [
      'express',
      'sequelize',
      'jsonwebtoken',
      'openai',
      'bcryptjs'
    ];
    
    const missing = [];
    const present = [];
    
    for (const dep of required) {
      try {
        require(dep);
        present.push(dep);
      } catch (error) {
        missing.push(dep);
      }
    }
    
    if (missing.length > 0) {
      console.log('❌ Dependencies: Missing packages');
      missing.forEach(dep => console.log(`   - ${dep}`));
      console.log('   Run: npm install');
      return false;
    } else {
      console.log('✅ Dependencies: All required packages installed');
      return true;
    }
  } catch (error) {
    console.log('❌ Dependencies: Check failed');
    return false;
  }
}

async function healthCheck() {
  console.log('🏥 System Health Check\n');
  console.log('='.repeat(50));
  
  const checks = [
    { name: 'Configuration', fn: checkConfig },
    { name: 'Environment', fn: checkEnvironment },
    { name: 'Dependencies', fn: checkDependencies },
    { name: 'Database', fn: checkDatabase }
  ];
  
  const results = [];
  
  for (const check of checks) {
    console.log(`\n📋 ${check.name}:`);
    const result = await check.fn();
    results.push(result);
  }
  
  console.log('\n' + '='.repeat(50));
  
  const allPassed = results.every(r => r === true);
  
  if (allPassed) {
    console.log('\n✅ All health checks passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Some health checks failed');
    process.exit(1);
  }
}

// Only run if called directly
if (require.main === module) {
  healthCheck();
}

module.exports = { healthCheck };

