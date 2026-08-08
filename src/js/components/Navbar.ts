import { store } from '../data/mockState';

export function renderNavbar(): string {
  const cartCount = store.cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = store.wishlist.length;

  return `
    <!-- Announcement Bar -->
    <div class="announcement-bar">
      <span>
        <i class="fa-solid fa-crown gold-accent"></i>
        <span>COMPLIMENTARY EXPRESS SHIPPING ON ORDERS ABOVE <strong class="gold-accent">RS. 5,000</strong></span>
        <span class="mx-2">|</span>
        <span>USE CODE <strong class="gold-accent">ATELIER10</strong> FOR 10% OFF</span>
      </span>
    </div>

    <!-- Main Header -->
    <header class="site-header">
      <div class="container header-inner">
        <!-- Logo -->
        <a href="#" class="brand-logo" data-route="home">
          <img src="/assets/the-atelier-logo.svg" alt="THE ATELIER" style="height: 52px; width: auto; display: block;" />
        </a>

        <!-- Navigation Menu -->
        <nav>
          <ul class="nav-menu">
            <li><a href="#" class="nav-link ${store.activeRoute === 'home' ? 'active' : ''}" data-route="home">Home</a></li>
            <li><a href="#" class="nav-link ${store.activeRoute === 'shop' ? 'active' : ''}" data-route="shop">New Arrivals</a></li>
            <li><a href="#" class="nav-link" data-route="shop" data-cat="Clothing">Clothing</a></li>
            <li><a href="#" class="nav-link" data-route="shop" data-cat="Bags">Bags</a></li>
            <li><a href="#" class="nav-link" data-route="shop" data-cat="Footwear">Shoes</a></li>
            <li><a href="#" class="nav-link" data-route="shop" data-cat="Accessories">Accessories</a></li>
            <li><a href="#" class="nav-link sale-link" data-route="shop" data-sale="true">Sale 50% Off</a></li>
          </ul>
        </nav>

        <!-- Header Actions -->
        <div class="header-actions">
          <button class="action-btn" id="search-trigger-btn" title="Search">
            <i class="fa-solid fa-magnifying-glass"></i>
          </button>

          <button class="action-btn" id="dna-quiz-btn" title="Style DNA Quiz">
            <i class="fa-solid fa-wand-magic-sparkles text-gold"></i>
          </button>

          <button class="action-btn" id="wishlist-btn" title="Wishlist" data-route="account" data-tab="wishlist">
            <i class="fa-regular fa-heart"></i>
            ${wishlistCount > 0 ? `<span class="badge-count">${wishlistCount}</span>` : ''}
          </button>

          <button class="action-btn" id="cart-drawer-trigger" title="Cart Bag">
            <i class="fa-solid fa-bag-shopping"></i>
            ${cartCount > 0 ? `<span class="badge-count">${cartCount}</span>` : ''}
          </button>

          <button class="action-btn" id="account-btn" title="Account" data-route="account">
            <i class="fa-regular fa-user"></i>
          </button>

          <button class="action-btn text-gold" id="admin-btn" title="Admin Panel" data-route="admin">
            <i class="fa-solid fa-sliders"></i>
          </button>
        </div>
      </div>
    </header>

    <!-- Mobile Sticky Bottom Navigation Bar -->
    <div class="mobile-bottom-nav">
      <a href="#" class="mobile-nav-item ${store.activeRoute === 'home' ? 'active' : ''}" data-route="home">
        <i class="fa-solid fa-house"></i>
        <span>Home</span>
      </a>
      <a href="#" class="mobile-nav-item ${store.activeRoute === 'shop' ? 'active' : ''}" data-route="shop">
        <i class="fa-solid fa-compass"></i>
        <span>Shop</span>
      </a>
      <a href="#" class="mobile-nav-item" id="mobile-search-btn">
        <i class="fa-solid fa-magnifying-glass"></i>
        <span>Search</span>
      </a>
      <a href="#" class="mobile-nav-item" data-route="account" data-tab="wishlist">
        <i class="fa-regular fa-heart"></i>
        <span>Wishlist (${wishlistCount})</span>
      </a>
      <a href="#" class="mobile-nav-item" data-route="account">
        <i class="fa-regular fa-user"></i>
        <span>Account</span>
      </a>
    </div>
  `;
}
