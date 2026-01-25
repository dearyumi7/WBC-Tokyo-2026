import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { 
  getAuth, 
  initializeAuth,
  browserLocalPersistence,
  browserPopupRedirectResolver,
  GoogleAuthProvider, 
  signInWithRedirect, 
  getRedirectResult, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDKwP_hdehGHJ2JdEU4R5O0jX9D2lyWThE",
  authDomain: "wbc-tokyo-2026.firebaseapp.com",
  projectId: "wbc-tokyo-2026",
  storageBucket: "wbc-tokyo-2026.firebasestorage.app",
  messagingSenderId: "198769055995",
  appId: "1:198769055995:web:85c4d584ac56869ebab85e",
  measurementId: "G-4J288J7EQJ"
};

// 確保 App 僅初始化一次
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// 使用 initializeAuth 以確保 Redirect 解析器被正確載入
let auth: any;
try {
  auth = getAuth(app);
} catch (e) {
  auth = initializeAuth(app, {
    persistence: browserLocalPersistence,
    popupRedirectResolver: browserPopupRedirectResolver,
  });
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ 
  prompt: 'select_account' 
});

export { db, auth, googleProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut };