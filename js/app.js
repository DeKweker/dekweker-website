// js/app.js
import { initToasts } from "./toast.js";
import { renderHeader, closeHeaderMenu } from "./menu.js";
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

import { cartCount, clearCart } from "./store.js";

initToasts();

/* ---------------------------
   Limited edition (Phase 1 UI)
--------------------------- */
const EDITION_TOTAL = 150;

function getEditionSold() {
  const v = Number(window.__VINYL_SOLD__ ?? 1);
  if (!Number.isFinite(v) || v < 1) return 1;
  if (v > EDITION_TOTAL) return EDITION_TOTAL;
  return v;
}

function syncEditionUI() {
  const sold = getEditionSold();
  document.querySelectorAll("#editionCount,[data-edition-sold]").forEach(el => {
    el.textContent = String(sold);
  });
  document.querySelectorAll("#editionTotal,[data-edition-total]").forEach(el => {
    el.textContent = String(EDITION_TOTAL);
  });
}

/* ---------------------------
   LINKS (artist + release)
--------------------------- */
const SPOTIFY_ARTIST_URL =
  "https://open.spotify.com/artist/2v5Tuugqs8s4vaONc286EG?si=qxSTBIvlTvmpoofpAtg1ew";

const SPOTIFY_EMBED_URL =
  "https://open.spotify.com/embed/artist/2v5Tuugqs8s4vaONc286EG?utm_source=generator";

const YT_URL = "https://www.youtube.com/watch?v=8Q0LB68kxRw";
const YT_EMBED = "https://www.youtube.com/embed/8Q0LB68kxRw";

/* ---------------------------
   UI ROOT (Cart shell mount)
--------------------------- */
let __uiMounted = false;

function ensureUIRoot() {
  const root = document.getElementById("ui-root");
  if (!root) return;

  if (!__uiMounted) {
    root.innerHTML = renderCartShell();
    wireCartEvents();

    window.__OPEN_CART__ = openCart;
    window.__CLOSE_CART__ = closeCart;

    __uiMounted = true;
  }

  syncCartBadge();
}

/* ---------------------------
   Routing normalization
--------------------------- */
function normalizeRoute(r) {
  const s = String(r || "").trim();
  if (!s) return "/home";
  const noHash = s.startsWith("#") ? s.slice(1) : s;
  return noHash.startsWith("/") ? noHash : `/${noHash}`;
}

