const API = '/api';

export function getToken() {
  return localStorage.getItem('mf_token');
}

export function getUser() {
  const u = localStorage.getItem('mf_user');
  return u ? JSON.parse(u) : null;
}

export function saveAuth(token, user) {
  localStorage.setItem('mf_token', token);
  localStorage.setItem('mf_user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('mf_token');
  localStorage.removeItem('mf_user');
}

export async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });

  let data = {};
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    if (res.status === 401) {
      clearAuth();
    }
    if (res.status === 403) {
      const raw = data.errors?.[0]?.msg || data.message || '';
      const msgStr = typeof raw === 'string' ? raw : '';
      if (msgStr.includes('suspended')) {
        clearAuth();
      }
    }
    const msg = data.errors?.[0]?.msg || data.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}
