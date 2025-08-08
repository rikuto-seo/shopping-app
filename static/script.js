let items = [];
let budget = null;

// プリセットリスト（オブジェクト配列：{name, quantity}）
const presetItems = [];

let isPresetInputMode = false;
let currentPresetName = null;

const PRESET_STORAGE_KEY = "myPresetItems";

// ローカルストレージからプリセット読み込み
function loadPresetItems() {
    const stored = localStorage.getItem(PRESET_STORAGE_KEY);
    if (stored) {
        try {
            const arr = JSON.parse(stored);
            if (Array.isArray(arr)) {
                presetItems.length = 0;
                presetItems.push(...arr);
            }
        } catch {
            presetItems.length = 0;
        }
    }
}

// ローカルストレージにプリセット保存
function savePresetItems() {
    localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presetItems));
}

// 事前用意リストのボタン生成
function createPresetButtons() {
    const container = document.getElementById("preset-list");
    container.innerHTML = "";

    presetItems.forEach(({ name }) => {
        const btn = document.createElement("button");
        btn.textContent = name;
        btn.style.margin = "0.2rem";
        // 個数も渡す
        btn.onclick = () => {
            const preset = presetItems.find(p => p.name === name);
            startPresetInput(preset.name, preset.quantity);
        };
        container.appendChild(btn);
    });
}

// 商品追加（通常モード）
function addItem() {
    if (isPresetInputMode) return;

    const name = document.getElementById("name").value.trim();
    const price = Number(document.getElementById("price").value);
    const quantity = Number(document.getElementById("quantity").value);

    if (!name || price <= 0 || quantity <= 0) return;

    items.push({ name, price, quantity, bought: false });
    sortItems();
    resetForm();
}

// フォームリセット（通常モード or プリセット入力モード終了時）
function resetForm() {
    // プリセット入力モードならモード解除＋フォーム初期化処理
    if (isPresetInputMode) {
        isPresetInputMode = false;
        currentPresetName = null;

        const nameInput = document.getElementById("name");
        const priceInput = document.getElementById("price");
        const qtyInput = document.getElementById("quantity");
        const addBtn = document.getElementById("form-add-btn");

        nameInput.readOnly = false;

        priceInput.disabled = false;
        priceInput.style.display = "inline-block";

        qtyInput.disabled = false;
        qtyInput.style.display = "inline-block";

        addBtn.textContent = "追加";
    }

    // フォームの値は最後に必ずリセット
    document.getElementById("name").value = "";
    document.getElementById("price").value = "";
    document.getElementById("quantity").value = 1;
}

// 買い物リスト更新表示
function updateList() {
    const list = document.getElementById("list");
    list.innerHTML = "";

    items.forEach((item, index) => {
        const li = document.createElement("li");

        // 商品名＋価格×数量＝合計 の表示（括弧なし）
        const textSpan = document.createElement("span");
        textSpan.textContent = `${item.name} ${item.price}円 × ${item.quantity} = ${item.price * item.quantity}円`;
        textSpan.style.cursor = "pointer";
        if (item.bought) {
            textSpan.style.textDecoration = "line-through";
            textSpan.style.color = "#999";
        }
        textSpan.onclick = () => toggleBought(index);

        // 個数表示（括弧・余計な記号なし）
        const qtySpan = document.createElement("span");
        qtySpan.textContent = item.quantity;
        qtySpan.style.cursor = "pointer";
        qtySpan.title = "クリックして個数を編集";
        qtySpan.style.marginLeft = "1rem";  // 余白をつける
        qtySpan.style.minWidth = "30px";    // 幅を確保
        qtySpan.style.textAlign = "center";
        qtySpan.style.fontWeight = "700";
        qtySpan.style.color = item.bought ? "#999" : "#2a7ae2";
        qtySpan.onclick = () => {
            const input = document.createElement("input");
            input.type = "number";
            input.value = item.quantity;
            input.min = 1;
            input.style.width = "50px";

            input.onblur = () => finishEditQuantity(index, input.value);
            input.onkeydown = e => {
                if (e.key === "Enter") input.blur();
            };

            qtySpan.replaceWith(input);
            input.focus();
        };

        // 削除ボタン
        const delBtn = document.createElement("button");
        delBtn.textContent = "×";
        delBtn.style.marginLeft = "1rem";
        delBtn.onclick = e => {
            e.stopPropagation();
            removeItem(index);
        };

        li.appendChild(textSpan);
        li.appendChild(qtySpan);
        li.appendChild(delBtn);

        list.appendChild(li);
    });

    updateTotalAndBudget();
}

