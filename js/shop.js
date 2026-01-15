// js/shop.js
import { addToCart } from "./store.js";
import { euro, escapeHtml, clampInt } from "./utils.js";

let _products = null;

/* ---------------------------
   Data loading
--------------------------- */
async function loadProducts() {
  if (_products) return _products;

  const res = await fetch("./data/products.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Kan products.json niet laden.");
  const data = await res.json();

  const arr = Array.isArray(data) ? data : (data.products || []);
  _products = arr.map(normalizeProduct);
  return _products;
}

function normalizeProduct(p) {
  const id = String(p?.id || "");
  const category = String(p?.category || p?.cat || "merch");
  const slug = String(p?.slug || slugify(p?.name || id));

  const images =
    p?.images && typeof p.images === "object"
      ? {
          front: p.images.front ? String(p.images.front) : "",
          back: p.images.back ? String(p.images.back) : ""
        }
      : {
          front: p?.image ? String(p.image) : "",
          back: p?.imageBack ? String(p.imageBack) : ""
        };

  const type = String(p?.type || inferType(category)); // "physical" | "digital"
  const shipping = normalizeShipping(p?.shipping, type);
  const limited = normalizeLimited(p?.limited, category);

  const variants =
    p?.variants && typeof p.variants === "object"
      ? {
          size: Array.isArray(p.variants.size) ? p.variants.size.map(String) : null
        }
      : { size: null };

  return {
    id,
    slug,
    category,
    name: String(p?.name || id),
    desc: String(p?.desc || ""),
    price: Number(p?.price || 0),
    tag: String(p?.tag || ""),
    type,
    shipping,
    limited,
    variants,
    images
  };
}

function inferType(category) {
  return String(category) === "digitaal" ? "digital" : "physical";
}

function normalizeShipping(sh, type) {
  if (type === "digital") return { pickup: false, ship: false, ship_price: 0 };

  const pickup = sh?.pickup !== false; // default true
  const ship = sh?.ship !== false; // default true
  const ship_price = Number(sh?.ship_price ?? 7);

  return {
    pickup: !!pickup,
    ship: !!ship,
    ship_price: Number.isFinite(ship_price) ? ship_price : 7
  };
}

