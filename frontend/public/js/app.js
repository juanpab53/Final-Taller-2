// ─────────────────────────────────────────────────────────
// FERVOR Bookstore — Application Entry Point
// ─────────────────────────────────────────────────────────

import { isAuthenticated, getUser } from './api.js';
import { updateAuthUI } from './header.js';
import { initLoginPage, initRegisterPage } from './auth.js';
import { initHomePage } from './home.js';
import { initCatalogPage } from './catalog.js';
import { initDetailPage } from './detail.js';
import { initCartPage } from './cart.js';
import { initCheckoutPage } from './checkout.js';
import { initConfirmPage } from './confirm.js';

// ─── Page Dispatcher ─────────────────────────────────

/**
 * On DOMContentLoaded, detect the current page and initialize
 * the corresponding module. If the user is already authenticated
 * and tries to access login or register, redirect accordingly.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Always update the header UI regardless of page
  updateAuthUI();

  const path = window.location.pathname;

  // Redirect authenticated users away from auth pages
  if (isAuthenticated()) {
    if (path.includes('/pages/login.html') || path.includes('/pages/register.html')) {
      const user = getUser();
      window.location.href = user?.role === 'ADMIN' ? '/admin/index.html' : '/index.html';
      return;
    }
  }

  // Initialize the module for the current page
  if (path.includes('/pages/login.html')) {
    initLoginPage();
  } else if (path.includes('/pages/register.html')) {
    initRegisterPage();
  } else if (path === '/' || path.includes('/index.html')) {
    initHomePage();
  } else if (path.includes('/pages/catalogo.html')) {
    initCatalogPage();
  } else if (path.includes('/pages/book-detail.html')) {
    initDetailPage();
  } else if (path.includes('/pages/cart.html')) {
    initCartPage();
  } else if (path.includes('/pages/checkout.html')) {
    initCheckoutPage();
  } else if (path.includes('/pages/order-confirmation.html')) {
    initConfirmPage();
  }
});
