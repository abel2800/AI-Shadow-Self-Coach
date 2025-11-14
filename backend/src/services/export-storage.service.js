/**
 * Export Storage Service
 * Manages export file storage and retrieval (in-memory for MVP)
 * In production, use S3, Azure Blob, or similar
 */

const fs = require('fs').promises;
const path = require('path');

// In-memory storage for exports (MVP)
// In production, use persistent storage (S3, database, etc.)
const exportStorage = new Map();

// Storage directory for file-based exports
const EXPORTS_DIR = path.join(__dirname, '../../exports');

// Ensure exports directory exists
async function ensureExportsDir() {
  try {
    await fs.mkdir(EXPORTS_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

/**
 * Store export file
 */
async function storeExport(exportId, content, format, metadata = {}) {
  await ensureExportsDir();
  
  const filename = metadata.filename || `export_${exportId}.${format === 'pdf' ? 'pdf' : 'txt'}`;
  const filepath = path.join(EXPORTS_DIR, filename);
  
  // Write file to disk
  await fs.writeFile(filepath, content, 'utf8');
  
  const fileSize = Buffer.byteLength(content, 'utf8');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  // Store metadata in memory
  exportStorage.set(exportId, {
    export_id: exportId,
    filename,
    filepath,
    format,
    file_size_bytes: fileSize,
    status: 'completed',
    created_at: new Date(),
    expires_at: expiresAt,
    ...metadata
  });
  
  return {
    export_id: exportId,
    filename,
    filepath,
    file_size_bytes: fileSize,
    expires_at: expiresAt
  };
}

/**
 * Get export metadata
 */
function getExport(exportId) {
  const exportData = exportStorage.get(exportId);
  
  if (!exportData) {
    return null;
  }
  
  // Check if expired
  if (new Date() > new Date(exportData.expires_at)) {
    exportStorage.delete(exportId);
    // Clean up file
    fs.unlink(exportData.filepath).catch(() => {});
    return null;
  }
  
  return exportData;
}

/**
 * Get export file content
 */
async function getExportContent(exportId) {
  const exportData = getExport(exportId);
  
  if (!exportData) {
    return null;
  }
  
  try {
    const content = await fs.readFile(exportData.filepath, 'utf8');
    return {
      content,
      filename: exportData.filename,
      format: exportData.format
    };
  } catch (error) {
    return null;
  }
}

/**
 * Delete export
 */
async function deleteExport(exportId) {
  const exportData = exportStorage.get(exportId);
  
  if (exportData) {
    exportStorage.delete(exportId);
    try {
      await fs.unlink(exportData.filepath);
    } catch (error) {
      // File might not exist
    }
  }
}

/**
 * Clean up expired exports
 */
async function cleanupExpiredExports() {
  const now = new Date();
  const expiredIds = [];
  
  for (const [exportId, exportData] of exportStorage.entries()) {
    if (new Date(exportData.expires_at) < now) {
      expiredIds.push(exportId);
    }
  }
  
  for (const exportId of expiredIds) {
    await deleteExport(exportId);
  }
  
  return expiredIds.length;
}

module.exports = {
  storeExport,
  getExport,
  getExportContent,
  deleteExport,
  cleanupExpiredExports
};

