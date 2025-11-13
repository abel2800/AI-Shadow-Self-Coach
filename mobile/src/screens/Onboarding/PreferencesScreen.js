/**
 * Preferences Screen
 * Set user preferences
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import { colors, typography } from '../../theme';

const PreferencesScreen = ({ navigation, route }) => {
  const { moodScore, notes, consentForResearch } = route.params || {};
  const [sessionLength, setSessionLength] = useState('medium');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [safetyContactName, setSafetyContactName] = useState('');
  const [safetyContactPhone, setSafetyContactPhone] = useState('');

  const handleComplete = () => {
    // Save preferences and navigate to main app
    navigation.replace('MainTabs', {
      preferences: {
        session_length: sessionLength,
        notifications_enabled: notificationsEnabled,
        safety_contact: safetyContactName && safetyContactPhone ? {
          name: safetyContactName,
          phone: safetyContactPhone,
        } : null,
      },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Session Preferences</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferred session length:</Text>
        <View style={styles.radioGroup}>
          {['short', 'medium', 'long'].map((length) => (
            <TouchableOpacity
              key={length}
              style={[
                styles.radioOption,
                sessionLength === length && styles.radioOptionSelected,
              ]}
              onPress={() => setSessionLength(length)}
            >
              <View style={styles.radio}>
                {sessionLength === length && <View style={styles.radioSelected} />}
              </View>
              <Text style={styles.radioLabel}>
                {length === 'short' ? 'Short (5-10 min)' :
                 length === 'medium' ? 'Medium (15-20 min)' :
                 'Long (25-30 min)'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Notifications:</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={notificationsEnabled ? colors.primary : colors.textSecondary}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety contact (optional):</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor={colors.textSecondary}
          value={safetyContactName}
          onChangeText={setSafetyContactName}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone"
          placeholderTextColor={colors.textSecondary}
          value={safetyContactPhone}
          onChangeText={setSafetyContactPhone}
          keyboardType="phone-pad"
        />
      </View>

      <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
        <Text style={styles.completeButtonText}>Get Started</Text>
      </TouchableOpacity>
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
    marginBottom: 32,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  radioGroup: {
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
  },
  radioOptionSelected: {
    borderColor: colors.primary,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  radioLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  switchLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    color: colors.textPrimary,
  },
  completeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  completeButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
});

export default PreferencesScreen;