function normalizeLimited(lim, category) {
  const isVinyl = String(category) === "vinyl";
  const enabled = lim?.enabled ?? isVinyl;

  if (!enabled) return { enabled: false, total: 0, press_min: 0, numbered: false };

  const total = clampInt(lim?.total ?? 150, 1, 99999);
  const press_min = clampInt(lim?.press_min ?? 100, 1, total);
  const numbered = lim?.numbered ?? true;

  return { enabled: true, total, press_min, numbered: !!numbered };
}

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function titleCase(s) {
  const str = String(s || "");
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function resolveImg(path) {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("/") || path.startsWith("./")) return path;
  return `./${path}`;
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

  const mount = appEl.querySelector("#shopMount");
  if (!mount) return;

  // 1x delegation: add to cart (werkt voor cards + detail)
  mount.addEventListener("click", async (e) => {
    const btn = e.target?.closest?.("[data-add-to-cart]");
    if (!btn) return;

    const id = btn.getAttribute("data-add-to-cart");
    if (!id) return;

    // Zorg dat cache gevuld is (1x fetch)
    try {
      await loadProducts();
    } catch (_) {}

    const p = (_products || []).find((x) => x.id === id);

    // variant (maat) als die in dezelfde product wrap zit
    const wrap = btn.closest?.("[data-product-wrap]") || mount;
    const sizeSel = wrap.querySelector?.('select[name="size"]');
    const size = sizeSel ? String(sizeSel.value || "") : "";

    const meta = p
      ? {
          name: p.name,
          price: p.price,
          tag: p.tag,
          image: p.images?.front || "",
          category: p.category,
          slug: p.slug,
          type: p.type,
          variant_size: size || undefined
        }
      : undefined;

    addToCart(id, meta, 1);
  });
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
      ${categoryCard("vinyl", "Limited pressings. Genummerd waar het hoort.")}
      ${categoryCard("cd", "Compact, proper, klaar om te draaien.")}
      ${categoryCard("digitaal", "Na betaling meteen binnen.")}
      ${categoryCard("merch", "Stukken om te dragen — niet om te showen.")}
    </div>

    <div class="shopHint" style="margin-top:14px;color:rgba(255,255,255,.65);font-size:12px;">
      Klik een categorie en pak het van daar.
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
      <p style="margin:0;color:rgba(255,255,255,.72);">Een selectie. Geen rommel.</p>
    </div>

    <div class="shopGrid">
      ${list.map((p) => productCard(p)).join("") || emptyCategory(category)}
    </div>
  `;

  wireCardImageFallbacks(mount);
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
          Ga terug naar <a href="#shop/${escapeHtml(category)}" style="color:rgba(255,255,255,.85);">de categorie</a>.
        </div>
      </div>
    `;
    return;
  }

  const front = resolveImg(p.images.front);
  const back = resolveImg(p.images.back);

  const shipLine = shippingLine(p);
  const limLine = limitedLineHtml(p);

  const sizePicker = p.variants?.size?.length
    ? `
      <label class="field" style="margin-top:12px; display:grid; gap:6px;">
        <span class="label" style="font-size:12px; color:rgba(255,255,255,.70);">Maat</span>
        <select name="size">
          ${p.variants.size.map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join("")}
        </select>
      </label>
    `
    : "";

  mount.innerHTML = `
    <div class="shopBreadcrumb">
      <a href="#shop">Shop</a><span class="sep">/</span>
      <a href="#shop/${escapeHtml(category)}">${escapeHtml(titleCase(category))}</a>
      <span class="sep">/</span>
      <span class="current">${escapeHtml(p.name)}</span>
    </div>

    <div class="productDetail" data-product-wrap>
      <div>
        <div class="productMedia ${front ? "" : "fallback"}" id="productMediaBox">
          ${
            front
              ? `<img id="productFrontImg" class="prodImg" src="${front}" alt="${escapeHtml(p.name)}">`
              : ``
          }
          ${
            back
              ? `<img id="productBackImg" class="prodImg" src="${back}" alt="${escapeHtml(p.name)} (back)" style="opacity:0;">`
              : ``
          }
          <div class="productMediaFallback">De Kweker</div>
        </div>

        ${
          back
            ? `
          <div class="galleryToggle">
            <button class="pillBtn active" type="button" data-img="front">Front</button>
            <button class="pillBtn" type="button" data-img="back">Back</button>
          </div>
        `
            : ``
        }
      </div>

      <div>
        <h2 class="productTitle">${escapeHtml(p.name)}</h2>

        <div class="productMetaRow">
          <span class="pillBtn" style="pointer-events:none;">${escapeHtml(p.tag || "Drop")}</span>
          <span class="pillBtn" style="pointer-events:none;">${escapeHtml(titleCase(p.category))}</span>
          ${p.type === "digital" ? `<span class="pillBtn" style="pointer-events:none;">Digitaal</span>` : ``}
        </div>

        <p class="productDesc">${escapeHtml(p.desc)}</p>

        ${sizePicker}

        <div class="productBuyRow" style="margin-top:12px;">
          <div class="productPrice">${euro(p.price)}</div>
          <button class="btn btnPrimary" type="button" data-add-to-cart="${escapeHtml(p.id)}">In mandje</button>
          <a class="btn" href="#shop/${escapeHtml(category)}">Terug</a>
        </div>

        <div class="productFine">
          ${limLine}
          ${shipLine}
          ${
            p.type === "digital"
              ? `<div class="fineLine"><span class="fineDot"></span><span>Download na betaling. Link komt via mail.</span></div>`
              : `<div class="fineLine"><span class="fineDot"></span><span>Ophalen kan. Verzenden kan ook.</span></div>`
          }
        </div>
      </div>
    </div>
  `;

  wireDetailMedia(mount);
}

/* ---------------------------
   UI helpers
--------------------------- */
function categoryCard(cat, sub) {
  return `
    <a class="shopCategoryCard" href="#shop/${escapeHtml(cat)}">
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
        Komt eraan.
      </div>
    </div>
  `;
}

