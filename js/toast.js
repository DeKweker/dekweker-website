// ./js/toast.js
export function initToasts() {
  // Zorg dat host bestaat (ook als je 'm vergeet in index.html)
  let host = document.getElementById("toastHost");
  if (!host) {
    host = document.createElement("div");
    host.id = "toastHost";
    document.body.appendChild(host);
  }

  window.__TOAST__ = function toast({ title = "Oké", msg = "", ms = 2200 } = {}) {
    const el = document.createElement("div");
    el.className = "toast";

    el.innerHTML = `
      <div>
        <div class="toastTitle">${escapeHtml(title)}</div>
        ${msg ? `<div class="toastMsg">${escapeHtml(msg)}</div>` : ""}
      </div>
      <div class="toastActions">
        <button class="btn ghost toastBtnGhost" type="button">OK</button>
      </div>
    `;

    host.appendChild(el);

    const kill = () => {
      el.classList.add("out");
      setTimeout(() => el.remove(), 180);
    };

    el.querySelector("button")?.addEventListener("click", kill);
    setTimeout(kill, ms);
  };
}

function escapeHtml(s = "") {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
