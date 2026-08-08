import { store } from '../data/mockState';

export function renderNavbar(): string {
  const cartCount = store.cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = store.wishlist.length;
  const user = store.currentUser;

  return `
    <!-- Announcement Bar -->
    <div class="announcement-bar">
      <div class="container announcement-text">
        <i class="fa-solid fa-truck-fast"></i> COMPLIMENTARY EXPRESS DELIVERY ON ALL ORDERS ABOVE RS. 5,000 &bull; PRIVATE SS26 PREVIEW
      </div>
    </div>

    <!-- Main Navigation Header -->
    <header class="site-header" id="site-header">
      <div class="container header-inner">
        <!-- Logo -->
        <a href="#" class="brand-logo" data-route="home">
          <img src="/assets/the-atelier-logo.svg" alt="THE ATELIER" style="height: 52px; width: auto; display: block;" />
        </a>

        <!-- Navigation Menu -->
        <nav class="nav-menu">
          <a href="#" class="nav-link ${store.activeRoute === 'home' ? 'active' : ''}" data-route="home">HOME</a>
          <a href="#" class="nav-link ${store.activeRoute === 'shop' ? 'active' : ''}" data-route="shop" data-cat="ALL">NEW ARRIVALS</a>
          <a href="#" class="nav-link" data-route="shop" data-cat="Clothing">CLOTHING</a>
          <a href="#" class="nav-link" data-route="shop" data-cat="Bags">BAGS</a>
          <a href="#" class="nav-link" data-route="shop" data-cat="Footwear">SHOES</a>
          <a href="#" class="nav-link" data-route="shop" data-cat="Accessories">ACCESSORIES</a>
          <a href="#" class="nav-link text-sale" data-route="shop" data-cat="ALL">SALE 50% OFF</a>
          ${
            user?.role === 'ADMIN'
              ? `<a href="#" class="nav-link ${store.activeRoute === 'admin' ? 'active' : ''}" data-route="admin" style="color: var(--color-gold); font-weight: 700;"><i class="fa-solid fa-user-shield"></i> ADMIN DASHBOARD</a>`
              : ''
          }
        </nav>

        <!-- Header Actions -->
        <div class="header-actions">
          <!-- Search Trigger -->
          <button class="header-action-btn" id="open-search-btn" title="Search Atelier Catalog">
            <i class="fa-solid fa-magnifying-glass"></i>
          </button>

          <!-- Wishlist Toggle -->
          <button class="header-action-btn ${store.activeRoute === 'account' ? 'active' : ''}" id="open-wishlist-btn" title="Wishlist">
            <i class="fa-regular fa-heart"></i>
            ${wishlistCount > 0 ? `<span class="cart-badge">${wishlistCount}</span>` : ''}
          </button>

          <!-- Cart Drawer Toggle -->
          <button class="header-action-btn" id="open-cart-btn" title="Shopping Cart">
            <i class="fa-solid fa-bag-shopping"></i>
            ${cartCount > 0 ? `<span class="cart-badge">${cartCount}</span>` : ''}
          </button>

          <!-- User Account / Auth Trigger -->
          ${
            user
              ? `
            <div class="flex items-center gap-xs" style="position: relative;">
              <button class="header-action-btn" id="user-menu-btn" title="${user.name}">
                <i class="fa-solid fa-user-check" style="color: var(--color-gold);"></i>
              </button>
              <button id="logout-btn" title="Sign Out" style="font-size: 0.75rem; color: var(--color-muted); background: none; border: none; cursor: pointer; padding: 4px;">
                <i class="fa-solid fa-right-from-bracket"></i>
              </button>
            </div>
          `
              : `
            <button class="header-action-btn" id="open-auth-btn" title="Sign In / Register">
              <i class="fa-regular fa-user"></i>
            </button>
          `
          }

          <!-- Mobile Hamburger (hidden on desktop via CSS) -->
          <button class="header-action-btn nav-hamburger" id="mobile-menu-btn" aria-label="Open navigation menu">
            <i class="fa-solid fa-bars"></i>
          </button>
        </div>
      </div>
    </header>
  `;
}
