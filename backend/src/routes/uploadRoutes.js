const express = require('express');
const router = express.Router();
const multer = require('multer');
const { upload, uploadFile } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

router.use(protect); // All upload routes are protected

// Upload route with error handling
router.post('/', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Handle multer-specific errors
      let message = 'File upload error';
      
      if (err.code === 'LIMIT_FILE_SIZE') {
        message = 'File too large. Maximum size is 10MB';
      } else if (err.code === 'LIMIT_FILE_COUNT') {
        message = 'Too many files';
      } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        message = 'Unexpected field in form';
      } else if (err.code === 'LIMIT_PART_COUNT') {
        message = 'Too many parts in request';
      } else if (err.code === 'LIMIT_FIELD_COUNT') {
        message = 'Too many fields in request';
      }
      
      return res.status(400).json({
        success: false,
        message
      });
    } else if (err) {
      // Handle other errors (e.g., from fileFilter)
      return res.status(400).json({
        success: false,
        message: err.message || 'Invalid file upload'
      });
    }
    
    // No error, proceed to controller
    next();
  });
}, uploadFile);

module.exports = router;