/* ---------------------------
   HOME
--------------------------- */
function renderHome(app) {
  app.innerHTML = `
    <section class="panel heroChalet">
      <div class="heroMain">
        <div class="kickerWarm"><span class="dotWarm"></span> De Kweker • Tunnelvisie</div>

        <div class="editionRow" style="margin-top:10px;">
          <span class="counterBadge">
            <strong id="editionCount" data-edition-sold>1</strong>
            <small>/</small>
            <small id="editionTotal" data-edition-total>${EDITION_TOTAL}</small>
            <span>Genummerde vinyl</span>
          </span>
        </div>

        <h1 class="heroTitle">ALBUM RELEASE.<br/>Tunnelvisie.</h1>

        <p class="lead">
          Eerlijke miserie, echte emoties, een blik op de tweestrijd in mezelf.
        </p>

        <div class="ctaRow">
          <a class="btn btnPrimary" href="#shop">Kopen</a>
          <a class="btn btnSecondary" href="#music">Luister</a>
          <a class="btn btnQuiet" href="#contact">Contact</a>
        </div>
      </div>

      <aside class="heroAside">
        <div class="cardMini">
          <h3>Gemaakt om te voelen</h3>
          <p>Geschreven voor mezelf, uitgebracht voor jullie.</p>
        </div>
        <div class="cardMini">
          <h3>Beperkte oplage</h3>
          <p>Vinyl pressing wordt beperkt tot 150stuks. Dit is dus een collector stuk.</p>
        </div>
        <div class="cardMini">
          <h3>Emotie is de basis</h3>
          <p>Geen kostuum. Geen filter. Gewoon wat het is.</p>
        </div>
      </aside>
    </section>

    <!-- Nu beschikbaar -->
    <section class="panel panelWide availPanel">
      <div class="availGrid">
        <div class="availLeft">
          <div class="kickerWarm"><span class="dotWarm"></span> Nu beschikbaar</div>
          <h2 style="margin:10px 0 8px;">Tunnelvisie</h2>

          <p style="margin:0 0 10px;color:rgba(255,255,255,.85);line-height:1.6;">
            Op vinyl &amp; CD — op = op.<br/>
            Vinyl pressing start pas na <strong>100 pre-orders</strong>.
          </p>

          <div class="tagsRow" style="margin:10px 0 0;">
            <span class="tag">Beperkte oplage</span>
            <span class="tag">Collector item</span>
            <span class="tag tagWarm">Genummerd <span style="opacity:.9;">#</span><span data-edition-sold>1</span>/<span data-edition-total>${EDITION_TOTAL}</span></span>
          </div>

          <div class="ctaRow" style="margin-top:14px;">
            <a class="btn btnPrimary" href="#shop">Naar de shop</a>
            <a class="btn btnSecondary" href="#music">Eerst luisteren</a>
          </div>
        </div>

        <div class="availRight" aria-hidden="true">
          <a class="availImgWrap" href="#shop/vinyl" title="Vinyl">
            <img
              class="availImg"
              src="./assets/products/vinyl/tunnelvisie-front.webp"
              alt="Tunnelvisie — Vinyl"
              loading="lazy"
            />
            <div class="availTag">Vinyl</div>
          </a>

          <a class="availImgWrap" href="#shop/cd" title="CD">
            <img
              class="availImg"
              src="./assets/products/cd/tunnelvisie-front-cd.webp"
              alt="Tunnelvisie — CD"
              loading="lazy"
            />
            <div class="availTag">CD</div>
          </a>
        </div>
      </div>
    </section>

<!-- Bio -->
<section class="panel panelWide">
  <div class="bioHero">
    <div class="bioLeft">
      <div class="kickerWarm"><span class="dotWarm"></span> De Kweker • Brugge (8000)</div>

      <h2 class="bioTitle">De Kweker.</h2>

      <p class="bioLead">
        Geen pose. Geen rol. Wat blijft als de ruis wegvalt.
      </p>

      <div class="tagsRow" style="margin-top:10px;">
        <span class="tag">Releases via <strong>Rugged &amp; Raw</strong></span>
        <span class="tag">Verbonden aan <strong>Kwartier West</strong></span>
        <span class="tag">Klank &amp; productie met <strong>NUMB</strong></span>
      </div>

      <div class="ctaRow" style="margin-top:14px;">
        <a class="btn btnPrimary" href="#music">Music</a>
        <a class="btn btnSecondary" href="#shop">Shop</a>
        <a class="btn btnQuiet" href="#contact">Contact</a>
      </div>
    </div>

    <!-- ✅ starts collapsed by default -->
    <div class="bioRight isCollapsed" id="bioPanel">
      <div class="bioTextHead">
        <h3 class="bioTextTitle">Verhaal</h3>
        <button class="btn btnQuiet" id="bioToggle" type="button" aria-expanded="false" aria-controls="bioText">
          Lees meer
        </button>
      </div>

      <div class="bioBody" id="bioText">
        <p>
          De Kweker is een rapper uit Brugge (8000) die in het West-Vlaams rapt over mentale druk, afkomst en identiteit.
          Zijn muziek is sober en direct, zonder pose of opsmuk, en vertrekt vanuit persoonlijke ervaringen in plaats van trends.
        </p>

        <p>
          In zijn teksten balanceert hij tussen introspectie en confrontatie: kwetsbaar waar het moet, hard waar het niet anders kan.
          De Kweker maakt geen bravoure-rap, maar gebruikt hiphop als middel om dingen te benoemen die meestal verzwegen blijven.
        </p>

        <p>
          Hij is verbonden aan het collectief <strong>Kwartier West</strong> en releaset zijn muziek via <strong>Rugged &amp; Raw</strong>,
          twee contexten die zijn onafhankelijke en underground benadering versterken zonder zijn verhaal te sturen.
        </p>

        <p>
          De Kweker bouwt gestaag aan een eigen traject binnen de Vlaamse hiphop, met de focus op inhoud, consistentie en
          geloofwaardigheid boven zichtbaarheid of hype.
        </p>
      </div>

      <div class="bioQuote">
        <span class="bioQuoteMark">“</span>
        <span class="bioQuoteText">Therapie voor mezelf, en hopelijk voor jullie.</span>
      </div>
    </div>
  </div>
</section>

  `;

  syncEditionUI();
}

