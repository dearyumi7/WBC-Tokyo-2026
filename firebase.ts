import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "tokyo-wbc-shared.firebaseapp.com",
  projectId: "tokyo-wbc-shared",
  storageBucket: "tokyo-wbc-shared.appspot.com",
  messagingSenderId: "shared-sender-id",
  appId: "shared-app-id"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);