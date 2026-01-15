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
// ======================================================

export function getRoute() {
  const hash = String(window.location.hash || "#home").trim();

  // strip leading "#"
  let raw = hash.startsWith("#") ? hash.slice(1) : hash;
  raw = raw.trim();

  // default
  if (!raw) return "/home";

  // remove any leading slashes to avoid "//"
  raw = raw.replace(/^\/+/, "");

  const parts = raw.split("/").filter(Boolean);
  const root = (parts[0] || "").toLowerCase();

  // shop keeps subroutes inside shop.js via getShopPathParts()
  if (root === "shop") return "/shop";

  if (root === "home") return "/home";
  if (root === "music") return "/music";
  if (root === "contact") return "/contact";

  return "/home";
}
