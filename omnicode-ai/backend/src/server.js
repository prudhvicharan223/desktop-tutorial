require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const chatRoutes = require('./routes/chat');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Security & utility middleware
app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// Root
app.get('/', (req, res) => {
  res.json({
    name: 'OmniCode AI API',
    version: '1.0.0',
    description: 'Multi-model AI coding assistant backend',
    endpoints: {
      health: 'GET /health',
      chat: 'POST /api/chat/message',
      history: 'GET /api/chat/history',
      auth: 'POST /api/auth/verify',
      upload: 'POST /api/upload/file',
    },
  });
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

// MongoDB connection + server start
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/omnicode-ai';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`OmniCode AI backend running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    // Start server even without DB so health check works
    app.listen(PORT, () => {
      console.log(`OmniCode AI backend running on port ${PORT} (DB unavailable)`);
    });
  });

module.exports = app;
