// register-page.js
document.addEventListener('DOMContentLoaded', () => {
  if (getToken()) {
    window.location.href = 'index.html';
    return;
  }

  updateNav();

  const form = document.querySelector('form');
  const btn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fullName = document.getElementById('full-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
      toast('Passwords do not match', 'error');
      return;
    }

    btn.textContent = 'Creating account…';
    btn.disabled = true;

    try {
      const data = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, password, confirmPassword }),
      });

      saveAuth(data.token, data.user);
      toast('Account created! Welcome, ' + data.user.fullName + '!');
      setTimeout(() => window.location.href = 'index.html', 800);
    } catch (err) {
      toast(err.message, 'error');
      btn.textContent = 'Register';
      btn.disabled = false;
    }
  });
});
