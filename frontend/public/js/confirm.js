// ─────────────────────────────────────────────────────────
// FERVOR Bookstore — Order Confirmation Page
// ─────────────────────────────────────────────────────────

import { api } from './api.js';
import { $, text, show, hide } from './dom.js';

/**
 * Initialize the order confirmation page (/pages/order-confirmation.html).
 * Reads `session_id` from URL params and verifies the payment.
 */
export function initConfirmPage() {
  const params = new URLSearchParams(location.search);
  const sessionId = params.get('session_id');

  if (!sessionId) {
    show('confirm-error');
    hide('confirm-loading');
    const detailEl = $('error-detail');
    if (detailEl) detailEl.textContent = 'No se proporcionó un identificador de sesión.';
    return;
  }

  // ─── Verify payment ─────────────────────────────────

  async function verifyPayment() {
    try {
      const res = await api(`/api/payments/verify?session_id=${encodeURIComponent(sessionId)}`);

      if (!res.success || !res.data) {
        throw new Error(res.error?.message || 'No se pudo verificar el pago.');
      }

      const data = res.data;

      text('confirm-order-id', data.order?.id || '—');
      text('confirm-receipt', data.receipt || '—');
      text('confirm-amount', data.amount ? `$${data.amount}` : '—');
      text('confirm-currency', data.currency || '—');
      text('confirm-date', data.date || '—');

      show('confirm-success');
      hide('confirm-loading');

    } catch (err) {
      show('confirm-error');
      hide('confirm-loading');
      const detailEl = $('error-detail');
      if (detailEl) detailEl.textContent = err.message;
    }
  }

  verifyPayment();
}
