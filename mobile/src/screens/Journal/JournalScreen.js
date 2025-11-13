/**
 * Journal Screen
 * View saved sessions and insights
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { colors, typography } from '../../theme';
import { journalAPI } from '../../services/api';
import { exportSession } from '../../services/export.service';

const JournalScreen = ({ navigation }) => {
  const [entries, setEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [exporting, setExporting] = useState(false);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = entries.filter(
        (entry) =>
          entry.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredEntries(filtered);
    } else {
      setFilteredEntries(entries);
    }
  }, [searchQuery, entries]);

  const loadEntries = async () => {
    try {
      const response = await journalAPI.listEntries({ limit: 50 });
      setEntries(response.data.entries || []);
      setFilteredEntries(response.data.entries || []);
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderEntry = ({ item }) => (
    <TouchableOpacity
      style={styles.entryCard}
      onPress={() => navigation.navigate('JournalEntry', { sessionId: item.session_id })}
      accessibilityRole="button"
      accessibilityLabel={`Journal entry from ${formatDate(item.date)}, ${item.session_type} session`}
      accessibilityHint="Opens detailed view of this journal entry"
    >
      <View style={styles.entryHeader}>
        <Text style={styles.entryDate}>{formatDate(item.date)}</Text>
        <Text style={styles.entryType}>{item.session_type}</Text>
      </View>
      <Text style={styles.entrySummary} numberOfLines={3}>
        {item.summary}
      </Text>
      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
      <View style={styles.entryActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('JournalEntry', { sessionId: item.session_id })}
          accessibilityLabel="View journal entry"
          accessibilityRole="button"
        >
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, exporting && styles.actionButtonDisabled]}
          onPress={() => handleExport(item.session_id)}
          disabled={exporting}
          accessibilityLabel="Export journal entry"
          accessibilityRole="button"
          accessibilityState={{ disabled: exporting }}
        >
          {exporting ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.actionButtonText}>Export</Text>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const handleExport = async (sessionId, format = 'text') => {
    if (exporting) return;
    
    setExporting(true);
    try {
      const result = await exportSession(sessionId, format);
      if (result && result.success) {
        Alert.alert(
          'Export Successful',
          `Journal entry exported as ${format.toUpperCase()}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error exporting:', error);
      Alert.alert(
        'Export Failed',
        error.message || 'Failed to export journal entry. Please try again.'
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Journal</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Search journal entries"
            accessibilityRole="searchbox"
            accessibilityHint="Search your journal entries by summary or tags"
          />
        </View>
      </View>

      <FlatList
        data={filteredEntries}
        keyExtractor={(item) => item.session_id}
        renderItem={renderEntry}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No journal entries yet</Text>
            <Text style={styles.emptySubtext}>Start a session to create your first entry</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  searchContainer: {
    marginTop: 8,
  },
  searchInput: {
    ...typography.body,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    color: colors.textPrimary,
  },
  listContent: {
    padding: 16,
  },
  entryCard: {
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
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryDate: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  entryType: {
    ...typography.bodySmall,
    color: colors.primary,
    textTransform: 'capitalize',
  },
  entrySummary: {
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
  entryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionButtonText: {
    ...typography.bodySmall,
    color: colors.primary,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    ...typography.h3,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
  },
});

export default JournalScreen;

