// login-page.js
document.addEventListener('DOMContentLoaded', () => {
  if (getToken()) {
    window.location.href = 'index.html';
    return;
  }

  updateNav();

  const form = document.querySelector('main form');
  const btn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      toast('Please enter both email and password', 'error');
      return;
    }

    btn.textContent = 'Signing in…';
    btn.disabled = true;

    try {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      saveAuth(data.token, data.user);
      toast('Welcome back, ' + data.user.fullName + '!');
      setTimeout(() => (window.location.href = 'index.html'), 600);
    } catch (err) {
      toast(err.message, 'error');
      btn.textContent = 'Login';
      btn.disabled = false;
    }
  });
});
