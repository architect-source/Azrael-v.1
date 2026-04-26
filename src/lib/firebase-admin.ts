import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

if (!admin.apps.length) {
  console.log(`[AZRAEL] INITIALIZING_FIREBASE_ADMIN: Project=${firebaseConfig.projectId}`);
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

export const getSovereignDb = () => {
  try {
    if (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)') {
      return getFirestore(admin.apps[0]!, firebaseConfig.firestoreDatabaseId);
    }
  } catch (e) {
    console.warn(`[AZRAEL] NAMED_DATABASE_INIT_FAILURE: ${firebaseConfig.firestoreDatabaseId}. Falling back to (default).`);
  }
  return getFirestore(); 
};

export const adminDb = getSovereignDb();

export const adminAuth = admin.auth();
