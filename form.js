const form = document.getElementById("inquiry-form");
const confirmMessage = document.getElementById("confirm-message");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const payload = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    subject: form.subject.value.trim(),
    message: form.message.value.trim(),
    submittedAt: new Date().toISOString()
  };

  // フェーズ4でここがAPI Gatewayへのfetch()呼び出しに置き換わります。
  console.log("[phase1] inquiry submitted (no backend yet):", payload);

  confirmMessage.textContent =
    "送信しました（このフェーズではAWSには送られず、コンソールに出力されるだけです）";
  confirmMessage.hidden = false;

  form.reset();
});
