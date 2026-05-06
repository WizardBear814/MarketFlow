import { useCallback, useEffect, useState } from 'react';
import { request } from '../api';
import { useAuth } from '../AuthContext';
import { RequireAuth } from '../RequireAuth';
import { useToast } from '../ToastContext';

export function InventoryPage() {
  return (
    <RequireAuth roles={['seller', 'admin']}>
      <InventoryInner />
    </RequireAuth>
  );
}

function InventoryInner() {
  const toast = useToast();
  const { user } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [txType, setTxType] = useState('sale');
  const [txQty, setTxQty] = useState('');
  const [txPrice, setTxPrice] = useState('');
  const [submitBusy, setSubmitBusy] = useState(false);
  const [loadErr, setLoadErr] = useState('');

  const loadProducts = useCallback(async () => {
    try {
      const data = await request('/products');
      const list = data.products || [];
      setProducts(list);
      setProductId((prev) => {
        if (prev && list.some((x) => x._id === prev)) return prev;
        return list[0]?._id || '';
      });
    } catch (err) {
      toast(err.message, 'error');
      setProducts([]);
    }
  }, [toast]);

  const loadInventory = useCallback(async () => {
    try {
      const data = await request('/inventory');
      setKpis(data.kpis);
      setTransactions(data.transactions || []);
      setLoadErr('');
    } catch (err) {
      setLoadErr(err.message);
      setTransactions([]);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadInventory();
  }, [loadProducts, loadInventory]);

  useEffect(() => {
    const id = setInterval(loadInventory, 30000);
    return () => clearInterval(id);
  }, [loadInventory]);

  useEffect(() => {
    const p = products.find((x) => x._id === productId);
    if (p) setTxPrice(String(p.price));
  }, [productId, products]);

  async function refresh() {
    await loadProducts();
    await loadInventory();
  }

  async function deleteTx(id) {
    if (!confirm('Delete this transaction? Note: this does NOT reverse stock changes.')) return;
    try {
      await request(`/inventory/${id}`, { method: 'DELETE' });
      toast('Transaction deleted');
      refresh();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function onSubmitTx(e) {
    e.preventDefault();
    const quantity = parseInt(txQty, 10);
    const unitPrice = parseFloat(txPrice);
    if (!productId) {
      toast('Please select a product', 'error');
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      toast('Quantity must be at least 1', 'error');
      return;
    }
    if (Number.isNaN(unitPrice) || unitPrice < 0) {
      toast('Enter a valid unit price', 'error');
      return;
    }
    setSubmitBusy(true);
    try {
      await request('/inventory', {
        method: 'POST',
        body: JSON.stringify({ type: txType, productId, quantity, unitPrice }),
      });
      toast(`${txType === 'sale' ? 'Sale' : 'Purchase'} recorded`);
      setTxQty('');
      refresh();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSubmitBusy(false);
    }
  }

  const colspan = user.role === 'admin' ? 7 : 6;

  return (
    <main className="container">
      <h1 className="page-title">Inventory Accounting Dashboard</h1>
      <p className="subtitle">Track sales, purchases, revenue, and profit at a glance.</p>

      <section className="kpis" aria-label="Key metrics">
        <article className="kpi">
          <div className="label">Total Units Sold</div>
          <div className="value">
            {kpis ? Number(kpis.totalUnitsSold).toLocaleString() : '—'}
          </div>
        </article>
        <article className="kpi">
          <div className="label">Total Revenue</div>
          <div className="value">
            {kpis ? `$${Number(kpis.totalRevenue).toLocaleString()}` : '—'}
          </div>
        </article>
        <article className="kpi">
          <div className="label">Total Cost</div>
          <div className="value">
            {kpis ? `$${Number(kpis.totalCost).toLocaleString()}` : '—'}
          </div>
        </article>
        <article className="kpi">
          <div className="label">Estimated Profit</div>
          <div className="value">
            {kpis ? `$${Number(kpis.estimatedProfit).toLocaleString()}` : '—'}
          </div>
        </article>
      </section>

      <section className="card">
        <h3>Record a Transaction</h3>
        <form onSubmit={onSubmitTx}>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <div>
              <label htmlFor="tx-type">Type</label>
              <select id="tx-type" value={txType} onChange={(e) => setTxType(e.target.value)}>
                <option value="sale">Sale</option>
                <option value="purchase">Purchase</option>
              </select>
            </div>
            <div>
              <label htmlFor="tx-product">Product</label>
              <select
                id="tx-product"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              >
                {products.length === 0 && <option value="">(no products)</option>}
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} — {p.sku}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="tx-qty">Quantity</label>
              <input
                id="tx-qty"
                type="number"
                min={1}
                placeholder="1"
                required
                value={txQty}
                onChange={(e) => setTxQty(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="tx-price">Unit Price</label>
              <input
                id="tx-price"
                type="number"
                step="0.01"
                min={0}
                placeholder="0.00"
                required
                value={txPrice}
                onChange={(e) => setTxPrice(e.target.value)}
              />
            </div>
          </div>
          <button className="btn btn--primary" type="submit" disabled={submitBusy}>
            {submitBusy ? 'Saving…' : 'Record Transaction'}
          </button>
        </form>
      </section>

      <section className="card">
        <h3>Recent Transactions</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
              {user.role === 'admin' && <th />}
            </tr>
          </thead>
          <tbody>
            {loadErr && (
              <tr>
                <td colSpan={colspan} style={{ color: 'var(--danger)' }}>
                  Failed to load: {loadErr}
                </td>
              </tr>
            )}
            {!loadErr && transactions.length === 0 && (
              <tr>
                <td colSpan={colspan} className="muted" style={{ textAlign: 'center' }}>
                  No transactions yet.
                </td>
              </tr>
            )}
            {!loadErr &&
              transactions.map((tx) => {
                const date = new Date(tx.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                });
                const typeColor = tx.type === 'sale' ? 'var(--success)' : 'var(--accent)';
                return (
                  <tr key={tx._id}>
                    <td>{date}</td>
                    <td style={{ color: typeColor, fontWeight: 600, textTransform: 'capitalize' }}>
                      {tx.type}
                    </td>
                    <td>
                      {tx.product?.name || 'Deleted product'}
                      <br />
                      <small className="muted">{tx.product?.sku || ''}</small>
                    </td>
                    <td>{tx.quantity}</td>
                    <td>${Number(tx.unitPrice).toFixed(2)}</td>
                    <td>${Number(tx.total).toFixed(2)}</td>
                    {user.role === 'admin' && (
                      <td>
                        <button
                          type="button"
                          className="btn btn-danger"
                          style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                          onClick={() => deleteTx(tx._id)}
                        >
                          ✕
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </section>
    </main>
  );
}
