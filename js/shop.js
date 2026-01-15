// js/shop.js
import { addToCart } from "./store.js";
import { euro } from "./utils.js";

let _products = null;

async function loadProducts() {
  if (_products) return _products;

  const res = await fetch("./data/products.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Kan products.json niet laden.");
  const data = await res.json();

  // verwacht array of {products:[...]}
  const arr = Array.isArray(data) ? data : (data.products || []);
  _products = arr.map(normalizeProduct);
  return _products;
}

function normalizeProduct(p) {
  const id = String(p.id || "");
  const category = String(p.category || p.cat || "merch"); // fallback
  const slug = String(p.slug || slugify(p.name || id));
  return {
    id,
    slug,
    category,
    name: String(p.name || id),
    desc: String(p.desc || ""),
    price: Number(p.price || 0),
    tag: String(p.tag || ""),
    // images: ondersteun zowel "image" als "images.front/back"
    images: p.images && typeof p.images === "object"
      ? {
          front: p.images.front ? String(p.images.front) : "",
          back: p.images.back ? String(p.images.back) : ""
        }
      : {
          front: p.image ? String(p.image) : "",
          back: p.imageBack ? String(p.imageBack) : ""
        }
  };
}

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/* ---------------------------
   Routing helper
--------------------------- */
export function getShopPathParts() {
  const raw = (window.location.hash || "#home").replace("#", "").trim();
  const cleaned = raw.startsWith("/") ? raw.slice(1) : raw;
  const parts = cleaned.split("/").filter(Boolean);

  if (parts[0] !== "shop") return { category: null, slug: null };

  return {
    category: parts[1] ? String(parts[1]) : null,
    slug: parts[2] ? String(parts[2]) : null
  };
}

/* ---------------------------
   Mount shell
--------------------------- */
export function mountShopShell(appEl) {
  if (!appEl) return;

  // Shop heeft eigen “subnav” + content mount zodat app.js niet hoeft te weten hoe
  appEl.innerHTML = `
    <section class="panel panelWide">
      <div class="shopPageHead">
        <h1 style="margin:0 0 6px;">Shop</h1>
        <p style="margin:0;color:rgba(255,255,255,.72);">
          Vinyl, CD, digitaal en merch — klein gehouden, proper gekozen.
        </p>
      </div>

      <nav class="shopNav" aria-label="Shop categorieën">
        <a class="shopNavLink" href="#shop/vinyl" data-shop-nav="vinyl">Vinyl</a>
        <a class="shopNavLink" href="#shop/cd" data-shop-nav="cd">CD</a>
        <a class="shopNavLink" href="#shop/digitaal" data-shop-nav="digitaal">Digitaal</a>
        <a class="shopNavLink" href="#shop/merch" data-shop-nav="merch">Merch</a>
      </nav>

      <div id="shopMount"></div>
    </section>
  `;

  // 1x event delegation voor add buttons
  const mount = appEl.querySelector("#shopMount");
  if (mount) {
    mount.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-add-to-cart]");
      if (!btn) return;
      const id = btn.getAttribute("data-add-to-cart");
      if (!id) return;

      // meta meegeven zodat cart mooi toont
      const p = _products?.find((x) => x.id === id);
      addToCart(
        id,
        p ? { name: p.name, price: p.price, tag: p.tag, image: (p.images.front || "") } : undefined,
        1
      );
    });
  }
}

/* ---------------------------
   Pages
--------------------------- */
export async function renderShopHome() {
  const mount = document.getElementById("shopMount");
  if (!mount) return;

  await loadProducts();

  mount.innerHTML = `
    <div class="shopCategoryGrid">
      ${categoryCard("vinyl", "Limited pressings, zwaar gevoel.")}
      ${categoryCard("cd", "Compact, proper, klaar om te draaien.")}
      ${categoryCard("digitaal", "Voor wie het meteen wil.")}
      ${categoryCard("merch", "Stukken om te dragen — niet om te tonen.")}
    </div>

    <div class="shopHint" style="margin-top:14px;color:rgba(255,255,255,.65);font-size:12px;">
      Tip: klik een categorie — details per drop staan daar.
    </div>
  `;

  setActiveShopNav(null);
}

