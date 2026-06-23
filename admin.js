const statusLabels = {
  open: "未対応",
  in_progress: "対応中",
  resolved: "解決済み"
};

const statsGrid = document.getElementById("stats-grid");
const ticketList = document.getElementById("ticket-list");
const filterBar = document.getElementById("filter-bar");

let activeFilter = "all";

function renderStats(tickets) {
  const counts = {
    open: tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length
  };

  statsGrid.innerHTML = ["open", "in_progress", "resolved"]
    .map(
      (key) => `
        <div class="stat-card">
          <div class="stat-count">${counts[key]}</div>
          <div class="stat-label">${statusLabels[key]}</div>
        </div>
      `
    )
    .join("");
}

function renderTickets(tickets) {
  const visible =
    activeFilter === "all"
      ? tickets
      : tickets.filter((t) => t.status === activeFilter);

  if (visible.length === 0) {
    ticketList.innerHTML = `<div class="empty-state">該当する問い合わせはありません</div>`;
    return;
  }

  ticketList.innerHTML = visible
    .map(
      (t) => `
        <div class="ticket-row">
          <div class="priority-bar ${t.priority}"></div>
          <div class="ticket-main">
            <div class="ticket-subject">${t.subject}</div>
            <div class="ticket-meta">${t.requester}・${t.id}</div>
          </div>
          <div class="ticket-time">${t.receivedAt}</div>
          <div class="badge ${t.status}">${statusLabels[t.status]}</div>
        </div>
      `
    )
    .join("");
}

filterBar.addEventListener("click", (event) => {
  const button = event.target.closest(".filter-btn");
  if (!button) return;

  filterBar
    .querySelectorAll(".filter-btn")
    .forEach((b) => b.classList.remove("is-active"));
  button.classList.add("is-active");

  activeFilter = button.dataset.filter;
  renderTickets(dummyTickets);
});

renderStats(dummyTickets);
renderTickets(dummyTickets);
