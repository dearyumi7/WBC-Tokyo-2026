import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';

/**
 * Hardcoded Firebase configuration based on the provided .env file.
 * This ensures that Firestore initializes with a valid Project ID, preventing
 * the "Invalid segment" error (projects//databases...).
 */
const firebaseConfig = {
  apiKey: "AIzaSyBuOD8-PHR8KCzRqL09JTzGkhGNss0OnEc",
  authDomain: "wbc-tokyo-2026.firebaseapp.com",
  projectId: "wbc-tokyo-2026",
  storageBucket: "wbc-tokyo-2026.firebasestorage.app",
  messagingSenderId: "198769055995",
  appId: "1:198769055995:web:85c4d584ac56869ebab85e",
  measurementId: "G-4J28BJ7EQJ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Note: IndexedDB persistence is disabled to avoid "IndexedDbTransactionError" 
// which often occurs in sandboxed browser environments.
