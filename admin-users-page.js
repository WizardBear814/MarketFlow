// admin-users-page.js
document.addEventListener('DOMContentLoaded', async () => {
  updateNav();

  const user = getUser();
  if (!user || user.role !== 'admin') {
    document.querySelector('main').innerHTML = `
      <h1 class="page-title">Access Denied</h1>
      <div class="card"><p>You must be an admin to view this page.</p></div>`;
    return;
  }

  const form = document.querySelector('form');
  const saveBtn = form.querySelector('button[type="submit"]');
  const tbody = document.querySelector('tbody');
  let editingId = null;

  // Add password field dynamically (needed for create)
  const passwordDiv = document.createElement('div');
  passwordDiv.id = 'password-field';
  passwordDiv.innerHTML = `
    <label for="user-password">Password <span id="pw-hint" style="color:var(--muted);font-size:0.8rem">(required for new users)</span></label>
    <input id="user-password" type="password" placeholder="Min 6 characters" />`;
  form.querySelector('.grid').after(passwordDiv);

  // Add clear button
  const clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.className = 'btn btn-secondary';
  clearBtn.textContent = 'Clear';
  clearBtn.style.marginLeft = '8px';
  saveBtn.after(clearBtn);

  async function loadUsers() {
    tbody.innerHTML = `<tr><td colspan="5" style="color:var(--muted)">Loading…</td></tr>`;
    try {
      const data = await request('/users');
      if (!data.users.length) {
        tbody.innerHTML = `<tr><td colspan="5" style="color:var(--muted)">No users found.</td></tr>`;
        return;
      }
      tbody.innerHTML = data.users.map(u => `
        <tr>
          <td>${u.fullName}</td>
          <td>${u.email}</td>
          <td style="text-transform:capitalize">${u.role}</td>
          <td>
            <span style="color:${u.status === 'active' ? '#16a34a' : '#dc2626'};font-weight:600;text-transform:capitalize">
              ${u.status}
            </span>
          </td>
          <td>
            <button class="btn btn-secondary edit-btn"
              data-id="${u._id}"
              data-name="${u.fullName}"
              data-email="${u.email}"
              data-role="${u.role}"
              data-status="${u.status}">
              Edit
            </button>
            <button class="btn btn-danger delete-btn" data-id="${u._id}" ${u._id === user.id ? 'disabled title="Cannot delete yourself"' : ''}>
              Delete
            </button>
          </td>
        </tr>`).join('');

      // Edit
      tbody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          editingId = btn.dataset.id;
          document.getElementById('user-name').value = btn.dataset.name;
          document.getElementById('user-email').value = btn.dataset.email;
          document.getElementById('role').value = btn.dataset.role.charAt(0).toUpperCase() + btn.dataset.role.slice(1);

          // Add status select if not present
          let statusSel = document.getElementById('status-select');
          if (!statusSel) {
            const div = document.createElement('div');
            div.innerHTML = `
              <label for="status-select">Status</label>
              <select id="status-select">
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>`;
            passwordDiv.after(div);
            statusSel = document.getElementById('status-select');
          }
          statusSel.value = btn.dataset.status;
          document.getElementById('pw-hint').textContent = '(leave blank to keep current)';

          saveBtn.textContent = 'Update User';
          document.querySelector('.card h3').textContent = 'Editing: ' + btn.dataset.name;
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      });

      // Delete
      tbody.querySelectorAll('.delete-btn:not([disabled])').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Delete this user?')) return;
          btn.textContent = '…';
          btn.disabled = true;
          try {
            await request(`/users/${btn.dataset.id}`, { method: 'DELETE' });
            toast('User deleted');
            loadUsers();
          } catch (err) {
            toast(err.message, 'error');
            btn.textContent = 'Delete';
            btn.disabled = false;
          }
        });
      });

    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="5" style="color:#dc2626">${err.message}</td></tr>`;
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const roleRaw = document.getElementById('role').value.toLowerCase();
    const statusEl = document.getElementById('status-select');
    const password = document.getElementById('user-password').value;

    const body = {
      fullName: document.getElementById('user-name').value.trim(),
      email: document.getElementById('user-email').value.trim(),
      role: roleRaw,
    };

    if (statusEl) body.status = statusEl.value;
    if (password) body.password = password;

    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving…';

    try {
      if (editingId) {
        await request(`/users/${editingId}`, { method: 'PUT', body: JSON.stringify(body) });
        toast('User updated');
      } else {
        if (!password) { toast('Password is required for new users', 'error'); return; }
        body.password = password;
        await request('/users', { method: 'POST', body: JSON.stringify(body) });
        toast('User created');
      }
      clearForm();
      loadUsers();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = editingId ? 'Update User' : 'Save User';
    }
  });

  function clearForm() {
    form.reset();
    editingId = null;
    saveBtn.textContent = 'Save User';
    document.querySelector('.card h3').textContent = 'Create / Edit User';
    document.getElementById('pw-hint').textContent = '(required for new users)';
    document.getElementById('status-select')?.closest('div')?.remove();
  }

  clearBtn.addEventListener('click', clearForm);
  loadUsers();
});
