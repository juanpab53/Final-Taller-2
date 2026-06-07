// ─────────────────────────────────────────────────────────
// FERVOR Bookstore — Admin Dashboard (Stat Cards)
// ─────────────────────────────────────────────────────────
// Depende de: GET /api/admin/stats
// Shape esperado:
//   { success, data: { cancellationRate, dailyRevenue, monthlyRevenue, lowStockCount } }
// ─────────────────────────────────────────────────────────

import { api } from '/shared/js/api.js';
import { $, text, show, hide } from '/shared/js/dom.js';

const STATS = [
  {
    loading: 'cancellation-loading',
    error: 'cancellation-error',
    data: 'cancellation-data',
    value: 'cancellation-value',
    key: 'cancellationRate',
    format: (v) => `${v}%`,
  },
  {
    loading: 'daily-loading',
    error: 'daily-error',
    data: 'daily-data',
    value: 'daily-value',
    key: 'dailyRevenue',
    format: (v) => `$${Number(v).toLocaleString('es-CO')}`,
  },
  {
    loading: 'monthly-loading',
    error: 'monthly-error',
    data: 'monthly-data',
    value: 'monthly-value',
    key: 'monthlyRevenue',
    format: (v) => `$${Number(v).toLocaleString('es-CO')}`,
  },
  {
    loading: 'lowstock-loading',
    error: 'lowstock-error',
    data: 'lowstock-data',
    value: 'lowstock-value',
    key: 'lowStockCount',
    format: (v) => String(v),
  },
];

export function initDashboardPage() {
  loadStats();
}

async function loadStats() {
  try {
    const res = await api('/api/admin/stats');

    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Error al cargar estadísticas.');
    }

    const stats = res.data;

    STATS.forEach((card) => {
      const val = stats[card.key];
      if (val !== undefined && val !== null) {
        text(card.value, card.format(val));
        show(card.data);
        hide(card.loading);
        hide(card.error);
      } else {
        show(card.error);
        hide(card.loading);
        hide(card.data);
      }
    });
  } catch {
    STATS.forEach((card) => {
      show(card.error);
      hide(card.loading);
      hide(card.data);
    });
  }
}
