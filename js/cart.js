// js/cart.js
import { cartItemsDetailed, cartTotal, cartCount, setQty, clearCart } from "./store.js";
import { euro, escapeHtml } from "./utils.js";

let isOpen = false;

/**
 * Render: drawer + overlay (shell)
 */
export function renderCartShell() {
  return `
    <div class="overlay" id="cartOverlay" aria-hidden="true"></div>

    <aside class="cart" id="cartDrawer" role="dialog" aria-modal="true" aria-label="Kwekermandje">
      <div class="cartTop">
        <div class="cartTitle">Kwekermandje</div>
        <button class="closeBtn" id="closeCart" type="button" aria-label="Sluiten">✕</button>
      </div>

      <div class="cartBody" id="cartBody"></div>

      <div class="cartBottom">
        <div class="cartRow">
          <span class="cartRowLabel">Totaal</span>
          <strong id="cartTotal">${euro(cartTotal())}</strong>
        </div>

        <button class="btn btnPrimary" id="checkoutBtn" type="button">
          Afrekenen
        </button>

        <div class="cartFine">
          <div class="fineLine"><span class="fineDot"></span><span>Verzending of ophaling kies je in checkout.</span></div>
          <div class="fineLine"><span class="fineDot"></span><span>Limited vinyl: genummerd. Persing start pas na genoeg betaalde orders.</span></div>
        </div>

        <button class="btn" id="clearCartBtn" type="button">Mandje leegmaken</button>
      </div>
    </aside>
  `;
}

/**
 * Open / close
 */
export function openCart() {
  isOpen = true;
  renderCartContents();
  syncCartBadge();

  document.body.classList.add("cart-open");
  document.getElementById("cartOverlay")?.classList.add("open");
  document.getElementById("cartDrawer")?.classList.add("open");
  document.getElementById("cartOverlay")?.setAttribute("aria-hidden", "false");
}

export function closeCart() {
  isOpen = false;
  document.body.classList.remove("cart-open");
  document.getElementById("cartOverlay")?.classList.remove("open");
  document.getElementById("cartDrawer")?.classList.remove("open");
  document.getElementById("cartOverlay")?.setAttribute("aria-hidden", "true");
}

/**
 * Contents render
 */
export function renderCartContents() {
  const body = document.getElementById("cartBody");
  if (!body) return;

  const items = cartItemsDetailed();

  if (!items.length) {
    body.innerHTML = `
      <div class="cartEmpty">
        <div class="cartEmptyTitle">Nog leeg.</div>
        <div class="cartEmptySub">Kies iets in de shop en kom terug.</div>
      </div>
    `;
    updateCartTotals();
    syncCartBadge();
    return;
  }

  body.innerHTML = items
    .map(
      (it) => `
      <div class="cartItem" data-id="${escapeHtml(String(it.id))}">
        <div class="cartThumb">
          <div class="cartThumbGlow"></div>
          <div class="cartThumbText">8000</div>
        </div>

        <div class="cartMeta">
          <div class="cartTopRow">
            <div>
              <div class="cartName">${escapeHtml(it.name)}</div>
              <div class="cartSub">${escapeHtml(it.tag || "Drop")}</div>
            </div>
            <div class="cartPrice">${euro(it.price)}</div>
          </div>

          <div class="qtyRow">
            <button class="qtyBtn" data-action="dec" data-id="${escapeHtml(String(it.id))}" type="button" aria-label="Minder">
              <span class="qtyGlyph">−</span>
            </button>

            <div class="qtyNum" data-qty="${it.qty}">${it.qty}</div>

            <button class="qtyBtn" data-action="inc" data-id="${escapeHtml(String(it.id))}" type="button" aria-label="Meer">
              <span class="qtyGlyph">+</span>
            </button>
          </div>
        </div>
      </div>
    `
    )
    .join("");

  updateCartTotals();
  syncCartBadge();
}

function updateCartTotals() {
  const totalEl = document.getElementById("cartTotal");
  if (totalEl) totalEl.textContent = euro(cartTotal());
}

/**
 * Badge sync
 * - update counts
 * - ALSO trigger header visibility logic (menu.js) via window.__CART_BADGE_SYNC__
 */
export function syncCartBadge() {
  const n = cartCount();

  const idEl = document.getElementById("cartCount");
  if (idEl) idEl.textContent = String(n);

  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = String(n);
  });

  document.querySelectorAll(".cartCount").forEach((el) => {
    el.textContent = String(n);
  });

  // 🔥 this updates the header cart button show/hide + count everywhere
  if (typeof window.__CART_BADGE_SYNC__ === "function") {
    window.__CART_BADGE_SYNC__();
  }
}

/**
 * Events (1x binden)
 */
export function wireCartEvents() {
  const overlay = document.getElementById("cartOverlay");
  const closeBtn = document.getElementById("closeCart");
  const body = document.getElementById("cartBody");

  overlay?.addEventListener("click", closeCart);
  closeBtn?.addEventListener("click", closeCart);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCart();
  });

  document.getElementById("clearCartBtn")?.addEventListener("click", () => {
    clearCart();
    renderCartContents();
    syncCartBadge();
  });

  // Qty buttons via delegation
  body?.addEventListener("click", (e) => {
    const btn = e.target?.closest?.("button[data-action][data-id]");
    if (!btn) return;

    const id = btn.getAttribute("data-id");
    const action = btn.getAttribute("data-action"); // inc/dec
    if (!id || !action) return;

    const current = getQtyFromStore(id);
    const next = action === "inc" ? current + 1 : current - 1;

    setQty(id, next);
    renderCartContents();
    syncCartBadge();
  });

  // Checkout
  document.getElementById("checkoutBtn")?.addEventListener("click", async () => {
    const items = cartItemsDetailed();
    if (!items.length) {
      toast("Leeg mandje", "Kies eerst iets in de shop.");
      return;
    }

    try {
      const r = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: items.map((it) => ({
            id: it.id,
            name: it.name,
            price: it.price,
            qty: it.qty
          }))
        })
      });

      const data = await r.json().catch(() => ({}));

      if (!r.ok) {
        if (data?.error === "sold_out") {
          toast("Uitverkocht", data?.message || "Deze drop is uitverkocht.");
          return;
        }
        toast("Fout", data?.message || "Checkout lukt niet. Probeer opnieuw.");
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      toast("Fout", "Geen checkout URL ontvangen.");
    } catch (e) {
      toast("Fout", "Netwerkprobleem. Probeer opnieuw.");
    }
  });
}

function getQtyFromStore(id) {
  const items = cartItemsDetailed();
  const found = items.find((x) => String(x.id) === String(id));
  return found ? Number(found.qty || 0) : 0;
}

function toast(title, msg) {
  try {
    window.__TOAST__?.({ title, msg, ms: 2200 });
  } catch (_) {}
}
