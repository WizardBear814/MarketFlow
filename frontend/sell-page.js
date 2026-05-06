document.addEventListener('DOMContentLoaded', () => {
  updateNav();
  if (!requireAuth()) return;

  const form = document.querySelector('main form');
  const saveBtn = form.querySelector('button[type="submit"]');
  const clearBtn = form.querySelector('button[type="button"]');
  const tbody = document.querySelector('main table tbody');
  const cardTitle = document.querySelector('main .card h3');
  let editingId = null;

  function esc(value = '') {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  async function loadMyProducts() {
    tbody.innerHTML = '<tr><td colspan="5" class="muted">Loading…</td></tr>';
    try {
      const data = await request('/products/mine');
      if (!data.products.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="muted">You have not added any products yet.</td></tr>';
        return;
      }

      tbody.innerHTML = data.products
        .map(
          (p) => `
        <tr>
          <td>${esc(p.sku)}</td>
          <td>${esc(p.name)}</td>
          <td>$${Number(p.price).toFixed(2)}</td>
          <td>${p.quantity}</td>
          <td>
            <button
              class="btn btn-secondary edit-btn"
              data-id="${p._id}"
              data-sku="${esc(p.sku)}"
              data-name="${esc(p.name)}"
              data-price="${p.price}"
              data-qty="${p.quantity}"
              data-desc="${esc(p.description || '')}">
              Edit
            </button>
            <button class="btn btn-danger delete-btn" data-id="${p._id}">Delete</button>
          </td>
        </tr>`
        )
        .join('');

      tbody.querySelectorAll('.edit-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          editingId = btn.dataset.id;
          document.getElementById('sku').value = btn.dataset.sku;
          document.getElementById('product-name').value = btn.dataset.name;
          document.getElementById('price').value = btn.dataset.price;
          document.getElementById('quantity').value = btn.dataset.qty;
          document.getElementById('description').value = btn.dataset.desc;
          saveBtn.textContent = 'Update Product';
          cardTitle.textContent = `Editing: ${btn.dataset.name}`;
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      });

      tbody.querySelectorAll('.delete-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
          if (!confirm('Delete this product?')) return;
          btn.disabled = true;
          btn.textContent = '…';
          try {
            await request(`/products/${btn.dataset.id}`, { method: 'DELETE' });
            toast('Product deleted');
            loadMyProducts();
          } catch (err) {
            toast(err.message, 'error');
            btn.disabled = false;
            btn.textContent = 'Delete';
          }
        });
      });
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="5" style="color:var(--danger)">${esc(err.message)}</td></tr>`;
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
      sku: document.getElementById('sku').value.trim(),
      name: document.getElementById('product-name').value.trim(),
      price: parseFloat(document.getElementById('price').value),
      quantity: parseInt(document.getElementById('quantity').value, 10),
      description: document.getElementById('description').value.trim(),
    };

    if (!body.sku || !body.name || Number.isNaN(body.price) || Number.isNaN(body.quantity)) {
      toast('Please fill in SKU, name, price, and quantity', 'error');
      return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving…';
    try {
      if (editingId) {
        await request(`/products/${editingId}`, { method: 'PUT', body: JSON.stringify(body) });
        toast('Product updated');
      } else {
        await request('/products', { method: 'POST', body: JSON.stringify(body) });
        toast('Product created');
      }
      clearForm();
      loadMyProducts();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = editingId ? 'Update Product' : 'Save Product';
    }
  });

  function clearForm() {
    form.reset();
    editingId = null;
    saveBtn.textContent = 'Save Product';
    cardTitle.textContent = 'Create / Edit Product';
  }

  clearBtn.addEventListener('click', clearForm);
  loadMyProducts();
});
