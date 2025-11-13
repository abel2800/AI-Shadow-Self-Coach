/**
 * Session Card Component
 * Displays session summary in a card format
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography } from '../../theme';

const SessionCard = ({ session, onPress, onExport, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getSessionTypeLabel = (type) => {
    const labels = {
      'check-in': 'Check-in',
      'gentle_deep': 'Gentle Deep',
      'micro_practice': 'Micro Practice',
    };
    return labels[type] || type;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.date}>{formatDate(session.started_at || session.date)}</Text>
        <Text style={styles.type}>{getSessionTypeLabel(session.session_type)}</Text>
      </View>

      {session.summary && (
        <Text style={styles.summary} numberOfLines={3}>
          {typeof session.summary === 'string' 
            ? session.summary 
            : session.summary.text || session.summary_preview}
        </Text>
      )}

      {session.tags && session.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {session.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        {session.duration_minutes && (
          <Text style={styles.duration}>{session.duration_minutes} min</Text>
        )}
        <View style={styles.actions}>
          {onExport && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                onExport();
              }}
            >
              <Text style={styles.actionText}>Export</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Text style={styles.actionText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  type: {
    ...typography.bodySmall,
    color: colors.primary,
    textTransform: 'capitalize',
  },
  summary: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: 12,
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  duration: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionText: {
    ...typography.bodySmall,
    color: colors.primary,
  },
});

export default SessionCard;

