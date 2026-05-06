import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getToken, request } from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';

export function RegisterPage() {
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
    const fullName = String(fd.get('fullName') || '').trim();
    const email = String(fd.get('email') || '').trim();
    const password = String(fd.get('password') || '');
    const confirmPassword = String(fd.get('confirmPassword') || '');
    if (!fullName || !email || !password) {
      toast('Please fill in all fields', 'error');
      return;
    }
    if (password.length < 6) {
      toast('Password must be at least 6 characters', 'error');
      return;
    }
    if (password !== confirmPassword) {
      toast('Passwords do not match', 'error');
      return;
    }
    setBusy(true);
    try {
      const data = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, password, confirmPassword }),
      });
      login(data.token, data.user);
      toast(`Account created! Welcome, ${data.user.fullName}!`);
      setTimeout(() => navigate('/', { replace: true }), 600);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container">
      <h1 className="page-title">Create Account</h1>
      <p className="subtitle">Register to track your purchases and order history.</p>

      <section className="card" style={{ maxWidth: 560 }}>
        <form onSubmit={onSubmit}>
          <div>
            <label htmlFor="full-name">Full Name</label>
            <input id="full-name" name="fullName" type="text" placeholder="Jane Doe" required />
          </div>
          <div>
            <label htmlFor="register-email">Email</label>
            <input id="register-email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div>
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              name="password"
              type="password"
              placeholder="Create password (min 6 characters)"
              required
            />
          </div>
          <div>
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              required
            />
          </div>
          <button className="btn btn--primary" type="submit" disabled={busy}>
            {busy ? 'Creating account…' : 'Register'}
          </button>
        </form>
        <p className="muted" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
          Already have an account?{' '}
          <Link className="link" to="/login">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
