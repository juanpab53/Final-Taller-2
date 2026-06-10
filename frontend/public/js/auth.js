// ─────────────────────────────────────────────────────────
// FERVOR Bookstore — Auth Module (Login & Register)
// ─────────────────────────────────────────────────────────

import { api, setToken, setUser } from '/shared/js/api.js';
import { $, show, hide, text, showError } from '/shared/js/dom.js';

// ─── Login Page ──────────────────────────────────────

/**
 * Initialize the login page (/pages/login.html).
 * Handles form submission, validation, and API call.
 */
export function initLoginPage() {
  const form = $('login-form');
  const emailInput = $('login-email');
  const passwordInput = $('login-password');
  const submitBtn = $('login-submit');
  const errorContainer = $('auth-error');
  const errorText = $('auth-error-text');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hide('auth-error');
    hide('login-email-error');
    hide('login-password-error');

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    let hasError = false;

    if (!email) {
      text('login-email-error', 'El correo es obligatorio.');
      show('login-email-error');
      hasError = true;
    }

    if (!password) {
      text('login-password-error', 'La contraseña es obligatoria.');
      show('login-password-error');
      hasError = true;
    }

    if (hasError) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Ingresando...';

    try {
      const res = await api('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      if (res.success && res.data) {
        setToken(res.data.accessToken);
        setUser(res.data.user);
        if (res.data.user.role === 'ADMIN') {
          window.location.href = '/admin/index.html';
        } else {
          window.location.href = '/index.html';
        }
      } else {
        showError('auth-error', 'Credenciales inválidas. Intenta de nuevo.');
      }
    } catch (err) {
      showError('auth-error', err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Iniciar sesión';
    }
  });
}

// ─── Register Page ───────────────────────────────────

/**
 * Initialize the registration page (/pages/register.html).
 * Handles form submission, field validation, and API call.
 */
export function initRegisterPage() {
  const form = $('register-form');
  const nameInput = $('reg-name');
  const emailInput = $('reg-email');
  const phoneInput = $('reg-phone');
  const passwordInput = $('reg-password');
  const confirmInput = $('reg-confirm');
  const submitBtn = $('register-submit');
  const errorContainer = document.querySelector('.auth-card .auth-error');

  function hideFieldErrors() {
    ['reg-name-error', 'reg-email-error', 'reg-phone-error', 'reg-password-error', 'reg-confirm-error'].forEach(id => hide(id));
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideFieldErrors();
    if (errorContainer) errorContainer.classList.add('hidden');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const password = passwordInput.value.trim();
    const confirm = confirmInput.value.trim();
    let hasError = false;

    if (!name) {
      text('reg-name-error', 'El nombre es obligatorio.');
      show('reg-name-error');
      hasError = true;
    }

    if (!email) {
      text('reg-email-error', 'El correo es obligatorio.');
      show('reg-email-error');
      hasError = true;
    }

    if (!phone) {
      text('reg-phone-error', 'El teléfono es obligatorio.');
      show('reg-phone-error');
      hasError = true;
    }

    if (!password || password.length < 8) {
      text('reg-password-error', 'La contraseña debe tener al menos 8 caracteres.');
      show('reg-password-error');
      hasError = true;
    }

    if (!confirm) {
      text('reg-confirm-error', 'Confirma tu contraseña.');
      show('reg-confirm-error');
      hasError = true;
    } else if (password !== confirm) {
      text('reg-confirm-error', 'Las contraseñas no coinciden.');
      show('reg-confirm-error');
      hasError = true;
    }

    if (hasError) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creando cuenta...';

    try {
      const res = await api('/api/users/register', {
        method: 'POST',
        body: { name, email, tel: phone, password },
      });

      if (res.success) {
        const loginRes = await api('/api/auth/login', {
          method: 'POST',
          body: { email, password },
        });
        if (loginRes.success) {
          setToken(loginRes.data.accessToken);
          setUser(loginRes.data.user);
          window.location.href = loginRes.data.user.role === 'ADMIN' ? '/admin/index.html' : '/index.html';
        } else {
          window.location.href = '/pages/login.html?registered=true';
        }
      } else {
        if (errorContainer) {
          const span = errorContainer.querySelector('span:last-child');
          if (span) span.textContent = res.message || 'Error al registrar. Intenta de nuevo.';
          errorContainer.classList.remove('hidden');
        }
      }
    } catch (err) {
      if (errorContainer) {
        const span = errorContainer.querySelector('span:last-child');
        if (span) span.textContent = err.message;
        errorContainer.classList.remove('hidden');
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Crear cuenta';
    }
  });
}
