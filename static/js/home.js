import { logout, observeAuthState } from "./auth.js";

const welcomeEl = document.getElementById("welcome");
const logoutBtn = document.getElementById("logout-btn");

// ログイン状態を監視
observeAuthState((user) => {
  if (user) {
    const name = user.displayName || user.email;
    welcomeEl.textContent = `ようこそ ${name} さん`;
  } else {
    // 未ログインならログイン画面へ
    window.location.href = "/login";
  }
});

// ログアウト処理
logoutBtn.addEventListener("click", async () => {
  await logout();
  window.location.href = "/login";
});
