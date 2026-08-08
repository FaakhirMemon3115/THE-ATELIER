import { store } from '../data/mockState';

export function renderAdminPage(activeTab = 'dashboard'): string {
  const products = store.products;
  const orders = store.orders;
  const coupons = store.coupons;

  // Real KPI calculations
  const totalSales = orders.reduce((sum, o) => (o.status !== 'Cancelled' ? sum + o.total : sum), 0);
  const totalOrdersCount = orders.length;
  const activeCustomersCount = new Set(orders.map((o) => o.customerEmail)).size || (store.currentUser ? 1 : 0);
  const totalProductsCount = products.length;

  const lowStockItems = store.getLowStockProducts();

  // Top selling products computation
  const salesMap: Record<string, { name: string; sold: number; revenue: number; image: string }> = {};
  orders.forEach((o) => {
    if (o.status !== 'Cancelled') {
      o.items.forEach((item) => {
        if (!salesMap[item.productId]) {
          salesMap[item.productId] = { name: item.productName, sold: 0, revenue: 0, image: item.image };
        }
        salesMap[item.productId].sold += item.quantity;
        salesMap[item.productId].revenue += item.price * item.quantity;
      });
    }
  });

  const topSelling = Object.values(salesMap).sort((a, b) => b.sold - a.sold).slice(0, 5);

  return `
    <div class="admin-container" style="padding: var(--space-xl) 0 var(--space-3xl);">
      <div class="container">
        
        <!-- Header -->
        <div class="flex justify-between items-center" style="margin-bottom: 24px; border-bottom: 1px solid var(--color-border); padding-bottom: 16px;">
          <div>
            <div class="subtitle" style="letter-spacing: 0.15em;">HAUTE COUTURE MANAGEMENT</div>
            <h1 class="heading-2 font-serif">ATELIER ADMIN DASHBOARD</h1>
          </div>
          <div class="flex items-center gap-md">
            <span style="font-size: 0.8rem; background: var(--color-black); color: var(--color-gold); padding: 4px 12px; border-radius: var(--radius-pill); font-weight: 600;">
              <i class="fa-solid fa-shield-check"></i> ADMIN SESSION (${store.currentUser?.email})
            </span>
          </div>
        </div>

        <div class="admin-layout">
          <!-- Sidebar Navigation -->
          <aside class="admin-sidebar">
            <nav style="display: flex; flex-direction: column; gap: 4px;">
              <button class="admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}" data-admin-tab="dashboard">
                <i class="fa-solid fa-chart-pie"></i> Analytics & Overview
              </button>
              <button class="admin-nav-item ${activeTab === 'products' ? 'active' : ''}" data-admin-tab="products">
                <i class="fa-solid fa-boxes-stacked"></i> Products Catalog (${products.length})
              </button>
              <button class="admin-nav-item ${activeTab === 'orders' ? 'active' : ''}" data-admin-tab="orders">
                <i class="fa-solid fa-receipt"></i> Orders (${orders.length})
              </button>
              <button class="admin-nav-item ${activeTab === 'coupons' ? 'active' : ''}" data-admin-tab="coupons">
                <i class="fa-solid fa-ticket"></i> Coupons (${coupons.length})
              </button>
              <button class="admin-nav-item ${activeTab === 'stock' ? 'active' : ''}" data-admin-tab="stock" style="${lowStockItems.length > 0 ? 'color: var(--color-sale-red); font-weight: 700;' : ''}">
                <i class="fa-solid fa-triangle-exclamation"></i> Stock Alerts (${lowStockItems.length})
              </button>
            </nav>
          </aside>

          <!-- Main Panel Content -->
          <div class="admin-content">
            ${
              activeTab === 'dashboard'
                ? renderAnalyticsDashboard(totalSales, totalOrdersCount, activeCustomersCount, totalProductsCount, topSelling, lowStockItems)
                : activeTab === 'products'
                ? renderProductsTab(products)
                : activeTab === 'orders'
                ? renderOrdersTab(orders)
                : activeTab === 'coupons'
                ? renderCouponsTab(coupons)
                : renderStockAlertsTab(lowStockItems)
            }
          </div>
        </div>

      </div>
    </div>
  `;
}

