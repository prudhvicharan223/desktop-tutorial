require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./config/database');
const initializeSocket = require('./services/socket');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const { initializeJobs } = require('./utils/jobs');

// Import routes
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
// Social media routes
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const followRoutes = require('./routes/followRoutes');
const storyRoutes = require('./routes/storyRoutes');
const reelRoutes = require('./routes/reelRoutes');
const exploreRoutes = require('./routes/exploreRoutes');
const moderationRoutes = require('./routes/moderationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Initialize express app
const app = express();
const server = http.createServer(app);

// Connect to database
connectDB();

// Initialize Socket.IO
const io = initializeSocket(server);

// Initialize background jobs
initializeJobs();

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve static files (uploaded media)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
// Social media routes
app.use('/api/posts', postRoutes);
app.use('/api/posts', commentRoutes);
app.use('/api/users', followRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/reels', reelRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Social Media API - Next Generation Platform',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      chats: '/api/chats',
      messages: '/api/messages',
      users: '/api/users',
      upload: '/api/upload',
      posts: '/api/posts',
      stories: '/api/stories',
      reels: '/api/reels',
      explore: '/api/explore',
      moderation: '/api/moderation',
      analytics: '/api/analytics',
      health: '/health'
    }
  });
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`WebSocket server is ready for connections`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});
