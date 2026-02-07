# Database Schema Documentation

This document describes the MongoDB database schema for the WhatsApp Clone application.

## Collections Overview

- **users** - User accounts and profiles
- **chats** - One-to-one and group chats
- **messages** - All messages
- **media** - Uploaded media metadata

---

## Users Collection

### Schema

```javascript
{
  _id: ObjectId,
  phoneNumber: String (unique, required),
  name: String (required),
  profilePicture: String,
  about: String,
  isOnline: Boolean,
  lastSeen: Date,
  otp: {
    code: String,
    expiresAt: Date
  },
  fcmToken: String,
  blockedUsers: [ObjectId],
  settings: {
    theme: String (enum: ['light', 'dark', 'auto']),
    notifications: Boolean,
    lastSeenPrivacy: String (enum: ['everyone', 'contacts', 'nobody']),
    profilePhotoPrivacy: String (enum: ['everyone', 'contacts', 'nobody']),
    readReceipts: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Fields

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `_id` | ObjectId | Unique identifier | Auto-generated |
| `phoneNumber` | String | User's phone number (with country code) | Required |
| `name` | String | User's display name | Required |
| `profilePicture` | String | URL to profile picture | Empty string |
| `about` | String | User's status/about text | "Hey there! I am using WhatsApp Clone" |
| `isOnline` | Boolean | Current online status | false |
| `lastSeen` | Date | Last activity timestamp | Current time |
| `otp.code` | String | OTP code for verification | - |
| `otp.expiresAt` | Date | OTP expiration time | - |
| `fcmToken` | String | Firebase Cloud Messaging token | Empty string |
| `blockedUsers` | Array | List of blocked user IDs | [] |
| `settings.theme` | String | UI theme preference | 'auto' |
| `settings.notifications` | Boolean | Notification preference | true |
| `settings.lastSeenPrivacy` | String | Who can see last seen | 'everyone' |
| `settings.profilePhotoPrivacy` | String | Who can see profile photo | 'everyone' |
| `settings.readReceipts` | Boolean | Send read receipts | true |

### Indexes

```javascript
{ phoneNumber: 1 }      // Unique index
{ isOnline: 1 }         // For filtering online users
```

### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "phoneNumber": "+1234567890",
  "name": "John Doe",
  "profilePicture": "https://example.com/profiles/john.jpg",
  "about": "Hey there! I am using WhatsApp Clone",
  "isOnline": true,
  "lastSeen": "2024-01-15T10:30:00.000Z",
  "fcmToken": "fY7Zw...",
  "blockedUsers": [],
  "settings": {
    "theme": "dark",
    "notifications": true,
    "lastSeenPrivacy": "everyone",
    "profilePhotoPrivacy": "contacts",
    "readReceipts": true
  },
  "createdAt": "2024-01-10T08:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

## Chats Collection

### Schema

```javascript
{
  _id: ObjectId,
  isGroup: Boolean,
  participants: [ObjectId],
  groupName: String,
  groupIcon: String,
  groupDescription: String,
  groupAdmins: [ObjectId],
  createdBy: ObjectId,
  lastMessage: ObjectId,
  lastMessageTime: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Fields

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `_id` | ObjectId | Unique identifier | Auto-generated |
| `isGroup` | Boolean | Whether this is a group chat | false |
| `participants` | Array | List of user IDs in the chat | Required |
| `groupName` | String | Name of the group (group chats only) | - |
| `groupIcon` | String | URL to group icon (group chats only) | Empty string |
| `groupDescription` | String | Group description (group chats only) | Empty string |
| `groupAdmins` | Array | List of admin user IDs (group chats only) | [] |
| `createdBy` | ObjectId | User who created the chat | Required |
| `lastMessage` | ObjectId | Reference to last message | null |
| `lastMessageTime` | Date | Timestamp of last message | Current time |

### Indexes

```javascript
{ participants: 1 }                    // For finding user's chats
{ isGroup: 1 }                         // For filtering group vs one-to-one
{ lastMessageTime: -1 }                // For sorting by recent activity
{ participants: 1, isGroup: 1 }        // Compound index for efficient queries
```

### Example Documents

#### One-to-One Chat

```json
{
  "_id": "507f1f77bcf86cd799439012",
  "isGroup": false,
  "participants": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439013"
  ],
  "createdBy": "507f1f77bcf86cd799439011",
  "lastMessage": "507f1f77bcf86cd799439014",
  "lastMessageTime": "2024-01-15T10:30:00.000Z",
  "createdAt": "2024-01-10T08:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

#### Group Chat

```json
{
  "_id": "507f1f77bcf86cd799439015",
  "isGroup": true,
  "groupName": "Team Alpha",
  "groupIcon": "https://example.com/groups/team-alpha.jpg",
  "groupDescription": "Our awesome team group",
  "participants": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439013",
    "507f1f77bcf86cd799439016",
    "507f1f77bcf86cd799439017"
  ],
  "groupAdmins": [
    "507f1f77bcf86cd799439011"
  ],
  "createdBy": "507f1f77bcf86cd799439011",
  "lastMessage": "507f1f77bcf86cd799439018",
  "lastMessageTime": "2024-01-15T11:00:00.000Z",
  "createdAt": "2024-01-12T09:00:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

---

## Messages Collection

### Schema

```javascript
{
  _id: ObjectId,
  chat: ObjectId,
  sender: ObjectId,
  messageType: String (enum: ['text', 'image', 'video', 'voice', 'document']),
  content: String,
  mediaUrl: String,
  mediaThumbnail: String,
  mediaSize: Number,
  mediaDuration: Number,
  status: String (enum: ['sent', 'delivered', 'read']),
  readBy: [{
    user: ObjectId,
    readAt: Date
  }],
  deliveredTo: [{
    user: ObjectId,
    deliveredAt: Date
  }],
  replyTo: ObjectId,
  isDeleted: Boolean,
  deletedFor: [ObjectId],
  encryptedContent: String,
  isEncrypted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Fields

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `_id` | ObjectId | Unique identifier | Auto-generated |
| `chat` | ObjectId | Reference to chat | Required |
| `sender` | ObjectId | Reference to sender user | Required |
| `messageType` | String | Type of message | 'text' |
| `content` | String | Text content (for text messages) | Required for text |
| `mediaUrl` | String | URL to media file | Required for media |
| `mediaThumbnail` | String | URL to thumbnail (for videos/images) | - |
| `mediaSize` | Number | File size in bytes | - |
| `mediaDuration` | Number | Duration in seconds (for voice/video) | - |
| `status` | String | Delivery status | 'sent' |
| `readBy` | Array | List of users who read the message | [] |
| `deliveredTo` | Array | List of users message was delivered to | [] |
| `replyTo` | ObjectId | Reference to message being replied to | null |
| `isDeleted` | Boolean | Whether message is deleted for everyone | false |
| `deletedFor` | Array | List of users who deleted this message | [] |
| `encryptedContent` | String | Encrypted message content | - |
| `isEncrypted` | Boolean | Whether message is encrypted | false |

### Indexes

```javascript
{ chat: 1, createdAt: -1 }    // For retrieving chat messages
{ sender: 1 }                  // For finding user's messages
{ status: 1 }                  // For filtering by status
```

### Example Documents

#### Text Message

```json
{
  "_id": "507f1f77bcf86cd799439014",
  "chat": "507f1f77bcf86cd799439012",
  "sender": "507f1f77bcf86cd799439011",
  "messageType": "text",
  "content": "Hello! How are you?",
  "status": "read",
  "readBy": [
    {
      "user": "507f1f77bcf86cd799439013",
      "readAt": "2024-01-15T10:35:00.000Z"
    }
  ],
  "deliveredTo": [
    {
      "user": "507f1f77bcf86cd799439013",
      "deliveredAt": "2024-01-15T10:30:05.000Z"
    }
  ],
  "isDeleted": false,
  "deletedFor": [],
  "isEncrypted": false,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:35:00.000Z"
}
```

#### Image Message

```json
{
  "_id": "507f1f77bcf86cd799439019",
  "chat": "507f1f77bcf86cd799439012",
  "sender": "507f1f77bcf86cd799439011",
  "messageType": "image",
  "mediaUrl": "/uploads/image/1234567890-photo.jpg",
  "mediaThumbnail": "/uploads/image/thumb-1234567890-photo.jpg",
  "mediaSize": 245678,
  "status": "delivered",
  "readBy": [],
  "deliveredTo": [
    {
      "user": "507f1f77bcf86cd799439013",
      "deliveredAt": "2024-01-15T11:05:02.000Z"
    }
  ],
  "isDeleted": false,
  "deletedFor": [],
  "isEncrypted": false,
  "createdAt": "2024-01-15T11:05:00.000Z",
  "updatedAt": "2024-01-15T11:05:02.000Z"
}
```

#### Voice Message

```json
{
  "_id": "507f1f77bcf86cd799439020",
  "chat": "507f1f77bcf86cd799439012",
  "sender": "507f1f77bcf86cd799439013",
  "messageType": "voice",
  "mediaUrl": "/uploads/voice/1234567890-audio.ogg",
  "mediaSize": 52341,
  "mediaDuration": 15,
  "status": "sent",
  "readBy": [],
  "deliveredTo": [],
  "isDeleted": false,
  "deletedFor": [],
  "isEncrypted": false,
  "createdAt": "2024-01-15T11:10:00.000Z",
  "updatedAt": "2024-01-15T11:10:00.000Z"
}
```

---

## Media Collection

### Schema

```javascript
{
  _id: ObjectId,
  filename: String,
  originalName: String,
  mimeType: String,
  size: Number,
  url: String,
  thumbnailUrl: String,
  uploadedBy: ObjectId,
  message: ObjectId,
  mediaType: String (enum: ['image', 'video', 'voice', 'document']),
  createdAt: Date,
  updatedAt: Date
}
```

### Fields

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `_id` | ObjectId | Unique identifier | Auto-generated |
| `filename` | String | Stored filename | Required |
| `originalName` | String | Original uploaded filename | Required |
| `mimeType` | String | MIME type of the file | Required |
| `size` | Number | File size in bytes | Required |
| `url` | String | URL to access the file | Required |
| `thumbnailUrl` | String | URL to thumbnail (if applicable) | - |
| `uploadedBy` | ObjectId | Reference to uploader user | Required |
| `message` | ObjectId | Reference to associated message | null |
| `mediaType` | String | Type of media | Required |

### Indexes

```javascript
{ uploadedBy: 1 }    // For finding user's uploads
{ message: 1 }       // For finding message media
```

### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439021",
  "filename": "1705315200000-abc123.jpg",
  "originalName": "vacation-photo.jpg",
  "mimeType": "image/jpeg",
  "size": 245678,
  "url": "/uploads/image/1705315200000-abc123.jpg",
  "thumbnailUrl": "/uploads/image/thumb-1705315200000-abc123.jpg",
  "uploadedBy": "507f1f77bcf86cd799439011",
  "message": "507f1f77bcf86cd799439019",
  "mediaType": "image",
  "createdAt": "2024-01-15T11:00:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

---

## Relationships

```
┌─────────┐          ┌──────────┐          ┌──────────┐
│  Users  │◄─────────┤  Chats   │──────────►│ Messages │
└─────────┘          └──────────┘          └──────────┘
     │                                            │
     │                                            │
     │               ┌──────────┐                │
     └───────────────┤  Media   │◄───────────────┘
                     └──────────┘
```

### User ↔ Chat
- **Type:** Many-to-Many
- **Field:** `chats.participants` contains user IDs
- A user can be in multiple chats
- A chat contains multiple users

### User ↔ Message
- **Type:** One-to-Many
- **Field:** `messages.sender` references user
- A user can send many messages
- A message has one sender

### Chat ↔ Message
- **Type:** One-to-Many
- **Field:** `messages.chat` references chat
- A chat contains many messages
- A message belongs to one chat

### User ↔ Media
- **Type:** One-to-Many
- **Field:** `media.uploadedBy` references user
- A user can upload many media files
- A media file has one uploader

### Message ↔ Media
- **Type:** One-to-One (optional)
- **Field:** `media.message` references message
- A message may have associated media
- A media file may be linked to a message

---

## Query Examples

### Find all chats for a user
```javascript
db.chats.find({
  participants: userId
}).sort({ lastMessageTime: -1 });
```

### Get messages for a chat
```javascript
db.messages.find({
  chat: chatId,
  deletedFor: { $ne: userId }
}).sort({ createdAt: -1 }).limit(50);
```

### Find unread messages for a user
```javascript
db.messages.find({
  chat: chatId,
  sender: { $ne: userId },
  'readBy.user': { $ne: userId }
});
```

### Search users by phone or name
```javascript
db.users.find({
  $or: [
    { phoneNumber: { $regex: query, $options: 'i' } },
    { name: { $regex: query, $options: 'i' } }
  ]
}).limit(20);
```

### Get online users
```javascript
db.users.find({
  isOnline: true
});
```

---

## Database Maintenance

### Recommended Backup Strategy
- Full backup daily
- Incremental backups every 6 hours
- Retain backups for 30 days

### Index Monitoring
Monitor index usage and performance:
```javascript
db.messages.getIndexes();
db.messages.stats();
```

### Data Cleanup
Consider implementing:
- Automatic deletion of old media files
- Archival of old messages
- Cleanup of expired OTPs
