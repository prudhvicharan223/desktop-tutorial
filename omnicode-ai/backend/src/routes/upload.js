const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { uploadLimiter, apiLimiter } = require('../middleware/rateLimiter');

const ALLOWED_EXTENSIONS = new Set([
  '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.h',
  '.go', '.rs', '.rb', '.php', '.html', '.css', '.scss', '.json',
  '.md', '.yaml', '.yml', '.sh', '.bash', '.sql', '.kt', '.swift',
  '.cs', '.r', '.m', '.lua', '.dart', '.vue', '.svelte',
]);

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_EXTENSIONS.has(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type "${ext}" is not allowed. Only text/code files are accepted.`));
    }
  },
});

// POST /api/upload/file
router.post('/file', apiLimiter, authenticate, uploadLimiter, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'File too large. Maximum size is 5MB.' })
      }
      return res.status(400).json({ message: err.message })
    }
    if (err) {
      return res.status(400).json({ message: err.message })
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' })
    }

    const content = req.file.buffer.toString('utf8')
    const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '')

    res.json({
      filename: req.file.originalname,
      size: req.file.size,
      language: ext,
      content,
    })
  })
})

module.exports = router;
