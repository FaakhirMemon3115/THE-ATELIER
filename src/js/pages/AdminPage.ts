import { store } from '../data/mockState';
import type { Order } from '../data/types';

export function renderAdminPage(activeTab = 'dashboard'): string {
  const products = store.products;
  const orders = store.orders;
  const coupons = store.coupons;
  const users = store.registeredUsers;
  const heroConfig = store.heroBanner;

  // Real KPI calculations
  const totalSales = orders.reduce((sum, o) => (o.status !== 'Cancelled' ? sum + o.total : sum), 0);
  const totalOrdersCount = orders.length;
  const activeCustomersCount = users.length;
  const totalProductsCount = products.length;
  const lowStockItems = store.getLowStockProducts();

  // Top selling products
  const salesMap: Record<string, { name: string; sold: number; revenue: number; image: string }> = {};
  orders.forEach((o) => {
    if (o.status !== 'Cancelled') {
      o.items.forEach((item: Order['items'][number]) => {
        if (!salesMap[item.productId]) {
          salesMap[item.productId] = { name: item.productName, sold: 0, revenue: 0, image: item.image };
        }
        salesMap[item.productId].sold += item.quantity;
        salesMap[item.productId].revenue += item.price * item.quantity;
      });
    }
  });
  const topSelling = Object.values(salesMap).sort((a, b) => b.sold - a.sold).slice(0, 5);

  // Tab labels for topbar
  const tabLabels: Record<string, string> = {
    dashboard: 'Executive Overview',
    products: 'Products Catalog',
    users: 'Users Database',
    orders: 'Orders Management',
    coupons: 'Coupon Database',
    hero: 'Hero Customizer',
    stock: 'Stock Alerts',
  };

  const currentUser = store.currentUser;

  return `
    <div class="admin-page-wrapper">

      <!-- ── SIDEBAR ──────────────────────────────────────────── -->
      <aside class="admin-sidebar">

        <!-- Brand -->
        <div class="admin-sidebar-brand">
          <span class="admin-sidebar-brand-logo">The Atelier</span>
          <span class="admin-sidebar-brand-sub">Admin Console</span>
        </div>

        <!-- User Badge -->
        <div class="admin-user-badge">
          <img
            class="admin-user-avatar"
            src="${currentUser?.avatar || '/images/hero_model.png'}"
            alt="${currentUser?.name}"
          />
          <div>
            <div class="admin-user-name">${currentUser?.name || 'Administrator'}</div>
            <div class="admin-user-role"><i class="fa-solid fa-shield-halved" style="font-size:0.55rem;"></i> ADMIN</div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="admin-nav-section">
          <span class="admin-nav-section-label">Main</span>

          <button class="admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}" data-admin-tab="dashboard">
            <i class="fa-solid fa-chart-pie"></i>
            Executive Overview
          </button>

          <button class="admin-nav-item ${activeTab === 'products' ? 'active' : ''}" data-admin-tab="products">
            <i class="fa-solid fa-boxes-stacked"></i>
            Products
            <span class="admin-nav-badge">${products.length}</span>
          </button>

          <button class="admin-nav-item ${activeTab === 'users' ? 'active' : ''}" data-admin-tab="users">
            <i class="fa-solid fa-users"></i>
            Users
            <span class="admin-nav-badge">${users.length}</span>
          </button>

          <button class="admin-nav-item ${activeTab === 'orders' ? 'active' : ''}" data-admin-tab="orders">
            <i class="fa-solid fa-receipt"></i>
            Orders
            <span class="admin-nav-badge">${orders.length}</span>
          </button>

          <button class="admin-nav-item ${activeTab === 'coupons' ? 'active' : ''}" data-admin-tab="coupons">
            <i class="fa-solid fa-ticket"></i>
            Coupons
            <span class="admin-nav-badge">${coupons.length}</span>
          </button>
        </nav>

        <nav class="admin-nav-section">
          <span class="admin-nav-section-label">Settings</span>

          <button class="admin-nav-item ${activeTab === 'hero' ? 'active' : ''}" data-admin-tab="hero">
            <i class="fa-solid fa-image"></i>
            Hero Customizer
          </button>

          <button class="admin-nav-item nav-alert ${activeTab === 'stock' ? 'active' : ''}" data-admin-tab="stock">
            <i class="fa-solid fa-triangle-exclamation"></i>
            Stock Alerts
            ${lowStockItems.length > 0
              ? `<span class="admin-nav-badge danger">${lowStockItems.length}</span>`
              : ''
            }
          </button>
        </nav>

        <!-- Sidebar Footer -->
        <div class="admin-sidebar-footer">
          <button class="admin-sidebar-footer-btn" id="admin-exit-btn">
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
            Exit to Store
          </button>
        </div>

      </aside>

      <!-- ── MAIN CONTENT ─────────────────────────────────────── -->
      <div class="admin-main">

        <!-- Top Bar -->
        <div class="admin-topbar">
          <div>
            <div class="admin-topbar-title">${tabLabels[activeTab] || 'Dashboard'}</div>
            <div class="admin-topbar-breadcrumb">Atelier Admin &rsaquo; ${tabLabels[activeTab] || 'Dashboard'}</div>
          </div>
          <div style="display:flex; align-items:center; gap:12px;">
            <div class="admin-live-badge">Live Database</div>
            <span style="font-size:0.72rem; color:var(--color-muted);">${currentUser?.email}</span>
          </div>
        </div>

        <!-- Page Body -->
        <div class="admin-body">
          ${
            activeTab === 'dashboard'
              ? renderAnalyticsDashboard(totalSales, totalOrdersCount, activeCustomersCount, totalProductsCount, topSelling, lowStockItems)
              : activeTab === 'users'
              ? renderUsersTab(users)
              : activeTab === 'hero'
              ? renderHeroCustomizerTab(heroConfig)
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
  `;
}

