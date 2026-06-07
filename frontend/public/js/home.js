// ─────────────────────────────────────────────────────────
// FERVOR Bookstore — Homepage (Featured Books Carousel)
// ─────────────────────────────────────────────────────────

import { api } from '/shared/js/api.js';
import { $, show, hide, html, setLoading, setError } from '/shared/js/dom.js';
import { createBookCard } from './ui.js';

// Number of books visible per carousel page
const BOOKS_PER_PAGE = 4;

/**
 * Initialize the homepage carousel (/index.html).
 * Fetches featured books and renders a paginated carousel (4 at a time).
 */
export function initHomePage() {
  let books = [];
  let currentPage = 0;
  let totalPages = 0;

  const loadingEl = $('books-loading');
  const errorEl = $('books-error');
  const carouselEl = $('books-carousel');
  const trackEl = $('carousel-track');
  const prevBtn = $('carousel-prev');
  const nextBtn = $('carousel-next');
  const dotsEl = $('carousel-dots');
  const retryBtn = $('books-retry');

  /**
   * Fetch books from the API and render the carousel.
   */
  async function loadBooks() {
    setLoading('books-loading', 'books-error', 'books-carousel');

    try {
      const res = await api('/api/books', { params: { page: 1, limit: 20 } });

      if (res.success && res.data?.books?.length > 0) {
        books = res.data.books;
        currentPage = 0;
        totalPages = Math.ceil(books.length / BOOKS_PER_PAGE);
        renderPage();
        show('books-carousel');
        hide('books-loading');
      } else {
        // No books available — hide everything (loading was already showing)
        hide('books-loading');
      }
    } catch (err) {
      showErrorText(err.message);
      setError('books-loading', 'books-error', 'books-carousel');
    }
  }

  /**
   * Render the current page of books into the carousel track.
   */
  function renderPage() {
    const start = currentPage * BOOKS_PER_PAGE;
    const end = start + BOOKS_PER_PAGE;
    const pageBooks = books.slice(start, end);
    const cardsHtml = pageBooks.map(book => createBookCard(book)).join('');
    trackEl.innerHTML = cardsHtml;

    // Update navigation state
    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage >= totalPages - 1;

    renderDots();
  }

  /**
   * Render dot indicators for each carousel page.
   */
  function renderDots() {
    dotsEl.innerHTML = '';
    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('span');
      dot.className = 'inline-block w-2 h-2 rounded-full transition-all duration-200 cursor-pointer';
      dot.style.cssText = `
        background: ${i === currentPage ? 'var(--color-primary, #000)' : 'var(--color-outline-variant, #ccc)'};
        width: ${i === currentPage ? '24px' : '8px'};
        border-radius: 999px;
      `;
      dot.addEventListener('click', () => {
        currentPage = i;
        renderPage();
      });
      dotsEl.appendChild(dot);
    }
  }

  /**
   * Set the error text inside the error container.
   */
  function showErrorText(msg) {
    const textEl = errorEl?.querySelector('p');
    if (textEl) textEl.textContent = msg;
  }

  // ─── Event Listeners ─────────────────────────────

  prevBtn?.addEventListener('click', () => {
    if (currentPage > 0) {
      currentPage--;
      renderPage();
    }
  });

  nextBtn?.addEventListener('click', () => {
    if (currentPage < totalPages - 1) {
      currentPage++;
      renderPage();
    }
  });

  retryBtn?.addEventListener('click', loadBooks);

  // Initial load
  loadBooks();
}