export async function renderShopCategory(category) {
  const mount = document.getElementById("shopMount");
  if (!mount) return;

  const products = await loadProducts();
  const list = products.filter((p) => p.category === category);

  setActiveShopNav(category);

  mount.innerHTML = `
    <div class="shopPageHead">
      <h2 style="margin:0 0 6px;">${escapeHtml(titleCase(category))}</h2>
      <p style="margin:0;color:rgba(255,255,255,.72);">Een korte selectie. Geen ruis.</p>
    </div>

    <div class="shopGrid">
      ${list.map((p) => productCard(p)).join("") || emptyCategory(category)}
    </div>
  `;
}

export async function renderProductDetail(category, slug) {
  const mount = document.getElementById("shopMount");
  if (!mount) return;

  const products = await loadProducts();
  const p = products.find((x) => x.category === category && x.slug === slug);

  setActiveShopNav(category);

  if (!p) {
    mount.innerHTML = `
      <div class="cartEmpty">
        <div style="font-weight:900;">Niet gevonden.</div>
        <div style="color:rgba(255,255,255,.65); font-size:12px; margin-top:6px;">
          Ga terug naar <a href="#shop/${category}" style="color:rgba(255,255,255,.85);">de categorie</a>.
        </div>
      </div>
    `;
    return;
  }

  const front = resolveImg(p.images.front);
  const back = resolveImg(p.images.back);

  mount.innerHTML = `
    <div class="shopBreadcrumb">
      <a href="#shop">Shop</a><span class="sep">/</span>
      <a href="#shop/${escapeHtml(category)}">${escapeHtml(titleCase(category))}</a>
      <span class="sep">/</span>
      <span class="current">${escapeHtml(p.name)}</span>
    </div>

    <div class="productDetail">
      <div>
        <div class="productMedia ${front ? "" : "fallback"}" id="productMediaBox">
          ${front ? `<img id="productMediaImg" src="${front}" alt="${escapeHtml(p.name)}">` : ``}
          <div class="productMediaFallback">De Kweker</div>
        </div>

        ${back ? `
          <div class="galleryToggle">
            <button class="pillBtn active" type="button" data-img="front">Front</button>
            <button class="pillBtn" type="button" data-img="back">Back</button>
          </div>
        ` : ``}
      </div>

      <div>
        <h2 class="productTitle">${escapeHtml(p.name)}</h2>

        <div class="productMetaRow">
          <span class="pillBtn" style="pointer-events:none;">${escapeHtml(p.tag || "Drop")}</span>
          <span class="pillBtn" style="pointer-events:none;">${escapeHtml(titleCase(p.category))}</span>
        </div>

        <p class="productDesc">${escapeHtml(p.desc)}</p>

        <div class="productBuyRow">
          <div class="productPrice">${euro(p.price)}</div>
          <button class="btn btnPrimary" type="button" data-add-to-cart="${escapeHtml(p.id)}">In mandje</button>
          <a class="btn" href="#shop/${escapeHtml(category)}">Terug</a>
        </div>

        <div class="productFine">
          <div class="fineLine"><span class="fineDot"></span><span>Beperkte oplage. Als het weg is, is het weg.</span></div>
          <div class="fineLine"><span class="fineDot"></span><span>Verzending: BE (uitbreidbaar later).</span></div>
          <div class="fineLine"><span class="fineDot"></span><span>Checkout komt later: eerst vibe, flow en afwerking.</span></div>
        </div>
      </div>
    </div>
  `;

  // ✅ Image fallback bij 404 (detail page)
  const mediaBox = mount.querySelector("#productMediaBox");
  const mediaImg = mount.querySelector("#productMediaImg");
  if (mediaImg && mediaBox) {
    mediaImg.addEventListener("error", () => {
      mediaImg.remove();
      mediaBox.classList.add("fallback");
    });
  }

  // simpele front/back toggle (detail page)
  if (back) {
    const btns = mount.querySelectorAll("[data-img]");
    const img = mount.querySelector("#productMediaImg");

    btns.forEach((b) => {
      b.addEventListener("click", () => {
        btns.forEach((x) => x.classList.remove("active"));
        b.classList.add("active");

        if (!img) return;
        const mode = b.getAttribute("data-img");
        img.src = mode === "back" ? back : front;
      });
    });

    // ✅ Ook back kan 404’en: dan terugvallen op front
    if (img) {
      img.addEventListener("error", () => {
        img.src = front;
        btns.forEach((x) => x.classList.remove("active"));
        const frontBtn = mount.querySelector('[data-img="front"]');
        frontBtn?.classList.add("active");
      });
    }
  }
}

