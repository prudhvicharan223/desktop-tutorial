# Social Media Platform - Next Generation App

A production-ready, full-stack social media application with posts, stories, reels, messaging, and advanced AI-powered features.

## 🚀 Features

### Social Media Features
- ✅ **Posts** - Text, images, videos with likes, comments, shares
- ✅ **Stories** - 24-hour auto-expiring content
- ✅ **Reels** - Short-form video content with swipe navigation
- ✅ **Infinite Scrolling Feed** - Seamless content discovery
- ✅ **AI-Powered Feed Ranking** - Personalized content recommendations
- ✅ **Explore Page** - AI-driven content discovery
- ✅ **Follow/Unfollow System** - Build your network
- ✅ **Likes & Comments** - Engage with content
- ✅ **Content Sharing** - Share posts across the platform
- ✅ **Content Moderation** - Report and review system
- ✅ **Creator Analytics Dashboard** - Track performance metrics
- ✅ **Trending Tags** - Discover popular topics

### Messaging Features (WhatsApp-like)
- ✅ Phone number authentication with OTP
- ✅ One-to-one and group chats
- ✅ Real-time messaging with WebSockets
- ✅ Message status (sent, delivered, read)
- ✅ Typing indicators
- ✅ Online/Last seen status
- ✅ Media sharing (images, videos, voice messages, documents)
- ✅ Push notifications support

### Frontend (React Native + Expo)
- ✅ Modern social media UI/UX
- ✅ Bottom tab navigation (Home, Explore, Reels, Messages, Profile)
- ✅ Infinite scroll feed
- ✅ Story rings display
- ✅ Swipeable reels player
- ✅ Post creation with media
- ✅ Explore grid layout
- ✅ Dark mode and light mode
- ✅ Smooth animations

### Backend (Node.js + Express + Socket.IO)
- ✅ RESTful API
- ✅ Real-time features with Socket.IO
- ✅ JWT authentication
- ✅ MongoDB database
- ✅ AI-powered feed ranking algorithm
- ✅ Engagement score calculation
- ✅ Story auto-expiry (24 hours)
- ✅ Content moderation system
- ✅ Analytics tracking
- ✅ Rate limiting
- ✅ Input validation

### Database (MongoDB)
- ✅ User management with social features
- ✅ Posts, Stories, Reels collections
- ✅ Comments and Follow relationships
- ✅ Content moderation reports
- ✅ Optimized indexes for performance

## 📁 Project Structure

```
social-media-app/
├── backend/                    # Node.js backend
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Route controllers (13 controllers)
│   │   ├── middleware/        # Express middleware
│   │   ├── models/            # Mongoose models (10 models)
│   │   ├── routes/            # API routes (13 routes)
│   │   ├── services/          # Business logic & Socket.IO
│   │   ├── utils/             # Utility functions & background jobs
│   │   └── server.js          # Entry point
│   ├── .env.example           # Environment variables template
│   ├── Dockerfile             # Docker configuration
│   └── package.json           # Dependencies
│
├── frontend/                   # React Native app
│   ├── src/
│   │   ├── components/        # Reusable components (PostCard, StoryRing, etc.)
│   │   ├── contexts/          # React contexts
│   │   ├── navigation/        # Navigation setup (Bottom tabs + Stacks)
│   │   ├── screens/           # App screens (Feed, Explore, Reels, etc.)
│   │   ├── services/          # API and Socket services
│   │   ├── utils/             # Helper functions
│   │   └── constants/         # Constants and config
│   ├── App.js                 # Main app component
│   ├── app.json               # Expo configuration
│   └── package.json           # Dependencies
│
├── docker-compose.yml         # Docker Compose configuration
├── .env.example               # Environment variables
└── README.md                  # This file
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v7 or higher)
- Docker and Docker Compose (optional)
- Expo CLI (`npm install -g expo-cli`)
- Twilio account (for OTP)
- Firebase account (for push notifications)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and fill in your configuration:
   - `JWT_SECRET`: Random string for JWT signing
   - `ENCRYPTION_KEY`: 32-character string for encryption
   - `MONGODB_URI`: MongoDB connection string
   - `TWILIO_*`: Twilio credentials for OTP
   - `FIREBASE_*`: Firebase credentials for push notifications

4. **Start MongoDB:**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7

   # Or use local MongoDB installation
   ```

5. **Run the backend:**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

   The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure API endpoint:**
   Create a `.env` file:
   ```bash
   EXPO_PUBLIC_API_URL=http://localhost:5000
   EXPO_PUBLIC_SOCKET_URL=http://localhost:5000
   ```

4. **Start Expo development server:**
   ```bash
   npm start
   ```

5. **Run on device/simulator:**
   - Press `a` for Android
   - Press `i` for iOS
   - Scan QR code with Expo Go app

## 📱 Main Features Overview

### Posts System
- Create text, image, or video posts
- Like, comment, and share posts
- AI-powered feed ranking based on engagement
- Tag users and add hashtags
- View count tracking

### Stories System
- Upload image or video stories
- Automatic 24-hour expiry
- View count and viewer list
- Swipe through stories

### Reels System
- Upload short-form video content
- Vertical swipe navigation
- Like, comment, and share reels
- AI-powered discovery feed

### Follow System
- Follow and unfollow users
- View followers and following lists
- Follower count displayed on profiles

### Explore Page
- AI-powered content discovery
- Search posts, reels, and users
- Trending hashtags
- Grid layout for visual content

### Analytics Dashboard
- View post and reel performance
- Track likes, comments, shares, views
- Engagement rate calculation
- Follower growth tracking
- Top performing content

### Content Moderation
- Report inappropriate content
- Automated content review queue
- Admin moderation tools
- Content removal and user banning

## 📚 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API reference.

Key API endpoints:
- `/api/posts` - Post management
- `/api/stories` - Story management  
- `/api/reels` - Reel management
- `/api/explore` - Content discovery
- `/api/analytics` - Creator analytics
- `/api/moderation` - Content moderation
- `/api/users/{id}/follow` - Follow system
- `/api/messages` - Direct messaging

## 🔌 WebSocket Events

See [WEBSOCKET_EVENTS.md](./WEBSOCKET_EVENTS.md) for WebSocket event documentation.

Real-time events:
- `post:new` - New post notification
- `like:new` - Like notification
- `comment:new` - Comment notification
- `follow:new` - Follow notification
- `story:viewed` - Story view notification
- `message:new` - New message notification

## 🗄️ Database Schema

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for database schema documentation.

## 🔐 Security Features

- JWT-based authentication
- Rate limiting on sensitive endpoints
- Input validation on all requests
- Encrypted message content support
- Secure OTP verification
- HTTPS recommended for production
- CORS configuration
- Helmet.js for security headers

## 🚀 Deployment

### Backend Deployment (Railway/Render/AWS)

1. **Railway:**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login and deploy
   railway login
   railway init
   railway up
   ```

2. **Configure environment variables** in the platform dashboard

3. **Add MongoDB** as a service or use MongoDB Atlas

### Frontend Deployment

1. **Build for Production:**
   ```bash
   cd frontend
   eas build --platform android --profile production
   ```

2. **Publish to Google Play Store** or distribute APK directly

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

---

**Built with ❤️ using React Native, Node.js, Express, Socket.IO, and MongoDB - A complete next-generation social media platform**
