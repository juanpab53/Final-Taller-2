// ─────────────────────────────────────────────────────────
// FERVOR Bookstore — DOM Helpers
// ─────────────────────────────────────────────────────────

export function $(id) {
  return document.getElementById(id);
}

export function show(id) {
  const el = $(id);
  if (el) el.classList.remove('hidden');
}

export function hide(id) {
  const el = $(id);
  if (el) el.classList.add('hidden');
}

export function text(id, content) {
  const el = $(id);
  if (el) el.textContent = content;
}

export function html(id, content) {
  const el = $(id);
  if (el) el.innerHTML = content;
}

export function attr(el, name, value) {
  const element = typeof el === 'string' ? $(el) : el;
  if (element) element.setAttribute(name, value);
}

export function formatPrice(n) {
  const num = Number(n);
  if (isNaN(num)) return '$0';
  const parts = num.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return '$' + parts[0] + ',' + parts[1];
}

export function showError(id, message) {
  const el = $(id);
  if (!el) return;
  const textEl = el.querySelector('[id$="-text"]') || el.querySelector('p');
  if (textEl) textEl.textContent = message || 'Ocurrió un error inesperado.';
  el.classList.remove('hidden');
}

export function setLoading(loadingId, errorId, contentId) {
  show(loadingId);
  hide(errorId);
  hide(contentId);
}

export function setError(loadingId, errorId, contentId) {
  hide(loadingId);
  show(errorId);
  hide(contentId);
}

export function setContent(loadingId, errorId, contentId) {
  hide(loadingId);
  hide(errorId);
  show(contentId);
}
