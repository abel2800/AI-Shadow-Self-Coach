/**
 * Encryption Configuration
 * Encryption utilities for sensitive data
 */

const crypto = require('crypto');

const ALGORITHM = process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm';
const KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production-32-chars';

/**
 * Encrypt data
 */
function encrypt(text) {
  if (!text) return null;
  
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(KEY.substring(0, 32)), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

/**
 * Decrypt data
 */
function decrypt(encryptedData) {
  if (!encryptedData || !encryptedData.encrypted) return null;
  
  try {
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const authTag = Buffer.from(encryptedData.authTag, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(KEY.substring(0, 32)), iv);
    
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

module.exports = {
  encrypt,
  decrypt
};

