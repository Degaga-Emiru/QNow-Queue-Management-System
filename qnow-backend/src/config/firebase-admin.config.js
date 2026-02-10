const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
try {
  const serviceAccount = require(path.join(__dirname, '../../.firebase/serviceAccountKey.json'));
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
  });
  
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error.message);
}

// Firebase services
const db = admin.firestore();
const auth = admin.auth();

module.exports = {
  admin,
  db,
  auth,
  FieldValue: admin.firestore.FieldValue,
  Timestamp: admin.firestore.Timestamp
};