(() => {
  if (!document.body.classList.contains('page-store')) {
    return;
  }

  const STORE = {
    live: false,
    checkoutEndpoint: '/api/create-checkout-session',
    currency: 'EUR',
    locale: 'nl-BE',
    vatRate: 0.21,
    shipping: {
      BE: 6.95,
      EU: 12.95,
      INT: 19.95,
      freeOver: 120
    }
  };

  const cartDrawer = document.getElementById('cart-drawer');
  const cartBackdrop = document.getElementById('cart-backdrop');
  const cartItemsEl = document.getElementById('cart-items');
  const cartEmptyEl = document.getElementById('cart-empty');
  const cartCountEl = document.getElementById('cart-count');
  const subtotalEl = document.getElementById('cart-subtotal');
  const shippingEl = document.getElementById('cart-shipping');
  const vatEl = document.getElementById('cart-vat');
  const totalEl = document.getElementById('cart-total');
  const shippingSelect = document.getElementById('shipping-region');
  const checkoutBtn = document.getElementById('checkout-btn');
  const checkoutNote = document.getElementById('checkout-note');
  const termsAccept = document.getElementById('terms-accept');

  let cart = loadCart();
  let checkoutBusy = false;

  const formatter = new Intl.NumberFormat(STORE.locale, {
    style: 'currency',
    currency: STORE.currency
  });

  function roundMoney(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  function formatMoney(value) {
    return formatter.format(value);
  }

  function loadCart() {
    try {
      const raw = localStorage.getItem('kweker-cart');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem('kweker-cart', JSON.stringify(cart));
    } catch {
      // ignore storage errors
    }
  }

  function getShipping(subtotal) {
    const region = shippingSelect ? shippingSelect.value : 'BE';
    let base = STORE.shipping[region];
    if (typeof base !== 'number') {
      base = STORE.shipping.BE;
    }
    if (subtotal >= STORE.shipping.freeOver) {
      base = 0;
    }
    return roundMoney(base);
  }

  function getTotals() {
    const subtotal = roundMoney(
      cart.reduce((sum, item) => sum + item.price * item.qty, 0)
    );
    const shipping = getShipping(subtotal);
    const vat = roundMoney(subtotal * STORE.vatRate);
    const total = roundMoney(subtotal + shipping + vat);
    return { subtotal, shipping, vat, total };
  }

  function openCart() {
    if (cartDrawer) {
      cartDrawer.classList.add('is-open');
      cartDrawer.setAttribute('aria-hidden', 'false');
    }
    if (cartBackdrop) {
      cartBackdrop.classList.add('is-active');
    }
  }

  function closeCart() {
    if (cartDrawer) {
      cartDrawer.classList.remove('is-open');
      cartDrawer.setAttribute('aria-hidden', 'true');
    }
    if (cartBackdrop) {
      cartBackdrop.classList.remove('is-active');
    }
  }

  function updateCount() {
    if (!cartCountEl) return;
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCountEl.textContent = String(count);
  }

  function updateTotals() {
    const totals = getTotals();
    if (subtotalEl) subtotalEl.textContent = formatMoney(totals.subtotal);
    if (shippingEl) shippingEl.textContent = formatMoney(totals.shipping);
    if (vatEl) vatEl.textContent = formatMoney(totals.vat);
    if (totalEl) totalEl.textContent = formatMoney(totals.total);
  }

  function setCheckoutNote(message) {
    if (checkoutNote) {
      checkoutNote.textContent = message;
    }
  }

  function updateCheckoutState() {
    if (!checkoutBtn) return;

    const hasItems = cart.length > 0;
    const termsOk = termsAccept ? termsAccept.checked : true;
    const canCheckout = STORE.live && hasItems && termsOk && !checkoutBusy;
    checkoutBtn.disabled = !canCheckout;

    if (checkoutBusy) {
      setCheckoutNote('Checkout voorbereiden...');
      return;
    }

    if (!STORE.live) {
      setCheckoutNote('Checkout opent zodra de drop live gaat.');
      return;
    }

    if (!hasItems) {
      setCheckoutNote('Voeg eerst items toe aan je mandje.');
      return;
    }

    if (!termsOk) {
      setCheckoutNote('Gelieve eerst akkoord te gaan met de voorwaarden.');
      return;
    }

    setCheckoutNote('Klaar om af te rekenen.');
  }

  function buildCartItem(item) {
    const li = document.createElement('li');
    li.className = 'cart-item';

    const info = document.createElement('div');
    info.className = 'cart-item-info';

    const name = document.createElement('strong');
    name.textContent = item.name;

    const variant = document.createElement('span');
    variant.className = 'cart-item-variant';
    variant.textContent = item.variant;

    const price = document.createElement('span');
    price.className = 'cart-item-price';
    price.textContent = formatMoney(item.price);

    info.appendChild(name);
    info.appendChild(variant);
    info.appendChild(price);

    const controls = document.createElement('div');
    controls.className = 'cart-item-controls';

    const minus = document.createElement('button');
    minus.type = 'button';
    minus.className = 'qty-btn';
    minus.textContent = '-';
    minus.dataset.action = 'decrease';
    minus.dataset.key = item.key;

    const qty = document.createElement('span');
    qty.className = 'qty';
    qty.textContent = String(item.qty);

    const plus = document.createElement('button');
    plus.type = 'button';
    plus.className = 'qty-btn';
    plus.textContent = '+';
    plus.dataset.action = 'increase';
    plus.dataset.key = item.key;

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'link-btn';
    remove.textContent = 'Verwijder';
    remove.dataset.action = 'remove';
    remove.dataset.key = item.key;

    controls.appendChild(minus);
    controls.appendChild(qty);
    controls.appendChild(plus);
    controls.appendChild(remove);

    li.appendChild(info);
    li.appendChild(controls);
    return li;
  }

  function renderCart() {
    if (!cartItemsEl || !cartEmptyEl) return;

    cartItemsEl.innerHTML = '';
    if (cart.length === 0) {
      cartEmptyEl.style.display = 'block';
    } else {
      cartEmptyEl.style.display = 'none';
      cart.forEach((item) => cartItemsEl.appendChild(buildCartItem(item)));
    }

    updateTotals();
    updateCount();
    updateCheckoutState();
    saveCart();
  }

  function addItem(data) {
    const existing = cart.find((item) => item.key === data.key);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        key: data.key,
        id: data.id,
        name: data.name,
        variant: data.variant,
        price: data.price,
        qty: 1
      });
    }
    renderCart();
  }

  function updateItemQty(key, delta) {
    cart = cart
      .map((item) => {
        if (item.key === key) {
          return {
            key: item.key,
            id: item.id,
            name: item.name,
            variant: item.variant,
            price: item.price,
            qty: item.qty + delta
          };
        }
        return item;
      })
      .filter((item) => item.qty > 0);
    renderCart();
  }

  function removeItem(key) {
    cart = cart.filter((item) => item.key !== key);
    renderCart();
  }

  function buildCheckoutPayload() {
    return {
      items: cart.map((item) => ({
        id: item.id,
        name: `${item.name} - ${item.variant}`,
        price: item.price,
        qty: item.qty
      }))
    };
  }

  async function startCheckout() {
    if (!STORE.live || checkoutBusy) return;

    const hasItems = cart.length > 0;
    const termsOk = termsAccept ? termsAccept.checked : true;
    if (!hasItems || !termsOk) {
      updateCheckoutState();
      return;
    }

    checkoutBusy = true;
    updateCheckoutState();

    try {
      const response = await fetch(STORE.checkoutEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(buildCheckoutPayload())
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.url) {
        throw new Error(payload.message || payload.error || 'checkout_failed');
      }

      window.location.href = payload.url;
    } catch {
      setCheckoutNote('Checkout kon niet worden gestart. Mail info@kwkr.be om je bestelling te regelen.');
    } finally {
      checkoutBusy = false;
      updateCheckoutState();
    }
  }

  document.querySelectorAll('[data-cart-open]').forEach((button) => {
    button.addEventListener('click', openCart);
  });

  document.querySelectorAll('[data-cart-close]').forEach((button) => {
    button.addEventListener('click', closeCart);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeCart();
    }
  });

  document.querySelectorAll('.add-to-cart').forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('.product-card');
      if (!card) return;

      const id = card.dataset.productId;
      const name = card.dataset.productName;
      const price = Number(card.dataset.productPrice || 0);
      if (!id || !name || !Number.isFinite(price) || price <= 0) return;

      const sizeSelect = card.querySelector("select[name='size']");
      const colorSelect = card.querySelector("select[name='color']");
      const size = sizeSelect ? sizeSelect.value : 'One size';
      const color = colorSelect ? colorSelect.value : 'Standard';
      const variant = `${size} / ${color}`;
      const key = `${id}::${variant}`;

      addItem({
        key,
        id,
        name,
        variant,
        price
      });
      openCart();
    });
  });

  if (cartItemsEl) {
    cartItemsEl.addEventListener('click', (event) => {
      const button = event.target.closest('button');
      if (!button) return;
      const action = button.dataset.action;
      const key = button.dataset.key;
      if (!action || !key) return;

      if (action === 'increase') updateItemQty(key, 1);
      if (action === 'decrease') updateItemQty(key, -1);
      if (action === 'remove') removeItem(key);
    });
  }

  if (shippingSelect) {
    shippingSelect.addEventListener('change', () => {
      updateTotals();
      updateCheckoutState();
    });
  }

  if (termsAccept) {
    termsAccept.addEventListener('change', updateCheckoutState);
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', (event) => {
      event.preventDefault();
      startCheckout();
    });
  }

  renderCart();
})();
