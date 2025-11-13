/**
 * Resources & Help Screen
 * Crisis resources and support information
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { colors, typography } from '../../theme';
import { safetyAPI } from '../../services/api';

const ResourcesScreen = () => {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const response = await safetyAPI.getResources('US');
      setResources(response.data.resources || []);
    } catch (error) {
      console.error('Error loading resources:', error);
      // Fallback resources
      setResources([
        {
          type: 'crisis_hotline',
          name: 'National Suicide Prevention Lifeline',
          phone: '988',
          available_24_7: true,
        },
        {
          type: 'crisis_text',
          name: 'Crisis Text Line',
          text: 'Text HOME to 741741',
          available_24_7: true,
        },
      ]);
    }
  };

  const handleCall = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleText = (text) => {
    Linking.openURL(`sms:${text}`);
  };

  const renderResource = (resource) => {
    if (resource.type === 'crisis_hotline') {
      return (
        <View key={resource.name} style={styles.resourceCard}>
          <Text style={styles.resourceTitle}>{resource.name}</Text>
          <Text style={styles.resourcePhone}>{resource.phone}</Text>
          <View style={styles.resourceActions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => handleCall(resource.phone)}
            >
              <Text style={styles.primaryButtonText}>Call Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (resource.type === 'crisis_text') {
      return (
        <View key={resource.name} style={styles.resourceCard}>
          <Text style={styles.resourceTitle}>{resource.name}</Text>
          <Text style={styles.resourceText}>{resource.text}</Text>
          <View style={styles.resourceActions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => handleText('741741')}
            >
              <Text style={styles.primaryButtonText}>Text Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Resources & Help</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🆘 Crisis Support</Text>
        {resources.map(renderResource)}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💬 Therapist Referral</Text>
        <View style={styles.resourceCard}>
          <Text style={styles.resourceTitle}>Find a Licensed Therapist</Text>
          <Text style={styles.resourceDescription}>
            Connect with a licensed therapist near you
          </Text>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Find Therapist</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>❓ FAQs</Text>
        <View style={styles.resourceCard}>
          <Text style={styles.resourceTitle}>Common Questions</Text>
          <Text style={styles.resourceDescription}>
            Learn more about Ari and shadow work
          </Text>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>View FAQs</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📧 Contact Support</Text>
        <View style={styles.resourceCard}>
          <Text style={styles.resourceTitle}>Need Help?</Text>
          <Text style={styles.resourceDescription}>
            support@shadowcoach.app
          </Text>
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
  resourceCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resourceTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  resourcePhone: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: 16,
  },
  resourceText: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  resourceDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 22,
  },
  resourceActions: {
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: colors.crisisButton,
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

export default ResourcesScreen;

