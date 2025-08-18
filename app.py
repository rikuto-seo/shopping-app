from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")  # 買い物ページ

@app.route("/preset")
def setup():
    return render_template("preset.html")  # 事前準備ページ

@app.route("/admin")
def admin():
    return render_template("admin.html")  # 商品管理ページ

if __name__ == "__main__":
    app.run(debug=True)
