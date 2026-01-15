// js/toast.js
import { escapeHtml, clampInt } from "./utils.js";

let _inited = false;

export function initToasts() {
  if (_inited) return;
  _inited = true;

  // Host (bestaat al in je index.html, maar we vangen het op)
  let host = document.getElementById("toastHost");
  if (!host) {
    host = document.createElement("div");
    host.id = "toastHost";
    document.body.appendChild(host);
  }

  // Kleine safety: max aantal toasts tegelijk
  const MAX_TOASTS = 3;

  window.__TOAST__ = function toast(opts = {}) {
    const title = opts.title != null ? String(opts.title) : "Oké";
    const msg = opts.msg != null ? String(opts.msg) : "";
    const ms = clampInt(opts.ms ?? 2200, 800, 12000);

    // verwijder oudste als te veel
    while (host.children.length >= MAX_TOASTS) {
      host.firstElementChild?.remove();
    }

    const el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");

    el.innerHTML = `
      <div class="toastText">
        <div class="toastTitle">${escapeHtml(title)}</div>
        ${msg ? `<div class="toastMsg">${escapeHtml(msg)}</div>` : ""}
      </div>
      <div class="toastActions">
        <button class="btn ghost toastBtnGhost" type="button" aria-label="Sluit">OK</button>
      </div>
    `;

    host.appendChild(el);

    let killed = false;
    const kill = () => {
      if (killed) return;
      killed = true;
      el.classList.add("out");
      window.setTimeout(() => el.remove(), 180);
    };

    el.querySelector("button")?.addEventListener("click", kill, { once: true });
    window.setTimeout(kill, ms);
  };
}
