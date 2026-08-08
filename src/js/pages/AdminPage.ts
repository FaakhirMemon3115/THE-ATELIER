import { store } from '../data/mockState';

export function renderAdminPage(activeTab = 'dashboard'): string {
  return `
    <div class="admin-container">
      <div class="container">
        <div class="admin-layout">
          <!-- Sidebar -->
          <aside class="admin-sidebar">
            <div class="admin-title">THE ATELIER ADMIN</div>

            <nav style="display: flex; flex-direction: column; gap: 8px;">
              <button class="admin-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}" data-admin-tab="dashboard">
                <i class="fa-solid fa-chart-line"></i> Dashboard Overview
              </button>
              <button class="admin-nav-btn ${activeTab === 'products' ? 'active' : ''}" data-admin-tab="products">
                <i class="fa-solid fa-shirt"></i> Product Catalog (${store.productsList.length})
              </button>
              <button class="admin-nav-btn ${activeTab === 'orders' ? 'active' : ''}" data-admin-tab="orders">
                <i class="fa-solid fa-receipt"></i> Order Management (${store.orders.length})
              </button>
              <button class="admin-nav-btn ${activeTab === 'coupons' ? 'active' : ''}" data-admin-tab="coupons">
                <i class="fa-solid fa-ticket"></i> Promo Coupons
              </button>
            </nav>
          </aside>

          <!-- Main Panel -->
          <main>
            ${
              activeTab === 'dashboard'
                ? `
              <h2 class="heading-2 font-serif" style="margin-bottom: 20px;">ADMINISTRATIVE ANALYTICS</h2>

              <!-- KPI Metrics -->
              <div class="kpi-grid">
                <div class="kpi-card">
                  <div class="kpi-label">TOTAL SALES REVENUE</div>
                  <div class="kpi-val text-gold">Rs. ${store.adminStats.totalSales.toLocaleString()}</div>
                  <div style="font-size: 0.75rem; color: #27AE60;"><i class="fa-solid fa-arrow-up"></i> +14.2% from last month</div>
                </div>

                <div class="kpi-card">
                  <div class="kpi-label">TOTAL ORDERS</div>
                  <div class="kpi-val">${store.adminStats.totalOrders}</div>
                  <div style="font-size: 0.75rem; color: #27AE60;"><i class="fa-solid fa-arrow-up"></i> +8.5% new orders</div>
                </div>

                <div class="kpi-card">
                  <div class="kpi-label">ACTIVE CUSTOMERS</div>
                  <div class="kpi-val">${store.adminStats.totalCustomers}</div>
                  <div style="font-size: 0.75rem; color: var(--color-muted);">1,842 Registered</div>
                </div>

                <div class="kpi-card">
                  <div class="kpi-label">ACTIVE PRODUCTS</div>
                  <div class="kpi-val">${store.productsList.length}</div>
                  <div style="font-size: 0.75rem; color: var(--color-gold);">100% In Stock</div>
                </div>
              </div>

              <!-- Revenue Chart Visual -->
              <div style="background-color: #FFFFFF; padding: 24px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); margin-bottom: 24px;">
                <h4 class="font-serif heading-3" style="margin-bottom: 16px;">MONTHLY REVENUE OVERVIEW (2026)</h4>
                <div style="display: flex; align-items: flex-end; gap: 20px; height: 180px; padding-top: 20px; border-bottom: 1px solid var(--color-border-light);">
                  <div style="flex: 1; background: var(--color-ivory); height: 40%; border-radius: 4px 4px 0 0; text-align: center; font-size: 0.75rem;">Jan</div>
                  <div style="flex: 1; background: var(--color-ivory); height: 55%; border-radius: 4px 4px 0 0; text-align: center; font-size: 0.75rem;">Feb</div>
                  <div style="flex: 1; background: var(--color-ivory); height: 70%; border-radius: 4px 4px 0 0; text-align: center; font-size: 0.75rem;">Mar</div>
                  <div style="flex: 1; background: var(--color-ivory); height: 60%; border-radius: 4px 4px 0 0; text-align: center; font-size: 0.75rem;">Apr</div>
                  <div style="flex: 1; background: var(--color-ivory); height: 85%; border-radius: 4px 4px 0 0; text-align: center; font-size: 0.75rem;">May</div>
                  <div style="flex: 1; background: var(--color-gold); height: 100%; border-radius: 4px 4px 0 0; text-align: center; font-size: 0.75rem; font-weight: bold; color: #fff;">Jun</div>
                </div>
              </div>
            `
                : activeTab === 'products'
                ? `
              <div class="flex justify-between items-center" style="margin-bottom: 20px;">
                <h2 class="heading-2 font-serif">PRODUCT CATALOG MANAGEMENT</h2>
                <button class="btn btn-primary" id="admin-add-product-btn"><i class="fa-solid fa-plus"></i> ADD NEW PRODUCT</button>
              </div>

              <!-- Product Table -->
              <div style="background-color: #FFFFFF; border: 1px solid var(--color-border); border-radius: var(--radius-sm); overflow-x: auto;">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${store.productsList
                      .map(
                        (p) => `
                      <tr>
                        <td class="flex items-center gap-md">
                          <img src="${p.primaryImage}" style="width: 40px; height: 50px; object-fit: cover; border-radius: 2px;" />
                          <strong>${p.name}</strong>
                        </td>
                        <td>${p.sku}</td>
                        <td>${p.category}</td>
                        <td>Rs. ${p.price.toLocaleString()}</td>
                        <td>${p.stock} units</td>
                        <td><span class="status-badge status-delivered">Active</span></td>
                      </tr>
                    `
                      )
                      .join('')}
                  </tbody>
                </table>
              </div>
            `
                : activeTab === 'orders'
                ? `
              <h2 class="heading-2 font-serif" style="margin-bottom: 20px;">ORDER STATUS MANAGEMENT</h2>
              <div style="background-color: #FFFFFF; border: 1px solid var(--color-border); border-radius: var(--radius-sm); overflow-x: auto;">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${store.orders
                      .map(
                        (o) => `
                      <tr>
                        <td><strong>#${o.id}</strong></td>
                        <td>${o.customerName}</td>
                        <td>${o.date}</td>
                        <td>Rs. ${o.total.toLocaleString()}</td>
                        <td><span class="status-badge status-${o.status.toLowerCase()}">${o.status}</span></td>
                        <td>
                          <select class="form-control admin-status-select" data-order-id="${o.id}" style="padding: 4px 8px; font-size: 0.75rem;">
                            <option value="Confirmed" ${o.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                            <option value="Packed" ${o.status === 'Packed' ? 'selected' : ''}>Packed</option>
                            <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                            <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    `
                      )
                      .join('')}
                  </tbody>
                </table>
              </div>
            `
                : `
              <h2 class="heading-2 font-serif" style="margin-bottom: 20px;">PROMO COUPON CAMPAIGNS</h2>
              <div style="background-color: #FFFFFF; padding: 24px; border: 1px solid var(--color-border); border-radius: var(--radius-sm);">
                <div class="flex justify-between items-center" style="margin-bottom: 16px;">
                  <div>
                    <h4 class="font-serif heading-3">ACTIVE PROMO: ATELIER10</h4>
                    <p style="font-size: 0.85rem; color: var(--color-muted);">10% Discount on all orders across entire catalog.</p>
                  </div>
                  <span class="status-badge status-delivered">ACTIVE</span>
                </div>
              </div>
            `
            }
          </main>
        </div>
      </div>
    </div>
  `;
}
