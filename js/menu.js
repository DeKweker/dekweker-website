// js/menu.js
import { cartCount } from "./store.js";
import { escapeHtml } from "./utils.js";

let _wired = false;

function getRouteKeyFromHash() {
  const raw = String(window.location.hash || "#home").replace("#", "").trim();
  const first = raw.split("/").filter(Boolean)[0] || "home";
  return first;
}

function routeInfoFromHash() {
  const key = getRouteKeyFromHash();

  const map = {
    home: { label: "Home", hash: "#home" },
    shop: { label: "Shop", hash: "#shop" },
    music: { label: "Music", hash: "#music" },
    contact: { label: "Contact", hash: "#contact" },
  };

  return map[key] || map.home;
}

function shouldShowCart(routeHash, count) {
  return routeHash === "#shop" || count > 0;
}

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

function syncCartBadgeAndVisibility() {
  const route = routeInfoFromHash();
  const count = Number(cartCount?.() ?? 0);
  const show = shouldShowCart(route.hash, count);

  document.querySelectorAll("[data-cart-count], #cartCount, .cartCount").forEach((el) => {
    if (el) el.textContent = String(count);
  });

  const cartBtn = document.querySelector("[data-open-cart]");
  if (cartBtn) cartBtn.style.display = show ? "" : "none";
}

function headerHTML() {
  const route = routeInfoFromHash();
  const count = Number(cartCount?.() ?? 0);
  const showCart = shouldShowCart(route.hash, count);

  return `
    <div class="topbar">
      <div class="brand">
        <a class="brandLink" href="#home" aria-label="De Kweker">De Kweker</a>
      </div>

      <nav class="navLinks" aria-label="Primary navigation">
        <a class="navLink ${route.hash === "#home" ? "isActive" : ""}" href="#home">Home</a>
        <a class="navLink ${route.hash === "#shop" ? "isActive" : ""}" href="#shop">Shop</a>
        <a class="navLink ${route.hash === "#music" ? "isActive" : ""}" href="#music">Music</a>
        <a class="navLink ${route.hash === "#contact" ? "isActive" : ""}" href="#contact">Contact</a>
      </nav>

      <div class="actions">
        <div class="currentPill">${escapeHtml(route.label)}</div>

        <button class="btn btnSecondary cartBtn" type="button" data-open-cart aria-label="Open cart"
          style="display:${showCart ? "inline-flex" : "none"}">
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
        <a class="mobileLink ${route.hash === "#home" ? "isActive" : ""}" href="#home" data-menu-close>Home</a>
        <a class="mobileLink ${route.hash === "#shop" ? "isActive" : ""}" href="#shop" data-menu-close>Shop</a>
        <a class="mobileLink ${route.hash === "#music" ? "isActive" : ""}" href="#music" data-menu-close>Music</a>
        <a class="mobileLink ${route.hash === "#contact" ? "isActive" : ""}" href="#contact" data-menu-close>Contact</a>
        <div class="mobileMeta"><span class="muted">8000</span></div>
      </div>
    </aside>
  `;
}

function openMenu() {
  const { drawer, overlay } = getEls();
  drawer?.classList.add("open");
  overlay?.classList.add("open");
  document.body.classList.add("no-scroll");
  setMenuAria(true);
}

function closeMenu() {
  const { drawer, overlay, toggleBtn } = getEls();
  drawer?.classList.remove("open");
  overlay?.classList.remove("open");
  document.body.classList.remove("no-scroll");
  setMenuAria(false);

  // ✅ focus terug veilig op toggle, voorkomt aria-hidden warning in sommige gevallen
  toggleBtn?.focus?.();
}

function toggleMenu() {
  const { drawer } = getEls();
  if (!drawer) return;
  drawer.classList.contains("open") ? closeMenu() : openMenu();
}

export function renderHeader() {
  const host = document.getElementById("site-header");
  if (!host) return;

  host.innerHTML = headerHTML();

  host.onclick = (e) => {
    const t = e.target;

    if (t?.closest?.("[data-open-cart]")) {
      // ✅ sluit menu altijd vóór je de cart opent (scroll issues weg)
      closeMenu();
      window.__OPEN_CART__?.();
      return;
    }
    if (t?.closest?.("[data-menu-toggle]")) {
      toggleMenu();
      return;
    }
    if (t?.closest?.("[data-menu-close]")) {
      closeMenu();
      return;
    }
  };

  window.__CART_BADGE_SYNC__ = syncCartBadgeAndVisibility;
  syncCartBadgeAndVisibility();

  if (!_wired) {
    _wired = true;
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeMenu();
        // cart sluit je via cart.js listener
      }
    });
  }
}

export function closeHeaderMenu() {
  closeMenu();
}
