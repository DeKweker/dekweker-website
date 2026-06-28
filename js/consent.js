(() => {
  const CONSENT_KEY = 'kwkr_cookie_consent_v1';
  const STATE_ACCEPTED = 'accepted';
  const STATE_DECLINED = 'declined';

  const getStoredState = () => {
    try {
      return window.localStorage.getItem(CONSENT_KEY);
    } catch {
      return null;
    }
  };

  const setStoredState = (value) => {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // no-op when storage is unavailable
    }
  };

  const mediaEmbeds = Array.from(document.querySelectorAll('iframe[data-embed-src]'));

  if (!mediaEmbeds.length) {
    return;
  }

  const ensureGate = (iframe, onAccept) => {
    const container = iframe.closest('.consent-embed') || iframe.parentElement;
    if (!container) return null;

    container.classList.add('consent-embed');

    let gate = container.querySelector('.embed-gate');
    if (!gate) {
      gate = document.createElement('div');
      gate.className = 'embed-gate';
      gate.innerHTML = `
        <div class='embed-gate-inner'>
          <p class='embed-gate-kicker'>Externe media</p>
          <p class='embed-gate-text'>
            Deze speler gebruikt cookies van derden (YouTube/Spotify).
          </p>
          <div class='embed-gate-actions'>
            <button type='button' class='btn ghost embed-gate-btn'>Media toestaan</button>
            <a class='textLink embed-gate-link' href='/privacy/'>Privacy</a>
          </div>
        </div>
      `;
      container.appendChild(gate);

      const button = gate.querySelector('.embed-gate-btn');
      if (button) {
        button.addEventListener('click', () => {
          onAccept();
        });
      }
    }

    return gate;
  };

  const applyEmbeds = (state, onAccept) => {
    mediaEmbeds.forEach((iframe) => {
      const container = iframe.closest('.consent-embed') || iframe.parentElement;
      if (!container) return;

      ensureGate(iframe, onAccept);

      if (state === STATE_ACCEPTED) {
        if (!iframe.getAttribute('src')) {
          const src = iframe.getAttribute('data-embed-src');
          if (src) {
            iframe.setAttribute('src', src);
          }
        }
        container.classList.remove('is-embed-blocked');
      } else {
        if (iframe.getAttribute('src')) {
          iframe.removeAttribute('src');
        }
        container.classList.add('is-embed-blocked');
      }
    });
  };

  const buildBanner = (onAccept, onDecline) => {
    const existing = document.querySelector('[data-cookie-banner]');
    if (existing) {
      return existing;
    }

    const banner = document.createElement('section');
    banner.className = 'cookie-banner';
    banner.setAttribute('data-cookie-banner', '');
    banner.setAttribute('aria-live', 'polite');
    banner.innerHTML = `
      <div class='cookie-banner-inner container'>
        <div class='cookie-copy'>
          <p class='cookie-kicker'>Cookies</p>
          <p class='cookie-text'>
            Noodzakelijke cookies zijn actief. Voor YouTube en Spotify vragen we eerst je akkoord.
          </p>
        </div>
        <div class='cookie-actions'>
          <button type='button' class='btn primary' data-cookie-accept>Akkoord</button>
          <button type='button' class='btn ghost' data-cookie-decline>Noodzakelijk</button>
          <a class='textLink cookie-link' href='/privacy/'>Meer info</a>
        </div>
      </div>
    `;

    const acceptBtn = banner.querySelector('[data-cookie-accept]');
    const declineBtn = banner.querySelector('[data-cookie-decline]');

    if (acceptBtn) {
      acceptBtn.addEventListener('click', onAccept);
    }

    if (declineBtn) {
      declineBtn.addEventListener('click', onDecline);
    }

    document.body.appendChild(banner);
    return banner;
  };

  const buildManageButton = (openBanner) => {
    let manage = document.querySelector('[data-cookie-manage]');
    if (manage) {
      return manage;
    }

    manage = document.createElement('button');
    manage.type = 'button';
    manage.className = 'cookie-manage';
    manage.setAttribute('data-cookie-manage', '');
    manage.textContent = 'Cookiekeuze';
    manage.addEventListener('click', openBanner);
    document.body.appendChild(manage);
    return manage;
  };

  const setBannerVisibility = (banner, visible) => {
    if (!banner) return;
    banner.classList.toggle('is-hidden', !visible);
  };

  const setManageVisibility = (manage, visible) => {
    if (!manage) return;
    manage.classList.toggle('is-visible', visible);
  };

  const initialState = getStoredState();

  const handleAccept = () => {
    setStoredState(STATE_ACCEPTED);
    applyEmbeds(STATE_ACCEPTED, handleAccept);
    setBannerVisibility(banner, false);
    setManageVisibility(manageButton, true);
  };

  const handleDecline = () => {
    setStoredState(STATE_DECLINED);
    applyEmbeds(STATE_DECLINED, handleAccept);
    setBannerVisibility(banner, false);
    setManageVisibility(manageButton, true);
  };

  const openBanner = () => {
    setBannerVisibility(banner, true);
  };

  const banner = buildBanner(handleAccept, handleDecline);
  const manageButton = buildManageButton(openBanner);

  if (initialState === STATE_ACCEPTED) {
    applyEmbeds(STATE_ACCEPTED, handleAccept);
    setBannerVisibility(banner, false);
    setManageVisibility(manageButton, true);
    return;
  }

  if (initialState === STATE_DECLINED) {
    applyEmbeds(STATE_DECLINED, handleAccept);
    setBannerVisibility(banner, false);
    setManageVisibility(manageButton, true);
    return;
  }

  applyEmbeds(STATE_DECLINED, handleAccept);
  setBannerVisibility(banner, true);
  setManageVisibility(manageButton, false);
})();
