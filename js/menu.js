// ./js/menu.js
import { cartCount } from "./store.js";

let _wired = false;

function routeInfoFromHash() {
  const raw = (window.location.hash || "#home").replace("#", "").trim();
  const key = raw === "" ? "home" : raw;

  const map = {
    home: { label: "Home", hash: "#home" },
    shop: { label: "Shop", hash: "#shop" },
    music: { label: "Music", hash: "#music" },
    contact: { label: "Contact", hash: "#contact" },
  };

  return map[key] || map.home;
}

function esc(s = "") {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function shouldShowCart(routeHash, count) {
  return routeHash === "#shop" || count > 0;
}

function syncCartBadgeAndVisibility() {
  const route = routeInfoFromHash();
  const count = Number(cartCount?.() ?? 0);
  const show = shouldShowCart(route.hash, count);

  document.querySelectorAll("[data-cart-count], #cartCount, .cartCount").forEach((n) => {
    if (n) n.textContent = String(count);
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
        <a class="navLink ${route.hash==="#home" ? "isActive" : ""}" href="#home">Home</a>
        <a class="navLink ${route.hash==="#shop" ? "isActive" : ""}" href="#shop">Shop</a>
        <a class="navLink ${route.hash==="#music" ? "isActive" : ""}" href="#music">Music</a>
        <a class="navLink ${route.hash==="#contact" ? "isActive" : ""}" href="#contact">Contact</a>
      </nav>

      <div class="actions">
        <div class="pill currentPill">${esc(route.label)}</div>

        <button class="btn ghost cartBtn" type="button" data-open-cart aria-label="Open cart"
          style="display:${showCart ? "inline-flex" : "none"}">
          Cart <span class="cartCount" id="cartCount" data-cart-count>${count}</span>
        </button>

        <!-- Menu knop blijft bestaan voor mobile (maar desktop verbergt hem via CSS) -->
        <button class="btn ghost hamburger" type="button" data-menu-toggle aria-label="Open menu">
          Menu
        </button>
      </div>
    </div>

    <!-- Mobile drawer markup (wordt op desktop weggedrukt via CSS) -->
    <div class="mobileOverlay" data-menu-close></div>
    <aside class="mobileDrawer" aria-label="Menu">
      <div class="mobileDrawerHead">
        <div class="mobileTitle">Menu</div>
        <button class="btn ghost" type="button" data-menu-toggle aria-label="Sluit menu">Sluit</button>
      </div>

      <div class="mobileDrawerBody">
        <a class="mobileLink ${route.hash==="#home" ? "isActive" : ""}" href="#home" data-menu-close>Home</a>
        <a class="mobileLink ${route.hash==="#shop" ? "isActive" : ""}" href="#shop" data-menu-close>Shop</a>
        <a class="mobileLink ${route.hash==="#music" ? "isActive" : ""}" href="#music" data-menu-close>Music</a>
        <a class="mobileLink ${route.hash==="#contact" ? "isActive" : ""}" href="#contact" data-menu-close>Contact</a>
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

  host.onkeydown = (e) => {
    if (e.key === "Escape") closeMenu();
  };

  window.__CART_BADGE_SYNC__ = syncCartBadgeAndVisibility;

  syncCartBadgeAndVisibility();

  if (!_wired) {
    _wired = true;
    window.addEventListener("hashchange", () => {
      closeMenu();
      renderHeader();
      syncCartBadgeAndVisibility();
    });
  }
}
