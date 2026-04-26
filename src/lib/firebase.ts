import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Initialize Firestore with the specific database ID from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  signInWithPopup
};

// Error handling helper as per instructions
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('AZRAEL // FIRESTORE_ERROR: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
