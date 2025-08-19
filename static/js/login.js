import { login } from "./auth.js";

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await login(email, password);
    // ログイン成功したら買い物ページに移動
    window.location.href = "/index";
  } catch (error) {
    console.error(error);
    alert("ログインに失敗しました: " + error.message);
  }
});