function renderAnalyticsDashboard(
  revenue: number,
  ordersCount: number,
  customersCount: number,
  productsCount: number,
  topSelling: any[],
  lowStock: any[]
): string {
  return `
    <!-- KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-title">TOTAL SALES REVENUE</div>
        <div class="kpi-value">Rs. ${revenue.toLocaleString()}</div>
        <div class="kpi-sub" style="color: green;"><i class="fa-solid fa-arrow-trend-up"></i> Real-time orders analytics</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">TOTAL ORDERS</div>
        <div class="kpi-value">${ordersCount}</div>
        <div class="kpi-sub">Lifetime client checkouts</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">ACTIVE CLIENTS</div>
        <div class="kpi-value">${customersCount}</div>
        <div class="kpi-sub">Registered buyers</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">CATALOG PRODUCTS</div>
        <div class="kpi-value">${productsCount}</div>
        <div class="kpi-sub">${lowStock.length > 0 ? `<span class="text-sale">${lowStock.length} Low Stock Alert!</span>` : 'Optimal Inventory'}</div>
      </div>
    </div>

    ${
      lowStock.length > 0
        ? `
      <div style="background: #FDEDEC; border: 1px solid #F5C6CB; padding: 14px 18px; border-radius: var(--radius-sm); margin-bottom: 24px; display: flex; justify-between; items-center;">
        <div>
          <strong style="color: var(--color-sale-red);"><i class="fa-solid fa-triangle-exclamation"></i> INVENTORY ALERT:</strong> ${lowStock.length} product(s) have low stock (< 10 units remaining).
        </div>
        <button class="btn btn-primary" style="padding: 6px 14px; font-size: 0.75rem; background: var(--color-sale-red);" data-admin-tab="stock">VIEW STOCK ALERTS</button>
      </div>
    `
        : ''
    }

    <!-- Analytics Visual Bars & Top Sellers Grid -->
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 24px;">
      
      <!-- Category Sales Breakdown Visual Bar -->
      <div style="background: #FFF; border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 20px;">
        <h3 class="heading-3 font-serif" style="margin-bottom: 16px;">Category Inventory & Demand Distribution</h3>
        
        <div style="margin-bottom: 16px;">
          <div class="flex justify-between" style="font-size: 0.8rem; margin-bottom: 4px;">
            <span>Clothing (Haute Gowns, Tops & Abayas)</span>
            <strong>38%</strong>
          </div>
          <div style="height: 8px; background: #EAE3D9; border-radius: 4px; overflow: hidden;">
            <div style="width: 38%; height: 100%; background: var(--color-gold);"></div>
          </div>
        </div>

        <div style="margin-bottom: 16px;">
          <div class="flex justify-between" style="font-size: 0.8rem; margin-bottom: 4px;">
            <span>Leather Handbags & Totes</span>
            <strong>25%</strong>
          </div>
          <div style="height: 8px; background: #EAE3D9; border-radius: 4px; overflow: hidden;">
            <div style="width: 25%; height: 100%; background: var(--color-black);"></div>
          </div>
        </div>

        <div style="margin-bottom: 16px;">
          <div class="flex justify-between" style="font-size: 0.8rem; margin-bottom: 4px;">
            <span>Stiletto Heels & Footwear</span>
            <strong>25%</strong>
          </div>
          <div style="height: 8px; background: #EAE3D9; border-radius: 4px; overflow: hidden;">
            <div style="width: 25%; height: 100%; background: var(--color-espresso);"></div>
          </div>
        </div>

        <div>
          <div class="flex justify-between" style="font-size: 0.8rem; margin-bottom: 4px;">
            <span>Fine Jewelry & Accessories</span>
            <strong>12%</strong>
          </div>
          <div style="height: 8px; background: #EAE3D9; border-radius: 4px; overflow: hidden;">
            <div style="width: 12%; height: 100%; background: #D4A59A;"></div>
          </div>
        </div>
      </div>

      <!-- Top Selling Products list -->
      <div style="background: #FFF; border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 20px;">
        <h3 class="heading-3 font-serif" style="margin-bottom: 16px;">Best Selling Pieces</h3>
        ${
          topSelling.length > 0
            ? topSelling
                .map(
                  (item) => `
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--color-border-light);">
                <img src="${item.image}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 2px;" />
                <div style="flex: 1; font-size: 0.8rem;">
                  <div style="font-weight: 600; line-clamp: 1;">${item.name}</div>
                  <div style="color: var(--color-muted);">${item.sold} Units Sold</div>
                </div>
                <div style="font-weight: 700; font-size: 0.85rem;" class="text-gold">Rs. ${item.revenue.toLocaleString()}</div>
              </div>
            `
                )
                .join('')
            : `<div style="font-size: 0.85rem; color: var(--color-muted);">No sales recorded yet.</div>`
        }
      </div>

    </div>
  `;
}

