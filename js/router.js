// js/router.js
// Router voor hash-based site:
// - #home, #music, #contact
// - #shop
// - #shop/<category>
// - #shop/<category>/<slug>

export function getRoute() {
  const hash = (window.location.hash || "#home").trim();

  // strip "#"
  let raw = hash.startsWith("#") ? hash.slice(1) : hash;
  raw = raw.trim();

  // default
  if (!raw) return "/home";

  // maak geen dubbele slashes
  raw = raw.replace(/^\/+/, "");

  const parts = raw.split("/").filter(Boolean);
  const root = parts[0];

  // shop met subroutes blijft altijd /shop
  if (root === "shop") return "/shop";

  // standaard pages
  if (root === "home") return "/home";
  if (root === "music") return "/music";
  if (root === "contact") return "/contact";

  // fallback
  return "/home";
}
