/**
 * Mood Slider Component
 * Reusable mood tracking slider
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, typography } from '../../theme';

const MoodSlider = ({ value, onValueChange, showLabels = true, showEmoji = true }) => {
  const getMoodEmoji = (score) => {
    if (score <= 3) return '😢';
    if (score <= 5) return '😐';
    if (score <= 7) return '🙂';
    return '😊';
  };

  const getMoodLabel = (score) => {
    if (score <= 3) return 'Not well';
    if (score <= 5) return 'Okay';
    if (score <= 7) return 'Good';
    return 'Great';
  };

  return (
    <View 
      style={styles.container}
      accessibilityRole="group"
      accessibilityLabel={`Mood: ${getMoodLabel(value)}`}
    >
      {showEmoji && (
        <Text 
          style={styles.emoji}
          accessibilityLabel={getMoodEmoji(value)}
          accessibilityRole="text"
        >
          {getMoodEmoji(value)}
        </Text>
      )}
      {showLabels && (
        <Text 
          style={styles.label}
          accessibilityRole="text"
        >
          {getMoodLabel(value)}
        </Text>
      )}
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={10}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
        accessibilityLabel="Mood slider"
        accessibilityRole="adjustable"
        accessibilityValue={{
          min: 1,
          max: 10,
          now: value,
          text: `${getMoodLabel(value)} (${value} out of 10)`,
        }}
        accessibilityHint="Adjust your mood score from 1 to 10"
      />
      {showLabels && (
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>1</Text>
          <Text style={styles.sliderLabel}>10</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  label: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: 24,
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
});

export default MoodSlider;