function wireBioToggle() {
  const btn = document.getElementById("bioToggle");
  const body = document.getElementById("bioBody");
  if (!btn || !body) return;

  const freshBtn = btn.cloneNode(true);
  btn.parentNode.replaceChild(freshBtn, btn);

  freshBtn.addEventListener("click", () => {
    const open = body.classList.toggle("open");
    freshBtn.textContent = open ? "Lees minder" : "Lees meer";
    freshBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

/* ---------------------------
   MUSIC
--------------------------- */
function renderMusic(app) {
  app.innerHTML = `
    <section class="panel panelWide">
      <div class="musicTop">
        <h1>Music</h1>
        <p>Releases en beelden — helder, zonder ruis.</p>

        <div class="ctaRow" style="margin-top:14px;">
          <a class="btn btnPrimary" href="${SPOTIFY_ARTIST_URL}" target="_blank" rel="noopener noreferrer">Open in Spotify</a>
          <a class="btn btnSecondary" href="${YT_URL}" target="_blank" rel="noopener noreferrer">Bekijk op YouTube</a>
        </div>
      </div>

      <div class="musicSpotlight">
        <div class="musicSpotText">
          <div class="kickerWarm" style="margin-bottom:10px;">
            <span class="dotWarm"></span> Uitgelicht
          </div>

          <h2 style="margin:0 0 10px;">Lekt Em (officiële videoclip)</h2>

          <p style="margin:0 0 12px;color:rgba(255,255,255,.85);line-height:1.6;">
            <strong>Eerste videoclip.</strong><br>
            Geen intro, maar een markering.
          </p>

          <p style="margin:0 0 14px;color:rgba(255,255,255,.72);line-height:1.6;">
            De Kweker is een rapper uit Brugge (8000) die in het West-Vlaams rapt over mentale druk, identiteit en afkomst.
            In <em>Lekt Em</em> valt beeld en tekst samen: sober, direct, zonder franjes.
          </p>

          <hr style="border:none;border-top:1px solid rgba(255,255,255,.08);margin:14px 0;">

          <p style="margin:0;color:rgba(255,255,255,.7);line-height:1.6;">
            <strong>Regie</strong> · Jan Maes<br>
            <strong>Camera</strong> · Patrick Nishimwe<br>
            <strong>Edit</strong> · Jason Moens
          </p>

          <p style="margin:14px 0 0;color:rgba(255,255,255,.6);line-height:1.6;">
            Alles wat je zoekt staat op één plek: clip, releases, context.
          </p>

          <div class="ctaRow" style="margin-top:14px;">
            <a class="btn btnPrimary" href="${YT_URL}" target="_blank" rel="noopener noreferrer">Kijk op YouTube</a>
            <a class="btn btnSecondary" href="#shop">Shop</a>
            <a class="btn btnQuiet" href="#contact">Contact</a>
          </div>
        </div>

        <div class="musicSpotMedia">
          <div class="ytWrap">
            <iframe
              src="${YT_EMBED}"
              title="De Kweker — Lekt Em (officiële videoclip)"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
              loading="lazy"
            ></iframe>
          </div>
        </div>

        <div class="musicBelow">
          <div class="musicCard">
            <div class="musicCardHead">
              <h3>Spotify</h3>
              <p class="mutedSmall">Releases en features, netjes gebundeld.</p>
            </div>

            <div class="spotifyFrameWrap">
              <iframe
                style="border-radius:16px;"
                src="${SPOTIFY_EMBED_URL}"
                width="100%"
                height="420"
                frameborder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title="De Kweker on Spotify"
              ></iframe>
            </div>
          </div>

          <div class="musicCard">
            <div class="musicCardHead">
              <h3>Context</h3>
              <p class="mutedSmall">Waar het gemaakt wordt — zonder het verhaal over te nemen.</p>
            </div>

            <div class="musicNotes">
              <div class="noteLine">
                <span class="noteDot"></span>
                <span><strong>Rugged &amp; Raw</strong> is waar releases landen — structuur, geen slogan.</span>
              </div>
              <div class="noteLine">
                <span class="noteDot"></span>
                <span><strong>Kwartier West</strong> is het collectief — uitwisseling, scherpte, onafhankelijkheid.</span>
              </div>
              <div class="noteLine">
                <span class="noteDot"></span>
                <span><strong>NUMB</strong> draagt de klank — ruimte en spanning die tekst laat ademen.</span>
              </div>

              <div class="ctaRow" style="margin-top:14px;">
                <a class="btn btnPrimary" href="#contact">Contact</a>
                <a class="btn btnSecondary" href="#shop">Shop</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

/* ---------------------------
   CONTACT
--------------------------- */
function renderContact(app) {
  app.innerHTML = `
    <section class="panel panelWide contactPage">
      <div class="contactIntro">
        <h1>Contact</h1>
        <p>Bookings, collabs of iets dat klopt: stuur gerust.</p>
      </div>

      <div class="contactGrid">
        <div class="contactCard">
          <h3>Mail</h3>
          <p class="mutedSmall">Ik lees alles. Antwoord kan soms even duren, maar het komt.</p>
          <a class="contactMail" href="mailto:info@kwkr.be">info@kwkr.be</a>
          <div class="contactNote">Zet liefst onderwerp + datum/plaats als het over booking gaat.</div>
        </div>

        <div class="contactCard">
          <h3>Socials</h3>
          <p class="mutedSmall">Updates, teasers en clips.</p>
          <ul class="socialList">
            <li><a href="https://www.instagram.com/dekweker_/" target="_blank" rel="noopener noreferrer">Instagram</a></li>
            <li><a href="https://www.facebook.com/p/De-Kweker-61570442235326/" target="_blank" rel="noopener noreferrer">Facebook</a></li>
            <li><a href="https://www.youtube.com/@De.kweker" target="_blank" rel="noopener noreferrer">YouTube</a></li>
            <li><a href="https://soundcloud.com/dekweker" target="_blank" rel="noopener noreferrer">SoundCloud</a></li>
            <li><a href="${SPOTIFY_ARTIST_URL}" target="_blank" rel="noopener noreferrer">Spotify</a></li>
          </ul>
        </div>
      </div>

      <div class="contactFooter">
        Brugge (8000) • Rugged &amp; Raw • Kwartier West
      </div>
    </section>
  `;
}

/* ---------------------------
   Success / cancel handler
--------------------------- */
function handleCheckoutResult() {
  const url = new URL(window.location.href);
  const success = url.searchParams.get("success");
  const canceled = url.searchParams.get("canceled");

  if (success === "1") {
    clearCart();
    syncCartBadge();

    window.__TOAST__?.({
      title: "Merci.",
      msg: "Echt. Door jou kan ik dit doen. Je krijgt straks bevestiging via mail.",
      ms: 3200
    });

    url.searchParams.delete("success");
    url.searchParams.delete("sid");
    window.history.replaceState({}, "", url.toString());
  }

  if (canceled === "1") {
    window.__TOAST__?.({
      title: "Checkout gestopt",
      msg: "Geen stress — je mandje staat nog klaar.",
      ms: 2400
    });

    url.searchParams.delete("canceled");
    window.history.replaceState({}, "", url.toString());
  }
}

/* ---------------------------
   Router
--------------------------- */
function renderPage() {
  ensureUIRoot();
  renderHeader();

  const app = document.getElementById("app");
  if (!app) return;

  const route = normalizeRoute(getRoute());

  if (route.startsWith("/shop")) {
    mountShopShell(app);

    const { category, slug } = getShopPathParts();
    if (!category) return renderShopHome();
    if (category && !slug) return renderShopCategory(category);
    if (category && slug) return renderProductDetail(category, slug);
    return;
  }

  if (route === "/home") {
    renderHome(app);
    wireBioToggle();
    return;
  }

  if (route === "/music") {
    renderMusic(app);
    return;
  }

  if (route === "/contact") {
    renderContact(app);
    return;
  }

  renderHome(app);
  wireBioToggle();
}

window.addEventListener("hashchange", () => {
  // feels cleaner: close menu before page swap
  closeHeaderMenu?.();
  renderPage();
});

window.addEventListener("DOMContentLoaded", () => {
  ensureUIRoot();
  handleCheckoutResult();
  renderPage();

  if (cartCount() > 0) syncCartBadge();
});
document.addEventListener("click", (e) => {
  const btn = e.target.closest("#bioToggle");
  if (!btn) return;

  const panel = document.querySelector("#bioPanel");
  if (!panel) return;

  const wasCollapsed = panel.classList.contains("isCollapsed");

  // toggle class
  panel.classList.toggle("isCollapsed");

  // update button text + aria
  const expanded = wasCollapsed; // if it was collapsed, now it’s expanded
  btn.textContent = expanded ? "Lees minder" : "Lees meer";
  btn.setAttribute("aria-expanded", expanded ? "true" : "false");
});
