// ─────────────────────────────────────────────────────────
// FERVOR Bookstore — API Layer
// ─────────────────────────────────────────────────────────

const API_BASE = '';

let activeRequests = 0;
const subscribers = new Set();

export function isLoading() {
  return activeRequests > 0;
}

export function onLoadingStateChange(callback) {
  subscribers.add(callback);
  // Return unsubscribe function
  return () => subscribers.delete(callback);
}

function notifyStateChange() {
  const active = activeRequests > 0;
  subscribers.forEach(cb => cb(active));
}

export function getToken() {
  return localStorage.getItem('fervor-token');
}

export function setToken(token) {
  localStorage.setItem('fervor-token', token);
}

export function removeToken() {
  localStorage.removeItem('fervor-token');
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('fervor-user'));
  } catch {
    return null;
  }
}

export function setUser(user) {
  localStorage.setItem('fervor-user', JSON.stringify(user));
}

export function removeUser() {
  localStorage.removeItem('fervor-user');
}

export function isAuthenticated() {
  return !!getToken();
}

export async function api(endpoint, options = {}) {
  activeRequests++;
  notifyStateChange();
  try {
    const { method = 'GET', body, params, headers: extraHeaders = {} } = options;

    let url = `${API_BASE}${endpoint}`;
    if (params) {
      const search = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') search.append(k, v);
      });
      const qs = search.toString();
      if (qs) url += `?${qs}`;
    }

    const headers = { ...extraHeaders };
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (body && !(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const fetchOptions = { method, headers };
    if (body) {
      fetchOptions.body = body instanceof FormData ? body : JSON.stringify(body);
    }

    let res;
    try {
      res = await fetch(url, fetchOptions);
    } catch (err) {
      throw new Error('Error de conexión. Verifica tu internet e intenta de nuevo.');
    }

    if (res.status === 401 && getToken()) {
      const refreshed = await attemptTokenRefresh();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${getToken()}`;
        fetchOptions.headers = headers;
        try {
          res = await fetch(url, fetchOptions);
        } catch {
          throw new Error('Error de conexión. Verifica tu internet e intenta de nuevo.');
        }
      } else {
        removeToken();
        removeUser();
        window.location.href = '/pages/login.html';
        throw new Error('Sesión expirada. Inicia sesión nuevamente.');
      }
    }

    if (!res.ok) {
      let errorMsg = 'Ocurrió un error inesperado.';
      try {
        const errorBody = await res.json();
        if (errorBody.message) {
          errorMsg = errorBody.message;
        } else if (errorBody.error) {
          errorMsg = typeof errorBody.error === 'string' ? errorBody.error : errorBody.error.message;
        }
      } catch {
        // JSON parsing failed — keep the default message
      }
      throw new Error(errorMsg);
    }

    const data = await res.json();
    return data;
  } finally {
    activeRequests--;
    if (activeRequests < 0) activeRequests = 0;
    notifyStateChange();
  }
}

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
      if (data.data.user) setUser(data.data.user);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
