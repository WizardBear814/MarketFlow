import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { request } from '../api';
import { RequireAuth } from '../RequireAuth';
import { useToast } from '../ToastContext';

export function CartPage() {
  return (
    <RequireAuth>
      <CartInner />
    </RequireAuth>
  );
}

function CartInner() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState('0.00');
  const [loading, setLoading] = useState(true);

  const loadCart = useCallback(async () => {
    try {
      const data = await request('/cart');
      setItems(data.items || []);
      setTotal(data.total || '0.00');
    } catch (err) {
      toast(err.message, 'error');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  async function removeLine(productId) {
    try {
      await request(`/cart/${productId}`, { method: 'DELETE' });
      toast('Item removed');
      loadCart();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function updateQty(productId, qty) {
    try {
      await request(`/cart/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity: qty }),
      });
      loadCart();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function handleQtyClick(productId, action, currentQty) {
    if (action === 'dec' && currentQty <= 1) {
      await removeLine(productId);
      return;
    }
    const next = action === 'inc' ? currentQty + 1 : currentQty - 1;
    await updateQty(productId, next);
  }

  async function clearCart() {
    if (!confirm('Clear your entire cart?')) return;
    try {
      await request('/cart', { method: 'DELETE' });
      toast('Cart cleared');
      loadCart();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function checkout() {
    if (!confirm('Proceed to checkout? This will record the items as sales.')) return;
    try {
      await request('/cart/checkout', { method: 'POST' });
      toast('Checkout complete!');
      loadCart();
    } catch (err) {
      toast(`Checkout failed: ${err.message}`, 'error');
    }
  }

  const totalQty = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <main className="container">
      <h1 className="page-title">Your Cart</h1>
      <p className="subtitle">Review your order, update quantities, and checkout.</p>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Subtotal</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={5} className="muted">
                Loading cart…
              </td>
            </tr>
          )}
          {!loading && items.length === 0 && (
            <tr>
              <td colSpan={5} className="muted" style={{ textAlign: 'center' }}>
                Your cart is empty.{' '}
                <Link className="link" to="/">
                  Shop now
                </Link>
              </td>
            </tr>
          )}
          {!loading &&
            items.map((item) => {
              const p = item.product;
              if (!p) return null;
              const subtotal = (p.price * item.quantity).toFixed(2);
              return (
                <tr key={p._id}>
                  <td>
                    {p.name}
                    <br />
                    <small className="muted">{p.sku}</small>
                  </td>
                  <td>${Number(p.price).toFixed(2)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px' }}
                        onClick={() => handleQtyClick(p._id, 'dec', item.quantity)}
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px' }}
                        onClick={() => handleQtyClick(p._id, 'inc', item.quantity)}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td>${subtotal}</td>
                  <td>
                    <button type="button" className="btn btn-danger" onClick={() => removeLine(p._id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>

      <section className="card" style={{ marginTop: '1rem' }}>
        <h3>Order Summary</h3>
        <p>
          <strong>Total Items:</strong> {totalQty}
        </p>
        <p>
          <strong>Order Total:</strong> ${total}
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button
            type="button"
            className="btn btn--primary"
            disabled={items.length === 0}
            style={{ opacity: items.length === 0 ? 0.4 : 1 }}
            onClick={checkout}
          >
            Checkout
          </button>
          <button type="button" className="btn btn-danger" onClick={clearCart}>
            Clear Cart
          </button>
        </div>
      </section>
    </main>
  );
}
