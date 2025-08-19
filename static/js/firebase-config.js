// Firebase 初期化共通ファイル
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

// Firebase 設定（既存のものを流用）
const firebaseConfig = {
  apiKey: "AIzaSyDI5HJyD3mTi67ndWrpb-tbd8c0jKOhjYg",
  authDomain: "shopping-app-754a1.firebaseapp.com",
  projectId: "shopping-app-754a1",
  storageBucket: "shopping-app-754a1.appspot.com",
  messagingSenderId: "1089983907690",
  appId: "1:1089983907690:web:1c6be68478230362ddc713",
  measurementId: "G-Y07NJF1SE1"
};

// Firebase 初期化
const app = initializeApp(firebaseConfig);

// モジュールとしてエクスポート
export const auth = getAuth(app);
export const db = getFirestore(app);
