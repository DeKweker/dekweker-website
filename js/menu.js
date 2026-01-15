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
  // toon cart knop op shop altijd, of als er items zijn
  return routeHash === "#shop" || count > 0;
}

function syncCartBadgeAndVisibility() {
  const route = routeInfoFromHash();
  const count = Number(cartCount?.() ?? 0);
  const show = shouldShowCart(route.hash, count);

  // badge teksten updaten
  document.querySelectorAll("[data-cart-count], #cartCount, .cartCount").forEach((el) => {
    if (el) el.textContent = String(count);
  });

  // cart knop tonen/verbergen
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
        <div class="pill currentPill">${escapeHtml(route.label)}</div>

        <button class="btn ghost cartBtn" type="button" data-open-cart aria-label="Open cart"
          style="display:${showCart ? "inline-flex" : "none"}">
          Cart <span class="cartCount" id="cartCount" data-cart-count>${count}</span>
        </button>

        <button class="btn ghost hamburger" type="button" data-menu-toggle aria-label="Open menu">
          Menu
        </button>
      </div>
    </div>

    <div class="mobileOverlay" data-menu-close></div>
    <aside class="mobileDrawer" aria-label="Menu">
      <div class="mobileDrawerHead">
        <div class="mobileTitle">Menu</div>
        <button class="btn ghost" type="button" data-menu-toggle aria-label="Sluit menu">Sluit</button>
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
  document.querySelector(".mobileDrawer")?.classList.add("open");
  document.querySelector(".mobileOverlay")?.classList.add("open");
  document.body.classList.add("no-scroll");
}

function closeMenu() {
  document.querySelector(".mobileDrawer")?.classList.remove("open");
  document.querySelector(".mobileOverlay")?.classList.remove("open");
  document.body.classList.remove("no-scroll");
}

function toggleMenu() {
  const drawer = document.querySelector(".mobileDrawer");
  if (!drawer) return;
  drawer.classList.contains("open") ? closeMenu() : openMenu();
}

export function renderHeader() {
  const host = document.getElementById("site-header");
  if (!host) return;

  host.innerHTML = headerHTML();

  // 1 delegated handler (geen losse listeners per knop)
  host.onclick = (e) => {
    const t = e.target;

    if (t?.closest?.("[data-open-cart]")) {
      if (typeof window.__OPEN_CART__ === "function") window.__OPEN_CART__();
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

  // escape sluit menu
  host.onkeydown = (e) => {
    if (e.key === "Escape") closeMenu();
  };

  // expose sync hook (store/cart gebruikt dit)
  window.__CART_BADGE_SYNC__ = syncCartBadgeAndVisibility;

  // direct sync
  syncCartBadgeAndVisibility();

  // bind global once
  if (!_wired) {
    _wired = true;
    window.addEventListener("hashchange", () => {
      closeMenu();
      // app.js rendert ook header op route change, maar dit is veilig:
      // re-render header zodat active state klopt
      renderHeader();
      syncCartBadgeAndVisibility();
    });
  }
}
