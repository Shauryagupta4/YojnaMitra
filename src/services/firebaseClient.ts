import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type Auth,
  type UserCredential
} from 'firebase/auth';

// Firebase configuration read strictly from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

// Singleton initialization for Firebase app
export const firebaseApp: FirebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

// Auth instance
export const auth: Auth = getAuth(firebaseApp);

// Google Auth Provider setup
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Initiates Google Sign-In with Firebase using a popup.
 * Returns the authenticated user on success.
 */
export async function signInWithGoogle(): Promise<UserCredential['user']> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err: any) {
    const errorCode = err?.code || '';
    if (errorCode === 'auth/popup-closed-by-user') {
      throw new Error('Google sign-in popup was closed before completing.');
    } else if (errorCode === 'auth/cancelled-popup-request') {
      throw new Error('Sign-in cancelled because another popup was opened.');
    } else if (errorCode === 'auth/unauthorized-domain') {
      throw new Error(
        'This domain is not authorized in Firebase Console! Please add localhost to Firebase Console > Authentication > Settings > Authorized domains.'
      );
    } else if (errorCode === 'auth/operation-not-allowed') {
      throw new Error(
        'Google sign-in is not enabled in Firebase. Please enable Google provider under Firebase Console > Authentication > Sign-in method.'
      );
    } else if (errorCode === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your internet connection.');
    }
    throw err;
  }
}

/**
 * Signs the user out from Firebase Auth.
 */
export async function logOutFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Firebase sign out error:', err);
  }
}
