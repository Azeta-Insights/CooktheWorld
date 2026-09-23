import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseAppletConfig from '../../firebase-applet-config.json';

// Master Firebase Configuration
export const firebaseConfig = {
  apiKey: firebaseAppletConfig.apiKey || "AIzaSyAadw2hRhyL9F2Mivpo0WnQH9jmleUcfII",
  authDomain: firebaseAppletConfig.authDomain || "cooktheworldapp.firebaseapp.com",
  projectId: firebaseAppletConfig.projectId || "cooktheworldapp",
  storageBucket: firebaseAppletConfig.storageBucket || "cooktheworldapp.firebasestorage.app",
  messagingSenderId: firebaseAppletConfig.messagingSenderId || "65047850253",
  appId: firebaseAppletConfig.appId || "1:65047850253:web:46062d01da6b55579b5444"
};

export const databaseId = firebaseAppletConfig.firestoreDatabaseId || "ai-studio-acafaa41-8ab8-407e-85e5-e51ae1fea3fb";

// Initialize Firebase App safely (avoid duplicate app initialization)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Cloud Firestore with dedicated Database ID
export const db = getFirestore(app, databaseId);

// Test connection on boot to verify Firestore availability
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore connection check: offline or awaiting network.");
    }
  }
}

if (typeof window !== 'undefined' && navigator.onLine) {
  testConnection();
}
