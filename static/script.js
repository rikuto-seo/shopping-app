let items = [];
let budget = null;

// プリセットリスト（オブジェクト配列：{name, quantity}）
const presetItems = [];

let isPresetInputMode = false;
let currentPresetName = null;

const PRESET_STORAGE_KEY = "myPresetItems";
const SHOPPING_HISTORY_KEY = "shoppingHistory"; 

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

        addBtn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> 追加';
    }

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

function createPresetButtons() {
    const container = document.getElementById("preset-list");
    container.innerHTML = "";

    presetItems.forEach(({ name }) => {
        const btn = document.createElement("button");
        btn.textContent = name;
        btn.style.margin = "0.2rem";
        btn.onclick = () => {
            const preset = presetItems.find(p => p.name === name);
            startPresetInput(preset.name, preset.quantity);
        };
        container.appendChild(btn);
    });
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

    priceInput.value = "";            // 毎回空欄にリセット
    priceInput.disabled = false;     // 入力可能に
    priceInput.style.display = "inline-block"; // 表示維持
    priceInput.focus();              // フォーカス

    qtyInput.value = quantity || 1;
    qtyInput.disabled = false;
    qtyInput.style.display = "inline-block";

    addBtn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> 追加（プリセット用）';
}


// プリセット入力中の追加ボタン処理（価格は0固定）
function addItemFromPreset() {
    if (!isPresetInputMode) {
        addItem();
        return;
    }

    const name = currentPresetName;
    const quantity = Number(document.getElementById("quantity").value);
    const priceInput = document.getElementById("price");
    const price = Number(priceInput.value);

    if (quantity <= 0) {
        alert("数量を正しく入力してください。");
        return;
    }

    if (!price || price <= 0) {
        alert("価格を入力してください（0円は無効です）。");
        priceInput.focus();
        return;
    }

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
    addBtn.addEventListener("click", function () {
        if (isPresetInputMode) {
            addItemFromPreset();
        } else {
            addItem();
        }
    });
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
    if (!confirm("本当に買い物を終了しますか？\n買い物リストと予算がリセットされ、リストは履歴に保存されます。")) return;

    // 1) 履歴を読み込み
    const history = loadShoppingHistory();

    // 2) 現在のitemsを履歴に追加（日時付き）
    const now = new Date();
    history.unshift({
        id: now.toISOString(),
        date: now.toLocaleString(),
        items: items.map(({ name, quantity }) => ({ name, quantity }))
    });

    // 3) 履歴を保存
    saveShoppingHistory(history);

    // 4) メモリ上の買い物リストと予算をクリア
    items = [];
    budget = null;

    // 5) localStorageの買い物関連データを削除
    try {
        localStorage.removeItem("myItems");
        localStorage.removeItem("items");
        localStorage.removeItem("budget");
    } catch (e) {
        console.warn("localStorage clear error:", e);
    }

    // 6) UIを更新
    updateList();
    resetForm();

    const budgetInput = document.getElementById("budget");
    if (budgetInput) budgetInput.value = "";

    const budgetMsg = document.getElementById("budget-message");
    if (budgetMsg) budgetMsg.textContent = "";

    updateTotalAndBudget();

    // 7) 履歴一覧を再描画
    renderShoppingHistory();

    alert("買い物リストを履歴に保存し、リストと予算をリセットしました。");
});

function loadShoppingHistory() {
    const stored = localStorage.getItem("shoppingHistory");
    if (!stored) return [];
    try {
        return JSON.parse(stored);
    } catch {
        return [];
    }
}

function saveShoppingHistory(history) {
    localStorage.setItem("shoppingHistory", JSON.stringify(history));
}

function renderShoppingHistory() {
    const container = document.getElementById("shopping-history-list");
    if (!container) return;

    container.innerHTML = "";

    const history = loadShoppingHistory();

    if (history.length === 0) {
        container.textContent = "履歴はまだありません。";
        return;
    }

    history.forEach((entry, index) => {
        const div = document.createElement("div");
        div.classList.add("history-entry");
        div.style.border = "1px solid #ccc";
        div.style.padding = "0.5rem";
        div.style.marginBottom = "0.5rem";

        const header = document.createElement("div");
        header.style.fontWeight = "700";
        header.textContent = `${entry.date} (${entry.items.length}件)`;
        div.appendChild(header);

        // 「プリセットに復元」ボタン
        const btnRestore = document.createElement("button");
        btnRestore.textContent = "プリセットに復元";
        btnRestore.style.marginRight = "0.5rem";
        btnRestore.onclick = () => {
            const presetItems = [...presetItems]; // もし必要なら

            entry.items.forEach(({ name, quantity }) => {
                const existing = presetItems.find(p => p.name === name);
                if (existing) {
                    existing.quantity += quantity;
                } else {
                    presetItems.push({ name, quantity });
                }
            });

            savePresetItems();
            createPresetButtons();
            alert("履歴の内容をプリセットリストに復元しました。");
        };
        div.appendChild(btnRestore);

        // 「履歴から削除」ボタン
        const btnDelete = document.createElement("button");
        btnDelete.textContent = "履歴から削除";
        btnDelete.onclick = () => {
            if (!confirm("この履歴を削除しますか？")) return;
            const history = loadShoppingHistory();
            history.splice(index, 1);
            saveShoppingHistory(history);
            renderShoppingHistory();
        };
        div.appendChild(btnDelete);

        container.appendChild(div);
    });
}

