(() => {
  document.documentElement.classList.add('js');

  const year = document.getElementById('year');
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('.nav-toggle');
  const navPanel = document.getElementById('nav-panel');
  if (header && navToggle && navPanel) {
    const closeNav = () => {
      header.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    };

    navToggle.addEventListener('click', () => {
      const isOpen = header.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navPanel.addEventListener('click', (event) => {
      const target = event.target;
      if (target instanceof Element && target.closest('a')) {
        closeNav();
      }
    });

    document.addEventListener('click', (event) => {
      if (!header.classList.contains('is-open')) return;
      if (!header.contains(event.target)) {
        closeNav();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeNav();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) {
        closeNav();
      }
    });
  }

  const bioDetails = document.querySelector('.bio-details');
  if (bioDetails) {
    const mq = window.matchMedia('(max-width: 700px)');
    const syncBioState = () => {
      if (mq.matches) {
        bioDetails.removeAttribute('open');
      } else {
        bioDetails.setAttribute('open', '');
      }
    };
    syncBioState();
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', syncBioState);
    } else if (typeof mq.addListener === 'function') {
      mq.addListener(syncBioState);
    }
  }
  const bioSlider = document.querySelector('[data-bio-slider]');
  if (bioSlider) {
    const track = bioSlider.querySelector('[data-bio-track]');
    const slides = Array.from(bioSlider.querySelectorAll('.bio-slide'));
    const dots = Array.from(bioSlider.querySelectorAll('[data-bio-dot]'));
    const prevButton = bioSlider.querySelector('[data-bio-prev]');
    const nextButton = bioSlider.querySelector('[data-bio-next]');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (track && slides.length > 0) {
      let activeIndex = 0;
      let autoplayTimer = 0;

      const update = (index) => {
        const safeIndex = (index + slides.length) % slides.length;
        activeIndex = safeIndex;
        track.style.transform = `translate3d(${-safeIndex * 100}%, 0, 0)`;

        dots.forEach((dot, dotIndex) => {
          const isActive = dotIndex === safeIndex;
          dot.classList.toggle('is-active', isActive);
          dot.setAttribute('aria-selected', String(isActive));
          dot.setAttribute('tabindex', isActive ? '0' : '-1');
        });
      };

      const stopAutoplay = () => {
        if (autoplayTimer) {
          window.clearInterval(autoplayTimer);
          autoplayTimer = 0;
        }
      };

      const startAutoplay = () => {
        if (prefersReducedMotion || slides.length < 2) {
          return;
        }
        stopAutoplay();
        autoplayTimer = window.setInterval(() => {
          update(activeIndex + 1);
        }, 5200);
      };

      const step = (delta) => {
        update(activeIndex + delta);
        startAutoplay();
      };

      if (prevButton) {
        prevButton.addEventListener('click', () => step(-1));
      }

      if (nextButton) {
        nextButton.addEventListener('click', () => step(1));
      }

      dots.forEach((dot, dotIndex) => {
        dot.addEventListener('click', () => {
          update(dotIndex);
          startAutoplay();
        });
      });

      bioSlider.addEventListener('mouseenter', stopAutoplay);
      bioSlider.addEventListener('mouseleave', startAutoplay);
      bioSlider.addEventListener('focusin', stopAutoplay);
      bioSlider.addEventListener('focusout', () => {
        if (!bioSlider.contains(document.activeElement)) {
          startAutoplay();
        }
      });

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          stopAutoplay();
        } else {
          startAutoplay();
        }
      });

      update(0);
      startAutoplay();
    }
  }


  const eventsFeed = document.querySelector('[data-events-feed]');
  if (eventsFeed) {
    const escapeHtml = (value) =>
      String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const renderEvents = (items) => {
      if (!items.length) {
        eventsFeed.innerHTML =
          "<p class='events-empty'>Nieuwe live data worden toegevoegd zodra ze bevestigd zijn.</p>";
        return;
      }

      const markup = items
        .map((item) => {
          const title = escapeHtml(item.title || 'Live moment');
          const when = escapeHtml(item.when || 'Datum volgt');
          const location = item.location
            ? `<p class='events-meta'>${escapeHtml(item.location)}</p>`
            : '';

          const links = Array.isArray(item.links)
            ? item.links
                .slice(0, 3)
                .map((link) => {
                  const label = escapeHtml(link.label || 'Link');
                  const url = escapeHtml(link.url || '#');
                  return `<a href='${url}' target='_blank' rel='noopener noreferrer'>${label}</a>`;
                })
                .join('')
            : '';

          const linksBlock = links
            ? `<div class='events-item-links'>${links}</div>`
            : "<p class='events-meta'>Details worden bevestigd via de organisator.</p>";

          return `
            <li class='events-item'>
              <p class='events-date'>${when}</p>
              <h3 class='events-title'>${title}</h3>
              ${location}
              ${linksBlock}
            </li>
          `;
        })
        .join('');

      eventsFeed.innerHTML = `<ul class='events-list'>${markup}</ul>`;
    };

    const loadEvents = async () => {
      const isStaticPreview =
        ['localhost', '127.0.0.1', '0.0.0.0'].includes(window.location.hostname) ||
        window.location.protocol === 'file:';

      if (isStaticPreview) {
        renderEvents([]);
        return;
      }

      try {
        const response = await fetch('/api/events?limit=4', {
          cache: 'default',
        });

        if (!response.ok) {
          throw new Error('events_not_available');
        }

        const payload = await response.json();
        renderEvents(Array.isArray(payload.events) ? payload.events : []);
      } catch {
        renderEvents([]);
      }
    };

    loadEvents();
  }

  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  if (!('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  let revealedAny = false;
  const markVisible = (el) => {
    if (!el.classList.contains('is-visible')) {
      el.classList.add('is-visible');
      revealedAny = true;
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          markVisible(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0 }
  );

  const revealInView = () => {
    reveals.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        markVisible(el);
        observer.unobserve(el);
      }
    });
  };

  reveals.forEach((el) => observer.observe(el));

  requestAnimationFrame(revealInView);
  window.addEventListener(
    'hashchange',
    () => requestAnimationFrame(revealInView),
    { passive: true }
  );

  setTimeout(() => {
    if (!revealedAny) {
      reveals.forEach(markVisible);
    }
  }, 1200);
})();

