let firebaseAdmin = null;

function getAdmin() {
  if (firebaseAdmin) return firebaseAdmin;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) return null;

  try {
    const admin = require('firebase-admin');
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          // Firebase private keys from the console contain literal \n sequences.
          // Store the key exactly as shown in the JSON credentials file; the
          // replace below converts those literal sequences to real newlines.
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
    }
    firebaseAdmin = admin;
    return admin;
  } catch (err) {
    console.error('Firebase Admin init error:', err.message);
    return null;
  }
}

/**
 * Express middleware that verifies a Firebase Bearer token.
 * In development (no FIREBASE_PROJECT_ID), allows all requests
 * and sets a stub user on req.user.
 */
async function authenticate(req, res, next) {
  const admin = getAdmin();

  if (!admin) {
    // Dev mode: no Firebase configured — attach a stub user
    req.firebaseUser = { uid: 'dev-user', email: 'dev@example.com', name: 'Dev User' };
    req.user = { _id: null, firebaseUid: 'dev-user', displayName: 'Dev User' };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.firebaseUser = decoded;

    // Lazy-load User model to avoid circular deps at startup
    const User = require('../models/User');
    const user = await User.findOne({ firebaseUid: decoded.uid });
    req.user = user || { _id: null, firebaseUid: decoded.uid };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.', detail: err.message });
  }
}

module.exports = { authenticate };
