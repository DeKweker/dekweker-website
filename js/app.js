
import { initToasts } from "./toast.js";
initToasts();

// js/app.js
function normalizeRoute(r) {
  const s = String(r || "").trim();
  if (!s) return "/home";

  // router kan "home" of "/home" of "#home" teruggeven
  const noHash = s.startsWith("#") ? s.slice(1) : s;
  return noHash.startsWith("/") ? noHash : `/${noHash}`;
}

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
   - 1x inject in #ui-root
   - 1x wire events
   - expose open cart for menu.js
--------------------------- */
let __uiMounted = false;

function ensureUIRoot() {
  const root = document.getElementById("ui-root");
  if (!root) return;

  if (!__uiMounted) {
    root.innerHTML = renderCartShell();
    wireCartEvents();

    // Expose hooks for header/menu
    window.__OPEN_CART__ = openCart;
    window.__CLOSE_CART__ = closeCart;

    __uiMounted = true;
  }

  // keep badge correct even on refresh/route change
  syncCartBadge();
}

/* ---------------------------
   HOME
--------------------------- */
function renderHome(app) {
  app.innerHTML = `
    <section class="panel heroChalet">
      <div class="heroMain">
        <div class="kickerWarm"><span class="dotWarm"></span> De Kweker • Brugge 8000</div>
        <h1 class="heroTitle">ALBUM RELEASE.<br/>Tunnelvisie.</h1>
        <p class="lead">
          Eerlijke miserie, echte emoties, een blik op de tweestrijd in mezelf. Tunnelvisie 
        </p>

        <div class="ctaRow">
          <a class="btn btnPrimary" href="#shop">Kopen</a>
          <a class="btn" href="#music">Luister</a>
          <a class="btn" href="#contact">Contact</a>
        </div>
      </div>

      <aside class="heroAside">
        <div class="cardMini">
          <h3>Gemaakt om te dragen</h3>
          <p>Degelijk, comfortabel, en niet gemaakt om na twee wassen te stoppen.</p>
        </div>
        <div class="cardMini">
          <h3>Beperkt, niet massaal</h3>
          <p>Drops komen en gaan. Als het klopt, dan klopt het — anders niet.</p>
        </div>
        <div class="cardMini">
          <h3>Brugge blijft de basis</h3>
          <p>Geen kostuum. Geen filter. Gewoon wat het is.</p>
        </div>
      </aside>
    </section>

    <section class="panel panelWide">
      <h2>Nu beschikbaar</h2>
      <p>Op vinyl &amp; CD. Op = op.</p>
      <div class="ctaRow" style="margin-top:14px;">
        <a class="btn btnPrimary" href="#shop">Naar de shop</a>
        <a class="btn" href="#music">Eerst luisteren</a>
      </div>
    </section>

    <section class="panel panelWide">
      <div class="bioHero">
        <div class="bioLeft">
          <div class="kickerWarm"><span class="dotWarm"></span> De Kweker • 8000</div>

          <h2 class="bioTitle">Tweestrijd.<br/></h2>

          <p class="bioLead">
           Van Lekt Em tot Moed(ig)er, Tunnnelvisie is niet zomaar een album. Maar wat De Kweker ademt en voelt.
          </p>

          <p class="bioMeta">
            <span class="bioMetaItem"><span class="bioMetaDot"></span> Releases via <strong>Rugged &amp; Raw</strong></span>
            <span class="bioMetaItem"><span class="bioMetaDot"></span> Collectief <strong>Kwartier West</strong></span>
            <span class="bioMetaItem"><span class="bioMetaDot"></span> Sound &amp; productie met <strong>NUMB</strong></span>
          </p>

          <div class="ctaRow" style="margin-top:14px;">
            <a class="btn btnPrimary" href="#music">Music</a>
            <a class="btn" href="#shop">Shop</a>
            <a class="btn" href="#contact">Contact</a>
          </div>
        </div>

        <div class="bioRight">
          <div class="bioTextHead">
            <h3 class="bioTextTitle">Verhaal</h3>
            <button class="bioToggle" id="bioToggle" type="button" aria-expanded="false">Lees meer</button>
          </div>

          <div class="bioBody" id="bioBody">
            <p class="bioPara bioDrop">
              De Kweker is een stem uit Brugge (8000). Niet gebouwd om te imponeren, maar om te blijven hangen.
              In het West-Vlaams, omdat dat de taal is waarin gedacht wordt, gewogen wordt, en uiteindelijk ook gesproken.
            </p>

            <p class="bioPara">
              Hij brengt muziek uit via Rugged &amp; Raw en maakt deel uit van Kwartier West —
              een collectief waar samenwerking belangrijker is dan zichtbaarheid. Niet om groter te lijken,
              maar om scherper te worden.
            </p>

            <p class="bioPara">
              Producer numb helpt het verhaal dragen: ruimte, spanning en gewicht. Beats die ademen,
              durven leeg te laten, en niet overstemmen wat gezegd wordt.
            </p>

            <p class="bioPara">
              Thema’s keren terug als straten die je kent: arbeid, identiteit, twijfel, trots, nostalgie.
              Geen grote verklaringen — momenten. Flarden die blijven plakken.
            </p>
          </div>

          <div class="bioQuote">
            <span class="bioQuoteMark">“</span>
            <span class="bioQuoteText">Ik maak geen muziek om te ontsnappen. Ik maak muziek om te blijven staan.</span>
          </div>
        </div>
      </div>
    </section>
  `;
}

