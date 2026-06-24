const API_BASE_URL = "https://eat-sushi.monster/api";

// --- 状態管理 ---
let lastQuestion = "";
let lastAiReply  = "";
let isShared    = false;

// --- DOM参照 ---
const messageList   = document.getElementById("message-list");
const chatInput     = document.getElementById("chat-input");
const sendBtn       = document.getElementById("send-btn");
const actionArea    = document.getElementById("action-area");
const escalateForm  = document.getElementById("share-form");
const sharePanel = document.getElementById("share-panel");

// --- メッセージ追加 ---
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

// --- 送信処理 ---
async function handleSend() {
  const text = chatInput.value.trim();
  if (!text) return addMessage("ai", "質問が入力されていないようです");
  if (!text || isShared) return;
  
  lastQuestion = text;
  chatInput.value = "";
  sendBtn.disabled = true;
  actionArea.hidden = true;

  addMessage("user", text);
  addTypingIndicator();

  try {
    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
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

// --- 投稿パネル表示 ---
document.getElementById("btn-share").addEventListener("click", () => {
  actionArea.hidden = true;
  sharePanel.hidden = false;
  sharePanel.querySelector("#name").focus();
});

document.getElementById("btn-resolved").addEventListener("click", () => {
  actionArea.hidden = true;
  addMessage("ai", "まいどあり！");
});

// --- 登録 ---
escalateForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name  = escalateForm.querySelector("#name").value.trim();
  const email = escalateForm.querySelector("#name").value.trim();
  const submitBtn = escalateForm.querySelector("button[type=submit]");

  submitBtn.disabled = true;
  submitBtn.textContent = "送信中…";

  try {
    const res = await fetch(`${API_BASE_URL}/inquiry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, question: lastQuestion, aiReply: lastAiReply })
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
    escalateForm.querySelector(".share-error").hidden = false;
  }
});

// --- キーボード送信 ---
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});
sendBtn.addEventListener("click", handleSend);