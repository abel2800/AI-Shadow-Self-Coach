/**
 * Journal Slice
 * Redux slice for journal state management
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { journalAPI } from '../../services/api';

// Async thunks
export const loadJournalEntries = createAsyncThunk(
  'journal/loadEntries',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await journalAPI.listEntries(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getJournalEntry = createAsyncThunk(
  'journal/getEntry',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await journalAPI.getEntry(sessionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addHighlight = createAsyncThunk(
  'journal/addHighlight',
  async ({ sessionId, messageId, note }, { rejectWithValue }) => {
    try {
      const response = await journalAPI.addHighlight(sessionId, messageId, note);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateTags = createAsyncThunk(
  'journal/updateTags',
  async ({ sessionId, tags }, { rejectWithValue }) => {
    try {
      const response = await journalAPI.updateTags(sessionId, tags);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const exportJournal = createAsyncThunk(
  'journal/export',
  async ({ format, sessionIds, dateRange, includeTranscript, includeHighlights }, { rejectWithValue }) => {
    try {
      const response = await journalAPI.export(
        format,
        sessionIds,
        dateRange,
        includeTranscript,
        includeHighlights
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteEntry = createAsyncThunk(
  'journal/deleteEntry',
  async (sessionId, { rejectWithValue }) => {
    try {
      await journalAPI.deleteEntry(sessionId);
      return sessionId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Initial state
const initialState = {
  entries: [],
  currentEntry: null,
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  },
};

// Slice
const journalSlice = createSlice({
  name: 'journal',
  initialState,
  reducers: {
    clearCurrentEntry: (state) => {
      state.currentEntry = null;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Load entries
    builder
      .addCase(loadJournalEntries.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadJournalEntries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.entries = action.payload.entries || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(loadJournalEntries.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Get entry
    builder
      .addCase(getJournalEntry.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getJournalEntry.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentEntry = action.payload;
      })
      .addCase(getJournalEntry.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Delete entry
    builder
      .addCase(deleteEntry.fulfilled, (state, action) => {
        state.entries = state.entries.filter(
          (entry) => entry.session_id !== action.payload
        );
      });
  },
});

export const { clearCurrentEntry, setSearchQuery } = journalSlice.actions;
export default journalSlice.reducer;

