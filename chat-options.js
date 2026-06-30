const API_BASE_URL = "https://eat-sushi.monster/api";

// ── 選択肢の定義は engine-options.js に分離（index.htmlでグローバル変数先に読み込む） ──

// ── 状態管理 ──────────────────────────────────────────────────────
let selectedEngine = ENGINE_OPTIONS[0];
let lastQuestion   = "";
let lastAiReply    = "";
let isShared       = false;

// ── DOM参照 ───────────────────────────────────────────────────────
const messageList  = document.getElementById("message-list");
const chatInput    = document.getElementById("chat-input");
const sendBtn      = document.getElementById("send-btn");
const actionArea   = document.getElementById("action-area");
const shareForm    = document.getElementById("share-form");
const sharePanel   = document.getElementById("share-panel");
const engineDesc   = document.getElementById("engine-desc");
const engineDropdown        = document.getElementById("engine-dropdown");
const engineDropdownTrigger = document.getElementById("engine-dropdown-trigger");
const engineDropdownLabel   = document.getElementById("engine-dropdown-label");
const engineDropdownList    = document.getElementById("engine-selector");

// ── エンジンセレクター（ドロップダウン）を動的生成 ────────────────
function renderTrigger() {
  engineDropdownLabel.textContent = selectedEngine.label;
  engineDesc.textContent = selectedEngine.desc;
}

function closeDropdown() {
  engineDropdownList.hidden = true;
  engineDropdownTrigger.setAttribute("aria-expanded", "false");
  engineDropdown.classList.remove("is-open");
}

function openDropdown() {
  engineDropdownList.hidden = false;
  engineDropdownTrigger.setAttribute("aria-expanded", "true");
  engineDropdown.classList.add("is-open");
}

function selectEngine(engine) {
  selectedEngine = engine;
  renderTrigger();
  engineDropdownList.querySelectorAll(".engine-option").forEach((el) => {
    el.classList.toggle("is-selected", el.dataset.engineId === engine.id);
    el.setAttribute("aria-selected", el.dataset.engineId === engine.id ? "true" : "false");
  });
}

function buildEngineSelector() {
  ENGINE_OPTIONS.forEach((engine) => {
    const item = document.createElement("li");
    item.className = "engine-option";
    item.dataset.engineId = engine.id;
    item.setAttribute("role", "option");
    item.setAttribute("tabindex", "-1");
    item.innerHTML = `
      <span class="engine-option-label">${engine.label}</span>
      <span class="engine-option-desc">${engine.desc}</span>
    `;

    if (engine.id === selectedEngine.id) {
      item.classList.add("is-selected");
      item.setAttribute("aria-selected", "true");
    } else {
      item.setAttribute("aria-selected", "false");
    }

    item.addEventListener("click", () => {
      selectEngine(engine);
      closeDropdown();
      engineDropdownTrigger.focus();
    });

    engineDropdownList.appendChild(item);
  });

  renderTrigger();

  // トリガーのクリックで開閉
  engineDropdownTrigger.addEventListener("click", () => {
    engineDropdownList.hidden ? openDropdown() : closeDropdown();
  });

  // 外側クリックで閉じる
  document.addEventListener("click", (e) => {
    if (!engineDropdown.contains(e.target)) closeDropdown();
  });

  // Escキーで閉じる
  engineDropdown.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeDropdown();
      engineDropdownTrigger.focus();
    }
  });
}

buildEngineSelector();

// ── メッセージ追加 ────────────────────────────────────────────────
function addMessage(role, text) {
  const wrap = document.createElement("div");
  wrap.className = `bubble-wrap ${role}`;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  wrap.appendChild(bubble);
  messageList.appendChild(wrap);
  messageList.scrollTop = messageList.scrollHeight;
  return bubble;
}

function addTypingIndicator() {
  const wrap = document.createElement("div");
  wrap.className = "bubble-wrap ai";
  wrap.id = "typing";

  const bubble = document.createElement("div");
  bubble.className = "bubble typing-indicator";
  bubble.innerHTML = "<span></span><span></span><span></span>";

  wrap.appendChild(bubble);
  messageList.appendChild(wrap);
  messageList.scrollTop = messageList.scrollHeight;
}

function removeTypingIndicator() {
  document.getElementById("typing")?.remove();
}

// ── 送信処理（エンジン選択に関わらず共通） ────────────────────────
async function handleSend() {
  const text = chatInput.value.trim();
  if (!text) return addMessage("ai", "質問が入力されていないようです");
  if (isShared) return;

  lastQuestion = text;
  chatInput.value = "";
  sendBtn.disabled = true;
  actionArea.hidden = true;

  addMessage("user", text);
  addTypingIndicator();

  // selectedEngine.path を読むだけ。if文なし
  const endpoint = `${API_BASE_URL}${selectedEngine.path}`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();
    lastAiReply = data.reply;

    removeTypingIndicator();
    addMessage("ai", lastAiReply);
    actionArea.hidden = false;

  } catch (err) {
    console.error(err);
    removeTypingIndicator();
    addMessage("ai", "申し訳ありません、応答の取得に失敗しました。時間をおいて再度お試しください。");
  } finally {
    sendBtn.disabled = false;
    chatInput.focus();
  }
}

// ── アクションボタン ──────────────────────────────────────────────
document.getElementById("btn-share").addEventListener("click", () => {
  actionArea.hidden = true;
  sharePanel.hidden = false;
  sharePanel.querySelector("#name").focus();
});

document.getElementById("btn-resolved").addEventListener("click", () => {
  actionArea.hidden = true;
  addMessage("ai", "まいどあり！");
});

// ── 掲示板登録 ────────────────────────────────────────────────────
shareForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    name:         shareForm.querySelector("#name").value.trim(),
    email:        shareForm.querySelector("#email").value.trim(),
    lastaireply:  lastAiReply,
    lastquestion: lastQuestion,
  };

  const submitBtn = shareForm.querySelector("button[type=submit]");
  submitBtn.disabled = true;
  submitBtn.textContent = "送信中…";

  try {
    const res = await fetch(`${API_BASE_URL}/inquiry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();

    isShared = true;
    sharePanel.hidden = true;
    addMessage("ai", `掲示板に登録されました（受付番号: ${data.id}）。まいどあり！`);

  } catch (err) {
    console.error(err);
    submitBtn.disabled = false;
    submitBtn.textContent = "送信する";
    shareForm.querySelector(".share-error").hidden = false;
  }
});

// ── キーボード送信 ────────────────────────────────────────────────
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});
sendBtn.addEventListener("click", handleSend);