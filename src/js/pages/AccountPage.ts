import { store } from '../data/mockState';
import { PRODUCTS_DATA } from '../data/products';
import { renderProductCard } from '../components/ProductCard';

export function renderAccountPage(activeTab = 'orders'): string {
  const user = store.currentUser;
  const userOrders = store.getUserOrders();
  const wishlistedProducts = PRODUCTS_DATA.filter((p) => store.wishlist.includes(p.id));

  return `
    <div class="account-container" style="padding: var(--space-2xl) 0 var(--space-3xl);">
      <div class="container">
        
        <!-- Client Profile Header -->
        <div class="account-header flex justify-between items-center" style="margin-bottom: 32px; border-bottom: 1px solid var(--color-border); padding-bottom: 24px;">
          <div>
            <div class="subtitle" style="letter-spacing: 0.15em;">ATELIER PRIVATE PROFILE</div>
            <h1 class="heading-2 font-serif">${user ? user.name : 'Valued Client'}</h1>
            <p style="font-size: 0.85rem; color: var(--color-muted); margin-top: 4px;">
              ${user ? user.email : 'Guest Client'} &bull; <span class="text-gold" style="font-weight: 600;">HAUTE CLUB VIP MEMBER</span>
            </p>
          </div>

          <div>
            <button class="btn btn-outline" id="account-logout-btn" style="padding: 8px 18px; font-size: 0.8rem;">
              <i class="fa-solid fa-right-from-bracket"></i> SIGN OUT
            </button>
          </div>
        </div>

        <!-- Account Layout -->
        <div class="account-layout">
          <!-- Sidebar Menu -->
          <aside class="account-sidebar">
            <nav style="display: flex; flex-direction: column; gap: 4px;">
              <button class="admin-nav-item ${activeTab === 'orders' ? 'active' : ''}" data-acc-tab="orders">
                <i class="fa-solid fa-box-archive"></i> My Orders (${userOrders.length})
              </button>
              <button class="admin-nav-item ${activeTab === 'wishlist' ? 'active' : ''}" data-acc-tab="wishlist">
                <i class="fa-solid fa-heart"></i> Saved Wishlist (${wishlistedProducts.length})
              </button>
              <button class="admin-nav-item ${activeTab === 'profile' ? 'active' : ''}" data-acc-tab="profile">
                <i class="fa-solid fa-user-gear"></i> Personal Preferences
              </button>
            </nav>
          </aside>

          <!-- Main View -->
          <div class="account-content">
            ${
              activeTab === 'orders'
                ? renderUserOrdersTab(userOrders)
                : activeTab === 'wishlist'
                ? renderWishlistTab(wishlistedProducts)
                : renderProfileTab(user)
            }
          </div>
        </div>

      </div>
    </div>
  `;
}

