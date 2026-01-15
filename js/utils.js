// js/utils.js

export function euro(n) {
  const v = Number(n);
  const safe = Number.isFinite(v) ? v : 0;
  try {
    return new Intl.NumberFormat("nl-BE", {
      style: "currency",
      currency: "EUR"
    }).format(safe);
  } catch {
    return `€ ${safe.toFixed(2)}`;
  }
}

export function escapeHtml(s = "") {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function clampInt(n, min, max) {
  const v = Number(n);
  if (!Number.isFinite(v)) return min;
  const r = Math.round(v);
  return Math.max(min, Math.min(max, r));
}
