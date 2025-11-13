/**
 * Session Summary Screen
 * Review session and save insights
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { colors, typography } from '../../theme';
import { getSessionSummary, endSession } from '../../store/slices/session.slice';
import { journalAPI } from '../../services/api';

const SessionSummaryScreen = ({ navigation, route }) => {
  const { sessionId } = route.params || {};
  const dispatch = useDispatch();
  const { currentSession } = useSelector((state) => state.session);
  const [summary, setSummary] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, [sessionId]);

  const loadSummary = async () => {
    try {
      const result = await dispatch(getSessionSummary(sessionId));
      if (result.payload) {
        setSummary(result.payload);
      }
    } catch (error) {
      console.error('Error loading summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Save to journal (session is already saved)
      navigation.navigate('Journal');
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const handleRate = async () => {
    try {
      await dispatch(endSession({ sessionId, rating, feedback }));
      handleSave();
    } catch (error) {
      console.error('Error rating session:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading summary...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Session Complete</Text>
      </View>

      {summary && (
        <>
          <View style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summaryText}>
              {summary.summary?.text || summary.summary || 'Session completed successfully.'}
            </Text>

            {summary.summary?.experiment && (
              <View style={styles.experimentContainer}>
                <Text style={styles.experimentLabel}>This Week's Experiment:</Text>
                <Text style={styles.experimentText}>{summary.summary.experiment}</Text>
              </View>
            )}
          </View>

          {summary.summary?.insights && summary.summary.insights.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Insights</Text>
              {summary.summary.insights.map((insight, index) => (
                <View key={index} style={styles.insightItem}>
                  <Text style={styles.insightText}>• {insight}</Text>
                </View>
              ))}
            </View>
          )}

          {summary.summary?.tags && summary.summary.tags.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagsContainer}>
                {summary.summary.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </>
      )}

      <View style={styles.ratingSection}>
        <Text style={styles.sectionTitle}>How was this session?</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              style={styles.star}
            >
              <Text style={styles.starText}>{star <= rating ? '⭐' : '☆'}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.feedbackInput}
          placeholder="Optional feedback..."
          placeholderTextColor={colors.textSecondary}
          value={feedback}
          onChangeText={setFeedback}
          multiline
        />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleRate}>
          <Text style={styles.primaryButtonText}>Save to Journal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.secondaryButtonText}>Return Home</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 64,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  summaryText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  experimentContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.accentLight,
    borderRadius: 8,
  },
  experimentLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  experimentText: {
    ...typography.body,
    color: colors.textPrimary,
    fontStyle: 'italic',
  },
  insightItem: {
    marginBottom: 8,
  },
  insightText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: colors.accentLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    ...typography.bodySmall,
    color: colors.primary,
  },
  ratingSection: {
    marginBottom: 32,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  star: {
    padding: 4,
  },
  starText: {
    fontSize: 32,
  },
  feedbackInput: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    color: colors.textPrimary,
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default SessionSummaryScreen;

