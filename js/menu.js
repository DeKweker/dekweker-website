// js/menu.js
import { cartCount } from "./store.js";
import { escapeHtml } from "./utils.js";
import { getRoute } from "./router.js";

let _wired = false;

/* ---------------------------
   Route helpers (single truth)
--------------------------- */
function routeInfo() {
  const route = String(getRoute?.() || "/home");

  // normalize key for nav highlight
  const key =
    route.startsWith("/shop") ? "shop" :
    route === "/music" ? "music" :
    route === "/contact" ? "contact" :
    "home";

  const map = {
    home:   { label: "Home",   hash: "#home" },
    shop:   { label: "Shop",   hash: "#shop" },
    music:  { label: "Music",  hash: "#music" },
    contact:{ label: "Contact",hash: "#contact" },
  };

  return { key, ...map[key] };
}

function shouldShowCart(routeKey, count) {
  // ✅ show cart on any shop route, or when cart has items
  return routeKey === "shop" || count > 0;
}

/* ---------------------------
   DOM helpers
--------------------------- */
function getEls() {
  return {
    drawer: document.querySelector(".mobileDrawer"),
    overlay: document.querySelector(".mobileOverlay"),
    toggleBtn: document.querySelector("[data-menu-toggle]"),
  };
}

function setMenuAria(isOpen) {
  const { toggleBtn, drawer } = getEls();
  if (toggleBtn) toggleBtn.setAttribute("aria-expanded", String(!!isOpen));
  if (drawer) drawer.setAttribute("aria-hidden", String(!isOpen));
}

/* ---------------------------
   Cart badge sync (shared)
--------------------------- */
function syncCartBadgeAndVisibility() {
  const { key } = routeInfo();
  const count = Number(cartCount?.() ?? 0);
  const show = shouldShowCart(key, count);

  document.querySelectorAll("[data-cart-count], #cartCount, .cartCount").forEach((el) => {
    if (el) el.textContent = String(count);
  });

  const cartBtn = document.querySelector("[data-open-cart]");
  if (cartBtn) cartBtn.style.display = show ? "" : "none";
}

/* ---------------------------
   Header HTML
--------------------------- */
function headerHTML() {
  const r = routeInfo();
  const count = Number(cartCount?.() ?? 0);
  const showCart = shouldShowCart(r.key, count);

  return `
    <div class="topbar">
      <div class="brand">
        <a class="brandLink" href="#home" aria-label="De Kweker">De Kweker</a>
      </div>

      <nav class="navLinks" aria-label="Primary navigation">
        <a class="navLink ${r.key === "home" ? "isActive" : ""}" href="#home">Home</a>
        <a class="navLink ${r.key === "shop" ? "isActive" : ""}" href="#shop">Shop</a>
        <a class="navLink ${r.key === "music" ? "isActive" : ""}" href="#music">Music</a>
        <a class="navLink ${r.key === "contact" ? "isActive" : ""}" href="#contact">Contact</a>
      </nav>

      <div class="actions">
        <div class="currentPill">${escapeHtml(r.label)}</div>

        <button
          class="btn btnSecondary cartBtn"
          type="button"
          data-open-cart
          aria-label="Open cart"
          style="display:${showCart ? "inline-flex" : "none"}"
        >
          Cart <span class="cartCount" id="cartCount" data-cart-count>${count}</span>
        </button>

        <button
          class="btn btnQuiet hamburger"
          type="button"
          data-menu-toggle
          aria-label="Open menu"
          aria-expanded="false"
          aria-controls="kwMobileDrawer"
        >
          Menu
        </button>
      </div>
    </div>

    <div class="mobileOverlay" data-menu-close></div>

    <aside class="mobileDrawer" id="kwMobileDrawer" aria-label="Menu" aria-hidden="true">
      <div class="mobileDrawerHead">
        <div class="mobileTitle">Menu</div>
        <button class="btn btnQuiet" type="button" data-menu-toggle aria-label="Sluit menu">Sluit</button>
      </div>

      <div class="mobileDrawerBody">
        <a class="mobileLink ${r.key === "home" ? "isActive" : ""}" href="#home" data-menu-close>Home</a>
        <a class="mobileLink ${r.key === "shop" ? "isActive" : ""}" href="#shop" data-menu-close>Shop</a>
        <a class="mobileLink ${r.key === "music" ? "isActive" : ""}" href="#music" data-menu-close>Music</a>
        <a class="mobileLink ${r.key === "contact" ? "isActive" : ""}" href="#contact" data-menu-close>Contact</a>
        <div class="mobileMeta"><span class="muted">8000</span></div>
      </div>
    </aside>
  `;
}

/* ---------------------------
   Menu open/close
--------------------------- */
function openMenu() {
  const { drawer, overlay } = getEls();
  drawer?.classList.add("open");
  overlay?.classList.add("open");
  document.body.classList.add("no-scroll");
  setMenuAria(true);
}

function closeMenu({ focusToggle = false } = {}) {
  const { drawer, overlay, toggleBtn } = getEls();
  drawer?.classList.remove("open");
  overlay?.classList.remove("open");
  document.body.classList.remove("no-scroll");
  setMenuAria(false);

  // focus only when explicitly requested (prevents weird jumps on link taps)
  if (focusToggle) toggleBtn?.focus?.();
}

function toggleMenu() {
  const { drawer } = getEls();
  if (!drawer) return;
  drawer.classList.contains("open") ? closeMenu({ focusToggle: true }) : openMenu();
}

/* ---------------------------
   Public API
--------------------------- */
export function renderHeader() {
  const host = document.getElementById("site-header");
  if (!host) return;

  host.innerHTML = headerHTML();

  host.onclick = (e) => {
    const t = e.target;

    if (t?.closest?.("[data-open-cart]")) {
      closeMenu(); // ✅ close menu before cart
      window.__OPEN_CART__?.();
      return;
    }

    if (t?.closest?.("[data-menu-toggle]")) {
      toggleMenu();
      return;
    }

    if (t?.closest?.("[data-menu-close]")) {
      closeMenu(); // no focus jump
      return;
    }
  };

  // expose for cart.js / app.js
  window.__CART_BADGE_SYNC__ = syncCartBadgeAndVisibility;
  syncCartBadgeAndVisibility();

  if (!_wired) {
    _wired = true;

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu({ focusToggle: true });
    });

    // if cartCount changes without hashchange (add/remove), your cart.js calls syncCartBadge()
    // but we also keep this helper available globally.
  }
}

export function closeHeaderMenu() {
  closeMenu({ focusToggle: false });
}
