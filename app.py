from flask import Flask, render_template, redirect, url_for

app = Flask(__name__)

# --- 最初に表示するページ ---
@app.route("/")
def root():
    return redirect(url_for("login"))  # まずはログインページへリダイレクト

# --- 公開ページ（ログイン後に使う想定） ---
@app.route("/index")
def index():
    return render_template("index.html")  # 買い物ページ

@app.route("/home")
def home():
    return render_template("home.html")  # home.html を /home で表示

@app.route("/preset")
def preset():
    return render_template("preset.html")  # 事前準備ページ

@app.route("/admin")
def admin():
    return render_template("admin.html")  # 商品管理ページ

@app.route("/settings")
def settings():
    return render_template("settings.html")  # 設定ページ

# --- 認証関連ページ ---
@app.route("/login")
def login():
    return render_template("login.html")  # ログイン画面

@app.route("/register")
def register():
    return render_template("register.html")  # アカウント新規作成

if __name__ == "__main__":
    app.run(debug=True)
