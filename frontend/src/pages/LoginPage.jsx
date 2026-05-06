import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getToken, request } from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (getToken()) navigate('/', { replace: true });
  }, [navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const email = String(fd.get('email') || '').trim();
    const password = String(fd.get('password') || '');
    if (!email || !password) {
      toast('Please enter both email and password', 'error');
      return;
    }
    setBusy(true);
    try {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      login(data.token, data.user);
      toast(`Welcome back, ${data.user.fullName}!`);
      setTimeout(() => navigate('/', { replace: true }), 600);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container">
      <h1 className="page-title">Login</h1>
      <p className="subtitle">Sign in to access your account and shop.</p>

      <section className="card" style={{ maxWidth: 480 }}>
        <form onSubmit={onSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="Enter password" required />
          </div>
          <button className="btn btn--primary" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Login'}
          </button>
        </form>
        <p className="muted" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
          New here?{' '}
          <Link className="link" to="/register">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
