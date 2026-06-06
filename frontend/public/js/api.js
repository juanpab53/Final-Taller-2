// ─────────────────────────────────────────────────────────
// FERVOR Bookstore — API Layer
// ─────────────────────────────────────────────────────────

// Base URL for API requests. Empty string means same-origin
// (frontend and API are served from the same Express server).
const API_BASE = '';

// ─── Token & Session Management ──────────────────────

/**
 * Retrieve the stored JWT access token from localStorage.
 * @returns {string|null}
 */
export function getToken() {
  return localStorage.getItem('fervor-token');
}

/**
 * Persist the JWT access token to localStorage.
 * @param {string} token
 */
export function setToken(token) {
  localStorage.setItem('fervor-token', token);
}

/**
 * Remove the JWT access token from localStorage.
 */
export function removeToken() {
  localStorage.removeItem('fervor-token');
}

/**
 * Retrieve the logged-in user object from localStorage.
 * @returns {object|null}
 */
export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('fervor-user'));
  } catch {
    return null;
  }
}

/**
 * Persist the logged-in user object to localStorage.
 * @param {object} user
 */
export function setUser(user) {
  localStorage.setItem('fervor-user', JSON.stringify(user));
}

/**
 * Remove the logged-in user data from localStorage.
 */
export function removeUser() {
  localStorage.removeItem('fervor-user');
}

/**
 * Check whether a user is currently authenticated.
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!getToken();
}

// ─── API Fetch Wrapper ───────────────────────────────

/**
 * Make an authenticated API request.
 * @param {string} endpoint - e.g. '/api/books'
 * @param {object} options
 * @param {string} [options.method='GET'] - HTTP method
 * @param {object} [options.body] - Request body (auto-JSON-stringified)
 * @param {object} [options.params] - URL query parameters
 * @param {object} [options.headers] - Additional headers
 * @returns {Promise<object>} Parsed JSON response
 * @throws {Error} On network failure or non-OK HTTP status
 */
export async function api(endpoint, options = {}) {
  const { method = 'GET', body, params, headers: extraHeaders = {} } = options;

  // Build URL with query parameters
  let url = `${API_BASE}${endpoint}`;
  if (params) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') search.append(k, v);
    });
    const qs = search.toString();
    if (qs) url += `?${qs}`;
  }

  // Build headers: inject auth token if available
  const headers = { ...extraHeaders };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Set JSON content-type for non-FormData bodies
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const fetchOptions = { method, headers };
  if (body) {
    fetchOptions.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  // Execute the request
  let res;
  try {
    res = await fetch(url, fetchOptions);
  } catch (err) {
    throw new Error('Error de conexión. Verifica tu internet e intenta de nuevo.');
  }

  // Auto-refresh token on 401 if user was previously authenticated
  if (res.status === 401 && getToken()) {
    const refreshed = await attemptTokenRefresh();
    if (refreshed) {
      // Retry the original request with the new token
      headers['Authorization'] = `Bearer ${getToken()}`;
      fetchOptions.headers = headers;
      try {
        res = await fetch(url, fetchOptions);
      } catch {
        throw new Error('Error de conexión. Verifica tu internet e intenta de nuevo.');
      }
    } else {
      // Refresh failed — clear session and redirect to login
      removeToken();
      removeUser();
      window.location.href = '/pages/login.html';
      throw new Error('Sesión expirada. Inicia sesión nuevamente.');
    }
  }

  // Handle non-2XX responses
  if (!res.ok) {
    let errorMsg = 'Ocurrió un error inesperado.';
    try {
      const errorBody = await res.json();
      if (errorBody.message) {
        errorMsg = errorBody.message;
      } else if (errorBody.error) {
        // error can be either a string or an object { code, message }
        errorMsg = typeof errorBody.error === 'string' ? errorBody.error : errorBody.error.message;
      }
    } catch {
      // JSON parsing failed — keep the default message
    }
    throw new Error(errorMsg);
  }

  // Parse and return the successful response
  const data = await res.json();
  return data;
}

/**
 * Attempt to refresh the JWT access token using the httpOnly refresh cookie.
 * @returns {Promise<boolean>} Whether the refresh succeeded
 */
async function attemptTokenRefresh() {
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.success && data.data?.accessToken) {
      setToken(data.data.accessToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