function productCard(p) {
  const front = resolveImg(p.images.front);
  const back = resolveImg(p.images.back);

  const hasFront = Boolean(front);
  const hasBack = Boolean(back);

  const mediaClass = [
    "prodMedia",
    hasFront ? "" : "fallback",
    hasBack ? "" : "noBack"
  ].filter(Boolean).join(" ");

  const limitedBadge = p.limited?.enabled
    ? `<span class="pillBtn" style="pointer-events:none;">${escapeHtml(String(p.limited.total))} stuks</span>`
    : "";

  return `
    <article class="productCard panel" data-product-wrap>
      <a class="prodMediaLink" href="#shop/${escapeHtml(p.category)}/${escapeHtml(p.slug)}">
        <div class="${mediaClass}">
          ${
            hasFront
              ? `<img class="prodImg prodImgFront" data-img-role="front" src="${front}" alt="${escapeHtml(p.name)}" loading="lazy">`
              : ``
          }
          ${
            hasBack
              ? `<img class="prodImg prodImgBack" data-img-role="back" src="${back}" alt="${escapeHtml(p.name)} (back)" loading="lazy">`
              : ``
          }
          <div class="prodMediaFallback">De Kweker</div>
        </div>
      </a>

      <div class="productBody">
        <div class="productTop">
          <div class="tag">${escapeHtml(p.tag || "Drop")}</div>
          <div class="price">${euro(p.price)}</div>
        </div>

        <a class="prodTitleLink" href="#shop/${escapeHtml(p.category)}/${escapeHtml(p.slug)}">
          <div class="productName prodTitle">${escapeHtml(p.name)}</div>
        </a>

        <div class="productDesc">${escapeHtml(p.desc || "")}</div>

        <div class="productMetaRow" style="margin-top:10px;">
          ${limitedBadge}
          ${p.type === "digital" ? `<span class="pillBtn" style="pointer-events:none;">Digitaal</span>` : ``}
        </div>

        <div class="productActions" style="margin-top:12px;">
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

/* ---------------------------
   Shipping / Limited lines
--------------------------- */
function shippingLine(p) {
  if (p.type !== "physical") return "";

  const ship = p.shipping?.ship;
  const pickup = p.shipping?.pickup;
  const shipPrice = Number(p.shipping?.ship_price ?? 7);

  const bits = [];
  if (pickup) bits.push("Ophaling: gratis");
  if (ship) bits.push(`Verzending: +${euro(shipPrice)}`);

  if (!bits.length) return "";

  return `<div class="fineLine"><span class="fineDot"></span><span>${escapeHtml(bits.join(" • "))}</span></div>`;
}

function limitedLineHtml(p) {
  // Als niet limited: toon gewoon korte lijn zonder marketing
  if (!p.limited?.enabled) {
    return `<div class="fineLine"><span class="fineDot"></span><span>Beperkt waar het klopt.</span></div>`;
  }

  const total = p.limited.total;
  const pressMin = p.limited.press_min;
  const numbered = p.limited.numbered;

  const t1 = numbered ? `Limited: ${total} stuks • genummerd` : `Limited: ${total} stuks`;
  const t2 = `Persing start pas als er genoeg betaalde pre-orders zijn (${pressMin}/${total}).`;

  return `
    <div class="fineLine"><span class="fineDot"></span><span>${escapeHtml(t1)}</span></div>
    <div class="fineLine"><span class="fineDot"></span><span>${escapeHtml(t2)}</span></div>
  `;
}

/* ---------------------------
   Image wiring
--------------------------- */
function wireCardImageFallbacks(scopeEl) {
  scopeEl.querySelectorAll('img[data-img-role="front"], img[data-img-role="back"]').forEach((img) => {
    img.addEventListener("error", () => {
      const media = img.closest(".prodMedia");
      if (!media) return;

      const role = img.getAttribute("data-img-role");
      img.remove();

      if (role === "front") {
        media.classList.add("fallback");
      } else {
        media.classList.add("noBack");
      }
    });
  });
}

function wireDetailMedia(scopeEl) {
  const mediaBox = scopeEl.querySelector("#productMediaBox");
  const frontImg = scopeEl.querySelector("#productFrontImg");
  const backImg = scopeEl.querySelector("#productBackImg");

  // Front fallback
  if (frontImg && mediaBox) {
    frontImg.addEventListener("error", () => {
      frontImg.remove();
      mediaBox.classList.add("fallback");
    });
  }

  // Back fallback -> toggle weg, front blijft
  if (backImg) {
    backImg.addEventListener("error", () => {
      backImg.remove();
      scopeEl.querySelector(".galleryToggle")?.remove();
    });
  }

  if (!backImg || !frontImg) return;

  // Toggle (simpel, stabiel)
  const btns = scopeEl.querySelectorAll("[data-img]");
  btns.forEach((b) => {
    b.addEventListener("click", () => {
      btns.forEach((x) => x.classList.remove("active"));
      b.classList.add("active");

      const mode = b.getAttribute("data-img");
      if (mode === "back") {
        frontImg.style.opacity = "0";
        backImg.style.opacity = "1";
      } else {
        frontImg.style.opacity = "1";
        backImg.style.opacity = "0";
      }
    });
  });
}
