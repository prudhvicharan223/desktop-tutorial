const cron = require('node-cron');
const { cleanupExpiredStories } = require('../controllers/storyController');

// Initialize scheduled jobs
const initializeJobs = () => {
  // Clean up expired stories every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Running expired stories cleanup...');
    try {
      await cleanupExpiredStories();
      console.log('Expired stories cleaned up successfully');
    } catch (error) {
      console.error('Error cleaning up expired stories:', error);
    }
  });

  console.log('Background jobs initialized');
};

module.exports = { initializeJobs };
