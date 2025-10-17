import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Check if required environment variables are set
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
      console.warn('⚠️  Firebase credentials not configured in .env file');
      return;
    }

    // You can use service account file or environment variables
    const serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
    };

    // Validate that project_id is a string
    if (typeof serviceAccount.project_id !== 'string' || !serviceAccount.project_id) {
      throw new Error('Service account object must contain a string "project_id" property.');
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase Admin initialized successfully');
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
  }
};

export { admin, initializeFirebase };
