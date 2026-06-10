import { api } from '/shared/js/api.js';
import { $ } from '/shared/js/dom.js';

let booksCache = [];
let editingBookId = null;

const SKELETON_ROWS = `
  <tr><td colspan="7"><div class="skeleton skeleton--display" style="height:6rem;margin-bottom:0.75rem"></div></td></tr>
  <tr><td colspan="7"><div class="skeleton skeleton--display" style="height:6rem;margin-bottom:0.75rem"></div></td></tr>
  <tr><td colspan="7"><div class="skeleton skeleton--display" style="height:6rem;margin-bottom:0.75rem"></div></td></tr>
  <tr><td colspan="7"><div class="skeleton skeleton--display" style="height:6rem;margin-bottom:0.75rem"></div></td></tr>
  <tr><td colspan="7"><div class="skeleton skeleton--display" style="height:6rem"></div></td></tr>
`.trim();

export function initInventoryPage() {
  const tbody = $('inventoryTbody');
  if (!tbody) return;

  tbody.innerHTML = SKELETON_ROWS;

  loadBooks();

  $('export-csv-btn')?.addEventListener('click', exportCSV);
  $('add-book-btn')?.addEventListener('click', () => showBookModal());

  $('modal-close')?.addEventListener('click', closeBookModal);
  $('modal-cancel')?.addEventListener('click', closeBookModal);
  $('book-form')?.addEventListener('submit', handleSaveBook);

  document.getElementById('book-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeBookModal();
  });
}

// ─── Load books ──────────────────────────────────────

