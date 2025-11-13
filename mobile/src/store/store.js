/**
 * Redux Store Configuration
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth.slice';
import sessionReducer from './slices/session.slice';
import journalReducer from './slices/journal.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    session: sessionReducer,
    journal: journalReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

