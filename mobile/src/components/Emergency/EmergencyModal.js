/**
 * Emergency Modal Component
 * Displays when high-risk content is detected
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Linking,
  ScrollView,
} from 'react-native';
import { colors, typography } from '../../theme';
import { safetyAPI } from '../../services/api';

const EmergencyModal = ({ visible, resources, onClose, onSafe }) => {
  const [safetyStatus, setSafetyStatus] = useState(null);

  const handleCall = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleText = (number) => {
    Linking.openURL(`sms:${number}`);
  };

  const handleSafe = async () => {
    setSafetyStatus('safe');
    if (onSafe) {
      await onSafe('safe');
    }
    onClose();
  };

  const handleNeedsHelp = () => {
    setSafetyStatus('needs_support');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.header}>
              <Text style={styles.emoji}>🆘</Text>
              <Text style={styles.title}>Your Safety Matters</Text>
            </View>

            <Text style={styles.message}>
              I'm concerned about what you've shared. Are you safe right now?
            </Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.safeButton}
                onPress={handleSafe}
                accessibilityLabel="I'm safe"
                accessibilityRole="button"
                accessibilityHint="Confirms you are safe and closes this modal"
              >
                <Text style={styles.safeButtonText}>I'm Safe</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.helpButton}
                onPress={handleNeedsHelp}
                accessibilityLabel="I need help"
                accessibilityRole="button"
                accessibilityHint="Shows crisis resources and support options"
              >
                <Text style={styles.helpButtonText}>I Need Help</Text>
              </TouchableOpacity>
            </View>

            {safetyStatus === 'needs_support' && (
              <View style={styles.resourcesContainer}>
                <Text style={styles.resourcesTitle}>Crisis Resources</Text>

                {resources?.crisis_hotline && (
                  <View style={styles.resourceCard}>
                    <Text style={styles.resourceName}>
                      National Suicide Prevention Lifeline
                    </Text>
                    <Text style={styles.resourcePhone}>
                      {resources.crisis_hotline}
                    </Text>
                    <TouchableOpacity
                      style={styles.callButton}
                      onPress={() => handleCall(resources.crisis_hotline)}
                      accessibilityLabel={`Call ${resources.crisis_hotline}`}
                      accessibilityRole="button"
                      accessibilityHint="Opens phone dialer to call crisis hotline"
                    >
                      <Text style={styles.callButtonText}>Call Now</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {resources?.crisis_text && (
                  <View style={styles.resourceCard}>
                    <Text style={styles.resourceName}>Crisis Text Line</Text>
                    <Text style={styles.resourceText}>
                      {resources.crisis_text}
                    </Text>
                    <TouchableOpacity
                      style={styles.callButton}
                      onPress={() => handleText('741741')}
                    >
                      <Text style={styles.callButtonText}>Text Now</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {resources?.local_resources?.map((resource, index) => (
                  <View key={index} style={styles.resourceCard}>
                    <Text style={styles.resourceName}>{resource.name}</Text>
                    <Text style={styles.resourcePhone}>{resource.phone}</Text>
                    <TouchableOpacity
                      style={styles.callButton}
                      onPress={() => handleCall(resource.phone)}
                    >
                      <Text style={styles.callButtonText}>Call Now</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityLabel="Return to session"
              accessibilityRole="button"
              accessibilityHint="Closes this modal and returns to your coaching session"
            >
              <Text style={styles.closeButtonText}>Return to Session</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: colors.emergencyBackground,
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    padding: 24,
  },
  content: {
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    ...typography.h1,
    color: colors.emergencyText,
    textAlign: 'center',
  },
  message: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  actions: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  safeButton: {
    backgroundColor: colors.success,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  safeButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  helpButton: {
    backgroundColor: colors.crisisButton,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  helpButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  resourcesContainer: {
    width: '100%',
    marginTop: 24,
  },
  resourcesTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  resourceCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  resourceName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 8,
  },
  resourcePhone: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: 12,
  },
  resourceText: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  callButton: {
    backgroundColor: colors.crisisButton,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  callButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  closeButton: {
    marginTop: 24,
    paddingVertical: 12,
  },
  closeButtonText: {
    ...typography.body,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});

export default EmergencyModal;

