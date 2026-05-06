import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, request } from '../api';
import { useToast } from '../ToastContext';

export function HomePage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProducts = useCallback(async (q = '') => {
    setLoading(true);
    setError('');
    try {
      const qs = q ? `?search=${encodeURIComponent(q)}` : '';
      const data = await request(`/products${qs}`);
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const delay = search.trim() === '' ? 0 : 250;
    const t = setTimeout(() => loadProducts(search.trim()), delay);
    return () => clearTimeout(t);
  }, [search, loadProducts]);

  async function handleAddToCart(productId, btnSetter) {
    if (!getToken()) {
      toast('Please log in to add items to your cart', 'error');
      setTimeout(() => navigate('/login'), 1000);
      return;
    }
    btnSetter({ loading: true });
    try {
      await request('/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      toast('Added to cart!');
      btnSetter({ added: true });
      setTimeout(() => btnSetter({ idle: true }), 1500);
    } catch (err) {
      toast(err.message, 'error');
      btnSetter({ idle: true });
    }
  }

  return (
    <main className="container">
      <h1 className="page-title">Shop Available Products</h1>
      <p className="subtitle">Browse products, compare prices, and add items to your cart.</p>
      <p className="muted" style={{ fontSize: '0.95rem' }}>
        To try seller or admin flows, log out and sign in with the seeded accounts listed in README.md.
      </p>

      <section className="card" aria-label="Search products">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadProducts(search.trim());
          }}
        >
          <div>
            <label htmlFor="search">Search products</label>
            <input
              id="search"
              type="text"
              placeholder="Search by name, SKU, or description"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </form>
      </section>

      <section className="grid products-grid" aria-label="Product listing">
        {loading && <p className="muted">Loading products…</p>}
        {!loading && error && (
          <p style={{ color: 'var(--danger)' }}>Failed to load products: {error}</p>
        )}
        {!loading && !error && products.length === 0 && (
          <p className="muted">No products found. Try a different search.</p>
        )}
        {!loading &&
          !error &&
          products.map((p) => (
            <ProductCard key={p._id} product={p} onAdd={handleAddToCart} />
          ))}
      </section>
    </main>
  );
}

function ProductCard({ product: p, onAdd }) {
  const [btnState, setBtnState] = useState('idle');
  const inStock = p.quantity > 0;
  const stockClass = p.quantity <= 5 ? 'stock-low' : 'stock-ok';
  const stockLabel = p.quantity <= 5 ? `Low stock: ${p.quantity}` : `In stock: ${p.quantity}`;

  function btnSetter(flags) {
    if (flags.loading) setBtnState('loading');
    else if (flags.added) setBtnState('added');
    else setBtnState('idle');
  }

  return (
    <article className="card" data-id={p._id}>
      <p className="product-sku">{p.sku}</p>
      <h3>{p.name}</h3>
      <p>{p.description || 'No description available.'}</p>
      <p className="price">${Number(p.price).toFixed(2)}</p>
      <p className={stockClass}>{stockLabel}</p>
      {inStock ? (
        <button
          type="button"
          className="btn btn--primary add-to-cart-btn"
          disabled={btnState === 'loading'}
          onClick={() => onAdd(p._id, btnSetter)}
        >
          {btnState === 'loading' ? 'Adding…' : btnState === 'added' ? '✓ Added' : 'Add to Cart'}
        </button>
      ) : (
        <button type="button" className="btn" disabled style={{ opacity: 0.4, cursor: 'not-allowed' }}>
          Out of Stock
        </button>
      )}
    </article>
  );
}
