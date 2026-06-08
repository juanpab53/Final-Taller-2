// ─────────────────────────────────────────────────────────
// FERVOR Bookstore — Header UI & Session Management
// ─────────────────────────────────────────────────────────

import { api, getUser, isLoading, onLoadingStateChange, removeToken, removeUser } from '/shared/js/api.js';
import { showLogoutConfirmation } from '/shared/js/ui.js';

// ─── Header User Icon ────────────────────────────────

/**
 * Update the header user icon based on authentication state.
 *
 * - Authenticated: replaces the "person" icon with the user's name + logout button.
 * - Anonymous: leaves the "person" icon as-is (links to login page).
 *
 * Called on every page load via the dispatcher.
 */
export function updateAuthUI() {
  const user = getUser();
  // Find the login/profile link in the header
  const personLink = document.querySelector('header a[href*="login"]');
  if (!personLink) return;

  if (user) {
    // Build a user-info container to replace the login link
    const container = document.createElement('div');
    container.className = 'flex items-center gap-2';

    const userName = document.createElement('span');
    userName.className = 'font-mono text-label-sm text-primary hidden md:inline';
    userName.textContent = user.name || user.email;

    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'material-symbols-outlined text-primary p-2 hover:bg-surface-container rounded-full transition-all duration-200';
    logoutBtn.title = 'Cerrar sesión';
    logoutBtn.textContent = 'logout';
    if (isLoading()) logoutBtn.disabled = true;
    logoutBtn.addEventListener('click', handleLogout);

    container.appendChild(userName);
    container.appendChild(logoutBtn);
    personLink.parentNode.replaceChild(container, personLink);
  }
  // Anonymous: the existing link already points to login — no action needed
}

// ─── Disable logout while API requests are in flight ─

onLoadingStateChange((active) => {
  const btn = document.querySelector('button.material-symbols-outlined[title="Cerrar sesión"]');
  if (btn) btn.disabled = active;
});

// ─── Logout Handler ─────────────────────────────────

/**
 * Show a confirmation modal and execute logout if confirmed.
 * Calls the logout API, clears local session data, and redirects to home.
 */
async function handleLogout() {
  if (isLoading()) return;

  const confirmed = await showLogoutConfirmation();
  if (!confirmed) return;

  try {
    await api('/api/auth/logout', { method: 'POST' });
  } catch {
    // Proceed with local cleanup even if the API call fails
  }
  removeToken();
  removeUser();
  window.location.href = '/index.html';
}
