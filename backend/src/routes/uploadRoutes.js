const express = require('express');
const router = express.Router();
const { upload, uploadFile } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

router.use(protect); // All upload routes are protected

router.post('/', upload.single('file'), uploadFile);

module.exports = router;
