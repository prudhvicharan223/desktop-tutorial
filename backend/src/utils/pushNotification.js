const admin = require('firebase-admin');

// Initialize Firebase Admin (in production, use proper service account)
let firebaseApp;

try {
  if (process.env.FIREBASE_PROJECT_ID) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      })
    });
  }
} catch (error) {
  console.log('Firebase initialization skipped (missing credentials)');
}

/**
 * Send push notification to a user
 * @param {string} fcmToken - User's FCM token
 * @param {object} notification - Notification data
 * @returns {Promise}
 */
exports.sendPushNotification = async (fcmToken, notification) => {
  if (!firebaseApp || !fcmToken) {
    console.log('Push notification not sent (Firebase not configured or no FCM token)');
    return { success: false };
  }

  try {
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data || {},
      token: fcmToken,
    };

    const response = await admin.messaging().send(message);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send push notification to multiple users
 * @param {Array} fcmTokens - Array of FCM tokens
 * @param {object} notification - Notification data
 * @returns {Promise}
 */
exports.sendMulticastNotification = async (fcmTokens, notification) => {
  if (!firebaseApp || !fcmTokens || fcmTokens.length === 0) {
    return { success: false };
  }

  try {
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data || {},
      tokens: fcmTokens,
    };

    const response = await admin.messaging().sendMulticast(message);
    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount
    };
  } catch (error) {
    console.error('Error sending multicast notification:', error);
    return { success: false, error: error.message };
  }
};
