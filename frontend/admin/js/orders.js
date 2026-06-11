// ─────────────────────────────────────────────────────────
// FERVOR Bookstore — Admin Orders (Filterable Table)
// ─────────────────────────────────────────────────────────
// Depende de: GET /api/admin/orders?status=<filter>
// Shape esperado por pedido:
//   { id, customer: { name, email }, items, total, status, created_at }
// ─────────────────────────────────────────────────────────

import { api } from '/shared/js/api.js';
import { $, html } from '/shared/js/dom.js';

let ordersCache = [];
let currentFilter = 'all';
let currentPage = 1;
let totalPages = 1;

const STATUS_LABELS = {
  all: 'Todos',
  pending: 'Pendiente',
  processing: 'En proceso',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const SKELETON_ROWS = `
  <tr><td colspan="7"><div class="skeleton skeleton--display" style="height:4rem;margin-bottom:0.75rem"></div></td></tr>
  <tr><td colspan="7"><div class="skeleton skeleton--display" style="height:4rem;margin-bottom:0.75rem"></div></td></tr>
  <tr><td colspan="7"><div class="skeleton skeleton--display" style="height:4rem;margin-bottom:0.75rem"></div></td></tr>
  <tr><td colspan="7"><div class="skeleton skeleton--display" style="height:4rem;margin-bottom:0.75rem"></div></td></tr>
  <tr><td colspan="7"><div class="skeleton skeleton--display" style="height:4rem"></div></td></tr>
`.trim();

export function initOrdersPage() {
  const tbody = $('ordersTbody');
  if (!tbody) return;

  tbody.innerHTML = SKELETON_ROWS;

  // Setup filter buttons
  document.querySelectorAll('.orders-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.orders-filter-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      currentFilter = btn.dataset.filter || 'all';
      tbody.innerHTML = SKELETON_ROWS;
      loadOrders();
    });
  });

  // Export CSV
  document.getElementById('exportOrdersBtn')?.addEventListener('click', exportCSV);

  // Pagination
  document.getElementById('orders-prev')?.addEventListener('click', () => {
    if (currentPage > 1) { currentPage--; loadOrders(); }
  });
  document.getElementById('orders-next')?.addEventListener('click', () => {
    if (currentPage < totalPages) { currentPage++; loadOrders(); }
  });

  loadOrders();
}

async function loadOrders() {
  const tbody = $('ordersTbody');
  if (!tbody) return;

  try {
    const params = { page: currentPage, limit: 15 };
    if (currentFilter !== 'all') params.status = currentFilter;
    const res = await api('/api/admin/orders', { params });

    if (!res.success || !res.data?.orders) {
      throw new Error(res.error?.message || 'Error al cargar pedidos.');
    }

    const orders = res.data.orders;
    const meta = res.data.meta;
    ordersCache = orders;
    totalPages = meta?.totalPages || 1;

    const pageInfo = document.getElementById('orders-page-info');
    if (pageInfo) pageInfo.textContent = `Página ${meta?.page || currentPage} de ${totalPages}`;
    const prevBtn = document.getElementById('orders-prev');
    const nextBtn = document.getElementById('orders-next');
    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;

    if (orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding:3rem;color:var(--color-secondary)">No hay pedidos ${currentFilter !== 'all' ? `con estado "${STATUS_LABELS[currentFilter]}"` : ''}</td></tr>`;
      return;
    }

    tbody.innerHTML = orders.map(order => {
      const statusLabel = STATUS_LABELS[order.status] || order.status;
      return `
        <tr>
          <td class="table-cell-mono">#${order.id}</td>
          <td>
            <div style="font-family:var(--font-sans);color:var(--color-primary)">${order.customer?.name || '—'}</div>
            <div class="table-book-isbn">${order.customer?.email || ''}</div>
          </td>
          <td class="table-cell-mono">${order.items ?? '—'}</td>
          <td class="table-cell-mono">$${(order.total ?? 0).toLocaleString('es-CO')}</td>
          <td><span class="orders-filter-btn is-active" style="cursor:default;padding:0.25rem 0.75rem;font-size:11px" data-filter="${order.status}">${statusLabel}</span></td>
          <td class="table-cell-mono">${formatDate(order.created_at)}</td>
          <td>
            <div class="table-actions">
              <button class="table-action-btn material-symbols-outlined" title="Ver detalle" data-id="${order.id}" style="cursor:pointer">visibility</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.table-action-btn').forEach(btn => {
      btn.addEventListener('click', () => alert(`Ver detalle del pedido #${btn.dataset.id} — pendiente`));
    });

  } catch (err) {
    tbody.innerHTML = `
      <tr><td colspan="7" class="text-center" style="padding:3rem">
        <span style="color:var(--color-error);font-family:var(--font-mono);font-size:12px">${err.message}</span>
        <br><br>
        <button class="btn btn--outline" onclick="initOrdersPage()">Reintentar</button>
      </td></tr>
    `;
  }
}

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('es-CO', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    });
  } catch {
    return '—';
  }
}

function exportCSV() {
  if (ordersCache.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  const header = 'Pedido,Cliente,Email,Ítems,Total,Estado,Fecha';
  const rows = ordersCache.map(o =>
    `#${o.id},"${o.customer?.name || ''}","${o.customer?.email || ''}",${o.items ?? ''},${o.total ?? ''},${STATUS_LABELS[o.status] || o.status},${o.created_at || ''}`
  ).join('\n');

  const blob = new Blob(['\uFEFF' + header + '\n' + rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pedidos.csv';
  a.click();
  URL.revokeObjectURL(url);
}