function renderUserOrdersTab(orders: any[]): string {
  if (orders.length === 0) {
    return `
      <div style="padding: 48px 24px; text-align: center; background: #FFF; border: 1px solid var(--color-border); border-radius: var(--radius-sm);">
        <i class="fa-solid fa-box-open" style="font-size: 2.5rem; color: var(--color-muted); margin-bottom: 14px;"></i>
        <h3 class="heading-3 font-serif" style="margin-bottom: 8px;">NO ORDERS FOUND</h3>
        <p style="font-size: 0.85rem; color: var(--color-muted); max-width: 360px; margin: 0 auto 20px;">
          You have not placed any orders yet. Discover your signature style in our haute couture catalog.
        </p>
        <button class="btn btn-primary" data-route="shop" data-cat="ALL">DISCOVER COLLECTION</button>
      </div>
    `;
  }

  return `
    <h3 class="heading-3 font-serif" style="margin-bottom: 20px;">Order History & Live Tracking</h3>
    <div style="display: flex; flex-direction: column; gap: 24px;">
      ${orders
        .map(
          (o) => `
        <div style="background: #FFF; border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 20px;">
          <!-- Order Summary Header -->
          <div class="flex justify-between items-center" style="border-bottom: 1px solid var(--color-border-light); padding-bottom: 12px; margin-bottom: 16px;">
            <div>
              <span style="font-weight: 700; font-family: monospace; font-size: 0.9rem;">ORDER ${o.id}</span>
              <span style="font-size: 0.8rem; color: var(--color-muted); margin-left: 12px;">Placed on ${o.date}</span>
            </div>
            <div>
              <span style="font-size: 0.75rem; background: var(--color-ivory); padding: 4px 10px; border-radius: var(--radius-pill); font-weight: 600;" class="text-gold">
                STATUS: ${o.status.toUpperCase()}
              </span>
            </div>
          </div>

          <!-- Order Timeline Visual -->
          <div style="margin-bottom: 20px; padding: 12px 16px; background: #FAF9F6; border-radius: var(--radius-sm);">
            <div class="flex justify-between" style="font-size: 0.75rem; font-weight: 600; margin-bottom: 8px;">
              <span>1. Order Placed</span>
              <span>2. Processing</span>
              <span>3. Out for Delivery</span>
              <span>4. Delivered</span>
            </div>
            <div style="height: 6px; background: #EAE3D9; border-radius: 3px; overflow: hidden;">
              <div style="width: ${
                o.status === 'Pending'
                  ? '25%'
                  : o.status === 'Processing'
                  ? '50%'
                  : o.status === 'Shipped'
                  ? '75%'
                  : '100%'
              }; height: 100%; background: var(--color-gold);"></div>
            </div>
            <div style="font-size: 0.72rem; color: var(--color-muted); margin-top: 6px;">
              Tracking Number: <strong>${o.trackingNumber}</strong>
            </div>
          </div>

          <!-- Items list -->
          <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
            ${o.items
              .map(
                (item: any) => `
              <div style="display: flex; align-items: center; gap: 12px;">
                <img src="${item.image}" style="width: 44px; height: 56px; object-fit: cover; border-radius: 2px;" />
                <div style="flex: 1;">
                  <div style="font-weight: 600; font-size: 0.85rem;">${item.productName}</div>
                  <div style="font-size: 0.75rem; color: var(--color-muted);">Size: ${item.selectedSize} &bull; Color: ${item.selectedColor} &bull; Qty: ${item.quantity}</div>
                </div>
                <div style="font-weight: 700; font-size: 0.85rem;">Rs. ${(item.price * item.quantity).toLocaleString()}</div>
              </div>
            `
              )
              .join('')}
          </div>

          <!-- Total Footer -->
          <div class="flex justify-between items-center" style="border-top: 1px solid var(--color-border-light); padding-top: 12px; font-size: 0.9rem;">
            <span>Total Paid (incl. delivery & tax):</span>
            <strong class="text-gold" style="font-size: 1.1rem;">Rs. ${o.total.toLocaleString()}</strong>
          </div>
        </div>
      `
        )
        .join('')}
    </div>
  `;
}

function renderWishlistTab(products: any[]): string {
  if (products.length === 0) {
    return `
      <div style="padding: 48px 24px; text-align: center; background: #FFF; border: 1px solid var(--color-border); border-radius: var(--radius-sm);">
        <i class="fa-regular fa-heart" style="font-size: 2.5rem; color: var(--color-muted); margin-bottom: 14px;"></i>
        <h3 class="heading-3 font-serif" style="margin-bottom: 8px;">YOUR WISHLIST IS EMPTY</h3>
        <p style="font-size: 0.85rem; color: var(--color-muted); max-width: 360px; margin: 0 auto 20px;">
          Save your favorite gowns, bags, and shoes by clicking the heart icon on product cards.
        </p>
        <button class="btn btn-primary" data-route="shop" data-cat="ALL">EXPLORE CATALOG</button>
      </div>
    `;
  }

  return `
    <h3 class="heading-3 font-serif" style="margin-bottom: 20px;">Saved Favorites (${products.length})</h3>
    <div class="products-grid" style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));">
      ${products.map(renderProductCard).join('')}
    </div>
  `;
}

function renderProfileTab(user: any): string {
  return `
    <div style="background: #FFF; border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 24px;">
      <h3 class="heading-3 font-serif" style="margin-bottom: 16px;">Personal Details</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
        <div>
          <label class="form-label">Full Name</label>
          <input type="text" value="${user?.name || ''}" class="newsletter-input" style="width: 100%; border: 1px solid var(--color-border);" readonly />
        </div>
        <div>
          <label class="form-label">Email Address</label>
          <input type="email" value="${user?.email || ''}" class="newsletter-input" style="width: 100%; border: 1px solid var(--color-border);" readonly />
        </div>
      </div>
      <p style="font-size: 0.8rem; color: var(--color-muted);">
        Account Security: Password protected with Atelier multi-factor encryption standards.
      </p>
    </div>
  `;
}
