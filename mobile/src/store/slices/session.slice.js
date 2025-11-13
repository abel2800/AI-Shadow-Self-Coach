/**
 * Session Slice
 * Redux slice for session state management
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sessionAPI } from '../../services/api';

// Async thunks
export const startSession = createAsyncThunk(
  'session/start',
  async ({ sessionType, moodScore, initialMessage, consentForDeepExploration }, { rejectWithValue }) => {
    try {
      const response = await sessionAPI.start(
        sessionType,
        moodScore,
        initialMessage,
        consentForDeepExploration
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'session/sendMessage',
  async ({ sessionId, messageText, timestamp }, { rejectWithValue }) => {
    try {
      const response = await sessionAPI.sendMessage(sessionId, messageText, timestamp);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const pauseSession = createAsyncThunk(
  'session/pause',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await sessionAPI.pause(sessionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const endSession = createAsyncThunk(
  'session/end',
  async ({ sessionId, rating, feedback }, { rejectWithValue }) => {
    try {
      const response = await sessionAPI.end(sessionId, rating, feedback);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getSessionSummary = createAsyncThunk(
  'session/getSummary',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await sessionAPI.getSummary(sessionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Initial state
const initialState = {
  currentSession: null,
  messages: [],
  isLoading: false,
  error: null,
  sessionState: null, // 'active', 'paused', 'completed'
};

// Slice
const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    clearSession: (state) => {
      state.currentSession = null;
      state.messages = [];
      state.sessionState = null;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setSessionState: (state, action) => {
      state.sessionState = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Start session
    builder
      .addCase(startSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSession = {
          session_id: action.payload.session_id,
          session_type: action.payload.session_type,
        };
        state.sessionState = 'active';
        if (action.payload.assistant_message) {
          state.messages = [action.payload.assistant_message];
        }
      })
      .addCase(startSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Send message
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.assistant_message) {
          state.messages.push(action.payload.assistant_message);
        }
        if (action.payload.session_state) {
          state.sessionState = action.payload.session_state;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // End session
    builder
      .addCase(endSession.fulfilled, (state, action) => {
        state.sessionState = 'completed';
        state.currentSession = null;
      });
  },
});

export const { clearSession, addMessage, setSessionState } = sessionSlice.actions;
export default sessionSlice.reducer;

