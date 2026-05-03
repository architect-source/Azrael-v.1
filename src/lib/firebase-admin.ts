import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

/**
 * AZRAEL // FIREBASE_ADMIN_PROTOCOL
 * Purpose: Sovereign access to the Shadow Ledger and Session Vault.
 * Robustness: Auto-detects environment or falls back to config.
 */

if (!admin.apps.length) {
  try {
    // If the projectId in config doesn't match the current environment (common in remixed apps),
    // initializeApp without parameters often auto-detects the correct credentials.
    admin.initializeApp({
      projectId: firebaseConfig.projectId || undefined,
    });
    console.log(`[AZRAEL] SHADOW_FIREBASE_INIT | Target: ${firebaseConfig.projectId || 'ENVIRONMENT_DEFAULT'}`);
  } catch (e) {
    console.error(`[AZRAEL] FIREBASE_PRIMARY_INIT_FAILED. Falling back to environment defaults.`, e);
    admin.initializeApp();
  }
}

export const getSovereignDb = () => {
  const app = admin.apps[0];
  
  try {
    // Attempt specific database access if configured
    if (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)') {
      return getFirestore(app!, firebaseConfig.firestoreDatabaseId);
    }
  } catch (e) {
    console.warn(`[AZRAEL] NAMED_DB_ACCESS_EXCEPTION [${firebaseConfig.firestoreDatabaseId}]: Falling back to (default)`);
  }
  
  return getFirestore(app!); 
};

export const adminDb = getSovereignDb();
export const adminAuth = admin.auth();
