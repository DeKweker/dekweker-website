// js/shop.js
import { addToCart } from "./store.js";
import { euro } from "./utils.js";

let _products = null;

function normalizeProduct(p = {}) {
  const images = p.images || {};
  const front = images.front || p.image || "";
  const back = images.back || p.imageBack || p.back || "";

  return {
    id: String(p.id || ""),
    category: String(p.category || "").toLowerCase(),
    slug: String(p.slug || ""),
    title: String(p.name || p.title || "Item"),
    subtitle: String(p.desc || p.subtitle || ""),
    description: String(p.desc || p.description || ""),
    price: Number(p.price || 0),
    tag: String(p.tag || "Drop"),
    type: String(p.type || ""),
    image: String(front || ""),
    imageBack: String(back || ""),
    shipping: p.shipping || null,
    limited: p.limited || null,
    variants: p.variants || null
  };
}

async function loadProducts() {
  if (_products) return _products;

  const res = await fetch("./data/products.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Kan products.json niet laden.");

  const data = await res.json();
  const arr = Array.isArray(data) ? data : (data.products || []);
  _products = arr.map(normalizeProduct);
  return _products;
}

export function getShopPathParts() {
  const raw = (window.location.hash || "#shop").replace("#", "").trim();
  const path = raw.startsWith("shop") ? raw.slice(4) : "";
  const clean = path.replace(/^\/+/, "");
  if (!clean) return { category: null, slug: null };

  const parts = clean.split("/").filter(Boolean);
  return {
    category: parts[0] || null,
    slug: parts[1] || null
  };
}

export function mountShopShell(app) {
  app.innerHTML = `
    <section class="panel panelWide">
      <div class="shopPageHead">
        <h1>Shop</h1>
        <p class="mutedSmall">Vinyl, CD, digitaal en merch — klein gehouden, proper gekozen.</p>
      </div>

      <nav class="shopNav" aria-label="Shop categories">
        <a class="shopNavLink" href="#shop/vinyl" data-cat="vinyl">Vinyl</a>
        <a class="shopNavLink" href="#shop/cd" data-cat="cd">CD</a>
        <a class="shopNavLink" href="#shop/digitaal" data-cat="digitaal">Digitaal</a>
        <a class="shopNavLink" href="#shop/merch" data-cat="merch">Merch</a>
      </nav>

      <div id="shopMount"></div>
    </section>
  `;

  app.querySelectorAll(".shopNavLink").forEach(a => {
    a.addEventListener("click", () => {
      setActiveShopNav(a.dataset.cat || null);
    });
  });
}

function setActiveShopNav(cat) {
  document.querySelectorAll(".shopNavLink").forEach(a => {
    const is = (a.dataset.cat || "") === (cat || "");
    a.classList.toggle("active", is);
  });
}

function categoryCard(cat, desc) {
  const map = {
    vinyl: { title: "Vinyl", desc },
    cd: { title: "CD", desc },
    digitaal: { title: "Digitaal", desc },
    merch: { title: "Merch", desc }
  };
  const item = map[cat] || { title: cat, desc: desc || "" };

  return `
    <a class="shopCategoryCard" href="#shop/${cat}">
      <div>
        <div class="shopCategoryTitle">${esc(item.title)}</div>
        <div class="shopCategorySub">${esc(item.desc)}</div>
      </div>
      <div class="shopHint mutedSmall" style="margin-top:10px;">Bekijk →</div>
    </a>
  `;
}

export async function renderShopHome() {
  const mount = document.getElementById("shopMount");
  if (!mount) return;

  await loadProducts();

  mount.innerHTML = `
    <div class="mutedSmall" style="margin:0 0 12px;">
      Kies een categorie. Vinyl &amp; CD staan bovenaan.
    </div>

    <div class="shopCategoryGrid">
      ${categoryCard("vinyl", "Limited pressings. Genummerd waar het hoort.")}
      ${categoryCard("cd", "Compact, proper, klaar om te draaien.")}
      ${categoryCard("digitaal", "Na betaling meteen binnen.")}
      ${categoryCard("merch", "Stukken om te dragen — niet om te showen.")}
    </div>

    <div class="shopHint mutedSmall" style="margin-top:14px;">
      Klik een categorie en pak het van daar.
    </div>
  `;

  setActiveShopNav(null);
}

