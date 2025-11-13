/**
 * Chat Bubble Component
 * Displays user and assistant messages
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography } from '../../theme';

const ChatBubble = ({ message, onHighlight }) => {
  const isUser = message.role === 'user';

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
      ]}
      accessibilityRole="text"
      accessibilityLabel={isUser ? `You: ${message.text}` : `Ari: ${message.text}`}
    >
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
        accessible={true}
        accessibilityLabel={message.text}
      >
        <Text
          style={[
            styles.text,
            isUser ? styles.userText : styles.assistantText,
          ]}
        >
          {message.text}
        </Text>
      </View>
      {!isUser && (
        <TouchableOpacity
          style={styles.highlightButton}
          onPress={() => onHighlight && onHighlight(message)}
          accessibilityLabel="Highlight this message"
          accessibilityRole="button"
          accessibilityHint="Saves this message as a highlight in your journal"
        >
          <Text style={styles.highlightIcon}>⭐</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  assistantContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: colors.background,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    ...typography.body,
  },
  userText: {
    color: colors.surface,
  },
  assistantText: {
    color: colors.textPrimary,
  },
  highlightButton: {
    marginLeft: 8,
    padding: 4,
  },
  highlightIcon: {
    fontSize: 20,
  },
});

export default ChatBubble;

