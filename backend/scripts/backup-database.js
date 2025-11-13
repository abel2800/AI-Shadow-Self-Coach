#!/usr/bin/env node
/**
 * Database Backup Script
 * Creates a PostgreSQL database backup
 */

require('dotenv').config();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { config } = require('../src/config/environment');

const dbConfig = config.database;
const backupDir = process.env.BACKUP_DIR || path.join(__dirname, '../../backups');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFilename = `backup-${dbConfig.name}-${timestamp}.sql`;
const backupPath = path.join(backupDir, backupFilename);

// Create backup directory if it doesn't exist
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
  console.log(`✅ Created backup directory: ${backupDir}`);
}

// Build pg_dump command
const pgDumpCmd = [
  'pg_dump',
  `-h ${dbConfig.host}`,
  `-p ${dbConfig.port}`,
  `-U ${dbConfig.user}`,
  `-d ${dbConfig.name}`,
  '--no-owner',
  '--no-acl',
  '--clean',
  '--if-exists',
  '--verbose'
].join(' ');

// Set PGPASSWORD environment variable
const env = {
  ...process.env,
  PGPASSWORD: dbConfig.password
};

console.log('🔄 Starting database backup...');
console.log(`Database: ${dbConfig.name}@${dbConfig.host}:${dbConfig.port}`);
console.log(`Backup file: ${backupPath}\n`);

// Execute backup
const backupProcess = exec(pgDumpCmd, { env }, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
  }

  if (stderr && !stderr.includes('pg_dump: warning')) {
    console.error('⚠️  Warnings:', stderr);
  }
});

// Write backup to file
const backupStream = fs.createWriteStream(backupPath);
backupProcess.stdout.pipe(backupStream);

backupProcess.on('close', (code) => {
  if (code === 0) {
    const stats = fs.statSync(backupPath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`✅ Backup completed successfully!`);
    console.log(`📁 File: ${backupPath}`);
    console.log(`📊 Size: ${sizeMB} MB`);
    console.log(`🕐 Timestamp: ${new Date().toISOString()}`);
    
    // Create backup metadata
    const metadata = {
      filename: backupFilename,
      path: backupPath,
      database: dbConfig.name,
      host: dbConfig.host,
      timestamp: new Date().toISOString(),
      size: stats.size,
      sizeMB: parseFloat(sizeMB),
      environment: process.env.NODE_ENV || 'development'
    };
    
    const metadataPath = backupPath.replace('.sql', '.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`📋 Metadata: ${metadataPath}`);
    
    // Compress backup if requested
    if (process.env.COMPRESS_BACKUP === 'true') {
      console.log('\n🗜️  Compressing backup...');
      const gzipCmd = `gzip "${backupPath}"`;
      exec(gzipCmd, (error) => {
        if (error) {
          console.error('⚠️  Compression failed:', error.message);
        } else {
          console.log(`✅ Backup compressed: ${backupPath}.gz`);
        }
      });
    }
  } else {
    console.error(`❌ Backup failed with code ${code}`);
    process.exit(1);
  }
});

