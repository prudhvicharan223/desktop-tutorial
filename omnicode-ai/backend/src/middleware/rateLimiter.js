const rateLimit = require('express-rate-limit');

const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many chat requests. Please wait a moment before trying again.',
  },
  keyGenerator: (req) => req.user?.firebaseUid || req.ip,
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many upload requests. Please wait a moment before trying again.',
  },
  keyGenerator: (req) => req.user?.firebaseUid || req.ip,
});

// General limiter for auth and read endpoints (100 req/min)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many requests. Please slow down.',
  },
  keyGenerator: (req) => req.user?.firebaseUid || req.ip,
});

module.exports = { chatLimiter, uploadLimiter, apiLimiter };
