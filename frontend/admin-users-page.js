// admin-users-page.js
document.addEventListener('DOMContentLoaded', () => {
  updateNav();
  if (!requireAuth(['admin'])) return;

  const me = getUser();
  const form = document.querySelector('main form');
  const saveBtn = form.querySelector('button[type="submit"]');
  const tbody = document.querySelector('main table tbody');
  const cardTitle = document.querySelector('main .card h3');
  let editingId = null;

  // Add password field dynamically (needed for create, optional for edit)
  const passwordDiv = document.createElement('div');
  passwordDiv.id = 'password-field';
  passwordDiv.innerHTML = `
    <label for="user-password">Password
      <span id="pw-hint" class="muted" style="font-size:0.75rem;text-transform:none;letter-spacing:0">
        (required for new users)
      </span>
    </label>
    <input id="user-password" type="password" placeholder="Min 6 characters" />`;
  form.querySelector('.grid').after(passwordDiv);

  // Add status field dynamically (used during edit)
  const statusDiv = document.createElement('div');
  statusDiv.id = 'status-field';
  statusDiv.style.display = 'none';
  statusDiv.innerHTML = `
    <label for="status-select">Status</label>
    <select id="status-select">
      <option value="active">Active</option>
      <option value="suspended">Suspended</option>
    </select>`;
  passwordDiv.after(statusDiv);

  // Add Clear button
  const clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.className = 'btn btn-secondary';
  clearBtn.textContent = 'Clear';
  clearBtn.style.marginLeft = '8px';
  saveBtn.after(clearBtn);

  async function loadUsers() {
    tbody.innerHTML = `<tr><td colspan="5" class="muted">Loading…</td></tr>`;
    try {
      const data = await request('/users');
      if (!data.users.length) {
        tbody.innerHTML = `<tr><td colspan="5" class="muted">No users found.</td></tr>`;
        return;
      }
      tbody.innerHTML = data.users
        .map(
          (u) => `
        <tr>
          <td>${u.fullName}</td>
          <td>${u.email}</td>
          <td style="text-transform:capitalize">${u.role}</td>
          <td>
            <span style="color:${u.status === 'active' ? 'var(--success)' : 'var(--danger)'};font-weight:600;text-transform:capitalize">
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
            <button class="btn btn-danger delete-btn" data-id="${u._id}" ${u._id === me.id ? 'disabled title="Cannot delete yourself"' : ''}>
              Delete
            </button>
          </td>
        </tr>`
        )
        .join('');

      tbody.querySelectorAll('.edit-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          editingId = btn.dataset.id;
          document.getElementById('user-name').value = btn.dataset.name;
          document.getElementById('user-email').value = btn.dataset.email;
          document.getElementById('role').value = btn.dataset.role;
          statusDiv.style.display = '';
          document.getElementById('status-select').value = btn.dataset.status;
          document.getElementById('pw-hint').textContent = '(leave blank to keep current)';
          saveBtn.textContent = 'Update User';
          cardTitle.textContent = 'Editing: ' + btn.dataset.name;
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      });

      tbody.querySelectorAll('.delete-btn:not([disabled])').forEach((btn) => {
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
      tbody.innerHTML = `<tr><td colspan="5" style="color:var(--danger)">${err.message}</td></tr>`;
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('user-password').value;
    const body = {
      fullName: document.getElementById('user-name').value.trim(),
      email: document.getElementById('user-email').value.trim(),
      role: document.getElementById('role').value,
    };
    if (statusDiv.style.display !== 'none') body.status = document.getElementById('status-select').value;

    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving…';

    try {
      if (editingId) {
        if (password) body.password = password;
        await request(`/users/${editingId}`, { method: 'PUT', body: JSON.stringify(body) });
        toast('User updated');
      } else {
        if (!password) {
          toast('Password is required for new users', 'error');
          return;
        }
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
    cardTitle.textContent = 'Create / Edit User';
    document.getElementById('pw-hint').textContent = '(required for new users)';
    statusDiv.style.display = 'none';
  }

  clearBtn.addEventListener('click', clearForm);
  loadUsers();
});