/* ---------------------------
   UI helpers
--------------------------- */

function categoryCard(cat, sub) {
  return `
    <a class="shopCategoryCard" href="#shop/${cat}">
      <div>
        <div class="shopCategoryTitle">${escapeHtml(titleCase(cat))}</div>
        <div class="shopCategorySub">${escapeHtml(sub)}</div>
      </div>
      <div class="shopCategorySub" style="opacity:.8;">Bekijk →</div>
    </a>
  `;
}

function emptyCategory(cat) {
  return `
    <div class="cartEmpty" style="grid-column:1/-1;">
      <div style="font-weight:900;">Nog niks in ${escapeHtml(titleCase(cat))}.</div>
      <div style="color:rgba(255,255,255,.65); font-size:12px; margin-top:6px;">
        Komt eraan. Klein gehouden, proper gekozen.
      </div>
    </div>
  `;
}

function productCard(p) {
  const front = resolveImg(p.images.front);
  const back = resolveImg(p.images.back);

  const hasFront = Boolean(front);
  const hasBack = Boolean(back);

  // ✅ Belangrijk: als back ontbreekt → noBack class
  // ✅ Als front ontbreekt → fallback class
  const mediaClass = [
    "prodMedia",
    hasFront ? "" : "fallback",
    hasBack ? "" : "noBack"
  ].filter(Boolean).join(" ");

  const media = `
    <a class="prodMediaLink" href="#shop/${escapeHtml(p.category)}/${escapeHtml(p.slug)}">
      <div class="${mediaClass}">
        ${
          hasFront
            ? `<img class="prodImg prodImgFront"
                  src="${front}"
                  alt="${escapeHtml(p.name)}"
                  loading="lazy"
                  onerror="this.closest('.prodMedia')?.classList.add('fallback'); this.remove();">`
            : ``
        }

        ${
          hasBack
            ? `<img class="prodImg prodImgBack"
                  src="${back}"
                  alt="${escapeHtml(p.name)} (back)"
                  loading="lazy"
                  onerror="this.remove(); this.closest('.prodMedia')?.classList.add('noBack');">`
            : ``
        }

        <div class="prodMediaFallback">De Kweker</div>
      </div>
    </a>
  `;

  return `
    <article class="productCard panel">
      ${media}

      <div class="productBody">
        <div class="productTop">
          <div class="tag">${escapeHtml(p.tag || "Drop")}</div>
          <div class="price">${euro(p.price)}</div>
        </div>

        <a class="prodTitleLink" href="#shop/${escapeHtml(p.category)}/${escapeHtml(p.slug)}">
          <div class="productName prodTitle">${escapeHtml(p.name)}</div>
        </a>

        <div class="productDesc">${escapeHtml(p.desc || "")}</div>

        <div class="productActions">
          <button class="btn btnPrimary" data-add-to-cart="${escapeHtml(p.id)}" type="button">In mandje</button>
          <a class="btn" href="#shop/${escapeHtml(p.category)}/${escapeHtml(p.slug)}">Details</a>
        </div>
      </div>
    </article>
  `;
}

function setActiveShopNav(category) {
  document.querySelectorAll(".shopNavLink").forEach((a) => a.classList.remove("active"));
  if (!category) return;
  const el = document.querySelector(`.shopNavLink[data-shop-nav="${CSS.escape(category)}"]`);
  if (el) el.classList.add("active");
}

function resolveImg(path) {
  if (!path) return "";
  // als je al absolute/relative geeft, laat het.
  if (path.startsWith("http") || path.startsWith("/") || path.startsWith("./")) return path;
  // anders behandel als assets path
  return `./${path}`;
}

function titleCase(s) {
  const str = String(s || "");
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(s = "") {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
