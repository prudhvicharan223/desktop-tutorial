# WebSocket Events Documentation

This document describes all WebSocket events used for real-time communication in the WhatsApp Clone application.

## Connection

### Establishing Connection

**Client Side:**
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  },
  transports: ['websocket']
});
```

### Connection Events

#### `connect`
Emitted when successfully connected to the server.

```javascript
socket.on('connect', () => {
  console.log('Connected to server');
});
```

#### `disconnect`
Emitted when disconnected from the server.

```javascript
socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
```

#### `error`
Emitted when an error occurs.

```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error);
});
```

---

## Message Events

### Client to Server

#### `message:send`
Send a new message to a chat.

**Emit:**
```javascript
socket.emit('message:send', {
  chatId: 'chat_id',
  content: 'Hello!',
  messageType: 'text',  // 'text' | 'image' | 'video' | 'voice' | 'document'
  mediaUrl: 'https://example.com/media.jpg',  // For non-text messages
  replyTo: 'message_id'  // Optional, for replies
});
```

**Server automatically:**
- Creates the message in database
- Broadcasts to all chat participants
- Marks as delivered for online users
- Sends push notifications to offline users

---

#### `message:delivered`
Confirm that a message has been delivered to the user.

**Emit:**
```javascript
socket.emit('message:delivered', {
  messageId: 'message_id',
  chatId: 'chat_id'
});
```

**Server automatically:**
- Updates message status to 'delivered'
- Notifies the sender

---

#### `message:read`
Mark all messages in a chat as read.

**Emit:**
```javascript
socket.emit('message:read', {
  chatId: 'chat_id'
});
```

**Server automatically:**
- Updates all unread messages in the chat
- Notifies all chat participants
- Returns list of affected message IDs

---

### Server to Client

#### `message:new`
Emitted when a new message is received in any chat.

**Listen:**
```javascript
socket.on('message:new', (message) => {
  console.log('New message:', message);
  // message = {
  //   _id: 'message_id',
  //   chat: 'chat_id',
  //   sender: { _id, name, phoneNumber, profilePicture },
  //   messageType: 'text',
  //   content: 'Hello!',
  //   status: 'sent',
  //   createdAt: '2024-01-15T10:30:00.000Z'
  // }
});
```

**Action:**
- Add message to chat
- Show notification if chat is not active
- Mark as delivered automatically

---

#### `message:delivered`
Emitted when a message has been delivered to a user.

**Listen:**
```javascript
socket.on('message:delivered', (data) => {
  console.log('Message delivered:', data);
  // data = {
  //   messageId: 'message_id',
  //   chatId: 'chat_id',
  //   userId: 'user_id'
  // }
});
```

**Action:**
- Update message status indicator
- Show single checkmark or double checkmark

---

#### `messages:read`
Emitted when messages have been read by a user.

**Listen:**
```javascript
socket.on('messages:read', (data) => {
  console.log('Messages read:', data);
  // data = {
  //   chatId: 'chat_id',
  //   userId: 'user_id',
  //   messageIds: ['msg_1', 'msg_2', ...]
  // }
});
```

**Action:**
- Update message status to read
- Show blue double checkmark

---

## Typing Indicators

### Client to Server

#### `typing:start`
Indicate that user started typing in a chat.

**Emit:**
```javascript
socket.emit('typing:start', {
  chatId: 'chat_id'
});
```

**Best Practice:**
- Emit when user starts typing
- Debounce to avoid too many emissions

---

#### `typing:stop`
Indicate that user stopped typing in a chat.

**Emit:**
```javascript
socket.emit('typing:stop', {
  chatId: 'chat_id'
});
```

**When to Emit:**
- When user clears the input
- After 3 seconds of no typing activity
- When sending a message

---

### Server to Client

#### `typing:start`
Emitted when another user starts typing.

**Listen:**
```javascript
socket.on('typing:start', (data) => {
  console.log('User typing:', data);
  // data = {
  //   chatId: 'chat_id',
  //   userId: 'user_id',
  //   userName: 'John Doe'
  // }
});
```

**Action:**
- Show "typing..." indicator in chat
- Display user name in group chats

---

#### `typing:stop`
Emitted when another user stops typing.

**Listen:**
```javascript
socket.on('typing:stop', (data) => {
  console.log('User stopped typing:', data);
  // data = {
  //   chatId: 'chat_id',
  //   userId: 'user_id'
  // }
});
```

**Action:**
- Hide "typing..." indicator

---

## User Presence Events

### Server to Client

#### `user:online`
Emitted when a user comes online.

**Listen:**
```javascript
socket.on('user:online', (data) => {
  console.log('User online:', data);
  // data = {
  //   userId: 'user_id'
  // }
});
```

**Action:**
- Update user's online status in UI
- Show green dot or "online" status

---

#### `user:offline`
Emitted when a user goes offline.

**Listen:**
```javascript
socket.on('user:offline', (data) => {
  console.log('User offline:', data);
  // data = {
  //   userId: 'user_id',
  //   lastSeen: '2024-01-15T10:30:00.000Z'
  // }
});
```

**Action:**
- Update user's online status to offline
- Display last seen time

---

## Chat Room Events

### Client to Server

#### `chat:join`
Join a chat room to receive messages for that chat.

**Emit:**
```javascript
socket.emit('chat:join', {
  chatId: 'chat_id'
});
```

**When to Emit:**
- When opening a chat screen
- When creating a new chat

**Note:** User is automatically joined to all their chats on connection.

---

#### `chat:leave`
Leave a chat room.

**Emit:**
```javascript
socket.emit('chat:leave', {
  chatId: 'chat_id'
});
```

**When to Emit:**
- When leaving a chat screen
- When deleting a chat

---

## Example Usage

### Complete Message Flow

```javascript
// 1. Connect to server
const socket = io('http://localhost:5000', {
  auth: { token: authToken }
});

