// api.js — shared fetch helper for all MarketFlow pages
const API = 'http://localhost:3005/api';

function getToken() {
  return localStorage.getItem('mf_token');
}

function getUser() {
  const u = localStorage.getItem('mf_user');
  return u ? JSON.parse(u) : null;
}

function saveAuth(token, user) {
  localStorage.setItem('mf_token', token);
  localStorage.setItem('mf_user', JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem('mf_token');
  localStorage.removeItem('mf_user');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    const msg = data.errors?.[0]?.msg || data.message || 'Something went wrong';
    throw new Error(msg);
  }
  return data;
}

// Show a toast notification
function toast(msg, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position:fixed;bottom:24px;right:24px;z-index:9999;
      display:flex;flex-direction:column;gap:10px;
    `;
    document.body.appendChild(container);
  }

  const t = document.createElement('div');
  t.style.cssText = `
    padding:12px 18px;border-radius:10px;font-size:0.9rem;font-weight:600;
    color:#fff;max-width:320px;box-shadow:0 8px 24px rgba(0,0,0,0.3);
    background:${type === 'success' ? '#16a34a' : type === 'error' ? '#dc2626' : '#2563eb'};
    animation:slideIn 0.2s ease;
  `;
  t.textContent = msg;

  const style = document.createElement('style');
  style.textContent = `@keyframes slideIn{from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1}}`;
  document.head.appendChild(style);

  container.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

// Update nav based on login state
function updateNav() {
  const user = getUser();
  const nav = document.querySelector('nav ul');
  if (!nav) return;

  // Remove old auth items we manage
  ['#nav-login','#nav-register','#nav-logout','#nav-admin-products','#nav-admin-users','#nav-inventory'].forEach(id => {
    nav.querySelector(id)?.remove();
  });

  if (user) {
    // Show logout
    const li = document.createElement('li');
    li.id = 'nav-logout';
    li.innerHTML = `<a href="#" style="color:var(--accent)">Hi, ${user.fullName.split(' ')[0]} · Logout</a>`;
    li.querySelector('a').addEventListener('click', (e) => {
      e.preventDefault();
      clearAuth();
      window.location.href = 'login.html';
    });
    nav.appendChild(li);

    // Show admin links for admin/seller
    if (user.role === 'admin' || user.role === 'seller') {
      ['#nav-login','#nav-register'].forEach(id => nav.querySelector(id)?.remove());
    }
  }
}
