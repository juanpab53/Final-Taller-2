// ─────────────────────────────────────────────────────────
// FERVOR Bookstore — Book Detail Page
// ─────────────────────────────────────────────────────────

import { api } from '/shared/js/api.js';
import { $, text, attr, html, show, hide, setLoading, setContent, formatPrice } from '/shared/js/dom.js';

/**
 * Initialize the book detail page (/pages/book-detail.html).
 * Fetches book by URL param `id` and populates all fields.
 */
export function initDetailPage() {
  const params = new URLSearchParams(location.search);
  const bookId = params.get('id');

  if (!bookId) {
    show('detail-error');
    const p = document.querySelector('#detail-error p');
    if (p) p.textContent = 'No se especificó un libro válido.';
    return;
  }

  // ─── Cache DOM refs ─────────────────────────────────

  const loadingEl = $('detail-loading');
  const errorEl = $('detail-error');
  const contentEl = $('detail-content');

  const coverImg = $('book-cover');
  const categoryEl = $('book-category');
  const titleEl = $('book-title');
  const authorEl = $('book-author');
  const priceEl = $('book-price');
  const descEl = $('book-description');
  const addBtn = $('btn-add-to-cart');
  const specsBody = $('specs-body');
  const breadcrumbTitle = $('breadcrumb-title');

  // ─── Fetch & render ─────────────────────────────────

  async function loadBook() {
    setLoading('detail-loading', 'detail-error', 'detail-content');

    try {
      const res = await api(`/api/books/${bookId}`);

      if (!res.success || !res.data?.book) {
        throw new Error(res.error?.message || 'No se pudo cargar el libro.');
      }

      const book = res.data.book;

      // Breadcrumb
      if (breadcrumbTitle) breadcrumbTitle.textContent = book.name;

      // Cover
      attr(coverImg, 'src', book.image_url || '');
      attr(coverImg, 'alt', book.name || 'Portada del libro');

      // Content
      text('book-category', book.category?.name || '');
      text('book-title', book.name || '');
      text('book-author', book.author?.name || '');
      text('book-description', book.description || '');
      if (priceEl) priceEl.textContent = formatPrice(book.price);

      // Add-to-cart data attribute for later use
      if (addBtn) {
        addBtn.dataset.bookId = book.id;
        addBtn.dataset.bookTitle = book.name;
      }

      // Specs
      renderSpecs(book);

      // Show content
      setContent('detail-loading', 'detail-error', 'detail-content');

    } catch (err) {
      const msgEl = errorEl?.querySelector('p');
      if (msgEl) msgEl.textContent = err.message;
      show('detail-error');
      hide('detail-loading', 'detail-content');
    }
  }

  // ─── Specs accordion ────────────────────────────────

  function renderSpecs(book) {
    const specs = [];

    if (book.publication_date) specs.push({ label: 'Fecha de publicación', value: book.publication_date });
    if (book.lenguage) specs.push({ label: 'Idioma', value: book.lenguage });
    if (book.stock !== undefined) specs.push({ label: 'Stock', value: String(book.stock) });

    if (specsBody) {
      if (specs.length === 0) {
        html('specs-body', '<p class="text-secondary text-body-sm">Sin especificaciones.</p>');
      } else {
        html('specs-body', specs.map(s =>
          `<div class="specs-row"><span class="specs-label">${s.label}</span><span class="specs-value">${s.value}</span></div>`
        ).join(''));
      }
    }
  }

  // ─── Add to cart ────────────────────────────────────

  addBtn?.addEventListener('click', async () => {
    const bookId = addBtn.dataset.bookId;
    if (!bookId) return;

    const token = localStorage.getItem('fervor-token');
    if (!token) {
      window.location.href = '/pages/login.html';
      return;
    }

    addBtn.disabled = true;
    addBtn.textContent = 'Agregando...';

    try {
      const res = await api('/api/cart/items', {
        method: 'POST',
        body: { bookId, quantity: 1 },
      });

      if (res.success) {
        addBtn.textContent = '✓ Agregado';
        addBtn.classList.add('btn--added');
        setTimeout(() => {
          addBtn.textContent = 'Agregar al carrito';
          addBtn.disabled = false;
          addBtn.classList.remove('btn--added');
        }, 2000);
      } else {
        throw new Error(res.error?.message || 'Error al agregar al carrito.');
      }
    } catch (err) {
      addBtn.textContent = 'Error';
      setTimeout(() => {
        addBtn.textContent = 'Agregar al carrito';
        addBtn.disabled = false;
      }, 1500);
    }
  });

  // ─── Start ──────────────────────────────────────────

  loadBook();
}
