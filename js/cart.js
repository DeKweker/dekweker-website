// js/cart.js
import {
  cartItemsDetailed,
  cartSubtotal,
  cartTotal,
  cartCount,
  setQty,
  clearCart,
  setShipping,
  getShipping,
  shippingCost
} from "./store.js";

import { euro } from "./utils.js";

/* --------------------------------------------------
   STATE
-------------------------------------------------- */

let checkoutOpen = false;

/* --------------------------------------------------
   SHELL
-------------------------------------------------- */

export function renderCartShell() {
  return `
    <div class="overlay" id="cartOverlay"></div>

    <aside class="cart" id="cartDrawer" aria-label="Winkelmandje">
      <div class="cartTop">
        <div class="cartTitle">Kwekermandje</div>
        <button class="closeBtn" id="closeCart" aria-label="Sluiten">✕</button>
      </div>

      <div class="cartBody" id="cartBody"></div>

      <div class="cartBottom">
        <div class="cartTotals">
          <div class="cartRow">
            <span>Subtotaal</span>
            <span id="cartSubtotal"></span>
          </div>

          <div class="cartRow">
            <span>Verzending</span>
            <span id="cartShipping"></span>
          </div>

          <div class="cartRow total">
            <strong>Totaal</strong>
            <strong id="cartTotal"></strong>
          </div>
        </div>

        <button class="btn btnPrimary" id="checkoutBtn">
          Afrekenen
        </button>

        <div id="checkoutWrap" class="checkoutWrap"></div>

        <button class="btn ghost" id="clearCartBtn">
          Mandje leegmaken
        </button>
      </div>
    </aside>
  `;
}

/* --------------------------------------------------
   OPEN / CLOSE
-------------------------------------------------- */

export function openCart() {
  renderCartContents();
  document.body.classList.add("cart-open");
  document.getElementById("cartOverlay")?.classList.add("open");
  document.getElementById("cartDrawer")?.classList.add("open");
}

export function closeCart() {
  checkoutOpen = false;
  document.body.classList.remove("cart-open");
  document.getElementById("cartOverlay")?.classList.remove("open");
  document.getElementById("cartDrawer")?.classList.remove("open");
}

/* --------------------------------------------------
   CONTENT
-------------------------------------------------- */

export function renderCartContents() {
  const body = document.getElementById("cartBody");
  if (!body) return;

  const items = cartItemsDetailed();

  if (!items.length) {
    body.innerHTML = `
      <div class="cartEmpty">
        <strong>Nog leeg.</strong>
        <div>Kies iets in de shop.</div>
      </div>
    `;
    updateTotals();
    renderCheckout(false);
    return;
  }

  body.innerHTML = items.map(renderCartItem).join("");

  updateTotals();
  renderCheckout(checkoutOpen);
}

/* --------------------------------------------------
   ITEM
-------------------------------------------------- */

function renderCartItem(it) {
  return `
    <div class="cartItem" data-id="${it.id}">
      <div class="cartItemMeta">
        <div class="cartItemName">${it.name}</div>
        <div class="cartItemTag">${it.tag || "Item"}</div>
      </div>

      <div class="cartItemControls">
        <button data-dec>−</button>
        <span>${it.qty}</span>
        <button data-inc>+</button>
      </div>

      <div class="cartItemPrice">
        ${euro(it.subtotal)}
      </div>
    </div>
  `;
}

/* --------------------------------------------------
   TOTALS
-------------------------------------------------- */

function updateTotals() {
  document.getElementById("cartSubtotal").textContent =
    euro(cartSubtotal());

  document.getElementById("cartShipping").textContent =
    shippingCost() === 0 ? "Gratis" : euro(shippingCost());

  document.getElementById("cartTotal").textContent =
    euro(cartTotal());
}

/* --------------------------------------------------
   CHECKOUT
-------------------------------------------------- */

function renderCheckout(open) {
  const wrap = document.getElementById("checkoutWrap");
  if (!wrap) return;

  wrap.innerHTML = open ? checkoutHTML() : "";
  wrap.classList.toggle("open", open);

  if (open) bindCheckoutEvents();
}

function checkoutHTML() {
  return `
    <div class="checkoutBox">
      <h4>Levering</h4>

      <label class="radioRow">
        <input type="radio" name="shipping" value="pickup" ${getShipping() === "pickup" ? "checked" : ""}>
        <span>Ophaling (gratis)</span>
      </label>

      <label class="radioRow">
        <input type="radio" name="shipping" value="delivery" ${getShipping() === "delivery" ? "checked" : ""}>
        <span>Verzending (+ €7)</span>
      </label>

      <div class="checkoutNotice">
        Dit is een <strong>pre-order met betaling</strong>.<br/>
        Pas na betaling wordt je exemplaar gereserveerd.
      </div>

      <button class="btn btnPrimary checkoutPay">
        Doorgaan naar betaling
      </button>
    </div>
  `;
}

/* --------------------------------------------------
   EVENTS
-------------------------------------------------- */

export function wireCartEvents() {
  document.getElementById("cartOverlay")?.addEventListener("click", closeCart);
  document.getElementById("closeCart")?.addEventListener("click", closeCart);

  document.getElementById("clearCartBtn")?.addEventListener("click", () => {
    clearCart();
    checkoutOpen = false;
    renderCartContents();
  });

  document.getElementById("checkoutBtn")?.addEventListener("click", () => {
    if (cartCount() === 0) return;
    checkoutOpen = !checkoutOpen;
    renderCheckout(checkoutOpen);
  });

  document.getElementById("cartBody")?.addEventListener("click", (e) => {
    const row = e.target.closest(".cartItem");
    if (!row) return;

    const id = row.dataset.id;
    if (e.target.matches("[data-inc]")) setQty(id, +1);
    if (e.target.matches("[data-dec]")) setQty(id, -1);

    renderCartContents();
  });
}

function bindCheckoutEvents() {
  document.querySelectorAll('input[name="shipping"]').forEach((r) => {
    r.addEventListener("change", (e) => {
      setShipping(e.target.value);
      updateTotals();
    });
  });

  document.querySelector(".checkoutPay")?.addEventListener("click", () => {
    alert("👉 Hier komt later Stripe / Mollie betaling.");
  });
}
