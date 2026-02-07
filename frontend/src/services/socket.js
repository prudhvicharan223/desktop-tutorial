import { io } from 'socket.io-client';
import { SOCKET_URL } from '../constants';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (!this.socket) return;

    this.socket.on(event, callback);

    // Store listener for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.socket) return;

    this.socket.off(event, callback);

    // Remove from stored listeners
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  // Message events
  sendMessage(messageData) {
    this.emit('message:send', messageData);
  }

  onNewMessage(callback) {
    this.on('message:new', callback);
  }

  onMessageDelivered(callback) {
    this.on('message:delivered', callback);
  }

  onMessagesRead(callback) {
    this.on('messages:read', callback);
  }

  markMessageDelivered(messageId, chatId) {
    this.emit('message:delivered', { messageId, chatId });
  }

  markMessagesRead(chatId) {
    this.emit('message:read', { chatId });
  }

  // Typing events
  startTyping(chatId) {
    this.emit('typing:start', { chatId });
  }

  stopTyping(chatId) {
    this.emit('typing:stop', { chatId });
  }

  onTypingStart(callback) {
    this.on('typing:start', callback);
  }

  onTypingStop(callback) {
    this.on('typing:stop', callback);
  }

  // User status events
  onUserOnline(callback) {
    this.on('user:online', callback);
  }

  onUserOffline(callback) {
    this.on('user:offline', callback);
  }

  // Chat events
  joinChat(chatId) {
    this.emit('chat:join', { chatId });
  }

  leaveChat(chatId) {
    this.emit('chat:leave', { chatId });
  }
}

export default new SocketService();