function wireBioToggle() {
  const btn = document.getElementById("bioToggle");
  const body = document.getElementById("bioBody");
  if (!btn || !body) return;

  // prevent double listeners after re-render
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
        <p>Releases, features en dingen in opbouw — zonder ruis.</p>

        <div class="ctaRow" style="margin-top:14px;">
          <a class="btn btnPrimary" href="${SPOTIFY_ARTIST_URL}" target="_blank" rel="noopener noreferrer">Open in Spotify</a>
          <a class="btn" href="${YT_URL}" target="_blank" rel="noopener noreferrer">Bekijk op YouTube</a>
        </div>
      </div>

      <div class="musicSpotlight">
        <div class="musicSpotText">
          <div class="kickerWarm" style="margin-bottom:10px;">
            <span class="dotWarm"></span> Nieuwste release
          </div>
          <h2 style="margin:0 0 10px;">Clip</h2>
          <p style="margin:0;color:rgba(255,255,255,.75);line-height:1.55;">
            Lekt Em komt meteen met De Kweker zijn eerste videoclip.
            beelden gedraaid door Patrick Nisihmwe en bewerkt door Jason Moens.
            Lekt em is geen intro, het is een statement.
          </p>

          <div class="ctaRow" style="margin-top:14px;">
            <a class="btn btnPrimary" href="${YT_URL}" target="_blank" rel="noopener noreferrer">Play op YouTube</a>
            <a class="btn" href="#shop">Shop</a>
            <a class="btn" href="#contact">Contact</a>
          </div>
        </div>

        <div class="musicSpotMedia">
          <div class="ytWrap">
            <iframe
              src="${YT_EMBED}"
              title="De Kweker — nieuwste clip"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>

      <div class="musicGrid" style="margin-top:14px;">
        <div class="musicCard">
          <div class="musicCardHead">
            <h3>Spotify</h3>
            <p class="mutedSmall">Alles netjes op één plek.</p>
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
            <p class="mutedSmall">Waar het gemaakt wordt, en met wie.</p>
          </div>

          <div class="musicNotes">
            <div class="noteLine">
              <span class="noteDot"></span>
              <span><strong>Rugged &amp; Raw</strong> is waar releases landen — als kader, niet als etalage.</span>
            </div>
            <div class="noteLine">
              <span class="noteDot"></span>
              <span><strong>Kwartier West</strong> is het collectief — scherpte, feedback, presence. Geen hype.</span>
            </div>
            <div class="noteLine">
              <span class="noteDot"></span>
              <span><strong>Numb</strong> helpt de klank dragen — ruimte, spanning en gewicht doorheen het verhaal.</span>
            </div>
            <div class="noteLine">
              <span class="noteDot"></span>
              <span>Brugge blijft de basis. Niet als slogan — als grond.</span>
            </div>

            <div class="ctaRow" style="margin-top:14px;">
              <a class="btn btnPrimary" href="#contact">Contact</a>
              <a class="btn" href="#shop">Shop</a>
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
   Router
--------------------------- */
function renderPage() {
  ensureUIRoot();
  renderHeader();

  const app = document.getElementById("app");
  if (!app) return;

  const route = normalizeRoute(getRoute());


  // SHOP routes: /shop, /shop/vinyl, /shop/vinyl/slug
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

  // fallback
  renderHome(app);
  wireBioToggle();
}

window.addEventListener("hashchange", renderPage);
window.addEventListener("DOMContentLoaded", () => {
  // UI first so cart badge is correct immediately
  ensureUIRoot();
  renderPage();

  // tiny safety: if user refreshes with items, keep badge in sync
  if (cartCount() > 0) syncCartBadge();
});
export function getState(){
  return {
    items: [...cart],
    count: cartCount(),
    total: cartTotal()
  };
}
