// ─────────────────────────────────────────────────────────
// FERVOR Bookstore — DOM Helpers
// ─────────────────────────────────────────────────────────

/** Shorthand for document.getElementById */
export function $(id) {
  return document.getElementById(id);
}

/** Remove the 'hidden' class from an element by ID */
export function show(id) {
  const el = $(id);
  if (el) el.classList.remove('hidden');
}

/** Add the 'hidden' class to an element by ID */
export function hide(id) {
  const el = $(id);
  if (el) el.classList.add('hidden');
}

/** Set the textContent of an element by ID */
export function text(id, content) {
  const el = $(id);
  if (el) el.textContent = content;
}

/** Set the innerHTML of an element by ID */
export function html(id, content) {
  const el = $(id);
  if (el) el.innerHTML = content;
}

/**
 * Set an attribute on an element.
 * Accepts either an element ID (string) or a direct element reference.
 */
export function attr(el, name, value) {
  const element = typeof el === 'string' ? $(el) : el;
  if (element) element.setAttribute(name, value);
}

// ─── Formatting Helpers ──────────────────────────────

/**
 * Format a number as Colombian Pesos (COP).
 * Uses dot as thousands separator and comma as decimal separator.
 * Example: 1234567.89 → "$1.234.567,89"
 * @param {number} n
 * @returns {string}
 */
export function formatPrice(n) {
  const num = Number(n);
  if (isNaN(num)) return '$0';
  const parts = num.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return '$' + parts[0] + ',' + parts[1];
}

/**
 * Show an error container by ID and set its message text.
 * Looks for a child element with an ID ending in "-text", or falls back to a <p> tag.
 * @param {string} id
 * @param {string} message
 */
export function showError(id, message) {
  const el = $(id);
  if (!el) return;
  const textEl = el.querySelector('[id$="-text"]') || el.querySelector('p');
  if (textEl) textEl.textContent = message || 'Ocurrió un error inesperado.';
  el.classList.remove('hidden');
}

// ─── UI State Helpers ─────────────────────────────────

/** Show loading, hide error and content containers */
export function setLoading(loadingId, errorId, contentId) {
  show(loadingId);
  hide(errorId);
  hide(contentId);
}

/** Show error, hide loading and content containers */
export function setError(loadingId, errorId, contentId) {
  hide(loadingId);
  show(errorId);
  hide(contentId);
}

/** Show content, hide loading and error containers */
export function setContent(loadingId, errorId, contentId) {
  hide(loadingId);
  hide(errorId);
  show(contentId);
}
