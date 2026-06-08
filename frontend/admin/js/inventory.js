// ─────────────────────────────────────────────────────────
// FERVOR Bookstore — Admin Inventory (Book Table)
// ─────────────────────────────────────────────────────────
// Depende de: GET /api/admin/books
// Shape esperado:
//   { success, data: { books: [{ id, name, image_url, stock, price, category: { name } }] } }
// ─────────────────────────────────────────────────────────

import { api } from '/shared/js/api.js';
import { $, html } from '/shared/js/dom.js';

let booksCache = [];

const SKELETON_ROWS = `
  <tr><td colspan="6"><div class="skeleton skeleton--display" style="height:6rem;margin-bottom:0.75rem"></div></td></tr>
  <tr><td colspan="6"><div class="skeleton skeleton--display" style="height:6rem;margin-bottom:0.75rem"></div></td></tr>
  <tr><td colspan="6"><div class="skeleton skeleton--display" style="height:6rem;margin-bottom:0.75rem"></div></td></tr>
  <tr><td colspan="6"><div class="skeleton skeleton--display" style="height:6rem;margin-bottom:0.75rem"></div></td></tr>
  <tr><td colspan="6"><div class="skeleton skeleton--display" style="height:6rem"></div></td></tr>
`.trim();

export function initInventoryPage() {
  const tbody = $('inventoryTbody');
  if (!tbody) return;

  tbody.innerHTML = SKELETON_ROWS;

  loadBooks();

  const exportBtn = document.getElementById('export-csv-btn');
  exportBtn?.addEventListener('click', exportCSV);

  const addBtn = document.getElementById('add-book-btn');
  addBtn?.addEventListener('click', () => {
    alert('Funcionalidad pendiente — Añadir libro');
  });
}

async function loadBooks() {
  const tbody = $('inventoryTbody');
  if (!tbody) return;

  try {
    const res = await api('/api/admin/books');

    if (!res.success || !res.data?.books) {
      throw new Error(res.error?.message || 'Error al cargar inventario.');
    }

    const books = res.data.books;
    booksCache = books;

    if (books.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding:3rem;color:var(--color-secondary)">No hay libros registrados</td></tr>`;
      return;
    }

    tbody.innerHTML = books.map(book => `
      <tr>
        <td>
          <div class="table-cover">
            <img src="${book.image_url || 'https://picsum.photos/seed/admin-' + book.id + '/80/120'}" alt="${book.name}" loading="lazy" />
          </div>
        </td>
        <td>
          <div class="table-book-title">${book.name}</div>
          <div class="table-book-genre">${book.category?.name || 'Sin categoría'}</div>
        </td>
        <td class="table-cell-mono">${book.category?.name || '—'}</td>
        <td class="table-cell-mono ${book.stock === 0 ? 'table-cell-mono--error' : ''}">${book.stock}</td>
        <td class="table-cell-mono ${book.stock === 0 ? 'table-cell-mono--error' : ''}">${book.stock > 0 ? 'Disponible' : 'Agotado'}</td>
        <td>
          <div class="table-actions">
            <button class="table-action-btn table-action-btn--edit material-symbols-outlined" title="Editar" data-id="${book.id}">edit</button>
            <button class="table-action-btn table-action-btn--delete material-symbols-outlined" title="Eliminar" data-id="${book.id}">delete</button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.table-action-btn--edit').forEach(btn => {
      btn.addEventListener('click', () => alert('Editar libro — pendiente'));
    });
    tbody.querySelectorAll('.table-action-btn--delete').forEach(btn => {
      btn.addEventListener('click', () => alert('Eliminar libro — pendiente'));
    });

  } catch (err) {
    tbody.innerHTML = `
      <tr><td colspan="6" class="text-center" style="padding:3rem">
        <span style="color:var(--color-error);font-family:var(--font-mono);font-size:12px">${err.message}</span>
        <br><br>
        <button class="btn btn--outline" onclick="initInventoryPage()">Reintentar</button>
      </td></tr>
    `;
  }
}

function exportCSV() {
  if (booksCache.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  const header = 'Título,Categoría,Stock,Precio';
  const rows = booksCache.map(b =>
    `"${b.name}","${b.category?.name || ''}",${b.stock},${b.price}`
  ).join('\n');

  const blob = new Blob([header + '\n' + rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'inventario.csv';
  a.click();
  URL.revokeObjectURL(url);
}
