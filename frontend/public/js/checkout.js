// ─────────────────────────────────────────────────────────
// FERVOR Bookstore — Checkout Page
// ─────────────────────────────────────────────────────────

import { api } from '/shared/js/api.js';
import { $, show, hide, html, text, setLoading, setContent, formatPrice } from '/shared/js/dom.js';

/**
 * Initialize the checkout page (/pages/checkout.html).
 */
export function initCheckoutPage() {
  // ─── DOM refs ──────────────────────────────────────

  const loadingEl = $('checkout-loading');
  const errorEl = $('checkout-error');
  const contentEl = $('checkout-content');
  const retryBtn = $('checkout-retry');
  const itemsEl = $('checkout-items');
  const subtotalEl = $('checkout-subtotal');
  const totalEl = $('checkout-total');
  const form = $('checkout-form');
  const payBtn = $('btn-pay');
  const globalError = $('checkout-global-error');
  const globalErrorText = $('checkout-global-error-text');

  // ─── Field definitions for validation ──────────────

  const fields = [
    { id: 'ship-first', label: 'Nombre' },
    { id: 'ship-last', label: 'Apellido' },
    { id: 'ship-address', label: 'Dirección' },
    { id: 'ship-city', label: 'Ciudad' },
    { id: 'ship-state', label: 'Departamento' },
    { id: 'ship-zip', label: 'Código postal' },
  ];

  // ─── Load cart summary ──────────────────────────────

  async function loadSummary() {
    setLoading('checkout-loading', 'checkout-error', 'checkout-content');

    try {
      const res = await api('/api/cart');

      if (!res.success || !res.data) {
        throw new Error(res.error?.message || 'No se pudo cargar el resumen.');
      }

      const cart = res.data;
      const items = cart.items || [];

      if (items.length === 0) {
        window.location.href = '/pages/cart.html';
        return;
      }

      renderItems(items);
      text('checkout-subtotal', formatPrice(cart.subtotal || 0));
      text('checkout-total', formatPrice(cart.total || cart.subtotal || 0));

      setContent('checkout-loading', 'checkout-error', 'checkout-content');

    } catch (err) {
      show('checkout-error');
      hide('checkout-loading');
      hide('checkout-content');
      const msgEl = errorEl?.querySelector('p');
      if (msgEl) msgEl.textContent = err.message;
    }
  }

  // ─── Render summary items ───────────────────────────

  function renderItems(items) {
    itemsEl.innerHTML = items.map(item => {
      const book = item.book || {};
      const lineTotal = (item.unit_price || 0) * (item.quantity || 1);
      return `
        <li class="flex justify-between items-start">
          <div class="flex-1 min-w-0">
            <p class="font-sans text-body-md text-primary truncate">${book.name || 'Sin título'}</p>
            <p class="font-mono text-label-sm text-secondary">Qty: ${item.quantity}</p>
          </div>
          <span class="font-mono text-label-sm font-bold text-primary ml-4 whitespace-nowrap">${formatPrice(lineTotal)}</span>
        </li>
      `;
    }).join('');
  }

  // ─── Form validation ────────────────────────────────

  function clearErrors() {
    fields.forEach(f => {
      const errEl = $(f.id + '-error');
      if (errEl) {
        errEl.textContent = '';
        errEl.classList.add('hidden');
      }
      const input = $(f.id);
      if (input) input.classList.remove('checkout-field__input--error');
    });
    hide('checkout-global-error');
  }

  function showFieldError(id, message) {
    const errEl = $(id + '-error');
    if (errEl) {
      errEl.textContent = message;
      errEl.classList.remove('hidden');
    }
    const input = $(id);
    if (input) input.classList.add('checkout-field__input--error');
  }

  function validate() {
    clearErrors();
    let valid = true;

    fields.forEach(f => {
      const input = $(f.id);
      const val = input?.value.trim();
      if (!val) {
        showFieldError(f.id, `${f.label} es obligatorio.`);
        valid = false;
      }
    });

    return valid;
  }

  function getFormData() {
    const data = {};
    fields.forEach(f => {
      data[f.id.replace('ship-', '')] = $(f.id)?.value.trim() || '';
    });
    data.apt = $('ship-apt')?.value.trim() || '';
    return data;
  }

  // ─── Submit handler ─────────────────────────────────

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validate()) return;

    hide('checkout-global-error');
    payBtn.disabled = true;
    payBtn.textContent = 'Procesando...';

    try {
      const shipping = getFormData();
      const res = await api('/api/orders', {
        method: 'POST',
        body: { shipping },
      });

      if (!res.success || !res.data?.url) {
        throw new Error(res.error?.message || 'No se pudo iniciar el pago.');
      }

      // Redirect to Stripe Checkout
      window.location.href = res.data.url;

    } catch (err) {
      show('checkout-global-error');
      if (globalErrorText) globalErrorText.textContent = err.message;
      payBtn.disabled = false;
      payBtn.innerHTML = `
        <span class="material-symbols-outlined" style="font-size: 18px; vertical-align: middle; margin-right: 6px;">lock</span>
        Continuar al pago seguro
      `;
    }
  });

  // ─── Retry ──────────────────────────────────────────

  retryBtn?.addEventListener('click', loadSummary);

  // ─── Initial load ──────────────────────────────────

  loadSummary();
}
