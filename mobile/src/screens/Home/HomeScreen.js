/**
 * Home Screen
 * Main navigation hub with daily check-in
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Slider from '@react-native-community/slider';
import { colors, typography } from '../../theme';
import { sessionAPI } from '../../services/api';

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [moodScore, setMoodScore] = useState(5);

  const handleStartCheckIn = async () => {
    try {
      const response = await sessionAPI.start(
        'check-in',
        moodScore,
        `Feeling ${moodScore <= 3 ? 'not well' : moodScore <= 5 ? 'okay' : 'good'} today.`,
        true
      );
      navigation.navigate('Session', { sessionId: response.data.session_id });
    } catch (error) {
      console.error('Error starting check-in:', error);
    }
  };

  const handleStartDeepSession = () => {
    navigation.navigate('Session', { sessionType: 'gentle_deep' });
  };

  const handleStartMicroPractice = () => {
    navigation.navigate('Session', { sessionType: 'micro_practice' });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.email?.split('@')[0] || 'there'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Daily Check-in</Text>
        <Text style={styles.cardSubtitle}>How are you feeling today?</Text>

        <View style={styles.moodContainer}>
          <Text style={styles.moodEmoji}>
            {moodScore <= 3 ? '😢' : moodScore <= 5 ? '😐' : '😊'}
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            value={moodScore}
            onValueChange={setMoodScore}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>1</Text>
            <Text style={styles.sliderLabel}>10</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleStartCheckIn}>
          <Text style={styles.primaryButtonText}>Start Check-in</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Insights</Text>
        <View style={styles.insightCard}>
          <Text style={styles.insightText}>
            "That feeling must be heavy — I'm sorry you're carrying that."
          </Text>
          <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View Session</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={handleStartDeepSession}
          >
            <Text style={styles.quickActionIcon}>💭</Text>
            <Text style={styles.quickActionLabel}>Deep Session</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={handleStartMicroPractice}
          >
            <Text style={styles.quickActionIcon}>🧘</Text>
            <Text style={styles.quickActionLabel}>Micro Practice</Text>
          </TouchableOpacity>
        </View>
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
  greeting: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  cardSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  moodContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  moodEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 8,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
  },
  sliderLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  insightCard: {
    backgroundColor: colors.accentLight,
    borderRadius: 8,
    padding: 16,
  },
  insightText: {
    ...typography.body,
    color: colors.textPrimary,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  viewButton: {
    alignSelf: 'flex-end',
  },
  viewButtonText: {
    ...typography.bodySmall,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
});

export default HomeScreen;

