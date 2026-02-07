import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

/**
 * Format message timestamp
 */
export const formatMessageTime = (date) => {
  const messageDate = new Date(date);
  
  if (isToday(messageDate)) {
    return format(messageDate, 'HH:mm');
  } else if (isYesterday(messageDate)) {
    return 'Yesterday';
  } else {
    return format(messageDate, 'dd/MM/yyyy');
  }
};

/**
 * Format chat list timestamp
 */
export const formatChatTime = (date) => {
  const chatDate = new Date(date);
  
  if (isToday(chatDate)) {
    return format(chatDate, 'HH:mm');
  } else if (isYesterday(chatDate)) {
    return 'Yesterday';
  } else {
    const daysDiff = Math.floor((Date.now() - chatDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
      return format(chatDate, 'EEEE'); // Day name
    }
    return format(chatDate, 'dd/MM/yy');
  }
};

/**
 * Format last seen
 */
export const formatLastSeen = (date) => {
  if (!date) return 'Last seen recently';
  
  const lastSeenDate = new Date(date);
  
  if (isToday(lastSeenDate)) {
    return `Last seen today at ${format(lastSeenDate, 'HH:mm')}`;
  } else if (isYesterday(lastSeenDate)) {
    return `Last seen yesterday at ${format(lastSeenDate, 'HH:mm')}`;
  } else {
    return `Last seen ${format(lastSeenDate, 'dd/MM/yyyy')} at ${format(lastSeenDate, 'HH:mm')}`;
  }
};

/**
 * Get chat name for display
 */
export const getChatName = (chat, currentUserId) => {
  if (chat.isGroup) {
    return chat.groupName;
  }
  
  // For one-to-one chat, get the other participant's name
  const otherUser = chat.participants?.find(p => p._id !== currentUserId);
  return otherUser?.name || 'Unknown';
};

/**
 * Get chat avatar
 */
export const getChatAvatar = (chat, currentUserId) => {
  if (chat.isGroup) {
    return chat.groupIcon;
  }
  
  const otherUser = chat.participants?.find(p => p._id !== currentUserId);
  return otherUser?.profilePicture || '';
};

/**
 * Truncate message content
 */
export const truncateMessage = (message, maxLength = 40) => {
  if (!message) return '';
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength) + '...';
};

/**
 * Validate phone number
 */
export const validatePhoneNumber = (phoneNumber) => {
  // Basic validation - adjust regex based on your requirements
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
