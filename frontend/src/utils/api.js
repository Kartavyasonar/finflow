/**
 * src/utils/api.js
 * Centralised fetch wrapper for all backend API calls.
 * Uses the Fetch API (ES6 async/await + Promises).
 */

const BASE_URL = process.env.REACT_APP_API_URL || 'https://finflow-production-9d3d.up.railway.app/api';

// ── Token helpers ──────────────────────────────────────────────
export const getToken  = ()       => localStorage.getItem('ff_token');
export const setToken  = (t)      => localStorage.setItem('ff_token', t);
export const clearAuth = ()       => { localStorage.removeItem('ff_token'); localStorage.removeItem('ff_user'); };
export const getUser   = ()       => JSON.parse(localStorage.getItem('ff_user') || 'null');
export const setUser   = (u)      => localStorage.setItem('ff_user', JSON.stringify(u));

// ── Core fetch wrapper ─────────────────────────────────────────
async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    // Normalise error message
    const message = data.error || (data.errors && data.errors[0]?.msg) || 'Request failed';
    throw new Error(message);
  }

  return data;
}

// auth stuff
export const authAPI = {
  register: (name, email, password) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),

  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  me: () => request('/auth/me'),
};

// ── Dashboard ──────────────────────────────────────────────────
export const dashboardAPI = {
  stats: () => request('/dashboard/stats'),
};

// ── Expenses ───────────────────────────────────────────────────
export const expensesAPI = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/expenses${qs ? '?' + qs : ''}`);
  },
  create: (data) => request('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/expenses/${id}`, { method: 'DELETE' }),
};

// ── Income ─────────────────────────────────────────────────────
export const incomeAPI = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/income${qs ? '?' + qs : ''}`);
  },
  create: (data) => request('/income', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/income/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/income/${id}`, { method: 'DELETE' }),
};

// ── Budgets ────────────────────────────────────────────────────
export const budgetsAPI = {
  list: () => request('/budgets'),
  upsert: (data) => request('/budgets', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id) => request(`/budgets/${id}`, { method: 'DELETE' }),
};
