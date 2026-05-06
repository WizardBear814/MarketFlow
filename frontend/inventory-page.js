// inventory-page.js
document.addEventListener('DOMContentLoaded', () => {
  updateNav();
  if (!requireAuth(['seller', 'admin'])) return;

  const me = getUser();
  const txForm = document.getElementById('tx-form');
  const txProductSelect = document.getElementById('tx-product');
  const txPriceInput = document.getElementById('tx-price');

  function syncUnitPriceFromProductSelect() {
    const opt = txProductSelect.selectedOptions[0];
    if (opt && opt.dataset.price != null) {
      txPriceInput.value = opt.dataset.price;
    }
  }

  txProductSelect.addEventListener('change', syncUnitPriceFromProductSelect);

  async function loadProductsIntoSelect() {
    try {
      const data = await request('/products');
      if (!data.products.length) {
        txProductSelect.innerHTML = `<option value="">(no products)</option>`;
        return;
      }
      txProductSelect.innerHTML = data.products
        .map((p) => `<option value="${p._id}" data-price="${p.price}">${p.name} — ${p.sku}</option>`)
        .join('');

      syncUnitPriceFromProductSelect();
    } catch (err) {
      txProductSelect.innerHTML = `<option value="">${err.message}</option>`;
    }
  }

  async function loadInventory() {
    try {
      const data = await request('/inventory');
      const { kpis, transactions } = data;

      const kpiArticles = document.querySelectorAll('.kpi');
      if (kpiArticles.length >= 4) {
        kpiArticles[0].querySelector('.value').textContent = Number(kpis.totalUnitsSold).toLocaleString();
        kpiArticles[1].querySelector('.value').textContent = '$' + Number(kpis.totalRevenue).toLocaleString();
        kpiArticles[2].querySelector('.value').textContent = '$' + Number(kpis.totalCost).toLocaleString();
        kpiArticles[3].querySelector('.value').textContent = '$' + Number(kpis.estimatedProfit).toLocaleString();
      }

      const tbody = document.querySelector('main table tbody');
      if (!transactions.length) {
        tbody.innerHTML = `<tr><td colspan="${me.role === 'admin' ? 7 : 6}" class="muted" style="text-align:center">No transactions yet.</td></tr>`;
        return;
      }

      // Add delete column header for admins
      const headerRow = document.querySelector('main thead tr');
      if (me.role === 'admin' && !headerRow.querySelector('.delete-col')) {
        const th = document.createElement('th');
        th.className = 'delete-col';
        th.textContent = '';
        headerRow.appendChild(th);
      }

      tbody.innerHTML = transactions
        .map((tx) => {
          const date = new Date(tx.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
          const typeColor = tx.type === 'sale' ? 'var(--success)' : 'var(--accent)';
          return `
            <tr>
              <td>${date}</td>
              <td style="color:${typeColor};font-weight:600;text-transform:capitalize">${tx.type}</td>
              <td>${tx.product?.name || 'Deleted product'}<br><small class="muted">${tx.product?.sku || ''}</small></td>
              <td>${tx.quantity}</td>
              <td>$${Number(tx.unitPrice).toFixed(2)}</td>
              <td>$${Number(tx.total).toFixed(2)}</td>
              ${me.role === 'admin' ? `<td><button class="btn btn-danger delete-tx-btn" data-id="${tx._id}" style="padding:4px 10px;font-size:0.8rem">✕</button></td>` : ''}
            </tr>`;
        })
        .join('');

      if (me.role === 'admin') {
        document.querySelectorAll('.delete-tx-btn').forEach((btn) => {
          btn.addEventListener('click', async () => {
            if (!confirm('Delete this transaction? Note: this does NOT reverse stock changes.')) return;
            btn.textContent = '…';
            btn.disabled = true;
            try {
              await request(`/inventory/${btn.dataset.id}`, { method: 'DELETE' });
              toast('Transaction deleted');
              refresh();
            } catch (err) {
              toast(err.message, 'error');
            }
          });
        });
      }
    } catch (err) {
      document.querySelector('main table tbody').innerHTML = `
        <tr><td colspan="6" style="color:var(--danger)">Failed to load: ${err.message}</td></tr>`;
    }
  }

  txForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const productId = txProductSelect.value;
    const type = document.getElementById('tx-type').value;
    const quantity = parseInt(document.getElementById('tx-qty').value, 10);
    const unitPrice = parseFloat(document.getElementById('tx-price').value);

    if (!productId) {
      toast('Please select a product', 'error');
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      toast('Quantity must be at least 1', 'error');
      return;
    }
    if (isNaN(unitPrice) || unitPrice < 0) {
      toast('Enter a valid unit price', 'error');
      return;
    }

    const submitBtn = txForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving…';

    try {
      await request('/inventory', {
        method: 'POST',
        body: JSON.stringify({ type, productId, quantity, unitPrice }),
      });
      toast(`${type === 'sale' ? 'Sale' : 'Purchase'} recorded`);
      txForm.reset();
      txProductSelect.dispatchEvent(new Event('change'));
      refresh();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Record Transaction';
    }
  });

  function refresh() {
    loadProductsIntoSelect();
    loadInventory();
  }

  refresh();
  setInterval(loadInventory, 30000);
});
