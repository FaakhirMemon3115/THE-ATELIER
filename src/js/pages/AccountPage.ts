import { store } from '../data/mockState';
import { PRODUCTS_DATA } from '../data/products';
import { renderProductCard } from '../components/ProductCard';

export function renderAccountPage(activeTab = 'orders'): string {
  const wishlistedProducts = PRODUCTS_DATA.filter((p) => store.wishlist.includes(p.id));

  return `
    <div class="account-container">
      <div class="container">
        <!-- Header -->
        <div style="margin-bottom: var(--space-2xl);">
          <div class="subtitle">MY ATELIER PROFILE</div>
          <h1 class="heading-1 font-serif">WELCOME BACK, ${store.user.name.toUpperCase()}</h1>
        </div>

        <div class="account-layout">
          <!-- Sidebar Nav -->
          <aside class="account-sidebar">
            <div class="account-user-card">
              <div class="user-avatar">${store.user.name.charAt(0)}</div>
              <h4 class="font-serif heading-3">${store.user.name}</h4>
              <p style="font-size: 0.75rem; color: var(--color-muted);">${store.user.email}</p>
            </div>

            <ul class="account-nav-list">
              <li>
                <button class="account-nav-btn ${activeTab === 'orders' ? 'active' : ''}" data-tab="orders">
                  <i class="fa-solid fa-box-open"></i> My Orders (${store.orders.length})
                </button>
              </li>
              <li>
                <button class="account-nav-btn ${activeTab === 'wishlist' ? 'active' : ''}" data-tab="wishlist">
                  <i class="fa-regular fa-heart"></i> My Wishlist (${store.wishlist.length})
                </button>
              </li>
              <li>
                <button class="account-nav-btn ${activeTab === 'addresses' ? 'active' : ''}" data-tab="addresses">
                  <i class="fa-solid fa-location-dot"></i> Saved Addresses
                </button>
              </li>
              <li>
                <button class="account-nav-btn ${activeTab === 'dna' ? 'active' : ''}" data-tab="dna">
                  <i class="fa-solid fa-wand-magic-sparkles"></i> Style DNA Profile
                </button>
              </li>
            </ul>
          </aside>

          <!-- Content Panel -->
          <main class="account-content-card">
            ${
              activeTab === 'orders'
                ? `
              <h3 class="font-serif heading-2" style="margin-bottom: 20px;">MY ORDERS & TRACKING</h3>

              ${store.orders
                .map((order) => {
                  // Determine timeline step index
                  const statusMap: Record<string, number> = {
                    Pending: 1,
                    Confirmed: 2,
                    Packed: 3,
                    Shipped: 4,
                    Delivered: 5
                  };
                  const currentStep = statusMap[order.status] || 2;
                  const progressPct = ((currentStep - 1) / 4) * 100;

                  return `
                  <div class="order-card">
                    <div class="order-header">
                      <div>
                        <strong>Order #${order.id}</strong> | <span class="text-muted">${order.date}</span>
                      </div>
                      <div>
                        Status: <strong class="text-gold">${order.status.toUpperCase()}</strong>
                      </div>
                    </div>

                    <!-- Live Order Tracking Timeline Bar -->
                    <div class="tracking-timeline">
                      <div class="tracking-timeline-progress" style="width: ${progressPct}%;"></div>
                      
                      <div class="timeline-step ${currentStep >= 1 ? 'completed' : ''} ${currentStep === 1 ? 'active' : ''}">
                        <div class="step-node"><i class="fa-solid fa-cart-shopping"></i></div>
                        <span>Placed</span>
                      </div>

                      <div class="timeline-step ${currentStep >= 2 ? 'completed' : ''} ${currentStep === 2 ? 'active' : ''}">
                        <div class="step-node"><i class="fa-solid fa-check"></i></div>
                        <span>Confirmed</span>
                      </div>

                      <div class="timeline-step ${currentStep >= 3 ? 'completed' : ''} ${currentStep === 3 ? 'active' : ''}">
                        <div class="step-node"><i class="fa-solid fa-box"></i></div>
                        <span>Packed</span>
                      </div>

                      <div class="timeline-step ${currentStep >= 4 ? 'completed' : ''} ${currentStep === 4 ? 'active' : ''}">
                        <div class="step-node"><i class="fa-solid fa-truck"></i></div>
                        <span>Shipped</span>
                      </div>

                      <div class="timeline-step ${currentStep >= 5 ? 'completed' : ''} ${currentStep === 5 ? 'active' : ''}">
                        <div class="step-node"><i class="fa-solid fa-house-chimney"></i></div>
                        <span>Delivered</span>
                      </div>
                    </div>

                    <!-- Purchased items list -->
                    <div style="margin-top: 20px;">
                      ${order.items
                        .map(
                          (item) => `
                        <div class="flex gap-md items-center" style="padding: 10px 0; border-bottom: 1px solid var(--color-border-light);">
                          <img src="${item.product.primaryImage}" style="width: 50px; height: 60px; object-fit: cover; border-radius: var(--radius-sm);" />
                          <div style="flex: 1;">
                            <div style="font-weight: 600; font-family: var(--font-serif);">${item.product.name}</div>
                            <div style="font-size: 0.75rem; color: var(--color-muted);">Size: ${item.selectedSize} | Color: ${item.selectedColor}</div>
                          </div>
                          <div style="font-weight: 700;">Rs. ${item.product.price.toLocaleString()}</div>
                        </div>
                      `
                        )
                        .join('')}
                    </div>

                    <div class="flex justify-between items-center" style="margin-top: 16px;">
                      <span style="font-size: 0.85rem; color: var(--color-muted);">Estimated Delivery: <strong>${order.estimatedDelivery}</strong></span>
                      <span style="font-size: 1.1rem; font-weight: 700; font-family: var(--font-serif);">Total: Rs. ${order.total.toLocaleString()}</span>
                    </div>
                  </div>
                `;
                })
                .join('')}
            `
                : activeTab === 'wishlist'
                ? `
              <h3 class="font-serif heading-2" style="margin-bottom: 20px;">MY WISHLIST (${wishlistedProducts.length})</h3>
              ${
                wishlistedProducts.length === 0
                  ? `<p class="text-muted">Your wishlist is currently empty.</p>`
                  : `<div class="products-grid">${wishlistedProducts.map(renderProductCard).join('')}</div>`
              }
            `
                : activeTab === 'addresses'
                ? `
              <h3 class="font-serif heading-2" style="margin-bottom: 20px;">SAVED DELIVERY ADDRESSES</h3>
              <div style="border: 1px solid var(--color-border); padding: 20px; border-radius: var(--radius-sm); max-width: 450px;">
                <div class="subtitle" style="margin-bottom: 4px;">PRIMARY HOME ADDRESS</div>
                <h4 style="font-size: 1.1rem; margin-bottom: 8px;">${store.user.name}</h4>
                <p style="font-size: 0.85rem; color: var(--color-muted); line-height: 1.6;">
                  ${store.user.address}<br>
                  ${store.user.city}, ${store.user.postalCode}<br>
                  Phone: ${store.user.phone}
                </p>
              </div>
            `
                : `
              <h3 class="font-serif heading-2" style="margin-bottom: 20px;">YOUR STYLE DNA PROFILE</h3>
              <div style="background-color: #FAF5EE; padding: 24px; border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
                <i class="fa-solid fa-wand-magic-sparkles text-gold" style="font-size: 2rem; margin-bottom: 12px;"></i>
                <h4 class="font-serif heading-2 text-gold">MODERN FEMININE MINIMALIST</h4>
                <p style="font-size: 0.9rem; color: var(--color-muted); margin-top: 8px;">
                  Your profile prioritizes clean fluid silhouettes, warm ivory & nude silk fabrics, and understated gold jewelry accents.
                </p>
              </div>
            `
            }
          </main>
        </div>
      </div>
    </div>
  `;
}
