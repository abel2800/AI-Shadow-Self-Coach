/**
 * Export Service
 * Handles exporting journal entries as PDF or text
 */

import { Platform, Alert, Share, PermissionsAndroid } from 'react-native';
import RNFS from 'react-native-fs';
import { journalAPI } from './api';

/**
 * Request storage permission (Android)
 */
async function requestStoragePermission() {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Storage Permission',
        message: 'App needs access to storage to save exports',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('Permission error:', err);
    return false;
  }
}

/**
 * Export journal entries
 */
export async function exportJournalEntries({
  format = 'text',
  sessionIds = null,
  dateRange = null,
  includeTranscript = true,
  includeHighlights = true,
}) {
  try {
    // Request permission if needed
    if (Platform.OS === 'android') {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Storage permission is required to export files.'
        );
        return null;
      }
    }

    // Call backend export API
    const response = await journalAPI.export(
      format,
      sessionIds,
      dateRange,
      includeTranscript,
      includeHighlights
    );

    if (!response.data || !response.data.content) {
      throw new Error('Export data not available');
    }

    const { content, filename } = response.data;

    // Save file locally
    const fileUri = await saveExportFile(content, filename, format);

    // Share file using React Native Share
    await Share.share({
      url: Platform.OS === 'ios' ? fileUri : `file://${fileUri}`,
      title: filename,
      message: format === 'text' ? content : undefined,
    }, {
      mimeType: format === 'pdf' ? 'application/pdf' : 'text/plain',
      dialogTitle: 'Export Journal Entry',
    });

    return {
      success: true,
      fileUri,
      filename,
    };
  } catch (error) {
    console.error('Export error:', error);
    Alert.alert(
      'Export Failed',
      error.message || 'Failed to export journal entry. Please try again.'
    );
    return null;
  }
}

/**
 * Save export file to device
 */
async function saveExportFile(content, filename, format) {
  const fileExtension = format === 'pdf' ? '.pdf' : '.txt';
  const fullFilename = filename.endsWith(fileExtension) ? filename : `${filename}${fileExtension}`;
  
  // Determine file path based on platform
  const documentsPath = Platform.OS === 'ios' 
    ? RNFS.DocumentDirectoryPath 
    : RNFS.DownloadDirectoryPath;
  
  const fileUri = `${documentsPath}/${fullFilename}`;
  
  // Write file
  await RNFS.writeFile(fileUri, content, 'utf8');

  return fileUri;
}

/**
 * Export single session
 */
export async function exportSession(sessionId, format = 'text') {
  return exportJournalEntries({
    format,
    sessionIds: [sessionId],
    includeTranscript: true,
    includeHighlights: true,
  });
}

/**
 * Export multiple sessions
 */
export async function exportSessions(sessionIds, format = 'text') {
  return exportJournalEntries({
    format,
    sessionIds,
    includeTranscript: true,
    includeHighlights: true,
  });
}

/**
 * Export by date range
 */
export async function exportByDateRange(startDate, endDate, format = 'text') {
  return exportJournalEntries({
    format,
    dateRange: {
      start: startDate,
      end: endDate,
    },
    includeTranscript: true,
    includeHighlights: true,
  });
}

