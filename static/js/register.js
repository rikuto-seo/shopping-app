import { register, observeAuthState } from "./auth.js";

const form = document.getElementById("register-form");
const errorMessage = document.getElementById("error-message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const displayName = document.getElementById("displayName").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  errorMessage.textContent = ""; // 前回のエラーをクリア

  try {
    await register(email, password, displayName);
    // 登録成功 → ホームへ
    window.location.href = "/index";
  } catch (err) {
    // Firebase エラーコードに応じて日本語で表示
    if (err.code === "auth/email-already-in-use") {
      errorMessage.textContent = "このメールアドレスはすでに登録されています。ログインしてください。";
    } else if (err.code === "auth/invalid-email") {
      errorMessage.textContent = "メールアドレスの形式が正しくありません。";
    } else if (err.code === "auth/weak-password") {
      errorMessage.textContent = "パスワードは6文字以上で入力してください。";
    } else {
      errorMessage.textContent = "登録に失敗しました。しばらくしてから再度お試しください。";
    }
    console.error(err);
  }
});

// すでにログインしている場合はホームへ
observeAuthState((user) => {
  if (user) {
    window.location.href = "/index";
  }
});
