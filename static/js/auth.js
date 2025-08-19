import { auth } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

/**
 * アカウント新規作成
 */
export async function register(email, password, displayName) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }
    return userCredential.user;
  } catch (error) {
    alert("登録失敗: " + error.message);
    throw error;
  }
}

/**
 * ログイン
 */
export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    alert("ログイン失敗: " + error.message);
    throw error;
  }
}

/**
 * ログアウト
 */
export async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    alert("ログアウト失敗: " + error.message);
    throw error;
  }
}

/**
 * 認証状態の監視
 */
export function observeAuthState(callback) {
  onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}
