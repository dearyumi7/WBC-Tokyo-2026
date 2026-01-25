// 使用官方 GStatic 模組路徑以確保 app 與 firestore 模組的相容性與正確連結
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBuOD8-PHR8KCzRqL09JTzGkhGNSs0OnEc",
  authDomain: "wbc-tokyo-2026.firebaseapp.com",
  projectId: "wbc-tokyo-2026",
  storageBucket: "wbc-tokyo-2026.firebasestorage.app",
  messagingSenderId: "198769055995",
  appId: "1:198769055995:web:85c4d584ac56869ebab85e",
  measurementId: "G-4J288J7EQJ"
};

let db = null;

try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  // 捕捉初始化錯誤，防止 App 因 Firebase 問題而崩潰白屏
  console.error("Firebase initialization failed:", error);
}

export { db };
