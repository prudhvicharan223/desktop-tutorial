import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getMessages } from '../services/api';
import socketService from '../services/socket';
import { formatMessageTime } from '../utils/helpers';
import { MESSAGE_STATUS } from '../constants';

export default function ChatScreen({ route, navigation }) {
  const { chat } = route.params;
  const { user } = useAuth();
  const { colors } = useTheme();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const flatListRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    loadMessages();
    socketService.joinChat(chat._id);

    // Listen for new messages
    socketService.onNewMessage((message) => {
      if (message.chat === chat._id) {
        setMessages(prev => [...prev, message]);
        // Mark as delivered
        socketService.markMessageDelivered(message._id, chat._id);
      }
    });

    // Listen for typing indicators
    socketService.onTypingStart((data) => {
      if (data.chatId === chat._id && data.userId !== user._id) {
        setTypingUsers(prev => new Set(prev).add(data.userId));
      }
    });

    socketService.onTypingStop((data) => {
      if (data.chatId === chat._id) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }
    });

    // Mark messages as read
    socketService.markMessagesRead(chat._id);

    return () => {
      socketService.leaveChat(chat._id);
    };
  }, [chat._id]);

  const loadMessages = async () => {
    try {
      const response = await getMessages(chat._id);
      setMessages(response.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const messageData = {
      chatId: chat._id,
      content: inputText.trim(),
      messageType: 'text'
    };

    setSending(true);
    socketService.sendMessage(messageData);
    setInputText('');
    setSending(false);
    
    // Stop typing indicator
    socketService.stopTyping(chat._id);
  };

  const handleTextChange = (text) => {
    setInputText(text);

    // Send typing indicator
    if (text.length > 0) {
      socketService.startTyping(chat._id);
      
      // Clear previous timeout
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }

      // Set timeout to stop typing
      typingTimeout.current = setTimeout(() => {
        socketService.stopTyping(chat._id);
      }, 3000);
    } else {
      socketService.stopTyping(chat._id);
    }
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.sender._id === user._id;

    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessage : styles.theirMessage
      ]}>
        {!isMyMessage && (
          <Text style={[styles.senderName, { color: colors.primary }]}>
            {item.sender.name}
          </Text>
        )}
        <View style={[
          styles.messageBubble,
          { backgroundColor: isMyMessage ? colors.primary : colors.surface }
        ]}>
          <Text style={[
            styles.messageText,
            { color: isMyMessage ? '#fff' : colors.text }
          ]}>
            {item.content}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={[
              styles.timestamp,
              { color: isMyMessage ? '#e0e0e0' : colors.textSecondary }
            ]}>
              {formatMessageTime(item.createdAt)}
            </Text>
            {isMyMessage && (
              <Text style={styles.statusIcon}>
                {item.status === MESSAGE_STATUS.READ ? '✓✓' : 
                 item.status === MESSAGE_STATUS.DELIVERED ? '✓✓' : '✓'}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onLayout={() => flatListRef.current?.scrollToEnd()}
      />
      
      {typingUsers.size > 0 && (
        <View style={[styles.typingContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.typingText, { color: colors.textSecondary }]}>
            Typing...
          </Text>
        </View>
      )}

      <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Type a message"
          placeholderTextColor={colors.textSecondary}
          value={inputText}
          onChangeText={handleTextChange}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: colors.primary }]}
          onPress={handleSendMessage}
          disabled={sending || !inputText.trim()}
        >
          {sending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.sendButtonText}>➤</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    marginVertical: 5,
    marginHorizontal: 10,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  theirMessage: {
    alignSelf: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    marginBottom: 2,
    marginLeft: 5,
  },
  messageBubble: {
    borderRadius: 8,
    padding: 10,
  },
  messageText: {
    fontSize: 16,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 5,
  },
  timestamp: {
    fontSize: 11,
  },
  statusIcon: {
    fontSize: 12,
    color: '#e0e0e0',
    marginLeft: 5,
  },
  typingContainer: {
    padding: 10,
    paddingHorizontal: 15,
  },
  typingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 20,
  },
});
