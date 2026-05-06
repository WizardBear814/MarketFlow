import { useCallback, useEffect, useState } from 'react';
import { request } from '../api';
import { RequireAuth } from '../RequireAuth';
import { useToast } from '../ToastContext';

export function SellPage() {
  return (
    <RequireAuth>
      <SellInner />
    </RequireAuth>
  );
}

function SellInner() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [saveBusy, setSaveBusy] = useState(false);
  const [form, setForm] = useState({
    sku: '',
    name: '',
    price: '',
    quantity: '',
    description: '',
  });

  const loadMyProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await request('/products/mine');
      setRows(data.products || []);
    } catch (err) {
      toast(err.message, 'error');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadMyProducts();
  }, [loadMyProducts]);

  function clearForm() {
    setEditingId(null);
    setForm({ sku: '', name: '', price: '', quantity: '', description: '' });
  }

  async function onSubmit(e) {
    e.preventDefault();
    const body = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity, 10),
      description: form.description.trim(),
    };
    if (!body.sku || !body.name || Number.isNaN(body.price) || Number.isNaN(body.quantity)) {
      toast('Please fill in SKU, name, price, and quantity', 'error');
      return;
    }
    setSaveBusy(true);
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
      setSaveBusy(false);
    }
  }

  async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    try {
      await request(`/products/${id}`, { method: 'DELETE' });
      toast('Product deleted');
      loadMyProducts();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  function startEdit(p) {
    setEditingId(p._id);
    setForm({
      sku: p.sku,
      name: p.name,
      price: String(p.price),
      quantity: String(p.quantity),
      description: p.description || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const cardTitle = editingId ? `Editing: ${form.name}` : 'Create / Edit Product';

  return (
    <main className="container">
      <h1 className="page-title">Sell a Product</h1>
      <p className="subtitle">Create listings and manage the products you added.</p>

      <section className="card">
        <h3>{cardTitle}</h3>
        <form onSubmit={onSubmit}>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div>
              <label htmlFor="sku">SKU</label>
              <input
                id="sku"
                type="text"
                placeholder="SKU-001"
                required
                value={form.sku}
                onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="product-name">Name</label>
              <input
                id="product-name"
                type="text"
                placeholder="Product name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="price">Price</label>
              <input
                id="price"
                type="number"
                step="0.01"
                min={0}
                placeholder="0.00"
                required
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="quantity">Quantity</label>
              <input
                id="quantity"
                type="number"
                min={0}
                placeholder="0"
                required
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={3}
              placeholder="Product details"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div>
            <button type="submit" className="btn btn--primary" disabled={saveBusy}>
              {saveBusy ? 'Saving…' : editingId ? 'Update Product' : 'Save Product'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={clearForm}>
              Clear
            </button>
          </div>
        </form>
      </section>

      <section style={{ marginTop: '1rem' }}>
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Price</th>
              <th>Qty</th>
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
                  You have not added any products yet.
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((p) => (
                <tr key={p._id}>
                  <td>{p.sku}</td>
                  <td>{p.name}</td>
                  <td>${Number(p.price).toFixed(2)}</td>
                  <td>{p.quantity}</td>
                  <td>
                    <button type="button" className="btn btn-secondary" onClick={() => startEdit(p)}>
                      Edit
                    </button>{' '}
                    <button type="button" className="btn btn-danger" onClick={() => deleteProduct(p._id)}>
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
