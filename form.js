const form = document.getElementById("inquiry-form");
const confirmMessage = document.getElementById("confirm-message");
const submitButton = form.querySelector("button[type=submit]");
const API_BASE_URL = "https://eat-sushi.monster/api"

form.addEventListener("submit", async(event) => {
  event.preventDefault();

  const payload = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    subject: form.subject.value.trim(),
    message: form.message.value.trim(),
    submittedAt: new Date().toISOString()
  };
  
  submitButton.disabled = true;
  submitButton.textContent = "送信中…";

  try {
    const res = await fetch(`${API_BASE_URL}/inquiry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`status ${res.status}`);
    /**
     * (property) Response.ok: boolean
     * The ok read-only property of the Response interface contains a Boolean stating whether the response was successful (status in the range 200-299) or not.
     * MDN Reference
     */

    const created = await res.json();
    console.log("[phase4] inquiry created:", created);

    confirmMessage.classList.remove("is-error");
    confirmMessage.textContent = `送信しました（受付コード: ${created.id}）`;
    confirmMessage.hidden = false;
    form.reset();
  } catch (err) {
    console.error(err);
    confirmMessage.classList.add("is-error");
    confirmMessage.textContent = "送信に失敗しました。時間をおいて再度お試しください。";
    confirmMessage.hidden = false;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "送信する";
      }
});