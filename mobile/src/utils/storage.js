/**
 * Storage Utilities
 * Encrypted local storage for session data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'shadow-coach-encryption-key'; // In production, use secure key storage

/**
 * Encrypt data before storing
 */
const encrypt = (data) => {
  const jsonString = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
};

/**
 * Decrypt data after retrieving
 */
const decrypt = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

/**
 * Store encrypted session data
 */
export const storeSession = async (sessionId, sessionData) => {
  try {
    const encrypted = encrypt(sessionData);
    await AsyncStorage.setItem(`session_${sessionId}`, encrypted);
    return true;
  } catch (error) {
    console.error('Error storing session:', error);
    return false;
  }
};

/**
 * Retrieve and decrypt session data
 */
export const getSession = async (sessionId) => {
  try {
    const encrypted = await AsyncStorage.getItem(`session_${sessionId}`);
    if (!encrypted) return null;
    return decrypt(encrypted);
  } catch (error) {
    console.error('Error retrieving session:', error);
    return null;
  }
};

/**
 * Delete session data
 */
export const deleteSession = async (sessionId) => {
  try {
    await AsyncStorage.removeItem(`session_${sessionId}`);
    return true;
  } catch (error) {
    console.error('Error deleting session:', error);
    return false;
  }
};

/**
 * Store user preferences
 */
export const storePreferences = async (preferences) => {
  try {
    await AsyncStorage.setItem('user_preferences', JSON.stringify(preferences));
    return true;
  } catch (error) {
    console.error('Error storing preferences:', error);
    return false;
  }
};

/**
 * Get user preferences
 */
export const getPreferences = async () => {
  try {
    const preferences = await AsyncStorage.getItem('user_preferences');
    return preferences ? JSON.parse(preferences) : null;
  } catch (error) {
    console.error('Error retrieving preferences:', error);
    return null;
  }
};

