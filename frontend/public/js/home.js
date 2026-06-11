import { api } from '/shared/js/api.js';
import { $, show, hide, html, setLoading, setError } from '/shared/js/dom.js';
import { createBookCard } from './ui.js';

const VISIBLE = 4;
const STEP = 1;
const TOTAL_BOOKS = 8;
const AUTO_INTERVAL = 5000;

export function initHomePage() {
  let books = [];
  let currentStep = 0;
  let totalSteps = 0;
  let autoTimer = null;

  const loadingEl = $('books-loading');
  const errorEl = $('books-error');
  const carouselEl = $('books-carousel');
  const trackEl = $('carousel-track');
  const prevBtn = $('carousel-prev');
  const nextBtn = $('carousel-next');
  const dotsEl = $('carousel-dots');
  const retryBtn = $('books-retry');

  function startAutoPlay() {
    stopAutoPlay();
    autoTimer = setInterval(() => {
      if (currentStep < totalSteps - 1) {
        currentStep++;
        updateSlide();
      } else {
        currentStep = 0;
        updateSlide();
      }
    }, AUTO_INTERVAL);
  }

  function stopAutoPlay() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  function restartAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  function getCardWidth() {
    const card = trackEl.querySelector('.book-card');
    if (!card) return 0;
    const style = getComputedStyle(trackEl);
    const gap = parseFloat(style.columnGap) || 0;
    return card.offsetWidth + gap;
  }

  function updateSlide() {
    const stepWidth = getCardWidth();
    trackEl.style.transform = `translateX(-${currentStep * stepWidth}px)`;

    prevBtn.disabled = currentStep === 0;
    nextBtn.disabled = currentStep >= totalSteps - 1;

    renderDots();
  }

  async function loadBooks() {
    setLoading('books-loading', 'books-error', 'books-carousel');

    try {
      const res = await api('/api/books', { params: { page: 1, limit: TOTAL_BOOKS } });

      if (res.success && res.data?.length > 0) {
        books = res.data;
        currentStep = 0;
        totalSteps = Math.max(1, books.length - VISIBLE + 1);
        trackEl.innerHTML = books.map(book => createBookCard(book)).join('');
        updateSlide();
        show('books-carousel');
        hide('books-loading');
        startAutoPlay();
      } else {
        hide('books-loading');
      }
    } catch (err) {
      showErrorText(err.message);
      setError('books-loading', 'books-error', 'books-carousel');
    }
  }

  function renderDots() {
    dotsEl.innerHTML = '';
    for (let i = 0; i < totalSteps; i++) {
      const dot = document.createElement('span');
      dot.className = 'inline-block w-2 h-2 rounded-full transition-all duration-200 cursor-pointer';
      dot.style.cssText = `
        background: ${i === currentStep ? 'var(--color-primary, #000)' : 'var(--color-outline-variant, #ccc)'};
        width: ${i === currentStep ? '24px' : '8px'};
        border-radius: 999px;
      `;
      dot.addEventListener('click', () => {
        currentStep = i;
        updateSlide();
        restartAutoPlay();
      });
      dotsEl.appendChild(dot);
    }
  }

  function showErrorText(msg) {
    const textEl = errorEl?.querySelector('p');
    if (textEl) textEl.textContent = msg;
  }

  prevBtn?.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      updateSlide();
      restartAutoPlay();
    }
  });

  nextBtn?.addEventListener('click', () => {
    if (currentStep < totalSteps - 1) {
      currentStep++;
      updateSlide();
      restartAutoPlay();
    }
  });

  retryBtn?.addEventListener('click', loadBooks);

  window.addEventListener('resize', updateSlide);

  loadBooks();
}
