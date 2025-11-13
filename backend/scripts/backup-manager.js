#!/usr/bin/env node
/**
 * Backup Manager
 * Manages database backups: list, cleanup, verify
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);
const backupDir = process.env.BACKUP_DIR || path.join(__dirname, '../../backups');

/**
 * List all backups with details
 */
function listBackups() {
  console.log('📋 Database Backups\n');
  
  if (!fs.existsSync(backupDir)) {
    console.log('❌ Backup directory does not exist:', backupDir);
    return;
  }

  const files = fs.readdirSync(backupDir)
    .filter(file => file.startsWith('backup-') && (file.endsWith('.sql') || file.endsWith('.sql.gz')))
    .map(file => {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      const metadataPath = filePath.replace(/\.(sql|sql\.gz)$/, '.json');
      
      let metadata = null;
      if (fs.existsSync(metadataPath)) {
        try {
          metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        } catch (e) {
          // Ignore metadata parse errors
        }
      }

      return {
        filename: file,
        path: filePath,
        size: stats.size,
        sizeMB: (stats.size / (1024 * 1024)).toFixed(2),
        created: stats.birthtime,
        modified: stats.mtime,
        metadata
      };
    })
    .sort((a, b) => b.modified - a.modified); // Most recent first

  if (files.length === 0) {
    console.log('❌ No backups found');
    return;
  }

  console.log(`Total backups: ${files.length}\n`);
  
  files.forEach((backup, index) => {
    console.log(`${index + 1}. ${backup.filename}`);
    console.log(`   Size: ${backup.sizeMB} MB`);
    console.log(`   Created: ${backup.created.toISOString()}`);
    console.log(`   Modified: ${backup.modified.toISOString()}`);
    if (backup.metadata) {
      console.log(`   Database: ${backup.metadata.database}`);
      console.log(`   Environment: ${backup.metadata.environment}`);
    }
    console.log('');
  });

  // Calculate total size
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
  console.log(`Total size: ${totalSizeMB} MB`);
}

/**
 * Clean up old backups
 */
function cleanupBackups(daysToKeep = 30) {
  console.log(`🧹 Cleaning up backups older than ${daysToKeep} days...\n`);
  
  if (!fs.existsSync(backupDir)) {
    console.log('❌ Backup directory does not exist');
    return;
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const files = fs.readdirSync(backupDir)
    .filter(file => file.startsWith('backup-'))
    .map(file => {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      return {
        filename: file,
        path: filePath,
        modified: stats.mtime,
        size: stats.size
      };
    })
    .filter(file => file.modified < cutoffDate);

  if (files.length === 0) {
    console.log('✅ No old backups to clean up');
    return;
  }

  let totalSize = 0;
  files.forEach(file => {
    try {
      fs.unlinkSync(file.path);
      // Also remove metadata file if exists
      const metadataPath = file.path.replace(/\.(sql|sql\.gz)$/, '.json');
      if (fs.existsSync(metadataPath)) {
        fs.unlinkSync(metadataPath);
      }
      console.log(`✅ Deleted: ${file.filename}`);
      totalSize += file.size;
    } catch (error) {
      console.error(`❌ Failed to delete ${file.filename}:`, error.message);
    }
  });

  const freedMB = (totalSize / (1024 * 1024)).toFixed(2);
  console.log(`\n✅ Cleanup complete. Freed ${freedMB} MB`);
}

/**
 * Verify backup integrity
 */
async function verifyBackup(backupFile) {
  console.log(`🔍 Verifying backup: ${backupFile}\n`);
  
  const backupPath = path.isAbsolute(backupFile) 
    ? backupFile 
    : path.join(backupDir, backupFile);

  if (!fs.existsSync(backupPath)) {
    console.error(`❌ Backup file not found: ${backupPath}`);
    return false;
  }

  const isCompressed = backupPath.endsWith('.gz');
  
  try {
    if (isCompressed) {
      // Test gzip integrity
      await execAsync(`gzip -t "${backupPath}"`);
      console.log('✅ Backup file is valid (compressed)');
    } else {
      // Check if file contains SQL
      const content = fs.readFileSync(backupPath, 'utf8', { start: 0, end: 100 });
      if (content.includes('PostgreSQL database dump') || content.includes('CREATE TABLE')) {
        console.log('✅ Backup file appears valid (SQL format)');
      } else {
        console.log('⚠️  Backup file format may be invalid');
        return false;
      }
    }
    
    const stats = fs.statSync(backupPath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`📊 Size: ${sizeMB} MB`);
    console.log(`📅 Modified: ${stats.mtime.toISOString()}`);
    
    return true;
  } catch (error) {
    console.error('❌ Backup verification failed:', error.message);
    return false;
  }
}

// CLI
const command = process.argv[2];
const arg = process.argv[3];

switch (command) {
  case 'list':
    listBackups();
    break;
  
  case 'cleanup':
    const days = arg ? parseInt(arg) : 30;
    cleanupBackups(days);
    break;
  
  case 'verify':
    if (!arg) {
      console.error('Usage: node scripts/backup-manager.js verify <backup-file>');
      process.exit(1);
    }
    verifyBackup(arg).then(valid => {
      process.exit(valid ? 0 : 1);
    });
    break;
  
  default:
    console.log('📋 Backup Manager\n');
    console.log('Usage:');
    console.log('  node scripts/backup-manager.js list              - List all backups');
    console.log('  node scripts/backup-manager.js cleanup [days]      - Clean up old backups (default: 30 days)');
    console.log('  node scripts/backup-manager.js verify <file>       - Verify backup integrity');
    break;
}

