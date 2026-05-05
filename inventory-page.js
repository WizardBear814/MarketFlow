// inventory-page.js
document.addEventListener('DOMContentLoaded', async () => {
  updateNav();

  const user = getUser();
  if (!user || (user.role !== 'admin' && user.role !== 'seller')) {
    document.querySelector('main').innerHTML = `
      <h1 class="page-title">Access Denied</h1>
      <div class="card"><p>You must be an admin or seller to view this page.</p></div>`;
    return;
  }

  async function loadInventory() {
    try {
      const data = await request('/inventory');
      const { kpis, transactions } = data;

      // Update KPI cards
      const kpiArticles = document.querySelectorAll('.kpi');
      if (kpiArticles.length >= 4) {
        kpiArticles[0].querySelector('.value').textContent = Number(kpis.totalUnitsSold).toLocaleString();
        kpiArticles[1].querySelector('.value').textContent = '$' + Number(kpis.totalRevenue).toLocaleString();
        kpiArticles[2].querySelector('.value').textContent = '$' + Number(kpis.totalCost).toLocaleString();
        kpiArticles[3].querySelector('.value').textContent = '$' + Number(kpis.estimatedProfit).toLocaleString();
      }

      // Update transaction table
      const tbody = document.querySelector('tbody');
      if (!transactions.length) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--muted)">No transactions yet.</td></tr>`;
        return;
      }

      tbody.innerHTML = transactions.map(tx => {
        const date = new Date(tx.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        const typeColor = tx.type === 'sale' ? '#16a34a' : '#2563eb';
        return `
          <tr>
            <td>${date}</td>
            <td style="color:${typeColor};font-weight:600;text-transform:capitalize">${tx.type}</td>
            <td>${tx.product?.name || 'Deleted product'}<br><small style="color:var(--muted)">${tx.product?.sku || ''}</small></td>
            <td>${tx.quantity}</td>
            <td>$${Number(tx.unitPrice).toFixed(2)}</td>
            <td>$${Number(tx.total).toFixed(2)}</td>
            ${user.role === 'admin' ? `<td><button class="btn btn-danger delete-tx-btn" data-id="${tx._id}" style="padding:4px 10px;font-size:0.8rem">✕</button></td>` : ''}
          </tr>`;
      }).join('');

      // Add delete column header if admin
      if (user.role === 'admin') {
        const headerRow = document.querySelector('thead tr');
        if (!headerRow.querySelector('.delete-col')) {
          const th = document.createElement('th');
          th.className = 'delete-col';
          th.textContent = '';
          headerRow.appendChild(th);
        }
        document.querySelectorAll('.delete-tx-btn').forEach(btn => {
          btn.addEventListener('click', async () => {
            if (!confirm('Delete this transaction? This will NOT reverse stock changes.')) return;
            btn.textContent = '…';
            btn.disabled = true;
            try {
              await request(`/inventory/${btn.dataset.id}`, { method: 'DELETE' });
              toast('Transaction deleted');
              loadInventory();
            } catch (err) {
              toast(err.message, 'error');
            }
          });
        });
      }

    } catch (err) {
      document.querySelector('tbody').innerHTML =
        `<tr><td colspan="6" style="color:#dc2626">Failed to load: ${err.message}</td></tr>`;
    }
  }

  loadInventory();

  // Auto-refresh every 30 seconds
  setInterval(loadInventory, 30000);
});
