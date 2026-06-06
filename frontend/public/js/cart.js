// ─────────────────────────────────────────────────────────
// FERVOR Bookstore — Cart Page
// ─────────────────────────────────────────────────────────

import { api } from './api.js';
import { $, show, hide, html, text, setLoading, setContent } from './dom.js';
import { formatPrice } from './dom.js';
import { createBookCard } from './ui.js';

/**
 * Initialize the cart page (/pages/cart.html).
 */
export function initCartPage() {
  // ─── State ───────────────────────────────────────────

  let items = [];
  let subtotal = 0;
  let total = 0;

  // ─── DOM refs ──────────────────────────────────────

  const loadingEl = $('cart-loading');
  const errorEl = $('cart-error');
  const emptyEl = $('cart-empty');
  const contentEl = $('cart-content');
  const itemsEl = $('cart-items');
  const retryBtn = $('cart-retry');
  const subtotalEl = $('summary-subtotal');
  const totalEl = $('summary-total');
  const checkoutBtn = $('btn-checkout');

  // ─── Fetch cart ─────────────────────────────────────

  async function loadCart() {
    setLoading('cart-loading', 'cart-error', 'cart-content');
    hide('cart-empty');

    try {
      const res = await api('/api/cart');

      if (!res.success || !res.data) {
        throw new Error(res.error?.message || 'No se pudo cargar el carrito.');
      }

      const cart = res.data;
      items = cart.items || [];
      subtotal = cart.subtotal || 0;
      total = cart.total || subtotal;

      if (items.length === 0) {
        show('cart-empty');
        hide('cart-loading');
        hide('cart-content');
        return;
      }

      renderItems();
      renderSummary();
      setContent('cart-loading', 'cart-error', 'cart-content');

    } catch (err) {
      show('cart-error');
      hide('cart-loading');
      hide('cart-content');
      hide('cart-empty');
      const msgEl = errorEl?.querySelector('p');
      if (msgEl) msgEl.textContent = err.message;
    }
  }

  // ─── Render items ───────────────────────────────────

  function renderItems() {
    itemsEl.innerHTML = items.map(item => {
      const book = item.book || {};
      const lineTotal = (item.unit_price || 0) * (item.quantity || 1);
      const image = book.image_url || 'https://picsum.photos/seed/cart-' + (book.id || item.id) + '/80/80';

      return `
        <li class="cart-item" data-item-id="${item.id}">
          <img class="cart-item__cover" src="${image}" alt="${book.name || 'Libro'}" loading="lazy" />
          <div class="cart-item__info">
            <a href="/pages/book-detail.html?id=${book.id}" class="no-underline">
              <h3 class="cart-item__title">${book.name || 'Sin título'}</h3>
            </a>
            <p class="cart-item__author">${book.author?.name || ''}</p>
            <p class="cart-item__price">${formatPrice(item.unit_price)}</p>
          </div>
          <div class="cart-item__actions">
            <div class="cart-stepper">
              <button class="cart-stepper__btn dec-btn" aria-label="Reducir cantidad">−</button>
              <span class="cart-stepper__value">${item.quantity}</span>
              <button class="cart-stepper__btn inc-btn" aria-label="Aumentar cantidad">+</button>
            </div>
            <button class="cart-item__remove" aria-label="Eliminar">
              <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
            </button>
          </div>
          <div class="cart-item__line-total">
            <span class="font-mono text-label-sm font-bold text-primary">${formatPrice(lineTotal)}</span>
          </div>
        </li>
      `;
    }).join('');

    // Attach event listeners for quantity stepper and remove
    itemsEl.querySelectorAll('.cart-item').forEach(li => {
      const itemId = li.dataset.itemId;
      const decBtn = li.querySelector('.dec-btn');
      const incBtn = li.querySelector('.inc-btn');
      const valEl = li.querySelector('.cart-stepper__value');
      const removeBtn = li.querySelector('.cart-item__remove');

      decBtn?.addEventListener('click', () => updateQuantity(itemId, parseInt(valEl.textContent) - 1));
      incBtn?.addEventListener('click', () => updateQuantity(itemId, parseInt(valEl.textContent) + 1));
      removeBtn?.addEventListener('click', () => removeItem(itemId));
    });
  }

  // ─── Quantity update ────────────────────────────────

  async function updateQuantity(itemId, newQty) {
    if (newQty < 1) {
      await removeItem(itemId);
      return;
    }

    try {
      const res = await api(`/api/cart/items/${itemId}`, {
        method: 'PATCH',
        body: { quantity: newQty },
      });

      if (res.success) {
        await loadCart();
      } else {
        throw new Error(res.error?.message || 'No se pudo actualizar la cantidad.');
      }
    } catch (err) {
      // Revert on error — just reload cart to show original state
      await loadCart();
    }
  }

  // ─── Remove item ────────────────────────────────────

  async function removeItem(itemId) {
    try {
      const res = await api(`/api/cart/items/${itemId}`, { method: 'DELETE' });

      if (res.success) {
        await loadCart();
      } else {
        throw new Error(res.error?.message || 'No se pudo eliminar el artículo.');
      }
    } catch (err) {
      await loadCart();
    }
  }

  // ─── Render summary ─────────────────────────────────

  function renderSummary() {
    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (totalEl) totalEl.textContent = formatPrice(total);
  }

  // ─── Checkout button ────────────────────────────────

  checkoutBtn?.addEventListener('click', () => {
    window.location.href = '/pages/checkout.html';
  });

  // ─── Retry ──────────────────────────────────────────

  retryBtn?.addEventListener('click', loadCart);

  // ─── Initial load ──────────────────────────────────

  loadCart();
}
