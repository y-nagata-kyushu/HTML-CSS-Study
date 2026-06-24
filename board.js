const API_BASE_URL = "https://eat-sushi.monster/api";

const postList = document.getElementById("post-list");
const loadingState = document.getElementById("loading-state");
const emptyState = document.getElementById("empty-state");
const errorState = document.getElementById("error-state");
const postCount = document.getElementById("post-count");

function formatDate(isoString) {
    const d = new Date(isoString);
    return d.toLocaleString("ja-JP", { dateStyle: "short", timeStyle: "short" });
}

function renderPosts(posts) {
    loadingState.hidden = true;

    if (posts.length === 0) {
        emptyState.hidden = false;
        return;
    }

    postCount.textContent = `${posts.length}件`;
    postCount.hidden = false;

    postList.innerHTML = posts.map((post) => `
    <article class="post-card card">
      <div class="post-question">
        <span class="post-label">質問</span>
        <p>${escapeHtml(post.lastquestion)}</p>
      </div>
      <div class="post-reply">
        <span class="post-label reply">AIの回答</span>
        <p>${escapeHtml(post.lastaireply)}</p>
      </div>
      <footer class="post-footer">
        <span class="post-author">${escapeHtml(post.name)}</span>
        <span class="post-date">${formatDate(post.createdAt)}</span>
      </footer>
    </article>
  `).join("");
}

// XSS対策
function escapeHtml(str) {
    if (!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

async function loadPosts() {
    try {
        const res = await fetch(`${API_BASE_URL}/inquiry`, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const posts = await res.json();
        renderPosts(posts);
    } catch (err) {
        console.error(err);
        loadingState.hidden = true;
        errorState.hidden = false;
    }
}

loadPosts();