function renderProductsTab(products: any[]): string {
  return `
    <div class="flex justify-between items-center" style="margin-bottom: 20px;">
      <h3 class="heading-3 font-serif">Product Catalog Management</h3>
      <button class="btn btn-gold" id="admin-add-product-btn" style="padding: 8px 16px; font-size: 0.8rem;">
        <i class="fa-solid fa-plus"></i> ADD NEW PRODUCT
      </button>
    </div>

    <!-- Product Table -->
    <table class="admin-table">
      <thead>
        <tr>
          <th>PRODUCT</th>
          <th>SKU</th>
          <th>CATEGORY</th>
          <th>PRICE</th>
          <th>STOCK</th>
          <th>ACTIONS</th>
        </tr>
      </thead>
      <tbody>
        ${products
          .map(
            (p) => `
          <tr>
            <td>
              <div class="flex items-center gap-sm">
                <img src="${p.primaryImage}" style="width: 36px; height: 48px; object-fit: cover;" />
                <div>
                  <div style="font-weight: 600;">${p.name}</div>
                  <div style="font-size: 0.72rem; color: var(--color-muted);">${p.subcategory}</div>
                </div>
              </div>
            </td>
            <td style="font-family: monospace; font-size: 0.8rem;">${p.sku}</td>
            <td>${p.category}</td>
            <td style="font-weight: 600;">Rs. ${p.price.toLocaleString()}</td>
            <td>
              ${
                p.stock < 10
                  ? `<span style="background: #FDEDEC; color: #721C24; padding: 2px 8px; border-radius: 2px; font-weight: 600; font-size: 0.75rem;">${p.stock} LOW</span>`
                  : `<span style="background: #E8F8F5; color: #117864; padding: 2px 8px; border-radius: 2px; font-weight: 600; font-size: 0.75rem;">${p.stock} in stock</span>`
              }
            </td>
            <td>
              <button class="btn-edit-prod" data-prod-id="${p.id}" style="padding: 4px 8px; font-size: 0.75rem; border: 1px solid var(--color-border); background: none; cursor: pointer; margin-right: 4px;">
                <i class="fa-solid fa-pen"></i> Edit
              </button>
              <button class="btn-del-prod" data-prod-id="${p.id}" style="padding: 4px 8px; font-size: 0.75rem; border: 1px solid #F5C6CB; color: var(--color-sale-red); background: none; cursor: pointer;">
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `;
}

function renderOrdersTab(orders: any[]): string {
  return `
    <h3 class="heading-3 font-serif" style="margin-bottom: 20px;">Client Order Fulfillment</h3>
    ${
      orders.length > 0
        ? `
      <table class="admin-table">
        <thead>
          <tr>
            <th>ORDER ID</th>
            <th>DATE</th>
            <th>CLIENT</th>
            <th>ITEMS</th>
            <th>TOTAL</th>
            <th>STATUS</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          ${orders
            .map(
              (o) => `
            <tr>
              <td style="font-weight: 700; font-family: monospace;">${o.id}</td>
              <td style="font-size: 0.8rem;">${o.date}</td>
              <td>
                <div style="font-weight: 600;">${o.customerName}</div>
                <div style="font-size: 0.75rem; color: var(--color-muted);">${o.customerEmail}</div>
              </td>
              <td style="font-size: 0.8rem;">${o.items.length} items</td>
              <td style="font-weight: 700;">Rs. ${o.total.toLocaleString()}</td>
              <td>
                <select class="order-status-select" data-order-id="${o.id}" style="padding: 4px 8px; font-size: 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm);">
                  <option ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
                  <option ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
                  <option ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                  <option ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                  <option ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
              </td>
              <td>
                <span style="font-size: 0.75rem; color: var(--color-gold);"><i class="fa-solid fa-truck"></i> ${o.trackingNumber}</span>
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `
        : `<div style="padding: 40px; text-align: center; color: var(--color-muted); background: #FFF; border: 1px solid var(--color-border);">No client orders have been placed yet.</div>`
    }
  `;
}

function renderCouponsTab(coupons: any[]): string {
  return `
    <div class="flex justify-between items-center" style="margin-bottom: 20px;">
      <h3 class="heading-3 font-serif">Single-Use Coupon Codes</h3>
      <form id="add-coupon-form" class="flex gap-sm">
        <input type="text" id="new-coupon-code" placeholder="CODE (e.g. LUXE25)" required style="padding: 6px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); text-transform: uppercase;" />
        <input type="number" id="new-coupon-discount" placeholder="Discount %" min="1" max="90" required style="width: 110px; padding: 6px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-sm);" />
        <button type="submit" class="btn btn-gold" style="padding: 6px 16px; font-size: 0.8rem;">CREATE COUPON</button>
      </form>
    </div>

    <table class="admin-table">
      <thead>
        <tr>
          <th>COUPON CODE</th>
          <th>DISCOUNT</th>
          <th>SINGLE-USE STATUS</th>
          <th>USED BY CLIENT</th>
          <th>ACTION</th>
        </tr>
      </thead>
      <tbody>
        ${coupons
          .map(
            (c) => `
          <tr>
            <td style="font-weight: 700; font-family: monospace; letter-spacing: 0.05em;">${c.code}</td>
            <td style="font-weight: 600;" class="text-gold">${c.discountPercent}% OFF</td>
            <td>
              ${
                c.isUsed
                  ? `<span style="background: #FDEDEC; color: #721C24; padding: 2px 8px; border-radius: 2px; font-weight: 600; font-size: 0.75rem;"><i class="fa-solid fa-lock"></i> USED (DISABLED)</span>`
                  : `<span style="background: #E8F8F5; color: #117864; padding: 2px 8px; border-radius: 2px; font-weight: 600; font-size: 0.75rem;"><i class="fa-solid fa-check"></i> ACTIVE (1-TIME USE AVAILABLE)</span>`
              }
            </td>
            <td style="font-size: 0.8rem; color: var(--color-muted);">${c.usedByEmail || '—'}</td>
            <td>
              <button class="btn-del-coupon" data-code="${c.code}" style="padding: 4px 8px; font-size: 0.75rem; border: 1px solid #F5C6CB; color: var(--color-sale-red); background: none; cursor: pointer;">
                <i class="fa-solid fa-trash"></i> Delete
              </button>
            </td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `;
}

function renderStockAlertsTab(lowStock: any[]): string {
  return `
    <h3 class="heading-3 font-serif" style="margin-bottom: 20px; color: var(--color-sale-red);">
      <i class="fa-solid fa-triangle-exclamation"></i> Low Inventory & Out-of-Stock Warnings
    </h3>
    ${
      lowStock.length > 0
        ? `
      <table class="admin-table">
        <thead>
          <tr>
            <th>PRODUCT</th>
            <th>SKU</th>
            <th>CATEGORY</th>
            <th>REMAINING UNITS</th>
            <th>STATUS</th>
            <th>QUICK RE-STOCK</th>
          </tr>
        </thead>
        <tbody>
          ${lowStock
            .map(
              (p) => `
            <tr>
              <td>
                <div class="flex items-center gap-sm">
                  <img src="${p.primaryImage}" style="width: 36px; height: 48px; object-fit: cover;" />
                  <span style="font-weight: 600;">${p.name}</span>
                </div>
              </td>
              <td style="font-family: monospace; font-size: 0.8rem;">${p.sku}</td>
              <td>${p.category}</td>
              <td style="font-weight: 700; color: var(--color-sale-red); font-size: 1.1rem;">${p.stock}</td>
              <td>
                ${
                  p.stock === 0
                    ? `<span style="background: #721C24; color: #FFF; padding: 2px 8px; border-radius: 2px; font-weight: 700; font-size: 0.75rem;">OUT OF STOCK</span>`
                    : `<span style="background: #FDEDEC; color: #721C24; padding: 2px 8px; border-radius: 2px; font-weight: 600; font-size: 0.75rem;">CRITICAL STOCK</span>`
                }
              </td>
              <td>
                <button class="btn-restock" data-prod-id="${p.id}" style="padding: 4px 10px; font-size: 0.75rem; background: var(--color-gold); color: #FFF; border: none; cursor: pointer; border-radius: 2px;">
                  + Add 20 Units
                </button>
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `
        : `<div style="padding: 40px; text-align: center; color: green; background: #E8F8F5; border: 1px solid #A3E4D7;"><i class="fa-solid fa-circle-check" style="font-size: 1.5rem; margin-bottom: 8px;"></i><br>All catalog items have healthy inventory (>10 units).</div>`
    }
  `;
}
