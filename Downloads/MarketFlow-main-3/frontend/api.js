// api.js — shared client helper for all MarketFlow pages
// Uses a relative URL so it works no matter what port the server runs on.
const API = '/api';

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
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });

  // Some endpoints (like 204 No Content) may not return JSON
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
      // Token expired or invalid → drop session so the user is forced to re-login
      clearAuth();
    }
    const msg = data.errors?.[0]?.msg || data.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
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
    animation:mf-slideIn 0.2s ease;
  `;
  t.textContent = msg;

  if (!document.getElementById('mf-toast-anim')) {
    const style = document.createElement('style');
    style.id = 'mf-toast-anim';
    style.textContent = `@keyframes mf-slideIn{from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1}}`;
    document.head.appendChild(style);
  }

  container.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

// ─── Nav: rebuild based on auth/role state ────────────────────────────────────
// Each page's <nav><ul> is rebuilt from this single source of truth.
// Each link declares which roles can see it via `roles`:
//   - 'guest'  : only logged-out users
//   - 'auth'   : any logged-in user
//   - 'buyer','seller','admin'
const NAV_LINKS = [
  { href: 'index.html',            label: 'Marketplace',     roles: ['*'] },
  { href: 'cart.html',             label: 'Cart',            roles: ['buyer', 'seller', 'admin'] },
  { href: 'sell.html',             label: 'Sell',            roles: ['auth'] },
  { href: 'admin-products.html',   label: 'Admin Products',  roles: ['seller', 'admin'] },
  { href: 'admin-users.html',      label: 'Admin Users',     roles: ['admin'] },
  { href: 'inventory-report.html', label: 'Inventory',       roles: ['seller', 'admin'] },
  { href: 'login.html',            label: 'Login',           roles: ['guest'] },
  { href: 'register.html',         label: 'Register',        roles: ['guest'] },
];

function canSee(roles, user) {
  if (roles.includes('*')) return true;
  if (!user) return roles.includes('guest');
  if (roles.includes('auth')) return true;
  return roles.includes(user.role);
}

function updateNav() {
  const ul = document.querySelector('header nav ul');
  if (!ul) return;

  const user = getUser();
  const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  ul.innerHTML = '';

  NAV_LINKS.forEach(({ href, label, roles }) => {
    if (!canSee(roles, user)) return;
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    if (here === href.toLowerCase()) a.classList.add('active');
    li.appendChild(a);
    ul.appendChild(li);
  });

  if (user) {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="pill" style="margin-right:6px">
        ${user.fullName.split(' ')[0]} · ${user.role}
      </span>
      <a href="#" id="logout-link">Logout</a>
    `;
    ul.appendChild(li);
    li.querySelector('#logout-link').addEventListener('click', (e) => {
      e.preventDefault();
      clearAuth();
      window.location.href = 'index.html';
    });
  }
}

// ─── Page guards ──────────────────────────────────────────────────────────────
// requireAuth([roles]) — call at top of a page-script. If access is denied,
// it replaces <main> with a friendly message and returns false.
function requireAuth(roles) {
  const user = getUser();
  if (!user) {
    document.querySelector('main').innerHTML = `
      <h1 class="page-title">Login required</h1>
      <div class="card" style="text-align:center">
        <p>Please <a href="login.html" class="link">log in</a> to view this page.</p>
      </div>`;
    return false;
  }
  if (roles && !roles.includes(user.role)) {
    document.querySelector('main').innerHTML = `
      <h1 class="page-title">Access denied</h1>
      <div class="card">
        <p>You don't have permission to view this page.
        It's restricted to: <strong>${roles.join(', ')}</strong>.</p>
      </div>`;
    return false;
  }
  return true;
}