// ── DASHBOARD ──────────────────────────────────────────────────────────────
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
        <div class="kpi-card-icon gold"><i class="fa-solid fa-coins"></i></div>
        <div class="kpi-title">Total Revenue</div>
        <div class="kpi-value" style="color:var(--color-gold);">Rs. ${revenue.toLocaleString()}</div>
        <div class="kpi-sub"><i class="fa-solid fa-database" style="font-size:0.65rem;"></i> Real-time synced</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-card-icon dark"><i class="fa-solid fa-receipt"></i></div>
        <div class="kpi-title">Total Orders</div>
        <div class="kpi-value">${ordersCount}</div>
        <div class="kpi-sub">Lifetime orders</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-card-icon green"><i class="fa-solid fa-users"></i></div>
        <div class="kpi-title">Registered Users</div>
        <div class="kpi-value">${customersCount}</div>
        <div class="kpi-sub">Client database</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-card-icon blue"><i class="fa-solid fa-boxes-stacked"></i></div>
        <div class="kpi-title">Catalog Items</div>
        <div class="kpi-value">${productsCount}</div>
        <div class="kpi-sub">${lowStock.length > 0 ? `<span style="color:var(--color-sale-red);">${lowStock.length} Low Stock</span>` : 'Healthy inventory'}</div>
      </div>
    </div>

    <!-- Stock Alert Banner -->
    ${lowStock.length > 0 ? `
      <div class="admin-alert admin-alert-danger">
        <div>
          <strong><i class="fa-solid fa-triangle-exclamation"></i> Inventory Alert:</strong>
          ${lowStock.length} product(s) running low (&lt; 10 units remaining).
        </div>
        <button class="btn btn-primary" style="padding:5px 14px; font-size:0.72rem; background:var(--color-sale-red); color:#FFF; border:none; border-radius:3px; cursor:pointer;" data-admin-tab="stock">
          View Alerts
        </button>
      </div>
    ` : ''}

    <!-- Charts Row -->
    <div style="display:grid; grid-template-columns:2fr 1fr; gap:20px; margin-bottom:24px;">

      <!-- Category Breakdown -->
      <div class="admin-section-card" style="margin-bottom:0;">
        <h3 class="admin-table-title" style="margin-bottom:20px;">Category Inventory Distribution</h3>

        <div class="admin-bar-row">
          <div class="admin-bar-label"><span>Clothing (Gowns, Tops &amp; Abayas)</span><strong>38%</strong></div>
          <div class="admin-bar-track"><div class="admin-bar-fill" style="width:38%; background:var(--color-gold);"></div></div>
        </div>

        <div class="admin-bar-row">
          <div class="admin-bar-label"><span>Leather Handbags &amp; Totes</span><strong>25%</strong></div>
          <div class="admin-bar-track"><div class="admin-bar-fill" style="width:25%; background:var(--color-black);"></div></div>
        </div>

        <div class="admin-bar-row">
          <div class="admin-bar-label"><span>Stiletto Heels &amp; Footwear</span><strong>25%</strong></div>
          <div class="admin-bar-track"><div class="admin-bar-fill" style="width:25%; background:var(--color-espresso);"></div></div>
        </div>

        <div class="admin-bar-row">
          <div class="admin-bar-label"><span>Fine Jewelry &amp; Accessories</span><strong>12%</strong></div>
          <div class="admin-bar-track"><div class="admin-bar-fill" style="width:12%; background:#D4A59A;"></div></div>
        </div>
      </div>

      <!-- Top Sellers -->
      <div class="admin-section-card" style="margin-bottom:0;">
        <h3 class="admin-table-title" style="margin-bottom:18px;">Best Selling Pieces</h3>
        ${
          topSelling.length > 0
            ? topSelling.map((item) => `
              <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px; padding-bottom:10px; border-bottom:1px solid #F0ECE6;">
                <img src="${item.image}" style="width:38px; height:48px; object-fit:cover; border-radius:2px; flex-shrink:0;" />
                <div style="flex:1; min-width:0;">
                  <div style="font-weight:600; font-size:0.78rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.name}</div>
                  <div style="font-size:0.7rem; color:var(--color-muted);">${item.sold} units sold</div>
                </div>
                <div style="font-weight:700; font-size:0.8rem; color:var(--color-gold); white-space:nowrap;">Rs. ${item.revenue.toLocaleString()}</div>
              </div>
            `).join('')
            : `<div style="font-size:0.83rem; color:var(--color-muted); padding:20px 0; text-align:center;">No sales recorded yet.</div>`
        }
      </div>

    </div>
  `;
}

// ── USERS ──────────────────────────────────────────────────────────────────
function renderUsersTab(users: any[]): string {
  return `
    <div class="admin-table-card">
      <div class="admin-table-header">
        <div>
          <div class="admin-table-title">Users Database</div>
          <div class="admin-table-sub">${users.length} registered accounts</div>
        </div>
        <span style="font-size:0.72rem; color:var(--color-muted);"><i class="fa-solid fa-database"></i> Real-time synced</span>
      </div>
      <table class="admin-table">
        <thead>
          <tr>
            <th>User Profile</th>
            <th>Role</th>
            <th>Registered</th>
            <th>Last Login</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${users.map((u) => `
            <tr>
              <td>
                <div style="display:flex; align-items:center; gap:10px;">
                  <img src="${u.avatar || '/images/hero_model.png'}" style="width:34px; height:34px; object-fit:cover; border-radius:50%; border:1.5px solid var(--color-gold);" />
                  <div>
                    <div style="font-weight:600; font-size:0.83rem;">${u.name}</div>
                    <div style="font-size:0.72rem; color:var(--color-muted);">${u.email}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="badge ${u.role === 'ADMIN' ? 'badge-admin' : ''}" style="${u.role !== 'ADMIN' ? 'background:rgba(21,21,21,0.06); color:var(--color-black);' : ''}">
                  ${u.role}
                </span>
              </td>
              <td style="font-size:0.78rem; color:var(--color-muted);">${u.registeredAt || 'Jan 10, 2026'}</td>
              <td style="font-size:0.78rem;">${u.lastLoginAt || 'Recent'}</td>
              <td>
                ${u.isBanned
                  ? `<span class="badge badge-banned"><i class="fa-solid fa-user-slash"></i> Banned</span>`
                  : `<span class="badge badge-active"><i class="fa-solid fa-user-check"></i> Active</span>`
                }
              </td>
              <td>
                ${u.role !== 'ADMIN'
                  ? `
                    ${u.isBanned
                      ? `<button class="btn-unban-user btn-sm btn-success" data-user-id="${u.id}">Unban</button>`
                      : `<button class="btn-ban-user btn-sm btn-danger" data-user-id="${u.id}"><i class="fa-solid fa-ban"></i> Ban</button>`
                    }
                    <button class="btn-remove-user btn-sm btn-outline" data-user-id="${u.id}" style="margin-left:6px;"><i class="fa-solid fa-trash"></i></button>
                  `
                  : `<span style="font-size:0.72rem; color:var(--color-muted);">Protected</span>`
                }
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ── HERO CUSTOMIZER ─────────────────────────────────────────────────────────
function renderHeroCustomizerTab(heroConfig: any): string {
  return `
    <div class="admin-section-card">
      <h3 class="admin-table-title" style="margin-bottom:22px;">Hero Banner Customizer</h3>
      <form id="hero-customizer-form" style="max-width:600px;">
        <div class="admin-form-group">
          <label class="admin-form-label">Hero Title Headline</label>
          <input type="text" id="hero-title-input" value="${heroConfig.title}" class="admin-form-input" required />
        </div>
        <div class="admin-form-group">
          <label class="admin-form-label">Subtitle Badge Text</label>
          <input type="text" id="hero-subtitle-input" value="${heroConfig.subtitle}" class="admin-form-input" required />
        </div>
        <div class="admin-form-group">
          <label class="admin-form-label">Hero Tagline Description</label>
          <textarea id="hero-tagline-input" class="admin-form-textarea" required>${heroConfig.tagline}</textarea>
        </div>
        <div class="admin-form-group">
          <label class="admin-form-label">Hero Banner Image URL</label>
          <input type="text" id="hero-image-input" value="${heroConfig.imageUrl}" class="admin-form-input" required />
        </div>
        <button type="submit" class="btn btn-gold" style="padding:10px 24px; margin-top:4px;">
          <i class="fa-solid fa-floppy-disk"></i> Save Hero Changes
        </button>
      </form>
    </div>
  `;
}

// ── PRODUCTS ────────────────────────────────────────────────────────────────
function renderProductsTab(products: any[]): string {
  return `
    <div class="admin-table-card">
      <div class="admin-table-header">
        <div>
          <div class="admin-table-title">Products Catalog</div>
          <div class="admin-table-sub">${products.length} items in database</div>
        </div>
        <button class="btn btn-gold" id="admin-add-prod-modal-btn" style="padding:7px 16px; font-size:0.78rem;">
          <i class="fa-solid fa-plus"></i> Add Product
        </button>
      </div>
      <table class="admin-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${products.map((p) => `
            <tr>
              <td>
                <div style="display:flex; align-items:center; gap:10px;">
                  <img src="${p.primaryImage}" style="width:34px; height:44px; object-fit:cover; border-radius:2px; flex-shrink:0;" />
                  <div>
                    <div style="font-weight:600; font-size:0.83rem;">${p.name}</div>
                    <div style="font-size:0.7rem; color:var(--color-muted);">${p.subcategory}</div>
                  </div>
                </div>
              </td>
              <td style="font-family:monospace; font-size:0.76rem; color:var(--color-muted);">${p.sku}</td>
              <td style="font-size:0.8rem;">${p.category}</td>
              <td style="font-weight:600; font-size:0.83rem;">Rs. ${p.price.toLocaleString()}</td>
              <td>
                ${p.stock < 10
                  ? `<span class="badge badge-low">${p.stock} Low</span>`
                  : `<span class="badge badge-ok">${p.stock}</span>`
                }
              </td>
              <td>
                <button class="btn-edit-prod-modal btn-sm btn-outline" data-prod-id="${p.id}">
                  <i class="fa-solid fa-pen-to-square"></i> Edit
                </button>
                <button class="btn-del-prod btn-sm btn-danger" data-prod-id="${p.id}" style="margin-left:6px;">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ── ORDERS ──────────────────────────────────────────────────────────────────
function renderOrdersTab(orders: any[]): string {
  return `
    <div class="admin-table-card">
      <div class="admin-table-header">
        <div>
          <div class="admin-table-title">Client Orders</div>
          <div class="admin-table-sub">${orders.length} total orders</div>
        </div>
      </div>
      ${orders.length > 0 ? `
        <table class="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Client</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Tracking</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map((o) => `
              <tr>
                <td style="font-weight:700; font-family:monospace; font-size:0.76rem;">${o.id}</td>
                <td style="font-size:0.78rem; color:var(--color-muted);">${o.date}</td>
                <td>
                  <div style="font-weight:600; font-size:0.82rem;">${o.customerName}</div>
                  <div style="font-size:0.7rem; color:var(--color-muted);">${o.customerEmail}</div>
                </td>
                <td style="font-size:0.8rem;">${o.items.length} items</td>
                <td style="font-weight:700; font-size:0.83rem;">Rs. ${o.total.toLocaleString()}</td>
                <td>
                  <select class="order-status-select" data-order-id="${o.id}" style="padding:4px 8px; font-size:0.73rem; border:1px solid #E0DBD4; border-radius:3px; background:#FFF; cursor:pointer;">
                    <option ${o.status === 'Pending'    ? 'selected' : ''}>Pending</option>
                    <option ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
                    <option ${o.status === 'Shipped'    ? 'selected' : ''}>Shipped</option>
                    <option ${o.status === 'Delivered'  ? 'selected' : ''}>Delivered</option>
                    <option ${o.status === 'Cancelled'  ? 'selected' : ''}>Cancelled</option>
                  </select>
                </td>
                <td style="font-size:0.73rem; color:var(--color-gold);">
                  <i class="fa-solid fa-truck"></i> ${o.trackingNumber}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : `
        <div style="padding:48px; text-align:center; color:var(--color-muted); font-size:0.85rem;">
          <i class="fa-solid fa-receipt" style="font-size:2rem; margin-bottom:12px; display:block; opacity:0.3;"></i>
          No client orders placed yet.
        </div>
      `}
    </div>
  `;
}

// ── COUPONS ─────────────────────────────────────────────────────────────────
function renderCouponsTab(coupons: any[]): string {
  return `
    <div class="admin-table-card">
      <div class="admin-table-header">
        <div>
          <div class="admin-table-title">Coupon Database</div>
          <div class="admin-table-sub">${coupons.length} coupons total</div>
        </div>
        <form id="add-coupon-form" style="display:flex; gap:8px; align-items:center;">
          <input type="text" id="new-coupon-code" placeholder="Code (e.g. LUXE25)" required
            style="padding:7px 12px; border:1px solid #E0DBD4; border-radius:3px; font-size:0.78rem; text-transform:uppercase; width:140px;" />
          <input type="number" id="new-coupon-discount" placeholder="Discount %" min="1" max="90" required
            style="width:100px; padding:7px 10px; border:1px solid #E0DBD4; border-radius:3px; font-size:0.78rem;" />
          <button type="submit" class="btn btn-gold" style="padding:7px 16px; font-size:0.78rem;">
            <i class="fa-solid fa-plus"></i> Create
          </button>
        </form>
      </div>
      <table class="admin-table">
        <thead>
          <tr>
            <th>Coupon Code</th>
            <th>Discount</th>
            <th>Status</th>
            <th>Used By</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${coupons.map((c) => `
            <tr>
              <td style="font-weight:700; font-family:monospace; letter-spacing:0.06em; font-size:0.85rem;">${c.code}</td>
              <td style="font-weight:600; color:var(--color-gold);">${c.discountPercent}% OFF</td>
              <td>
                ${c.isUsed
                  ? `<span class="badge badge-used"><i class="fa-solid fa-lock"></i> Used</span>`
                  : `<span class="badge badge-avail"><i class="fa-solid fa-check"></i> Active</span>`
                }
              </td>
              <td style="font-size:0.78rem; color:var(--color-muted);">${c.usedByEmail || '—'}</td>
              <td>
                <button class="btn-del-coupon btn-sm btn-danger" data-code="${c.code}">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ── STOCK ALERTS ─────────────────────────────────────────────────────────────
function renderStockAlertsTab(lowStock: any[]): string {
  if (lowStock.length === 0) {
    return `
      <div class="admin-section-card" style="text-align:center; padding:48px;">
        <i class="fa-solid fa-circle-check" style="font-size:2.5rem; color:#27AE60; margin-bottom:14px; display:block;"></i>
        <div style="font-size:1rem; font-weight:600; color:#27AE60; margin-bottom:6px;">All Clear</div>
        <div style="font-size:0.83rem; color:var(--color-muted);">All catalog items have healthy inventory (&gt; 10 units).</div>
      </div>
    `;
  }

  return `
    <div class="admin-table-card">
      <div class="admin-table-header">
        <div>
          <div class="admin-table-title" style="color:var(--color-sale-red);">
            <i class="fa-solid fa-triangle-exclamation"></i> Low Stock Warnings
          </div>
          <div class="admin-table-sub">${lowStock.length} item(s) need restocking</div>
        </div>
      </div>
      <table class="admin-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th>Category</th>
            <th>Units Left</th>
            <th>Status</th>
            <th>Quick Restock</th>
          </tr>
        </thead>
        <tbody>
          ${lowStock.map((p) => `
            <tr>
              <td>
                <div style="display:flex; align-items:center; gap:10px;">
                  <img src="${p.primaryImage}" style="width:34px; height:44px; object-fit:cover; border-radius:2px; flex-shrink:0;" />
                  <div>
                    <div style="font-weight:600; font-size:0.83rem;">${p.name}</div>
                    <div style="font-size:0.7rem; color:var(--color-muted);">${p.subcategory}</div>
                  </div>
                </div>
              </td>
              <td style="font-family:monospace; font-size:0.76rem; color:var(--color-muted);">${p.sku}</td>
              <td style="font-size:0.8rem;">${p.category}</td>
              <td style="font-weight:700; color:var(--color-sale-red); font-size:1.05rem;">${p.stock}</td>
              <td>
                ${p.stock === 0
                  ? `<span class="badge badge-out">Out of Stock</span>`
                  : `<span class="badge badge-low">Critical Stock</span>`
                }
              </td>
              <td>
                <form class="restock-form" data-prod-id="${p.id}" style="display:flex; gap:6px; align-items:center;">
                  <input type="number" class="restock-qty-input" min="1" max="999" value="20"
                    style="width:60px; padding:5px 8px; font-size:0.78rem; border:1px solid #E0DBD4; border-radius:3px; text-align:center;" />
                  <button type="submit" class="btn-sm btn-success">
                    <i class="fa-solid fa-plus"></i> Add
                  </button>
                </form>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}
