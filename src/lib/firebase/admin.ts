import { initializeApp, getApps, getApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

let app;

if (getApps().length === 0) {
  try {
    app = initializeApp({
      credential: applicationDefault(),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch (err) {
    console.warn('Failed to initialize Firebase Admin with applicationDefault, falling back:', err);
    app = initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  }
} else {
  app = getApp();
}

export const adminDb = getFirestore(app);
export const adminBucket = getStorage(app).bucket();
export { app as adminApp };