/* ---------------------------
   BULLETPROOF media helpers
--------------------------- */
function mediaBoxStyle({ radius = 16, aspect = "1 / 1" } = {}) {
  // Inline styles on purpose: protects against missing/overwritten CSS
  return [
    `position:relative`,
    `aspect-ratio:${aspect}`,
    `width:100%`,
    `border-radius:${radius}px`,
    `overflow:hidden`,
    `background:rgba(255,255,255,.04)`,
    `border:1px solid rgba(255,255,255,.08)`
  ].join(";");
}

function mediaImgStyle() {
  return [
    `position:absolute`,
    `inset:0`,
    `width:100%`,
    `height:100%`,
    `object-fit:cover`,
    `display:block`
  ].join(";");
}

function productCard(p) {
  const front = p.image || "";
  const back = p.imageBack || "";
  const hasBack = Boolean(back);

  return `
    <article class="panel" style="padding:14px;">
      <a class="prodMediaLink" href="#shop/${esc(p.category)}/${esc(p.slug)}">
        <div class="prodMedia ${hasBack ? "" : "noBack"}" style="${mediaBoxStyle({ radius: 16, aspect: "1 / 1" })}">
          ${
            front
              ? `<img class="prodImg prodImgFront" src="${front}" alt="${esc(p.title)}" loading="lazy" decoding="async" style="${mediaImgStyle()}">`
              : ""
          }
          ${
            hasBack
              ? `<img class="prodImg prodImgBack" src="${back}" alt="${esc(p.title)} (back)" loading="lazy" decoding="async" style="${mediaImgStyle()};opacity:0;">`
              : ""
          }
          ${!front ? `<div class="prodMediaFallback">Geen image</div>` : ""}
        </div>
      </a>

      <a class="prodTitleLink" href="#shop/${esc(p.category)}/${esc(p.slug)}" style="text-decoration:none;color:inherit;">
        <div class="prodTitle" style="font-weight:950;letter-spacing:-.3px;">${esc(p.title)}</div>
      </a>

      <div class="mutedSmall" style="margin-top:6px;">${esc(p.subtitle || "")}</div>

      <div class="productBuyRow" style="margin-top:10px;">
        <div class="productPrice">${euro(p.price)}</div>
        <button class="btn btnPrimary" data-add="${esc(p.id)}" type="button">In mandje</button>
      </div>
    </article>
  `;
}

export async function renderShopCategory(category) {
  const mount = document.getElementById("shopMount");
  if (!mount) return;

  const products = await loadProducts();
  const cat = String(category || "").toLowerCase();

  setActiveShopNav(cat);

  const items = products.filter(p => p.category === cat);

  mount.innerHTML = `
    <div class="shopBreadcrumb">
      <a href="#shop">Shop</a> <span class="sep">/</span>
      <span class="current">${esc(cap(cat))}</span>
    </div>

    ${
      items.length === 0
        ? `
      <div class="panel" style="padding:14px;">
        <div style="font-weight:950;letter-spacing:-.2px;">Nog geen items hier.</div>
        <div class="mutedSmall" style="margin-top:6px;">Kom straks terug. Eerst komt vinyl &amp; CD.</div>
      </div>
    `
        : `
      <div class="shopGrid">
        ${items.map(productCard).join("")}
      </div>
    `
    }
  `;

  // Flip back image on hover/focus, but keep it safe even if CSS got reset.
  // (Only touches inside this mount, no global side-effects.)
  mount.querySelectorAll(".prodMedia").forEach(media => {
    const frontImg = media.querySelector(".prodImgFront");
    const backImg = media.querySelector(".prodImgBack");
    if (!frontImg || !backImg) return;

    const showBack = () => { backImg.style.opacity = "1"; frontImg.style.opacity = "0"; };
    const showFront = () => { backImg.style.opacity = "0"; frontImg.style.opacity = "1"; };

    // Default
    showFront();

    media.addEventListener("mouseenter", showBack);
    media.addEventListener("mouseleave", showFront);
    media.addEventListener("focusin", showBack);
    media.addEventListener("focusout", showFront);
  });

  mount.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-add");
      const p = products.find(x => String(x.id) === String(id));
      if (!p) return;

      addToCart(
        p.id,
        {
          name: p.title,
          price: p.price,
          tag: p.tag,
          image: p.image,
          category: p.category,
          slug: p.slug,
          type: p.type
        },
        1
      );

      window.__CART_BADGE_SYNC__?.();
      window.__TOAST__?.({ title: "In mandje", msg: p.title, ms: 1600 });
    });
  });
}