// 2. Listen for new messages
socket.on('message:new', (message) => {
  if (message.chat === currentChatId) {
    // Add to current chat
    addMessageToChat(message);
    
    // Mark as delivered
    socket.emit('message:delivered', {
      messageId: message._id,
      chatId: message.chat
    });
    
    // If chat is active, mark as read
    if (isChatActive) {
      socket.emit('message:read', {
        chatId: message.chat
      });
    }
  } else {
    // Show notification
    showNotification(message);
  }
});

// 3. Send a message
function sendMessage(chatId, content) {
  socket.emit('message:send', {
    chatId,
    content,
    messageType: 'text'
  });
}

// 4. Handle typing
let typingTimeout;
function handleTextChange(text) {
  if (text.length > 0) {
    socket.emit('typing:start', { chatId: currentChatId });
    
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit('typing:stop', { chatId: currentChatId });
    }, 3000);
  } else {
    socket.emit('typing:stop', { chatId: currentChatId });
  }
}

// 5. Listen for typing indicators
socket.on('typing:start', (data) => {
  if (data.chatId === currentChatId) {
    showTypingIndicator(data.userName);
  }
});

socket.on('typing:stop', (data) => {
  if (data.chatId === currentChatId) {
    hideTypingIndicator();
  }
});

// 6. Handle user presence
socket.on('user:online', (data) => {
  updateUserStatus(data.userId, true);
});

socket.on('user:offline', (data) => {
  updateUserStatus(data.userId, false, data.lastSeen);
});
```

---

## Event Flow Diagrams

### Sending a Message

```
User A                    Server                    User B
  |                         |                         |
  |--message:send---------->|                         |
  |                         |                         |
  |                         |--message:new----------->|
  |                         |                         |
  |                         |<--message:delivered-----|
  |                         |                         |
  |<--message:delivered-----|                         |
  |                         |                         |
  |                         |<--message:read----------|
  |                         |                         |
  |<--messages:read---------|                         |
```

### Typing Indicator

```
User A                    Server                    User B
  |                         |                         |
  |--typing:start---------->|                         |
  |                         |                         |
  |                         |--typing:start---------->|
  |                         |                         |
  |                         |                         |
  |--typing:stop----------->|                         |
  |                         |                         |
  |                         |--typing:stop----------->|
```

### User Presence

```
User A                    Server              All Connected Users
  |                         |                         |
  |--connect--------------->|                         |
  |                         |                         |
  |                         |--user:online----------->|
  |                         |                         |
  |                         |                         |
  |--disconnect------------>|                         |
  |                         |                         |
  |                         |--user:offline---------->|
```

---

## Best Practices

1. **Connection Management**
   - Reconnect automatically on disconnect
   - Handle authentication errors
   - Clean up listeners on component unmount

2. **Message Handling**
   - Always acknowledge received messages
   - Queue messages when offline
   - Handle duplicate messages

3. **Typing Indicators**
   - Debounce typing events (3 seconds)
   - Clear on send
   - Clear on input blur

4. **Performance**
   - Join only active chat rooms
   - Leave rooms when not needed
   - Batch read receipts

5. **Error Handling**
   - Listen for error events
   - Implement retry logic
   - Show user-friendly error messages

---

## Troubleshooting

### Common Issues

1. **Messages not received**
   - Check connection status
   - Verify you're in the chat room
   - Check authentication token

2. **Typing indicator stuck**
   - Ensure `typing:stop` is emitted
   - Implement timeout on client side

3. **Duplicate messages**
   - Check message IDs before adding
   - Handle reconnection properly

4. **High latency**
   - Use WebSocket transport only
   - Optimize message payload
   - Check server resources
