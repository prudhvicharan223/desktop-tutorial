# Quick Start Guide

Get the WhatsApp Clone running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- MongoDB installed (or use Docker)
- A code editor

## Method 1: Docker (Easiest) 🐳

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Edit .env and set JWT_SECRET
nano .env  # Set JWT_SECRET=your-random-32-character-string

# 3. Start everything
docker-compose up -d

# Backend will be running on http://localhost:5000
```

## Method 2: Manual Setup 💻

### Backend

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Setup environment
cp .env.example .env

# 3. Edit .env file - set these minimum values:
# JWT_SECRET=your-random-secret-key-change-this-to-something-secure-and-long
# ENCRYPTION_KEY=another-32-char-key-for-encryption
# MONGODB_URI=mongodb://localhost:27017/whatsapp-clone

# 4. Start MongoDB (if not using Docker)
# Option A: Use Docker
docker run -d -p 27017:27017 --name mongodb mongo:7

# Option B: Start local MongoDB service
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS

# 5. Start backend
npm run dev

# ✅ Backend running on http://localhost:5000
```

### Frontend

```bash
# 1. Open new terminal, install frontend dependencies
cd frontend
npm install

# 2. Create .env file
echo "EXPO_PUBLIC_API_URL=http://localhost:5000" > .env
echo "EXPO_PUBLIC_SOCKET_URL=http://localhost:5000" >> .env

# For testing on physical device, use your computer's IP:
# echo "EXPO_PUBLIC_API_URL=http://192.168.1.100:5000" > .env
# echo "EXPO_PUBLIC_SOCKET_URL=http://192.168.1.100:5000" >> .env

# 3. Start Expo
npm start

# 4. Scan QR code with Expo Go app (iOS/Android)
# Or press 'a' for Android emulator
# Or press 'i' for iOS simulator (macOS only)
```

## First Test

1. **Open the app** on your device/emulator

2. **Login:**
   - Enter any phone number (e.g., `+1234567890`)
   - Click "Send OTP"
   - Check backend console for OTP (in development mode)
   - Enter the OTP shown in console
   - You're logged in! ✅

3. **Create a chat:**
   - Click the "+" button
   - Search for users (you can create multiple test accounts)
   - Start messaging!

## Testing Real-time Features

To test real-time messaging:

1. **Login on two devices** (or two browser tabs in web mode)
2. **Create a chat** between the two users
3. **Send messages** - they appear instantly!
4. **Watch for:**
   - Message status (✓ sent, ✓✓ delivered, blue ✓✓ read)
   - Typing indicators
   - Online/offline status

## Common Issues

### Backend won't start

**MongoDB connection error?**
```bash
# Check if MongoDB is running
docker ps  # If using Docker
sudo systemctl status mongod  # If using local MongoDB
```

### Frontend can't connect to backend

**Check:**
1. Backend is running on port 5000
2. Frontend .env has correct URL
3. For physical device, use computer's IP address (not localhost)
4. Both devices on same WiFi network

### Port already in use

```bash
# Find and kill process using port 5000
lsof -i :5000
kill -9 <PID>
```

## What to Try

✅ **Basic Features:**
- Phone authentication
- Send/receive messages
- Create group chats
- Search users
- Profile settings
- Dark/light mode

✅ **Real-time Features:**
- Live message delivery
- Typing indicators
- Online/offline status
- Read receipts

## Next Steps

1. ✅ App is running!
2. 📱 Test all features
3. 🎨 Customize UI/branding
4. 🔧 Configure Twilio for real SMS
5. 🔔 Setup Firebase for push notifications
6. 🚀 Deploy to production (see SETUP_GUIDE.md)

## Need Help?

- 📖 Full Setup: `SETUP_GUIDE.md`
- 🔌 API Docs: `API_DOCUMENTATION.md`
- 📡 WebSocket Events: `WEBSOCKET_EVENTS.md`
- 💾 Database: `DATABASE_SCHEMA.md`
- 📋 Overview: `README.md`

## Development Mode Notes

In development:
- OTP is logged to backend console (not sent via SMS)
- CORS allows all origins
- More verbose logging
- Auto-reload on code changes

---

**You're all set! Happy coding! 🎉**