// クリックで買った/未購入切替
function toggleBought(index) {
    items[index].bought = !items[index].bought;
    updateList();
}

// 個数編集完了処理
function finishEditQuantity(index, newVal) {
    const qty = Number(newVal);
    if (qty >= 1) {
        items[index].quantity = qty;
    }
    updateList();
}

// 並び替え処理
function sortItems() {
    const sortOrder = document.getElementById("sortOrder").value;

    if (sortOrder === "priceAsc") {
        items.sort((a, b) => (a.price * a.quantity) - (b.price * b.quantity));
    } else if (sortOrder === "priceDesc") {
        items.sort((a, b) => (b.price * b.quantity) - (a.price * a.quantity));
    } else if (sortOrder === "unitPriceAsc") {
        items.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "unitPriceDesc") {
        items.sort((a, b) => b.price - a.price);
    }
    // "added"の場合はソートしない（追加順のまま）

    updateList();
}

// 予算設定
function setBudget() {
    const val = Number(document.getElementById("budget").value);
    if (val <= 0 || isNaN(val)) {
        alert("正しい予算を入力してください");
        return;
    }
    budget = val;
    localStorage.setItem("budget", budget);
    document.getElementById("budget-message").textContent = `予算は ${budget} 円に設定されました。`;
    updateList();
}

// 予算読み込み
function loadBudget() {
    const saved = localStorage.getItem("budget");
    if (saved) {
        budget = Number(saved);
        document.getElementById("budget").value = budget;
        document.getElementById("budget-message").textContent = `予算は ${budget} 円に設定されています。`;
    }
}

// 合計・予算表示更新
function updateTotalAndBudget() {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalElem = document.getElementById("total");
    const remainingElem = document.getElementById("remaining");

    totalElem.textContent = total;

    if (budget !== null) {
        const diff = budget - total;
        if (total > budget) {
            totalElem.style.color = "red";
            remainingElem.style.color = "red";
            remainingElem.textContent = `超過: ${-diff} 円`;
            document.getElementById("budget-message").textContent = `予算オーバー！現在の合計は ${total} 円です。`;
        } else if (total > budget * 0.8) {
            totalElem.style.color = "orange";
            remainingElem.style.color = "orange";
            remainingElem.textContent = `残り: ${diff} 円`;
            document.getElementById("budget-message").textContent = `予算が近づいています。現在の合計は ${total} 円です。`;
        } else {
            totalElem.style.color = "black";
            remainingElem.style.color = "black";
            remainingElem.textContent = `残り: ${diff} 円`;
            document.getElementById("budget-message").textContent = `予算は ${budget} 円です。`;
        }
    } else {
        totalElem.style.color = "black";
        remainingElem.textContent = "";
        document.getElementById("budget-message").textContent = "";
    }
}

// アイテム削除
function removeItem(index) {
    items.splice(index, 1);
    updateList();
}

