// ─────────────────────────────────────────────────────────
// FERVOR Bookstore — Admin Entry Point & Page Dispatcher
// ─────────────────────────────────────────────────────────

import { api, isAuthenticated, isLoading, onLoadingStateChange, removeToken, removeUser } from '/shared/js/api.js';
import { showLogoutConfirmation } from '/shared/js/ui.js';

document.addEventListener('DOMContentLoaded', () => {
  if (!isAuthenticated()) {
    window.location.href = '/pages/login.html';
    return;
  }

  // ─── Sidebar toggle (mobile) ───────────────────────────

  const sidenav = document.querySelector('.sidenav');
  const toggle = document.getElementById('sidenav-toggle');
  const overlay = document.getElementById('sidenav-overlay');

  function toggleSidenav(open) {
    if (!sidenav || !overlay) return;
    sidenav.classList.toggle('is-open', open);
    overlay.classList.toggle('is-visible', open);
  }

  if (toggle && overlay) {
    toggle.addEventListener('click', () => toggleSidenav(true));
    overlay.addEventListener('click', () => toggleSidenav(false));
  }

  document.querySelectorAll('.sidenav__link').forEach(link => {
    link.addEventListener('click', () => toggleSidenav(false));
  });

  const topbar = document.querySelector('.admin-topbar');

  // ─── Find logout button ─────────────────────────────

  const logoutBtn = topbar && Array.from(topbar.querySelectorAll('.material-symbols-outlined'))
    .find(el => el.textContent.trim() === 'logout');

  // ─── Disable logout while API requests are in flight ─

  if (logoutBtn) {
    onLoadingStateChange((active) => {
      logoutBtn.disabled = active;
    });
  }

  // ─── Logout modal ───────────────────────────────────

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (isLoading()) return;
      const confirmed = await showLogoutConfirmation();
      if (!confirmed) return;
      try {
        await api('/api/auth/logout', { method: 'POST' });
      } catch {
        // Proceed with local cleanup even if API call fails
      }
      removeToken();
      removeUser();
      window.location.href = '/pages/login.html';
    });
  }

  // ─── Page dispatcher ────────────────────────────────

  const path = window.location.pathname;

  if (path === '/admin/' || path === '/admin/index.html') {
    import('./dashboard.js').then(m => m.initDashboardPage());
  } else if (path.includes('/admin/pages/inventory.html')) {
    import('./inventory.js').then(m => m.initInventoryPage());
  } else if (path.includes('/admin/pages/order.html')) {
    import('./orders.js').then(m => m.initOrdersPage());
  }
});
