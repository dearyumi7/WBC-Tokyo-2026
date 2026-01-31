import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';
import { getFirestore, enableIndexedDbPersistence } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';

// 嚴格依照使用者提供的 Firebase SDK 配置
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

// 啟用離線快取與本地持久化
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore Persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore Persistence unimplemented: Browser not supported');
    }
  });
}
