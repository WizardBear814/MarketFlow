import { useCallback, useEffect, useState } from 'react';
import { request } from '../api';
import { useAuth } from '../AuthContext';
import { RequireAuth } from '../RequireAuth';
import { useToast } from '../ToastContext';

export function AdminUsersPage() {
  return (
    <RequireAuth roles={['admin']}>
      <AdminUsersInner />
    </RequireAuth>
  );
}

function AdminUsersInner() {
  const toast = useToast();
  const { user: me, updateLocalUser } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showStatus, setShowStatus] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [quickBusy, setQuickBusy] = useState(null);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    role: 'buyer',
    password: '',
    status: 'active',
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await request('/users');
      setRows(data.users || []);
    } catch (err) {
      toast(err.message, 'error');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function clearForm() {
    setEditingId(null);
    setShowStatus(false);
    setForm({
      fullName: '',
      email: '',
      role: 'buyer',
      password: '',
      status: 'active',
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    const body = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      role: form.role,
    };
    if (showStatus) body.status = form.status;

    setSaveBusy(true);
    try {
      if (editingId) {
        if (form.password) body.password = form.password;
        await request(`/users/${editingId}`, { method: 'PUT', body: JSON.stringify(body) });
        toast('User updated');
      } else {
        if (!form.password) {
          toast('Password is required for new users', 'error');
          setSaveBusy(false);
          return;
        }
        body.password = form.password;
        await request('/users', { method: 'POST', body: JSON.stringify(body) });
        toast('User created');
      }
      clearForm();
      loadUsers();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaveBusy(false);
    }
  }

  async function deleteUser(id) {
    if (!confirm('Delete this user?')) return;
    try {
      await request(`/users/${id}`, { method: 'DELETE' });
      toast('User deleted');
      loadUsers();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  function startEdit(u) {
    setEditingId(u._id);
    setShowStatus(true);
    setForm({
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      password: '',
      status: u.status || 'active',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function setMyRole(role, key) {
    setQuickBusy(key);
    try {
      await request(`/users/${me.id}`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      });
      updateLocalUser({
        id: me.id,
        fullName: me.fullName,
        email: me.email,
        role,
      });
      toast(`Your role is now ${role}`);
      loadUsers();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setQuickBusy(null);
    }
  }

  const pwHint = editingId ? '(leave blank to keep current)' : '(required for new users)';
  const cardTitle = editingId ? `Editing: ${form.fullName}` : 'Create / Edit User';

  return (
    <main className="container">
      <h1 className="page-title">Admin User Management</h1>
      <p className="subtitle">Manage user accounts and access levels.</p>

      <section className="card">
        <h3>Quick Role for My Account</h3>
        <p className="muted">Use this to quickly switch your own role.</p>
        <div>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={quickBusy}
            onClick={() => setMyRole('buyer', 'buyer')}
          >
            {quickBusy === 'buyer' ? 'Saving…' : 'Make Me Buyer'}
          </button>{' '}
          <button
            type="button"
            className="btn btn-secondary"
            disabled={quickBusy}
            onClick={() => setMyRole('seller', 'seller')}
          >
            {quickBusy === 'seller' ? 'Saving…' : 'Make Me Seller'}
          </button>{' '}
          <button
            type="button"
            className="btn btn--primary"
            disabled={quickBusy}
            onClick={() => setMyRole('admin', 'admin')}
          >
            {quickBusy === 'admin' ? 'Saving…' : 'Make Me Admin'}
          </button>
        </div>
      </section>

      <section className="card">
        <h3>{cardTitle}</h3>
        <form onSubmit={onSubmit}>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div>
              <label htmlFor="user-name">Full Name</label>
              <input
                id="user-name"
                type="text"
                placeholder="Full name"
                required
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="user-email">Email</label>
              <input
                id="user-email"
                type="email"
                placeholder="email@example.com"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="role">Role</label>
              <select
                id="role"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="user-password">
              Password{' '}
              <span className="muted" style={{ fontSize: '0.75rem', textTransform: 'none', letterSpacing: 0 }}>
                {pwHint}
              </span>
            </label>
            <input
              id="user-password"
              type="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          </div>
          {showStatus && (
            <div>
              <label htmlFor="status-select">Status</label>
              <select
                id="status-select"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          )}
          <div>
            <button type="submit" className="btn btn--primary" disabled={saveBusy}>
              {saveBusy ? 'Saving…' : editingId ? 'Update User' : 'Save User'}
            </button>
            <button type="button" className="btn btn-secondary" style={{ marginLeft: 8 }} onClick={clearForm}>
              Clear
            </button>
          </div>
        </form>
      </section>

      <section style={{ marginTop: '1rem' }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="muted">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="muted">
                  No users found.
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((u) => (
                <tr key={u._id}>
                  <td>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                  <td>
                    <span
                      style={{
                        color: u.status === 'active' ? 'var(--success)' : 'var(--danger)',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="btn btn-secondary" onClick={() => startEdit(u)}>
                      Edit
                    </button>{' '}
                    <button
                      type="button"
                      className="btn btn-danger"
                      disabled={u._id === me.id}
                      title={u._id === me.id ? 'Cannot delete yourself' : undefined}
                      onClick={() => deleteUser(u._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