async function loadBooks() {
  const tbody = $('inventoryTbody');
  if (!tbody) return;

  try {
    const res = await api('/api/books', { params: { limit: 100 } });

    if (!res.success || !res.data?.length) {
      throw new Error(res.error?.message || 'Error al cargar inventario.');
    }

    const books = res.data;
    booksCache = books;

    if (books.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding:3rem;color:var(--color-secondary)">No hay libros registrados</td></tr>`;
      return;
    }

    tbody.innerHTML = books.map(book => `
      <tr>
        <td>
          <div class="table-cover">
            <img src="${book.imageUrl || 'https://picsum.photos/seed/admin-' + book.id + '/80/120'}" alt="${book.name}" loading="lazy" />
          </div>
        </td>
        <td>
          <div class="table-book-title">${book.name}</div>
          <div class="table-book-genre">${book.category?.name || 'Sin categoría'}</div>
        </td>
        <td class="table-cell-mono">${book.category?.name || '—'}</td>
        <td class="table-cell-mono">$${Number(book.price).toFixed(2)}</td>
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
      btn.addEventListener('click', () => {
        const book = booksCache.find(b => b.id === btn.dataset.id);
        if (book) showBookModal(book);
      });
    });
    tbody.querySelectorAll('.table-action-btn--delete').forEach(btn => {
      btn.addEventListener('click', () => handleDeleteBook(btn.dataset.id));
    });

  } catch (err) {
    tbody.innerHTML = `
      <tr><td colspan="7" class="text-center" style="padding:3rem">
        <span style="color:var(--color-error);font-family:var(--font-mono);font-size:12px">${err.message}</span>
        <br><br>
        <button class="btn btn--outline" onclick="initInventoryPage()">Reintentar</button>
      </td></tr>
    `;
  }
}

// ─── Modal ───────────────────────────────────────────

async function showBookModal(book) {
  const modal = $('book-modal');
  const form = $('book-form');
  const titleEl = $('modal-title');
  const errorEl = $('modal-error');

  errorEl.classList.add('hidden');
  form.reset();
  editingBookId = null;

  titleEl.textContent = book ? 'Editar libro' : 'Añadir libro';

  await Promise.all([loadAuthors(), loadCategories()]);

  if (book) {
    editingBookId = book.id;
    $('book-name').value = book.name || '';
    $('book-author').value = book.authorId || '';
    $('book-category').value = book.categoryId || '';
    $('book-price').value = book.price ?? '';
    $('book-stock').value = book.stock ?? '';
    $('book-language').value = book.language || 'Español';
    $('book-date').value = book.publicationDate ? book.publicationDate.slice(0, 10) : '';
    $('book-image').value = book.imageUrl || '';
    $('book-desc').value = book.description || '';
  }

  modal.classList.remove('hidden');
}

function closeBookModal() {
  $('book-modal')?.classList.add('hidden');
  $('book-form')?.reset();
  $('modal-error')?.classList.add('hidden');
  editingBookId = null;
}

// ─── Save (Create / Update) ─────────────────────────

async function handleSaveBook(e) {
  e.preventDefault();
  const errorEl = $('modal-error');
  errorEl.classList.add('hidden');

  const data = {
    name: $('book-name').value.trim(),
    authorId: $('book-author').value,
    categoryId: $('book-category').value,
    price: parseFloat($('book-price').value),
    stock: parseInt($('book-stock').value, 10),
    language: $('book-language').value.trim() || 'Español',
    publicationDate: $('book-date').value || undefined,
    imageUrl: $('book-image').value.trim() || undefined,
    description: $('book-desc').value.trim() || undefined,
  };

  if (!data.name) { showModalError('El nombre es obligatorio.'); return; }
  if (!data.authorId) { showModalError('Selecciona un autor.'); return; }
  if (!data.categoryId) { showModalError('Selecciona una categoría.'); return; }
  if (isNaN(data.price) || data.price < 0) { showModalError('El precio debe ser un número válido.'); return; }
  if (!Number.isInteger(data.stock) || data.stock < 0) { showModalError('El stock debe ser un número entero válido.'); return; }

  const saveBtn = $('modal-save');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Guardando...';

  try {
    let res;
    if (editingBookId) {
      res = await api(`/api/books/${editingBookId}`, { method: 'PUT', body: data });
    } else {
      res = await api('/api/books', { method: 'POST', body: data });
    }

    if (res.success) {
      closeBookModal();
      loadBooks();
    } else {
      showModalError(res.message || 'Error al guardar el libro.');
    }
  } catch (err) {
    showModalError(err.message);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Guardar';
  }
}

function showModalError(msg) {
  const el = $('modal-error');
  if (el) { el.textContent = msg; el.classList.remove('hidden'); }
}

// ─── Delete ─────────────────────────────────────────

async function handleDeleteBook(id) {
  if (!confirm('¿Eliminar este libro? Esta acción no se puede deshacer.')) return;

  try {
    const res = await api(`/api/books/${id}`, { method: 'DELETE' });
    if (res.success) {
      loadBooks();
    } else {
      alert(res.message || 'Error al eliminar el libro.');
    }
  } catch (err) {
    alert(err.message);
  }
}

// ─── Load selects ───────────────────────────────────

async function loadAuthors() {
  try {
    const res = await api('/api/authors');
    if (res.success && res.data?.length) {
      const opts = res.data.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
      $('book-author').innerHTML = '<option value="">Seleccionar autor</option>' + opts;
    }
  } catch { /* silent */ }
}

async function loadCategories() {
  try {
    const res = await api('/api/categories');
    if (res.success && res.data?.length) {
      const opts = res.data.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      $('book-category').innerHTML = '<option value="">Seleccionar categoría</option>' + opts;
    }
  } catch { /* silent */ }
}

// ─── Export CSV ─────────────────────────────────────

function exportCSV() {
  if (booksCache.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  const header = 'Título,Precio,Stock,Categoría';
  const rows = booksCache.map(b =>
    `"${b.name}",${b.price},${b.stock},"${b.category?.name || ''}"`
  ).join('\n');

  const blob = new Blob([header + '\n' + rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'inventario.csv';
  a.click();
  URL.revokeObjectURL(url);
}