// プリセット商品選択時のフォーム設定（価格入力欄を隠して、名前読み取り＋個数入力可能に）
function startPresetInput(name, quantity) {
    if (isPresetInputMode) {
        alert("現在プリセット商品の入力中です。価格と数量を入力してください。");
        return;
    }
    isPresetInputMode = true;
    currentPresetName = name;

    const nameInput = document.getElementById("name");
    const priceInput = document.getElementById("price");
    const qtyInput = document.getElementById("quantity");
    const addBtn = document.getElementById("form-add-btn");

    nameInput.value = name;
    nameInput.readOnly = true;

    // 価格欄はプリセットモードでは不要のため非表示・無効化
    priceInput.value = "";
    priceInput.disabled = false;  // 入力可能にする
    priceInput.style.display = "inline-block";  // 表示は維持
    priceInput.focus();  // 価格入力を促すためフォーカスも移すのが親切

    qtyInput.value = quantity || 1;
    qtyInput.disabled = false;
    qtyInput.style.display = "inline-block";

    addBtn.textContent = "追加（プリセット用）";
}

// プリセット入力中の追加ボタン処理（価格は0固定）
function addItemFromPreset() {
    if (!isPresetInputMode) {
        addItem();
        return;
    }

    const name = currentPresetName;
    const quantity = Number(document.getElementById("quantity").value);

    if (quantity <= 0) {
        alert("数量を正しく入力してください。");
        return;
    }

    // 価格はプリセット入力モードでは0固定（または任意に変更可）
    const price = Number(document.getElementById("price").value);

    items.push({ name, price, quantity, bought: false });

    // プリセット商品をリストから削除しローカルストレージ更新
    const idx = presetItems.findIndex(item => item.name === name);
    if (idx !== -1) {
        presetItems.splice(idx, 1);
        savePresetItems();
    }

    sortItems();
    resetForm();
    createPresetButtons();
}

// ページロード時処理
window.onload = () => {
    loadBudget();
    loadPresetItems();
    createPresetButtons();
    updateList();

    const addBtn = document.getElementById("form-add-btn");
    addBtn.onclick = addItemFromPreset;
};

// 予算設定欄表示切替 + アイコン表示切替
document.getElementById('budget-toggle-btn').addEventListener('click', () => {
    const budgetSetting = document.getElementById('budget-setting');
    const moneyIcon = document.getElementById('money-icon');

    const isHidden = budgetSetting.style.display === 'none' || budgetSetting.style.display === '';

    if (isHidden) {
        budgetSetting.style.display = 'flex';
        moneyIcon.style.display = 'inline-block'; // お札アイコンを表示
    } else {
        budgetSetting.style.display = 'none';
        moneyIcon.style.display = 'none'; // お札アイコンを非表示
    }
});

// 「買い物終了」ボタンの正しい処理（既存の未定義関数や誤ったキーを使わない）
document.getElementById("end-shopping-btn").addEventListener("click", () => {
    if (!confirm("本当に買い物を終了しますか？\n買い物リストと予算がリセットされます。")) return;

    // 1) メモリ上のデータをクリア
    items = [];
    budget = null;

    // 2) 使っている可能性のある localStorage キーを削除（安全のため複数キーを消す）
    try {
        localStorage.removeItem("myItems");   // もし以前に使っていれば
        localStorage.removeItem("items");     // こちらも念のため
        localStorage.removeItem("budget");    // 現行コードは "budget" を使っているのでこれを削除
        // preset（myPresetItems）は残す仕様なので消さない
    } catch (e) {
        console.warn("localStorage clear error:", e);
    }

    // 3) UI を最新状態に更新
    // items を描画する関数は updateList() を使う（あなたのスクリプトに定義済み）
    updateList();

    // フォームをリセットしておく（既存 resetForm を呼ぶ）
    if (typeof resetForm === "function") resetForm();

    // 予算入力欄とメッセージをクリア
    const budgetInput = document.getElementById("budget");
    if (budgetInput) budgetInput.value = "";

    const budgetMsg = document.getElementById("budget-message");
    if (budgetMsg) budgetMsg.textContent = "";

    // 必要なら合計表示も更新
    if (typeof updateTotalAndBudget === "function") updateTotalAndBudget();

    alert("買い物リストと予算をリセットしました。");
});
