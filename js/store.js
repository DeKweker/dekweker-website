// js/store.js
const LS_KEY = "dekweker_cart_v1";

let _state = {
  cart: {} // { [key]: { id, qty, meta } }
};

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.cart && typeof parsed.cart === "object") {
      _state.cart = parsed.cart;
    }
  } catch (_) {}
}

function save() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ cart: _state.cart }));
  } catch (_) {}
}

function syncBadgeSafe() {
  try {
    window.__CART_BADGE_SYNC__?.();
  } catch (_) {}
}

load();

/* ---------------------------
   Public API
--------------------------- */
export function getState() {
  return { cart: _state.cart };
}

export function addToCart(id, meta = {}, qty = 1) {
  const pid = String(id || "").trim();
  if (!pid) return;

  const n = Math.max(1, Math.round(Number(qty) || 1));

  // cart key: later uitbreidbaar voor varianten (maat, kleur, ...)
  // const key = meta?.variant_size ? `${pid}::size:${meta.variant_size}` : pid;
  const key = pid;

  const existing = _state.cart[key];
  const nextQty = (existing?.qty || 0) + n;

  _state.cart[key] = {
    id: pid,
    qty: nextQty,
    meta: sanitizeMeta(meta)
  };

  save();
  syncBadgeSafe();

  // Toast: productnaam tonen
  const name = _state.cart[key]?.meta?.name || "Toegevoegd";
  safeToast("In mandje", name);
}

export function setQty(id, qty) {
  const key = String(id || "").trim();
  if (!key) return;

  const n = Math.round(Number(qty) || 0);

  if (n <= 0) {
    delete _state.cart[key];
    save();
    syncBadgeSafe();
    return;
  }

  if (!_state.cart[key]) {
    _state.cart[key] = { id: key, qty: n, meta: {} };
  } else {
    _state.cart[key].qty = n;
  }

  save();
  syncBadgeSafe();
}

export function clearCart() {
  _state.cart = {};
  save();
  syncBadgeSafe();
}

export function cartCount() {
  return Object.values(_state.cart).reduce((sum, it) => sum + (Number(it?.qty) || 0), 0);
}

export function cartItemsDetailed() {
  // shape die cart.js verwacht: {key,id,qty,name,price,tag,image,...}
  return Object.entries(_state.cart).map(([key, it]) => {
    const meta = it?.meta || {};
    return {
      key,
      id: String(it?.id || key),
      qty: Number(it?.qty || 0),
      name: String(meta.name || "Item"),
      price: Number(meta.price || 0),
      tag: String(meta.tag || ""),
      image: String(meta.image || ""),
      category: String(meta.category || ""),
      slug: String(meta.slug || ""),
      type: String(meta.type || ""),
      variant_size: meta.variant_size ? String(meta.variant_size) : ""
    };
  });
}

export function cartTotal() {
  return cartItemsDetailed().reduce(
    (sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 0),
    0
  );
}

/* ---------------------------
   Helpers
--------------------------- */
function sanitizeMeta(m) {
  const meta = m && typeof m === "object" ? m : {};

  // ✅ accepteer zowel name als title (shop.js gebruikt title)
  const name = meta.name ?? meta.title ?? "";

  return {
    name: name ? String(name) : "",
    price: Number(meta.price || 0),
    tag: meta.tag ? String(meta.tag) : "",
    image: meta.image ? String(meta.image) : "",
    category: meta.category ? String(meta.category) : "",
    slug: meta.slug ? String(meta.slug) : "",
    type: meta.type ? String(meta.type) : "",
    variant_size: meta.variant_size ? String(meta.variant_size) : ""
  };
}

function safeToast(title, msg) {
  try {
    window.__TOAST__?.({ title, msg, ms: 1800 });
  } catch (_) {}
}
