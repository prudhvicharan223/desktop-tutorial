const express = require('express');
const router = express.Router();
const moderationController = require('../controllers/moderationController');
const auth = require('../middleware/auth');

// Moderation routes
router.post('/report', auth, moderationController.reportContent);
router.get('/reports', auth, moderationController.getReports);
router.post('/reports/:reportId/review', auth, moderationController.reviewReport);

module.exports = router;
