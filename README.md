# WhatsApp Clone - Real-Time Messaging Application

A production-ready, full-stack WhatsApp-like messaging application with real-time chat, voice messages, media sharing, and more.

## 🚀 Features

### Frontend (React Native + Expo)
- ✅ Phone number authentication with OTP
- ✅ One-to-one and group chats
- ✅ Real-time messaging with WebSockets
- ✅ Message status (sent, delivered, read)
- ✅ Typing indicators
- ✅ Online/Last seen status
- ✅ Media sharing (images, videos, voice messages, documents)
- ✅ Emoji support
- ✅ Dark mode and light mode
- ✅ Smooth animations
- ✅ Push notifications support

### Backend (Node.js + Express + Socket.IO)
- ✅ RESTful API
- ✅ Real-time messaging with Socket.IO
- ✅ JWT authentication
- ✅ OTP verification
- ✅ MongoDB database
- ✅ File upload handling
- ✅ Push notifications via Firebase
- ✅ Rate limiting
- ✅ Input validation
- ✅ Basic encryption support

### Database (MongoDB)
- ✅ User management
- ✅ Chat and group management
- ✅ Message storage
- ✅ Media metadata
- ✅ Optimized indexes

## 📁 Project Structure

```
whatsapp-clone/
├── backend/                    # Node.js backend
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Express middleware
│   │   ├── models/            # Mongoose models
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Utility functions
│   │   └── server.js          # Entry point
│   ├── .env.example           # Environment variables template
│   ├── Dockerfile             # Docker configuration
│   └── package.json           # Dependencies
│
├── frontend/                   # React Native app
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── contexts/          # React contexts
│   │   ├── navigation/        # Navigation setup
│   │   ├── screens/           # App screens
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

### Docker Setup (Recommended for Production)

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```
   Fill in your credentials in `.env`

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f
   ```

4. **Stop services:**
   ```bash
   docker-compose down
   ```

## 📱 Building Android APK

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Configure build:**
   ```bash
   eas build:configure
   ```

4. **Build APK:**
   ```bash
   eas build --platform android --profile preview
   ```

## 📚 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API reference.

## 🔌 WebSocket Events

See [WEBSOCKET_EVENTS.md](./WEBSOCKET_EVENTS.md) for WebSocket event documentation.

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

**Built with ❤️ using React Native, Node.js, Express, Socket.IO, and MongoDB**
