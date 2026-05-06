// cart-page.js
document.addEventListener('DOMContentLoaded', () => {
  updateNav();
  if (!requireAuth()) return;

  const tbody = document.querySelector('tbody');
  const summary = document.querySelector('main .card');

  async function loadCart() {
    try {
      const data = await request('/cart');

      if (!data.items.length) {
        tbody.innerHTML = `
          <tr><td colspan="5" class="muted" style="text-align:center">
            Your cart is empty. <a class="link" href="index.html">Shop now</a>
          </td></tr>`;
        summary.innerHTML = `
          <h3>Order Summary</h3>
          <p><strong>Total Items:</strong> 0</p>
          <p><strong>Order Total:</strong> $0.00</p>
          <button type="button" class="btn btn--primary" disabled style="opacity:0.4">Checkout</button>`;
        return;
      }

      const totalQty = data.items.reduce((s, i) => s + i.quantity, 0);

      tbody.innerHTML = data.items
        .map((item) => {
          const p = item.product;
          if (!p) return '';
          const subtotal = (p.price * item.quantity).toFixed(2);
          return `
            <tr>
              <td>${p.name}<br><small class="muted">${p.sku}</small></td>
              <td>$${Number(p.price).toFixed(2)}</td>
              <td>
                <div style="display:flex;align-items:center;gap:6px">
                  <button class="btn btn-secondary qty-btn" data-id="${p._id}" data-action="dec" style="padding:4px 10px">−</button>
                  <span>${item.quantity}</span>
                  <button class="btn btn-secondary qty-btn" data-id="${p._id}" data-action="inc" style="padding:4px 10px">+</button>
                </div>
              </td>
              <td>$${subtotal}</td>
              <td><button class="btn btn-danger remove-btn" data-id="${p._id}">Remove</button></td>
            </tr>`;
        })
        .join('');

      summary.innerHTML = `
        <h3>Order Summary</h3>
        <p><strong>Total Items:</strong> ${totalQty}</p>
        <p><strong>Order Total:</strong> $${data.total}</p>
        <div style="display:flex;gap:10px;margin-top:8px">
          <button type="button" class="btn btn--primary" id="checkout-btn">Checkout</button>
          <button class="btn btn-danger" id="clear-cart-btn">Clear Cart</button>
        </div>`;

      tbody.querySelectorAll('.remove-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
          btn.textContent = '…';
          btn.disabled = true;
          try {
            await request(`/cart/${btn.dataset.id}`, { method: 'DELETE' });
            toast('Item removed');
            loadCart();
          } catch (err) {
            toast(err.message, 'error');
          }
        });
      });

      tbody.querySelectorAll('.qty-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const productId = btn.dataset.id;
          const action = btn.dataset.action;
          const row = btn.closest('tr');
          const qtySpan = row.querySelector('span');
          let qty = parseInt(qtySpan.textContent, 10);

          if (action === 'dec' && qty <= 1) {
            try {
              await request(`/cart/${productId}`, { method: 'DELETE' });
              toast('Item removed');
              loadCart();
            } catch (err) {
              toast(err.message, 'error');
            }
            return;
          }

          qty = action === 'inc' ? qty + 1 : qty - 1;
          try {
            await request(`/cart/${productId}`, {
              method: 'PUT',
              body: JSON.stringify({ quantity: qty }),
            });
            loadCart();
          } catch (err) {
            toast(err.message, 'error');
          }
        });
      });

      document.getElementById('clear-cart-btn')?.addEventListener('click', async () => {
        if (!confirm('Clear your entire cart?')) return;
        try {
          await request('/cart', { method: 'DELETE' });
          toast('Cart cleared');
          loadCart();
        } catch (err) {
          toast(err.message, 'error');
        }
      });

      document.getElementById('checkout-btn')?.addEventListener('click', async () => {
        console.log('clicked checkout button');
        if (!confirm('Proceed to checkout? This will record the items as sales.')) return;
        try {
          // Record each cart item as a sale transaction
            //changed so that buyers can checkout, previously it was calling /inventory which buyers dont have access to
          console.log('calling /cart/checkout');
          await request('/cart/checkout', { method: 'POST' });
          toast ('Checkout complete!');
          loadCart();
        }
        catch (err){
          toast('Checkout failed: ' + err.message);
        }
      });
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="5" style="color:var(--danger)">Failed to load cart: ${err.message}</td></tr>`;
    }
  }

  loadCart();
});
