// js/router.js
// ======================================================
// Hash router
// Supports:
//   #home
//   #music
//   #contact
//   #shop
//   #shop/<category>
//   #shop/<category>/<slug>
//
// Also accepts:
//   #/home, #/shop/..., empty hash
// ======================================================

function safeDecode(s) {
  try { return decodeURIComponent(s); }
  catch { return s; }
}

export function getRoute() {
  const hash = String(window.location.hash || "").trim();

  // strip leading "#"
  let raw = hash.startsWith("#") ? hash.slice(1) : hash;
  raw = raw.trim();

  // allow "#/home" style
  raw = raw.replace(/^\/+/, "");

  // default
  if (!raw) return "/home";

  // split + decode each segment (safer for slugs)
  const parts = raw
    .split("/")
    .map(p => p.trim())
    .filter(Boolean)
    .map(safeDecode);

  const root = String(parts[0] || "").toLowerCase();

  // Keep shop subroutes intact: /shop, /shop/<category>, /shop/<category>/<slug>
  if (root === "shop") {
    const rest = parts.slice(1).join("/").replace(/^\/+/, "");
    return rest ? `/shop/${rest}` : "/shop";
  }

  if (root === "home") return "/home";
  if (root === "music") return "/music";
  if (root === "contact") return "/contact";

  return "/home";
}
