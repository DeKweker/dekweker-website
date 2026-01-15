// js/app.js
import { renderHeader } from "./menu.js";
import { getRoute } from "./router.js";

import {
  mountShopShell,
  renderShopHome,
  renderShopCategory,
  renderProductDetail,
  getShopPathParts
} from "./shop.js";

import {
  renderCartShell,
  wireCartEvents,
  openCart,
  closeCart,
  syncCartBadge
} from "./cart.js";

import { cartCount } from "./store.js";

/* --------------------------------------------------
   UI ROOT (cart / overlays)
-------------------------------------------------- */

let uiMounted = false;

function mountUIRoot() {
  const root = document.getElementById("ui-root");
  if (!root || uiMounted) return;

  root.innerHTML = renderCartShell();
  wireCartEvents();

  // expose for menu
  window.__OPEN_CART__ = openCart;
  window.__CLOSE_CART__ = closeCart;

  uiMounted = true;
}

/* --------------------------------------------------
   ROUTE NORMALIZATION
-------------------------------------------------- */

function normalizeRoute(r) {
  const raw = String(r || "").replace("#", "").trim();
  return raw || "home";
}

/* --------------------------------------------------
   PAGES
-------------------------------------------------- */

function renderHome(app) {
  app.innerHTML = `
    <section class="panel heroChalet">
      <div>
        <div class="kickerWarm"><span class="dotWarm"></span> De Kweker • Brugge 8000</div>
        <h1 class="heroTitle">Tunnelvisie.</h1>
        <p class="lead">
          Geen façade. Geen omweg. Wat gezegd wordt, blijft staan.
        </p>

        <div class="ctaRow">
          <a class="btn btnPrimary" href="#shop">Shop</a>
          <a class="btn" href="#music">Music</a>
          <a class="btn" href="#contact">Contact</a>
        </div>
      </div>

      <aside class="heroAside">
        <div class="cardMini">
          <h3>Beperkt gehouden</h3>
          <p>Kleine oplages. Geen overschot, geen ruis.</p>
        </div>
        <div class="cardMini">
          <h3>Brugge als grond</h3>
          <p>Niet als merk. Gewoon als feit.</p>
        </div>
        <div class="cardMini">
          <h3>Gemaakt om te blijven</h3>
          <p>Muziek, kleding en dragers met gewicht.</p>
        </div>
      </aside>
    </section>
  `;
}

function renderMusic(app) {
  app.innerHTML = `
    <section class="panel panelWide">
      <h1>Music</h1>
      <p>Releases, context en waar het gemaakt wordt.</p>

      <div class="musicGrid">
        <div class="musicCard">
          <h3>Spotify</h3>
          <p class="mutedSmall">Alles op één plek.</p>
        </div>

        <div class="musicCard">
          <h3>Context</h3>
          <p class="mutedSmall">
            Rugged & Raw • Kwartier West • NUMB
          </p>
        </div>
      </div>
    </section>
  `;
}

function renderContact(app) {
  app.innerHTML = `
    <section class="panel panelWide contactPage">
      <h1>Contact</h1>
      <p>Bookings of iets dat klopt.</p>

      <div class="contactGrid">
        <div class="contactCard">
          <h3>Mail</h3>
          <a class="contactMail" href="mailto:info@kwkr.be">
            info@kwkr.be
          </a>
        </div>

        <div class="contactCard">
          <h3>Socials</h3>
          <ul class="socialList">
            <li><a href="https://instagram.com/dekweker_" target="_blank">Instagram</a></li>
            <li><a href="https://youtube.com/@De.kweker" target="_blank">YouTube</a></li>
            <li><a href="https://open.spotify.com/artist/2v5Tuugqs8s4vaONc286EG" target="_blank">Spotify</a></li>
          </ul>
        </div>
      </div>
    </section>
  `;
}

/* --------------------------------------------------
   ROUTER
-------------------------------------------------- */

function renderPage() {
  mountUIRoot();
  renderHeader();

  const app = document.getElementById("app");
  if (!app) return;

  const route = normalizeRoute(getRoute());

  // SHOP routes
  if (route.startsWith("shop")) {
    mountShopShell(app);

    const { category, slug } = getShopPathParts();
    if (!category) return renderShopHome();
    if (category && !slug) return renderShopCategory(category);
    if (category && slug) return renderProductDetail(category, slug);
    return;
  }

  // STATIC pages
  if (route === "home") return renderHome(app);
  if (route === "music") return renderMusic(app);
  if (route === "contact") return renderContact(app);

  // fallback
  renderHome(app);
}

/* --------------------------------------------------
   BOOT
-------------------------------------------------- */

window.addEventListener("hashchange", renderPage);

window.addEventListener("DOMContentLoaded", () => {
  mountUIRoot();
  renderPage();

  // badge safety on refresh
  if (cartCount() > 0) syncCartBadge();
});
