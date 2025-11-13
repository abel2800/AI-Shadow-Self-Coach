/**
 * Mood Baseline Screen
 * Capture initial mood state
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, typography } from '../../theme';

const MoodBaselineScreen = ({ navigation, route }) => {
  const [moodScore, setMoodScore] = useState(5);
  const [notes, setNotes] = useState('');
  const { consentForResearch } = route.params || {};

  const handleContinue = () => {
    navigation.navigate('Preferences', {
      moodScore,
      notes,
      consentForResearch,
    });
  };

  const getMoodEmoji = (score) => {
    if (score <= 3) return '😢';
    if (score <= 5) return '😐';
    if (score <= 7) return '🙂';
    return '😊';
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>How are you feeling?</Text>

        <View style={styles.sliderContainer}>
          <Text style={styles.moodEmoji}>{getMoodEmoji(moodScore)}</Text>
          <Text style={styles.moodLabel}>
            {moodScore <= 3 ? 'Not well' : moodScore <= 5 ? 'Okay' : 'Good'}
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

        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>What's on your mind? (optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Share what's on your mind..."
            placeholderTextColor={colors.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: 48,
    textAlign: 'center',
  },
  sliderContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  moodEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  moodLabel: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: 32,
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
  notesContainer: {
    marginTop: 32,
  },
  notesLabel: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  notesInput: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    color: colors.textPrimary,
  },
  actions: {
    paddingBottom: 32,
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
});

export default MoodBaselineScreen;