export async function renderProductDetail(category, slug) {
  const mount = document.getElementById("shopMount");
  if (!mount) return;

  const products = await loadProducts();
  const cat = String(category || "").toLowerCase();
  const s = String(slug || "").toLowerCase();

  setActiveShopNav(cat);

  const p = products.find(x => x.category === cat && String(x.slug).toLowerCase() === s);

  if (!p) {
    mount.innerHTML = `
      <div class="panel" style="padding:14px;">
        <div style="font-weight:950;">Niet gevonden.</div>
        <div class="mutedSmall" style="margin-top:6px;">
          Terug naar <a href="#shop/${esc(cat)}">categorie</a>.
        </div>
      </div>
    `;
    return;
  }

  const front = p.image || "";
  const back = p.imageBack || "";
  const hasBack = Boolean(back);

  mount.innerHTML = `
    <div class="shopBreadcrumb">
      <a href="#shop">Shop</a> <span class="sep">/</span>
      <a href="#shop/${esc(cat)}">${esc(cap(cat))}</a> <span class="sep">/</span>
      <span class="current">${esc(p.title)}</span>
    </div>

    <div class="productDetail">
      <div>
        <div class="productMedia prodMedia ${hasBack ? "" : "noBack"}" style="${mediaBoxStyle({ radius: 16, aspect: "1 / 1" })};max-width:520px;margin:0 auto;">
          ${
            front
              ? `<img class="prodImg prodImgFront" src="${front}" alt="${esc(p.title)}" loading="lazy" decoding="async" style="${mediaImgStyle()}">`
              : ""
          }
          ${
            hasBack
              ? `<img class="prodImg prodImgBack" src="${back}" alt="${esc(p.title)} (back)" loading="lazy" decoding="async" style="${mediaImgStyle()};opacity:0;">`
              : ""
          }
          ${!front ? `<div class="productMediaFallback">Geen image</div>` : ""}
        </div>
      </div>

      <div class="panel" style="padding:16px;">
        <div class="productTitle">${esc(p.title)}</div>
        <div class="mutedSmall">${esc(p.subtitle || "")}</div>

        <div class="productDesc">${esc(p.description || "")}</div>

        <div class="productBuyRow">
          <div class="productPrice">${euro(p.price)}</div>
          <button class="btn btnPrimary" id="buyBtn" type="button">In mandje</button>
        </div>

        <div class="productFine">
          <div class="fineLine"><span class="fineDot"></span><span>Betaalde pre-order. Geen reservatie zonder betaling.</span></div>
          <div class="fineLine"><span class="fineDot"></span><span>Verzending +€7 of gratis ophaling.</span></div>
          <div class="fineLine"><span class="fineDot"></span><span>Genummerde pressing: #?/150 (na checkout bevestigd).</span></div>
        </div>
      </div>
    </div>
  `;

  // Flip on hover/focus in detail too (safe)
  const media = mount.querySelector(".productMedia.prodMedia");
  const frontImg = media?.querySelector(".prodImgFront");
  const backImg = media?.querySelector(".prodImgBack");
  if (media && frontImg && backImg) {
    const showBack = () => { backImg.style.opacity = "1"; frontImg.style.opacity = "0"; };
    const showFront = () => { backImg.style.opacity = "0"; frontImg.style.opacity = "1"; };
    showFront();
    media.addEventListener("mouseenter", showBack);
    media.addEventListener("mouseleave", showFront);
    media.addEventListener("focusin", showBack);
    media.addEventListener("focusout", showFront);
  }

  document.getElementById("buyBtn")?.addEventListener("click", () => {
    addToCart(
      p.id,
      {
        name: p.title,
        price: p.price,
        tag: p.tag,
        image: p.image,
        category: p.category,
        slug: p.slug,
        type: p.type
      },
      1
    );

    window.__CART_BADGE_SYNC__?.();
    window.__TOAST__?.({ title: "In mandje", msg: p.title, ms: 1600 });
  });
}

/* ---------------------------
   Helpers
--------------------------- */
function esc(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function cap(s) {
  const t = String(s || "");
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
}
