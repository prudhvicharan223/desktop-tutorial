# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Request OTP
Send OTP to phone number for authentication.

**Endpoint:** `POST /auth/request-otp`

**Request Body:**
```json
{
  "phoneNumber": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otp": "123456"  // Only in development mode
}
```

**Rate Limit:** 5 requests per hour per IP

---

### Verify OTP
Verify OTP and login.

**Endpoint:** `POST /auth/verify-otp`

**Request Body:**
```json
{
  "phoneNumber": "+1234567890",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id",
    "phoneNumber": "+1234567890",
    "name": "John Doe",
    "profilePicture": "",
    "about": "Hey there! I am using WhatsApp Clone"
  }
}
```

---

### Get Current User
Get authenticated user's profile.

**Endpoint:** `GET /auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "phoneNumber": "+1234567890",
    "name": "John Doe",
    "profilePicture": "",
    "about": "Hey there!",
    "isOnline": true,
    "lastSeen": "2024-01-15T10:30:00.000Z",
    "settings": {
      "theme": "auto",
      "notifications": true,
      "lastSeenPrivacy": "everyone",
      "profilePhotoPrivacy": "everyone",
      "readReceipts": true
    }
  }
}
```

---

### Update Profile
Update user profile information.

**Endpoint:** `PUT /auth/profile`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Doe",
  "about": "Hey there!",
  "profilePicture": "https://example.com/profile.jpg",
  "settings": {
    "theme": "dark",
    "notifications": true,
    "lastSeenPrivacy": "contacts",
    "profilePhotoPrivacy": "contacts",
    "readReceipts": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    // Updated user object
  }
}
```

---

### Update FCM Token
Update Firebase Cloud Messaging token for push notifications.

**Endpoint:** `PUT /auth/fcm-token`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "fcmToken": "firebase_cloud_messaging_token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "FCM token updated successfully"
}
```

---

## Chat Endpoints

### Get All Chats
Get all chats for the authenticated user.

**Endpoint:** `GET /chats`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "count": 5,
  "chats": [
    {
      "_id": "chat_id",
      "isGroup": false,
      "participants": [
        {
          "_id": "user_id",
          "name": "Jane Doe",
          "phoneNumber": "+9876543210",
          "profilePicture": "",
          "isOnline": true,
          "lastSeen": "2024-01-15T10:30:00.000Z"
        }
      ],
      "lastMessage": {
        "_id": "message_id",
        "content": "Hello!",
        "createdAt": "2024-01-15T10:30:00.000Z"
      },
      "lastMessageTime": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-10T08:00:00.000Z"
    }
  ]
}
```

---

### Create One-to-One Chat
Create or get existing chat with another user.

**Endpoint:** `POST /chats/create`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "participantId": "user_id"
}
```

**Response:**
```json
{
  "success": true,
  "chat": {
    "_id": "chat_id",
    "isGroup": false,
    "participants": [/* user objects */],
    "createdBy": "user_id",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Create Group Chat
Create a new group chat.

**Endpoint:** `POST /chats/group`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "groupName": "My Group",
  "participantIds": ["user_id_1", "user_id_2", "user_id_3"],
  "groupDescription": "This is our group",
  "groupIcon": "https://example.com/group-icon.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "group": {
    "_id": "group_id",
    "isGroup": true,
    "groupName": "My Group",
    "groupDescription": "This is our group",
    "groupIcon": "",
    "participants": [/* user objects */],
    "groupAdmins": ["user_id"],
    "createdBy": {
      "_id": "user_id",
      "name": "John Doe"
    }
  }
}
```

---

### Get Single Chat
Get details of a specific chat.

**Endpoint:** `GET /chats/:chatId`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "chat": {
    // Chat object
  }
}
```

---

### Update Group
Update group details (admin only).

**Endpoint:** `PUT /chats/group/:chatId`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "groupName": "Updated Group Name",
  "groupDescription": "Updated description",
  "groupIcon": "https://example.com/new-icon.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "group": {
    // Updated group object
  }
}
```

