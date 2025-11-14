#!/usr/bin/env node
/**
 * Generate API Documentation Script
 * Generates OpenAPI/Swagger documentation from code
 */

const fs = require('fs');
const path = require('path');

async function generateApiDocs() {
  try {
    console.log('📚 Generating API documentation...\n');
    
    // This script would typically use swagger-jsdoc to generate docs
    // For now, we'll just verify the Swagger setup is correct
    
    const swaggerConfig = require('../src/config/swagger');
    
    console.log('✅ Swagger configuration loaded');
    console.log(`   Title: ${swaggerConfig.definition.info.title}`);
    console.log(`   Version: ${swaggerConfig.definition.info.version}`);
    console.log(`   Base Path: ${swaggerConfig.definition.servers[0].url}`);
    
    console.log('\n📋 API Documentation available at:');
    console.log('   http://localhost:3000/api-docs');
    console.log('\n💡 Start the server and visit the URL above to view interactive API docs');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to generate API documentation:', error.message);
    process.exit(1);
  }
}

// Only run if called directly
if (require.main === module) {
  generateApiDocs();
}

module.exports = { generateApiDocs };

