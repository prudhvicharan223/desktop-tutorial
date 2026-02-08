# Quick Start Guide - Social Media Platform

Get your next-generation social media platform running in 5 minutes!

## Prerequisites

- Node.js v18+
- MongoDB v7+
- Expo CLI
- Phone (iOS/Android) or emulator

## 🚀 5-Minute Setup

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in new terminal)
cd frontend
npm install
```

### 2. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/social-media
JWT_SECRET=your-secret-key-here-make-it-long-and-random
NODE_ENV=development
```

### 3. Start MongoDB

```bash
# Using Docker (Recommended)
docker run -d -p 27017:27017 --name mongodb mongo:7
```

### 4. Start Backend

```bash
cd backend
npm run dev
```

✅ Server runs on `http://localhost:5000`

### 5. Configure & Start Frontend

```bash
cd frontend
# Create .env with: EXPO_PUBLIC_API_URL=http://localhost:5000
npm start
```

Press `a` for Android or `i` for iOS

## 📱 First Login

1. Enter any 10-digit phone number
2. Check backend console for OTP
3. Enter OTP and start using!

## 🎯 Key Features to Try

- **Feed**: Create and view posts
- **Stories**: 24-hour expiring content
- **Reels**: Swipeable short videos
- **Explore**: AI-powered discovery
- **Messages**: Real-time chat

---

**Full docs:** [README.md](./README.md) | **API:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