---

### Add Participants to Group
Add new members to a group (admin only).

**Endpoint:** `POST /chats/group/:chatId/add-participants`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "participantIds": ["user_id_1", "user_id_2"]
}
```

**Response:**
```json
{
  "success": true,
  "group": {
    // Updated group object
  }
}
```

---

### Remove Participant from Group
Remove a member from group (admin only).

**Endpoint:** `POST /chats/group/:chatId/remove-participant`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "participantId": "user_id"
}
```

**Response:**
```json
{
  "success": true,
  "group": {
    // Updated group object
  }
}
```

---

## Message Endpoints

### Get Messages
Get messages for a specific chat with pagination.

**Endpoint:** `GET /messages/:chatId`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Messages per page (default: 50, max: 100)

**Response:**
```json
{
  "success": true,
  "count": 100,
  "totalPages": 2,
  "currentPage": 1,
  "messages": [
    {
      "_id": "message_id",
      "chat": "chat_id",
      "sender": {
        "_id": "user_id",
        "name": "John Doe",
        "profilePicture": ""
      },
      "messageType": "text",
      "content": "Hello!",
      "status": "read",
      "readBy": [
        {
          "user": "user_id",
          "readAt": "2024-01-15T10:35:00.000Z"
        }
      ],
      "deliveredTo": [],
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### Send Message
Send a new message (fallback, prefer WebSocket).

**Endpoint:** `POST /messages`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "chatId": "chat_id",
  "content": "Hello!",
  "messageType": "text",
  "mediaUrl": "https://example.com/media.jpg",  // For non-text messages
  "replyTo": "message_id"  // Optional, for replies
}
```

**Response:**
```json
{
  "success": true,
  "message": {
    // Message object
  }
}
```

---

### Mark Messages as Read
Mark all messages in a chat as read.

**Endpoint:** `PUT /messages/read/:chatId`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Messages marked as read"
}
```

---

### Delete Message
Delete a message for yourself or everyone.

**Endpoint:** `DELETE /messages/:messageId`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "deleteFor": "me"  // or "everyone" (only within 1 hour)
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

---

## User Endpoints

### Search Users
Search for users by name or phone number.

**Endpoint:** `GET /users/search`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `query`: Search term (minimum 3 characters)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "users": [
    {
      "_id": "user_id",
      "name": "Jane Doe",
      "phoneNumber": "+9876543210",
      "profilePicture": "",
      "about": "Hey there!",
      "isOnline": false,
      "lastSeen": "2024-01-15T09:00:00.000Z"
    }
  ]
}
```

---

### Get User by ID
Get details of a specific user.

**Endpoint:** `GET /users/:userId`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "user": {
    // User object
  }
}
```

---

### Block User
Block a user.

**Endpoint:** `POST /users/block/:userId`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "User blocked successfully"
}
```

---

### Unblock User
Unblock a previously blocked user.

**Endpoint:** `POST /users/unblock/:userId`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "User unblocked successfully"
}
```

---

## Upload Endpoint

### Upload File
Upload media files (images, videos, voice, documents).

**Endpoint:** `POST /upload`

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `file`: The file to upload
- `mediaType`: Type of media (`image`, `video`, `voice`, `document`)

**Response:**
```json
{
  "success": true,
  "media": {
    "_id": "media_id",
    "filename": "1234567890-randomstring.jpg",
    "originalName": "photo.jpg",
    "mimeType": "image/jpeg",
    "size": 102400,
    "url": "/uploads/image/1234567890-randomstring.jpg",
    "uploadedBy": "user_id",
    "mediaType": "image",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**File Size Limit:** 10MB

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

### Common HTTP Status Codes

- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

## Rate Limiting

- **General API**: 100 requests per 15 minutes
- **OTP Requests**: 5 requests per hour
- **Auth Endpoints**: 20 requests per 15 minutes
