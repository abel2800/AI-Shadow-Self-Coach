/**
 * Welcome Screen
 * First screen in onboarding flow
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { colors, typography } from '../../theme';

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Welcome to Ari</Text>
        <Text style={styles.subtitle}>
          Your compassionate{'\n'}inner-work coach
        </Text>
        <Text style={styles.description}>
          Explore your shadow self with gentle,{'\n'}
          evidence-based guidance
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Privacy')}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => {
            // Navigate to login if user already has account
          }}
        >
          <Text style={styles.secondaryButtonText}>
            Already have an account? Log In
          </Text>
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
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 32,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    paddingBottom: 32,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...typography.body,
    color: colors.primary,
  },
});

export default WelcomeScreen;

