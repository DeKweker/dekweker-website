// js/store.js
const LS_KEY = "kwkr_cart_v1";

// cart lines: { id: string, qty: number, meta?: { name, price, tag, image, ... } }
let cart = loadCart();

function loadCart() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((x) => ({
        id: String(x.id),
        qty: clampInt(x.qty, 0, 999),
        meta: x.meta && typeof x.meta === "object" ? x.meta : undefined
      }))
      .filter((x) => x.id && x.qty > 0);
  } catch {
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(cart));
  } catch {
    // ignore
  }
}

function clampInt(n, min, max) {
  const v = Number(n);
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, Math.round(v)));
}

function findLine(id) {
  const sid = String(id);
  return cart.find((x) => x.id === sid);
}

function normalizeMeta(meta) {
  if (!meta || typeof meta !== "object") return undefined;
  const safe = {};
  if (meta.name != null) safe.name = String(meta.name);
  if (meta.tag != null) safe.tag = String(meta.tag);
  if (meta.image != null) safe.image = String(meta.image);
  if (meta.price != null) safe.price = Number(meta.price) || 0;
  if (meta.desc != null) safe.desc = String(meta.desc);
  if (meta.category != null) safe.category = String(meta.category);
  if (meta.slug != null) safe.slug = String(meta.slug);
  return safe;
}

/* ---------------------------
   Public API (sync)
--------------------------- */
export function addToCart(id, meta = undefined, qty = 1) {
  const sid = String(id);
  const q = clampInt(qty, 1, 999);

  const line = findLine(sid);
  if (line) {
    line.qty = clampInt(line.qty + q, 0, 999);
    const m = normalizeMeta(meta);
    if (m) line.meta = { ...(line.meta || {}), ...m };
  } else {
    cart.push({ id: sid, qty: q, meta: normalizeMeta(meta) });
  }

  cart = cart.filter((x) => x.qty > 0);
  saveCart();

  // ✅ UI sync meteen (geen refresh nodig)
  try { window.__CART_BADGE_SYNC__?.(); } catch (_) {}

  // ✅ Toast “In mandje” terug
  try {
    window.__TOAST__?.({
      title: "In mandje",
      msg: "Toegevoegd aan je winkelmandje.",
      ms: 1800
    });
  } catch (_) {}
}


export function setQty(id, qty) {
  const sid = String(id);
  const q = clampInt(qty, 0, 999);

  const line = findLine(sid);
  if (!line) {
    if (q <= 0) return;
    cart.push({ id: sid, qty: q });
  } else {
    line.qty = q;
  }

  cart = cart.filter((x) => x.qty > 0);
  saveCart();
}

export function removeFromCart(id) {
  const sid = String(id);
  cart = cart.filter((x) => x.id !== sid);
  saveCart();
}

export function clearCart() {
  cart = [];
  saveCart();
}

export function cartCount() {
  return cart.reduce((sum, x) => sum + (Number(x.qty) || 0), 0);
}

export function cartTotal() {
  return cart.reduce((sum, x) => {
    const price = x.meta && typeof x.meta.price === "number" ? x.meta.price : 0;
    return sum + price * (Number(x.qty) || 0);
  }, 0);
}

export function cartItemsDetailed() {
  return cart.map((x) => {
    const meta = x.meta || {};
    return {
      id: x.id,
      qty: x.qty,
      name: meta.name || x.id,
      price: typeof meta.price === "number" ? meta.price : 0,
      tag: meta.tag || "",
      image: meta.image || ""
    };
  });
}

/* ---------------------------
   Public API (compat async)
   - jouw cart.js importeert async namen
--------------------------- */

export async function cartItemsDetailedAsync() {
  return cartItemsDetailed();
}

export async function cartTotalAsync() {
  return cartTotal();
}

export async function cartCountAsync() {
  return cartCount();
}

/* ---------------------------
   Debug / shop compat
--------------------------- */
export function getState() {
  return {
    cart: cart.map((x) => ({ ...x })),
    count: cartCount(),
    total: cartTotal()
  };
}
