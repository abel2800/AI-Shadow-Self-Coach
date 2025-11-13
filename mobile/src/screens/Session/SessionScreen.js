/**
 * Session Screen
 * Main chat interface for coaching sessions
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { colors, typography } from '../../theme';
import { sessionAPI } from '../../services/api';
import ChatBubble from '../../components/Chat/ChatBubble';

const SessionScreen = ({ navigation, route }) => {
  const { sessionId, sessionType } = route.params || {};
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(sessionId);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (!currentSessionId && sessionType) {
      startNewSession();
    } else if (currentSessionId) {
      loadSession();
    }
  }, []);

  const startNewSession = async () => {
    try {
      setIsLoading(true);
      const response = await sessionAPI.start(
        sessionType || 'check-in',
        5,
        'Starting session...',
        true
      );
      setCurrentSessionId(response.data.session_id);
      if (response.data.assistant_message) {
        setMessages([response.data.assistant_message]);
      }
    } catch (error) {
      console.error('Error starting session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSession = async () => {
    try {
      const response = await sessionAPI.getSummary(currentSessionId);
      // Load messages from session
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      text: inputText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await sessionAPI.sendMessage(
        currentSessionId,
        inputText,
        new Date().toISOString()
      );

      const assistantMessage = {
        role: 'assistant',
        text: response.data.assistant_message.text,
        intent: response.data.assistant_message.intent,
        risk_level: response.data.assistant_message.risk_level,
        timestamp: response.data.assistant_message.timestamp,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Handle safety escalation
      if (response.data.safety_escalation?.triggered) {
        navigation.navigate('Emergency', {
          resources: response.data.safety_escalation.emergency_resources,
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = async () => {
    try {
      await sessionAPI.pause(currentSessionId);
      navigation.goBack();
    } catch (error) {
      console.error('Error pausing session:', error);
    }
  };

  const handleEnd = async () => {
    try {
      await sessionAPI.end(currentSessionId, 5, 'Session completed');
      navigation.navigate('SessionSummary', { sessionId: currentSessionId });
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {sessionType === 'gentle_deep' ? 'Gentle Deep' :
           sessionType === 'micro_practice' ? 'Micro Practice' :
           'Check-in'}
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={handlePause}>
            <Text style={styles.headerButton}>⏸</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleEnd}>
            <Text style={styles.headerButton}>⏹</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => `message-${index}`}
        renderItem={({ item }) => (
          <ChatBubble message={item} />
        )}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={colors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    ...typography.body,
    color: colors.primary,
    fontSize: 20,
  },
  messagesContainer: {
    padding: 16,
  },
  inputContainer: {
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

export default SessionScreen;

