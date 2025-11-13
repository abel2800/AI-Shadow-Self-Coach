/**
 * API Service
 * Handles all API communication with backend
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('auth_token');
      // Navigate to login (handled by app)
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (email, password, consentForResearch = false) =>
    api.post('/auth/register', { email, password, consent_for_research: consentForResearch }),
  
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  
  refresh: () =>
    api.post('/auth/refresh'),
};

// Session endpoints
export const sessionAPI = {
  start: (sessionType, moodScore, initialMessage, consentForDeepExploration) =>
    api.post('/session/start', {
      session_type: sessionType,
      mood_score: moodScore,
      initial_message: initialMessage,
      consent_for_deep_exploration: consentForDeepExploration,
    }),
  
  sendMessage: (sessionId, messageText, timestamp) =>
    api.post(`/session/${sessionId}/message`, {
      message_text: messageText,
      timestamp: timestamp || new Date().toISOString(),
    }),
  
  pause: (sessionId) =>
    api.post(`/session/${sessionId}/pause`),
  
  resume: (sessionId, resumeToken) =>
    api.post(`/session/${sessionId}/resume`, { resume_token: resumeToken }),
  
  end: (sessionId, rating, feedback) =>
    api.post(`/session/${sessionId}/end`, { rating, feedback }),
  
  getSummary: (sessionId) =>
    api.get(`/session/${sessionId}/summary`),
  
  list: (params = {}) =>
    api.get('/session', { params }),
};

// Journal endpoints
export const journalAPI = {
  listEntries: (params = {}) =>
    api.get('/journal/entries', { params }),
  
  getEntry: (sessionId) =>
    api.get(`/journal/entry/${sessionId}`),
  
  addHighlight: (sessionId, messageId, note) =>
    api.post(`/journal/entry/${sessionId}/highlight`, { message_id: messageId, note }),
  
  updateTags: (sessionId, tags) =>
    api.post(`/journal/entry/${sessionId}/tags`, { tags }),
  
  export: (format, sessionIds, dateRange, includeTranscript, includeHighlights) =>
    api.post('/journal/export', {
      format,
      session_ids: sessionIds,
      date_range: dateRange,
      include_transcript: includeTranscript,
      include_highlights: includeHighlights,
    }),
  
  deleteEntry: (sessionId) =>
    api.delete(`/journal/entry/${sessionId}`),
};

// Analytics endpoints
export const analyticsAPI = {
  submitMood: (moodScore, timestamp, notes) =>
    api.post('/analytics/mood', { mood_score: moodScore, timestamp, notes }),
  
  getMoodHistory: (startDate, endDate, granularity) =>
    api.get('/analytics/mood', { params: { start_date: startDate, end_date: endDate, granularity } }),
  
  getInsights: (startDate, endDate) =>
    api.get('/analytics/insights', { params: { start_date: startDate, end_date: endDate } }),
  
  getProgress: (startDate, endDate) =>
    api.get('/analytics/progress', { params: { start_date: startDate, end_date: endDate } }),
};

// Safety endpoints
export const safetyAPI = {
  submitCheckIn: (sessionId, safetyStatus, message) =>
    api.post('/safety/check-in', { session_id: sessionId, safety_status: safetyStatus, message }),
  
  getResources: (country, region) =>
    api.get('/safety/resources', { params: { country, region } }),
  
  requestReferral: (preferences, consentForContact) =>
    api.post('/safety/referral', { preferences, consent_for_contact: consentForContact }),
};

export default api;

