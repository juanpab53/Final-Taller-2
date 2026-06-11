// ─────────────────────────────────────────────────────────
// FERVOR Bookstore — Public UI Components
// ─────────────────────────────────────────────────────────

import { formatPrice } from '/shared/js/dom.js';

export function createBookCard(book) {
  const price = formatPrice(book.price);
  const image = book.imageUrl || 'https://picsum.photos/seed/' + encodeURIComponent(book.name) + '/300/400';
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
