#!/usr/bin/env node
/**
 * Database Restore Script
 * Restores a PostgreSQL database from a backup file
 */

require('dotenv').config();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { config } = require('../src/config/environment');
const { promisify } = require('util');

const execAsync = promisify(exec);
const dbConfig = config.database;
const backupDir = process.env.BACKUP_DIR || path.join(__dirname, '../../backups');

// Get backup file from command line argument or list available backups
const backupFile = process.argv[2];

async function listBackups() {
  console.log('📋 Available backups:\n');
  
  if (!fs.existsSync(backupDir)) {
    console.log('❌ Backup directory does not exist:', backupDir);
    return;
  }

  const files = fs.readdirSync(backupDir)
    .filter(file => file.startsWith('backup-') && (file.endsWith('.sql') || file.endsWith('.sql.gz')))
    .sort()
    .reverse(); // Most recent first

  if (files.length === 0) {
    console.log('❌ No backups found in:', backupDir);
    return;
  }

  files.forEach((file, index) => {
    const filePath = path.join(backupDir, file);
    const stats = fs.statSync(filePath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    const date = stats.mtime.toISOString();
    console.log(`${index + 1}. ${file}`);
    console.log(`   Size: ${sizeMB} MB | Date: ${date}\n`);
  });
}

async function restoreDatabase(backupFilePath) {
  // Check if file exists
  if (!fs.existsSync(backupFilePath)) {
    console.error(`❌ Backup file not found: ${backupFilePath}`);
    process.exit(1);
  }

  // Check if compressed
  const isCompressed = backupFilePath.endsWith('.gz');
  let restoreCmd;

  if (isCompressed) {
    // Use gunzip and psql pipeline for compressed backups
    restoreCmd = `gunzip -c "${backupFilePath}" | psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.name}`;
  } else {
    // Direct psql for uncompressed backups
    restoreCmd = `psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.name} -f "${backupFilePath}"`;
  }

  // Set PGPASSWORD environment variable
  const env = {
    ...process.env,
    PGPASSWORD: dbConfig.password
  };

  console.log('🔄 Starting database restore...');
  console.log(`Database: ${dbConfig.name}@${dbConfig.host}:${dbConfig.port}`);
  console.log(`Backup file: ${backupFilePath}`);
  console.log(`⚠️  WARNING: This will overwrite existing data!\n`);

  // Confirm in non-interactive mode
  if (process.env.FORCE_RESTORE !== 'true') {
    console.log('⚠️  To proceed, set FORCE_RESTORE=true or run interactively');
    console.log('Example: FORCE_RESTORE=true node scripts/restore-database.js <backup-file>');
    process.exit(1);
  }

  try {
    const { stdout, stderr } = await execAsync(restoreCmd, { env, maxBuffer: 10 * 1024 * 1024 });
    
    if (stderr && !stderr.includes('NOTICE') && !stderr.includes('WARNING')) {
      console.error('⚠️  Warnings:', stderr);
    }
    
    console.log('✅ Database restored successfully!');
    console.log(`📁 Restored from: ${backupFilePath}`);
    console.log(`🕐 Timestamp: ${new Date().toISOString()}`);
  } catch (error) {
    console.error('❌ Restore failed:', error.message);
    if (error.stderr) {
      console.error('Error details:', error.stderr);
    }
    process.exit(1);
  }
}

async function main() {
  if (!backupFile) {
    console.log('📋 Database Restore Script\n');
    await listBackups();
    console.log('\nUsage: node scripts/restore-database.js <backup-file>');
    console.log('Example: node scripts/restore-database.js backup-shadow_coach-2024-01-01T00-00-00-000Z.sql');
    console.log('\n⚠️  WARNING: Restore will overwrite existing data!');
    console.log('Set FORCE_RESTORE=true to proceed without confirmation\n');
    process.exit(0);
  }

  // Resolve backup file path
  let backupFilePath = backupFile;
  if (!path.isAbsolute(backupFile)) {
    // Try in backup directory first
    const backupInDir = path.join(backupDir, backupFile);
    if (fs.existsSync(backupInDir)) {
      backupFilePath = backupInDir;
    } else if (!fs.existsSync(backupFile)) {
      console.error(`❌ Backup file not found: ${backupFile}`);
      console.error(`   Tried: ${backupInDir}`);
      console.error(`   Tried: ${backupFile}`);
      process.exit(1);
    }
  }

  await restoreDatabase(backupFilePath);
}

main().catch(console.error);

