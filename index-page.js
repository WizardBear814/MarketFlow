// index-page.js
document.addEventListener('DOMContentLoaded', async () => {
  updateNav();

  const grid = document.querySelector('.products-grid');
  const searchInput = document.getElementById('search');
  const searchForm = document.querySelector('form');
  const footerNote = document.querySelector('.footer-note');
  if (footerNote) footerNote.remove();

  function productCard(p) {
    const inStock = p.quantity > 0;
    const stockClass = p.quantity <= 5 ? 'stock-low' : 'stock-ok';
    const stockLabel = p.quantity <= 5 ? `Low stock: ${p.quantity}` : `In stock: ${p.quantity}`;

    return `
      <article class="card" data-id="${p._id}">
        <p class="product-sku">${p.sku}</p>
        <h3>${p.name}</h3>
        <p>${p.description || 'No description available.'}</p>
        <p class="price">$${Number(p.price).toFixed(2)}</p>
        <p class="${stockClass}">${stockLabel}</p>
        ${inStock
          ? `<button type="button" class="btn btn--primary add-to-cart-btn" data-id="${p._id}">Add to Cart</button>`
          : `<button type="button" class="btn" disabled style="opacity:0.4;cursor:not-allowed">Out of Stock</button>`
        }
      </article>
    `;
  }

  async function loadProducts(search = '') {
    grid.innerHTML = '<p style="color:var(--muted)">Loading products…</p>';
    try {
      const qs = search ? `?search=${encodeURIComponent(search)}` : '';
      const data = await request(`/products${qs}`);
      if (!data.products.length) {
        grid.innerHTML = '<p style="color:var(--muted)">No products found.</p>';
        return;
      }
      grid.innerHTML = data.products.map(productCard).join('');
      attachCartButtons();
    } catch (err) {
      grid.innerHTML = `<p style="color:#dc2626">Failed to load products: ${err.message}</p>`;
    }
  }

  function attachCartButtons() {
    grid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!getToken()) {
          toast('Please log in to add items to your cart', 'error');
          setTimeout(() => window.location.href = 'login.html', 1200);
          return;
        }
        const productId = btn.dataset.id;
        btn.textContent = 'Adding…';
        btn.disabled = true;
        try {
          await request('/cart', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity: 1 }),
          });
          toast('Added to cart!');
          btn.textContent = '✓ Added';
          setTimeout(() => {
            btn.textContent = 'Add to Cart';
            btn.disabled = false;
          }, 1500);
        } catch (err) {
          toast(err.message, 'error');
          btn.textContent = 'Add to Cart';
          btn.disabled = false;
        }
      });
    });
  }

  // Search
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loadProducts(searchInput.value.trim());
  });

  searchInput.addEventListener('input', () => {
    if (searchInput.value === '') loadProducts();
  });

  loadProducts();
});
