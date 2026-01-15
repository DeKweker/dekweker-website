// js/utils.js

export function euro(n) {
  const v = Number(n);
  try {
    return new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR" }).format(
      Number.isFinite(v) ? v : 0
    );
  } catch {
    return `€ ${(Number.isFinite(v) ? v : 0).toFixed(2)}`;
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
  return Math.max(min, Math.min(max, Math.round(v)));
}
