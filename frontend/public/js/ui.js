// ─────────────────────────────────────────────────────────
// FERVOR Bookstore — Reusable UI Components
// ─────────────────────────────────────────────────────────

import { formatPrice } from './dom.js';

// ─── Book Card Template ──────────────────────────────

/**
 * Generate HTML for a book catalog card.
 * Used by the homepage carousel and the catalog grid.
 * @param {object} book
 * @param {string} book.id
 * @param {string} book.name
 * @param {number} book.price
 * @param {string} [book.image_url]
 * @param {object} [book.author]
 * @param {string} [book.author.name]
 * @returns {string} HTML string
 */
export function createBookCard(book) {
  const price = formatPrice(book.price);
  const image = book.image_url || 'https://picsum.photos/seed/' + encodeURIComponent(book.name) + '/300/400';
  const authorName = book.author?.name || 'Autor desconocido';
  const href = '/pages/book-detail.html?id=' + book.id;
  return `
    <a href="${href}" class="book-card no-underline block group" aria-label="${book.name}">
      <div class="aspect-[3/4] rounded-lg overflow-hidden bg-surface-container mb-stack-sm">
        <img src="${image}" alt="${book.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
      </div>
      <span class="font-mono text-label-sm text-secondary">${authorName}</span>
      <h3 class="font-serif text-headline-sm-mobile md:text-headline-sm text-primary leading-tight mt-1">${book.name}</h3>
      <span class="font-mono text-label-sm font-bold text-primary">${price}</span>
    </a>
  `;
}

// ─── Logout Confirmation Modal ───────────────────────

/**
 * Display a centered confirmation modal for logout.
 * Returns a promise that resolves to true (confirmed) or false (cancelled).
 * @returns {Promise<boolean>}
 */
export function showLogoutConfirmation() {
  return new Promise((resolve) => {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      padding: 1rem;
    `;

    // Create modal card
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: var(--color-surface-container-lowest, #fff);
      border-radius: 1rem;
      padding: 2rem;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
      animation: slideUp 0.25s ease;
    `;

    // Icon
    const icon = document.createElement('span');
    icon.className = 'material-symbols-outlined';
    icon.textContent = 'logout';
    icon.style.cssText = `
      font-size: 40px;
      color: var(--color-primary, #000);
      margin-bottom: 1rem;
    `;

    // Title
    const title = document.createElement('h2');
    title.className = 'font-serif text-headline-sm text-primary';
    title.textContent = 'Cerrar sesión';
    title.style.cssText = 'margin: 0 0 0.5rem 0;';

    // Message
    const msg = document.createElement('p');
    msg.className = 'font-sans text-body-md text-secondary';
    msg.textContent = '¿Estás seguro de que deseas cerrar sesión?';
    msg.style.cssText = 'margin: 0 0 1.5rem 0;';

    // Buttons container
    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display: flex; gap: 0.75rem;';

    // Cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn--outline';
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.style.cssText = 'flex: 1;';

    // Confirm button
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'btn btn--primary';
    confirmBtn.textContent = 'Cerrar sesión';
    confirmBtn.style.cssText = 'flex: 1;';

    // Assemble modal
    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(confirmBtn);
    modal.appendChild(icon);
    modal.appendChild(title);
    modal.appendChild(msg);
    modal.appendChild(btnRow);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Inject keyframe animations if not already present
    if (!document.getElementById('fervor-modal-styles')) {
      const style = document.createElement('style');
      style.id = 'fervor-modal-styles';
      style.textContent = `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `;
      document.head.appendChild(style);
    }

    // Cleanup and resolve
    function close(result) {
      overlay.remove();
      resolve(result);
    }

    cancelBtn.addEventListener('click', () => close(false));
    confirmBtn.addEventListener('click', () => close(true));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close(false);
    });
  });
}
