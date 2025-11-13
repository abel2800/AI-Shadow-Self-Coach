/**
 * Chat Input Component
 * Text input for chat interface
 */

import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme';

const ChatInput = ({ value, onChangeText, onSend, placeholder, disabled }) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder || "Type a message..."}
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        multiline
        editable={!disabled}
        accessibilityLabel="Message input"
        accessibilityRole="textbox"
        accessibilityHint="Type your message to Ari"
        accessibilityState={{ disabled }}
      />
      <TouchableOpacity
        style={[styles.sendButton, (!value.trim() || disabled) && styles.sendButtonDisabled]}
        onPress={onSend}
        disabled={!value.trim() || disabled}
        accessibilityLabel="Send message"
        accessibilityRole="button"
        accessibilityHint="Sends your message to Ari"
        accessibilityState={{ disabled: !value.trim() || disabled }}
      >
        <Text style={styles.sendButtonText}>Send</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    ...typography.body,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
    color: colors.textPrimary,
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: colors.border,
    opacity: 0.5,
  },
  sendButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
});

export default ChatInput;

