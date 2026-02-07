// API Configuration
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:5000';

// Colors
export const COLORS = {
  // Light theme
  light: {
    primary: '#075E54',
    primaryDark: '#054740',
    accent: '#25D366',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#000000',
    textSecondary: '#667781',
    border: '#E5E5E5',
    online: '#25D366',
    sent: '#95A5A6',
    delivered: '#667781',
    read: '#34B7F1',
    error: '#E74C3C',
    typing: '#075E54',
  },
  // Dark theme
  dark: {
    primary: '#075E54',
    primaryDark: '#054740',
    accent: '#25D366',
    background: '#0B141A',
    surface: '#1F2C34',
    text: '#E9EDEF',
    textSecondary: '#8696A0',
    border: '#2A3942',
    online: '#25D366',
    sent: '#95A5A6',
    delivered: '#8696A0',
    read: '#34B7F1',
    error: '#E74C3C',
    typing: '#075E54',
  }
};

// Message status
export const MESSAGE_STATUS = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read'
};

// Message types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  VOICE: 'voice',
  DOCUMENT: 'document'
};

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  USER_DATA: '@user_data',
  THEME: '@theme'
};
