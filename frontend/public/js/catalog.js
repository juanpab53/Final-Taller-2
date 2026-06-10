import { api } from '/shared/js/api.js';
import { $, show, hide, html, text, setLoading, setContent } from '/shared/js/dom.js';
import { createBookCard } from './ui.js';

const BOOKS_PER_PAGE = 8;

export function initCatalogPage() {
  const state = {
    query: '',
    authorId: '',
    authorName: '',
    categoryId: '',
    categoryName: '',
    page: 1,
    totalPages: 0,
  };

  const gridEl = $('books-grid');
  const loadingEl = $('books-loading');
  const errorEl = $('books-error');
  const emptyEl = $('books-empty');
  const contentEl = $('books-content');
  const retryBtn = $('books-retry');
  const emptyClearBtn = $('empty-clear');

  const tabSearch = $('tab-search');
  const tabFilter = $('tab-filter');
  const panelSearch = $('panel-search');
  const panelFilter = $('panel-filter');

  const searchInput = $('search-input');
  const searchClearBtn = $('search-clear');

  const filterAuthor = $('filter-author');
  const filterCategory = $('filter-category');
  const filterApplyBtn = $('filter-apply');
  const filterClearBtn = $('filter-clear');

  const chipEl = $('active-filter-chip');
  const chipLabel = $('active-filter-label');
  const chipClearBtn = $('chip-clear');

  const prevBtn = $('page-prev');
  const nextBtn = $('page-next');
  const pageInfo = $('page-info');
  const dotsEl = $('page-dots');

  // ─── Tab switching ─────────────────────────────────

  function switchTab(tab) {
    [tabSearch, tabFilter].forEach(btn => btn.classList.remove('catalog-tab--active'));
    const activeTab = tab === 'search' ? tabSearch : tabFilter;
    activeTab.classList.add('catalog-tab--active');

    if (tab === 'search') {
      show('panel-search');
      hide('panel-filter');
    } else {
      hide('panel-search');
      show('panel-filter');
    }
  }

  tabSearch?.addEventListener('click', () => switchTab('search'));
  tabFilter?.addEventListener('click', () => switchTab('filter'));

  // ─── Load authors & categories ─────────────────────

  async function loadAuthors() {
    try {
      const res = await api('/api/authors');
      if (res.success && res.data?.length) {
        const options = res.data.map(a =>
          `<option value="${a.id}">${a.name}</option>`
        ).join('');
        filterAuthor.innerHTML = '<option value="">Todos los autores</option>' + options;
      }
    } catch {
      // Silently fail
    }
  }

  async function loadCategories() {
    try {
      const res = await api('/api/categories');
      if (res.success && res.data?.length) {
        const options = res.data.map(cat =>
          `<option value="${cat.id}">${cat.name}</option>`
        ).join('');
        filterCategory.innerHTML = '<option value="">Todas las categorías</option>' + options;
      }
    } catch {
      // Silently fail
    }
  }

  // ─── Book fetching ─────────────────────────────────

  async function loadBooks() {
    setLoading('books-loading', 'books-error', 'books-content');
    hide('books-empty');

    const params = {
      page: state.page,
      limit: BOOKS_PER_PAGE,
    };
    if (state.query) params.search = state.query;
    if (state.authorId) params.authorId = state.authorId;
    if (state.categoryId) params.categoryId = state.categoryId;

    try {
      const res = await api('/api/books', { params });

      if (res.success && res.data?.length > 0) {
        renderBooks(res.data);
        state.totalPages = res.meta.totalPages;
        renderPagination();
        setContent('books-loading', 'books-error', 'books-content');
      } else {
        show('books-empty');
        hide('books-loading');
        hide('books-content');
      }
    } catch (err) {
      const msgEl = errorEl?.querySelector('p');
      if (msgEl) msgEl.textContent = err.message;
      show('books-error');
      hide('books-loading');
      hide('books-content');
    }
  }

  // ─── Render helpers ────────────────────────────────

  function renderBooks(books) {
    gridEl.innerHTML = books.map(book => createBookCard(book)).join('');
  }

  function renderPagination() {
    const { page, totalPages } = state;

    prevBtn.disabled = page <= 1;
    nextBtn.disabled = page >= totalPages;

    text('page-info', `Página ${page} de ${totalPages}`);

    dotsEl.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      const dot = document.createElement('span');
      dot.className = 'inline-block rounded-full transition-all duration-200 cursor-pointer';
      dot.style.cssText = `
        background: ${i === page ? 'var(--color-primary, #000)' : 'var(--color-outline-variant, #ccc)'};
        width: ${i === page ? '24px' : '8px'};
        height: 8px;
        border-radius: 999px;
      `;
      dot.addEventListener('click', () => {
        state.page = i;
        loadBooks();
      });
      dotsEl.appendChild(dot);
    }
  }

  function getSelectedText(sel) {
    return sel.options[sel.selectedIndex]?.text || '';
  }

  function updateActiveChip() {
    if (state.query) {
      show('active-filter-chip');
      text('active-filter-label', `"${state.query}"`);
    } else if (state.authorName || state.categoryName) {
      show('active-filter-chip');
      const parts = [];
      if (state.authorName) parts.push(`Autor: ${state.authorName}`);
      if (state.categoryName) parts.push(`Categoría: ${state.categoryName}`);
      text('active-filter-label', parts.join(' | '));
    } else {
      hide('active-filter-chip');
    }
  }

  // ─── Search handlers ───────────────────────────────

  let searchTimer = null;

  searchInput?.addEventListener('input', () => {
    const val = searchInput.value.trim();
    searchClearBtn.classList.toggle('hidden', !val);

    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      if (val !== state.query) {
        state.query = val;
        state.authorId = '';
        state.authorName = '';
        state.categoryId = '';
        state.categoryName = '';
        state.page = 1;
        filterAuthor.value = '';
        filterCategory.value = '';
        updateActiveChip();
        loadBooks();
      }
    }, 300);
  });

  searchClearBtn?.addEventListener('click', () => {
    searchInput.value = '';
    searchClearBtn.classList.add('hidden');
    if (state.query) {
      state.query = '';
      state.page = 1;
      updateActiveChip();
      loadBooks();
    }
  });

  // ─── Filter handlers ───────────────────────────────

  filterApplyBtn?.addEventListener('click', () => {
    const authorId = filterAuthor.value;
    const categoryId = filterCategory.value;
    const authorName = authorId ? getSelectedText(filterAuthor) : '';
    const categoryName = categoryId ? getSelectedText(filterCategory) : '';

    if (authorId !== state.authorId || categoryId !== state.categoryId) {
      state.query = '';
      state.authorId = authorId;
      state.authorName = authorName;
      state.categoryId = categoryId;
      state.categoryName = categoryName;
      state.page = 1;
      searchInput.value = '';
      searchClearBtn.classList.add('hidden');
      updateActiveChip();
      loadBooks();
    }
  });

  filterClearBtn?.addEventListener('click', () => {
    filterAuthor.value = '';
    filterCategory.value = '';
    if (state.authorId || state.categoryId) {
      state.authorId = '';
      state.authorName = '';
      state.categoryId = '';
      state.categoryName = '';
      state.page = 1;
      updateActiveChip();
      loadBooks();
    }
  });

  // ─── Chip clear ────────────────────────────────────

  chipClearBtn?.addEventListener('click', () => {
    state.query = '';
    state.authorId = '';
    state.authorName = '';
    state.categoryId = '';
    state.categoryName = '';
    state.page = 1;
    searchInput.value = '';
    searchClearBtn.classList.add('hidden');
    filterAuthor.value = '';
    filterCategory.value = '';
    hide('active-filter-chip');
    loadBooks();
  });

  // ─── Empty state: "Ver todo" ───────────────────────

  emptyClearBtn?.addEventListener('click', () => {
    state.query = '';
    state.authorId = '';
    state.authorName = '';
    state.categoryId = '';
    state.categoryName = '';
    state.page = 1;
    searchInput.value = '';
    searchClearBtn.classList.add('hidden');
    filterAuthor.value = '';
    filterCategory.value = '';
    hide('active-filter-chip');
    loadBooks();
  });

  // ─── Retry ─────────────────────────────────────────

  retryBtn?.addEventListener('click', loadBooks);

  // ─── Pagination listeners ─────────────────────────

  prevBtn?.addEventListener('click', () => {
    if (state.page > 1) {
      state.page--;
      loadBooks();
    }
  });

  nextBtn?.addEventListener('click', () => {
    if (state.page < state.totalPages) {
      state.page++;
      loadBooks();
    }
  });

  // ─── Initial load ──────────────────────────────────

  loadAuthors();
  loadCategories();
  loadBooks();
}
