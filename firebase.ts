import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBuOD8-PHR8KCzRqL09JTzGkhGNss0OnEc",
  authDomain: "wbc-tokyo-2026.firebaseapp.com",
  projectId: "wbc-tokyo-2026",
  storageBucket: "wbc-tokyo-2026.firebasestorage.app",
  messagingSenderId: "198769055995",
  appId: "1:198769055995:web:85c4d584ac56869ebab85e",
  measurementId: "G-4J288J7EQJ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);