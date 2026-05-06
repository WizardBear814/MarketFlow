import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getToken, request } from '../api';
import { useToast } from '../ToastContext';

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [btnState, setBtnState] = useState('idle');

  const loadProduct = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await request(`/products/${id}`);
      setProduct(data.product);
    } catch (err) {
      setError(err.message);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  async function addToCart() {
    if (!product) return;
    if (!getToken()) {
      toast('Please log in to add items to your cart', 'error');
      setTimeout(() => navigate('/login'), 1000);
      return;
    }
    setBtnState('loading');
    try {
      await request('/cart', {
        method: 'POST',
        body: JSON.stringify({ productId: product._id, quantity: 1 }),
      });
      toast('Added to cart!');
      setBtnState('added');
      setTimeout(() => setBtnState('idle'), 1500);
    } catch (err) {
      toast(err.message, 'error');
      setBtnState('idle');
    }
  }

  const inStock = product ? product.quantity > 0 : false;
  const createdAt = product?.createdAt ? new Date(product.createdAt) : null;
  const uploadedLabel = createdAt ? createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
  const sellerName = product?.seller?.fullName || '—';

  return (
    <main className="container">
      <div style={{ marginBottom: 12 }}>
        <Link className="link" to="/">
          ← Back to Marketplace
        </Link>
      </div>

      {loading && <p className="muted">Loading…</p>}
      {!loading && error && <p style={{ color: 'var(--danger)' }}>Failed to load: {error}</p>}

      {!loading && !error && product && (
        <>
          <section className="card" style={{ padding: 18 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(220px, 360px) 1fr',
                gap: 18,
                alignItems: 'start',
              }}
            >
              <div
                aria-label="Product image placeholder"
                style={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  borderRadius: 16,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid var(--border)',
                }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 35 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'start' }}>
                  <h2 style={{ margin: 0, fontSize: '1.45rem' }}>{product.name}</h2>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>${Number(product.price).toFixed(2)}</div>
                  <div className="muted" style={{ fontSize: '0.9rem' }}>
                    Uploaded {uploadedLabel}
                  </div>
                </div>

                <div>
                  <div className="muted" style={{ fontSize: '0.85rem' }}>
                    Seller
                  </div>
                  <div style={{ fontWeight: 700 }}>{sellerName}</div>
                </div>

                <div>
                  {inStock ? (
                    <button
                      type="button"
                      className="btn btn--primary"
                      disabled={btnState === 'loading'}
                      onClick={addToCart}
                    >
                      {btnState === 'loading' ? 'Adding…' : btnState === 'added' ? '✓ Added' : 'Add to Cart'}
                    </button>
                  ) : (
                    <button type="button" className="btn" disabled style={{ opacity: 0.4, cursor: 'not-allowed' }}>
                      Out of Stock
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 18, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <p style={{ marginBottom: 0 }}>{product.description || 'No description available.'}</p>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

