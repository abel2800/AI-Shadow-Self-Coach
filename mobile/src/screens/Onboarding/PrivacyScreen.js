/**
 * Privacy Screen
 * Privacy and consent information
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  CheckBox,
} from 'react-native';
import { colors, typography } from '../../theme';

const PrivacyScreen = ({ navigation }) => {
  const [consentChecked, setConsentChecked] = useState(false);
  const [researchChecked, setResearchChecked] = useState(false);

  const handleContinue = () => {
    if (consentChecked) {
      navigation.navigate('MoodBaseline', {
        consentForResearch: researchChecked,
      });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Privacy & Consent</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your privacy matters</Text>
        <Text style={styles.text}>
          • Sessions are encrypted{'\n'}
          • Minimal data stored{'\n'}
          • You control your data{'\n'}
          • Opt-in research participation
        </Text>
      </View>

      <TouchableOpacity style={styles.linkButton}>
        <Text style={styles.linkText}>Read Full Privacy Policy</Text>
      </TouchableOpacity>

      <View style={styles.checkboxContainer}>
        <CheckBox
          value={consentChecked}
          onValueChange={setConsentChecked}
          tintColors={{ true: colors.primary, false: colors.border }}
        />
        <Text style={styles.checkboxLabel}>
          I understand and agree to the privacy policy
        </Text>
      </View>

      <View style={styles.checkboxContainer}>
        <CheckBox
          value={researchChecked}
          onValueChange={setResearchChecked}
          tintColors={{ true: colors.primary, false: colors.border }}
        />
        <Text style={styles.checkboxLabel}>
          I consent to anonymized research participation (optional)
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.continueButton,
          !consentChecked && styles.continueButtonDisabled,
        ]}
        onPress={handleContinue}
        disabled={!consentChecked}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
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
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  text: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  linkButton: {
    marginBottom: 32,
  },
  linkText: {
    ...typography.body,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxLabel: {
    ...typography.body,
    color: colors.textPrimary,
    marginLeft: 12,
    flex: 1,
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  continueButtonDisabled: {
    backgroundColor: colors.border,
    opacity: 0.5,
  },
  continueButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
});

export default PrivacyScreen;

