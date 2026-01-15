// js/store.js
// Simpele, stabiele cart store (localStorage) — geen hacks, geen rondjes.

const STORAGE_KEY = "kwkr_cart_v1";

/**
 * cart shape:
 * {
 *   [id]: {
 *     id: string,
 *     qty: number,
 *     meta: { name, price, tag, image, category, slug, type, variant_size, ... }
 *   }
 * }
 */
let cart = loadCart();

/* ---------------------------
   Internal helpers
--------------------------- */
function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return {};
    return data;
  } catch {
    return {};
  }
}

function saveCart() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // ignore (privacy mode / quota)
  }
}

function normId(id) {
  return String(id ?? "").trim();
}

function clampQty(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.round(v));
}

function normPrice(p) {
  const v = Number(p);
  return Number.isFinite(v) ? v : 0;
}

function ensureLine(id) {
  const key = normId(id);
  if (!key) return null;

  if (!cart[key]) {
    cart[key] = { id: key, qty: 0, meta: {} };
  }
  return cart[key];
}

function mergeMeta(existing = {}, incoming = {}) {
  // incoming wint, maar we houden bestaande keys als incoming leeg is
  const out = { ...(existing || {}) };
  for (const [k, v] of Object.entries(incoming || {})) {
    if (v === undefined || v === null) continue;
    // lege strings niet forceren over bestaande
    if (typeof v === "string" && v.trim() === "") continue;
    out[k] = v;
  }
  return out;
}

function cleanupIfZero(id) {
  const key = normId(id);
  if (!key) return;
  if (!cart[key]) return;
  if (cart[key].qty <= 0) delete cart[key];
}

/* ---------------------------
   Public API (imports in jouw files)
--------------------------- */

/**
 * Voeg toe aan cart.
 * meta kan {name, price, tag, image, category, slug, type, variant_size, ...}
 */
export function addToCart(id, meta = {}, qty = 1) {
  const line = ensureLine(id);
  if (!line) return;

  const add = clampQty(qty);
  if (add <= 0) return;

  line.qty = clampQty(line.qty + add);
  line.meta = mergeMeta(line.meta, meta);

  saveCart();

  // badge sync hook (menu.js zet dit)
  if (typeof window.__CART_BADGE_SYNC__ === "function") {
    window.__CART_BADGE_SYNC__();
  }
}

/**
 * Zet quantity (0 = verwijderen)
 */
export function setQty(id, qty) {
  const line = ensureLine(id);
  if (!line) return;

  line.qty = clampQty(qty);
  cleanupIfZero(id);

  saveCart();

  if (typeof window.__CART_BADGE_SYNC__ === "function") {
    window.__CART_BADGE_SYNC__();
  }
}

/**
 * Leeg cart
 */
export function clearCart() {
  cart = {};
  saveCart();

  if (typeof window.__CART_BADGE_SYNC__ === "function") {
    window.__CART_BADGE_SYNC__();
  }
}

/**
 * Aantal items (som van qty)
 */
export function cartCount() {
  let n = 0;
  for (const k in cart) {
    n += clampQty(cart[k]?.qty ?? 0);
  }
  return n;
}

/**
 * Total in euro (som qty * price)
 */
export function cartTotal() {
  let t = 0;
  for (const k in cart) {
    const line = cart[k];
    const qty = clampQty(line?.qty ?? 0);
    const price = normPrice(line?.meta?.price ?? 0);
    t += qty * price;
  }
  return t;
}

/**
 * Gedetailleerde items voor UI (cart.js verwacht dit)
 */
export function cartItemsDetailed() {
  const items = [];

  for (const k in cart) {
    const line = cart[k];
    const qty = clampQty(line?.qty ?? 0);
    if (qty <= 0) continue;

    const meta = line?.meta || {};
    items.push({
      id: String(line.id),
      qty,
      name: String(meta.name ?? line.id),
      price: normPrice(meta.price ?? 0),
      tag: String(meta.tag ?? ""),
      image: String(meta.image ?? ""),
      category: meta.category ? String(meta.category) : "",
      slug: meta.slug ? String(meta.slug) : "",
      type: meta.type ? String(meta.type) : "",
      variant_size: meta.variant_size ? String(meta.variant_size) : ""
    });
  }

  // optioneel: stabiele sort (zelfde volgorde)
  items.sort((a, b) => String(a.name).localeCompare(String(b.name)));
  return items;
}

/**
 * (Handig voor debug)
 */
export function _getCartRaw() {
  return cart;
}
