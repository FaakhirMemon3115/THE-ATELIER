import './style.css';
import { store } from './js/data/mockState';
import { PRODUCTS_DATA } from './js/data/products';
import { renderNavbar } from './js/components/Navbar';
import { renderCartDrawer } from './js/components/CartDrawer';
import { renderProductModal } from './js/components/ProductModal';
import { renderStyleDNAQuizModal } from './js/components/StyleDNAQuiz';
import { renderSearchOverlay } from './js/components/SearchOverlay';
import { renderHomePage } from './js/pages/Home';
import { renderShopPage } from './js/pages/ShopPage';
import { renderCheckoutPage } from './js/pages/CheckoutPage';
import { renderAccountPage } from './js/pages/AccountPage';
import { renderAdminPage } from './js/pages/AdminPage';

// Local UI state flags
let isCartOpen = false;
let isSearchOpen = false;
let searchQuery = '';
let isQuizOpen = false;
let quizStep = 0;
let quizAnswers: string[] = [];
let accountTab = 'orders';
let adminTab = 'dashboard';
let confirmedOrderData: any = null;
let currentShopCategory = 'ALL';
let hasBrandLoaded = false;

// Builder state
let builderSelected: Record<string, string> = {
  Clothing: 'prod-001',
  Bags: 'prod-003'
};

function renderApp() {
  const appEl = document.querySelector<HTMLDivElement>('#app')!;

  // 1. Determine main content based on route
  let mainContent = '';
  if (store.activeRoute === 'home') {
    mainContent = renderHomePage(!hasBrandLoaded);
  } else if (store.activeRoute === 'shop') {
    mainContent = renderShopPage(currentShopCategory);
  } else if (store.activeRoute === 'checkout') {
    mainContent = renderCheckoutPage(confirmedOrderData);
  } else if (store.activeRoute === 'account') {
    mainContent = renderAccountPage(accountTab);
  } else if (store.activeRoute === 'admin') {
    mainContent = renderAdminPage(adminTab);
  }

  // 2. Assemble Full Page Shell
  appEl.innerHTML = `
    ${renderNavbar()}
    <main class="fade-in">${mainContent}</main>

    <!-- Footer (omitted on checkout for distraction-free flow) -->
    ${
      store.activeRoute !== 'checkout'
        ? `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-hero-statement">
            <h2 class="footer-hero-title">THE ATELIER</h2>
            <p class="footer-hero-tagline">Wear your story. Express your silhouette.</p>
          </div>

          <div class="footer-grid">
            <div>
              <div class="brand-logo" style="margin-bottom: 14px;">THE ATELIER<span class="logo-dot"></span></div>
              <p style="font-size: 0.85rem; color: #A0A0A0; max-width: 260px;">
                Haute couture fashion brand bringing international luxury aesthetics to modern women.
              </p>
            </div>

            <div>
              <div class="footer-col-title">SHOP</div>
              <ul class="footer-links">
                <li><a href="#" data-route="shop" data-cat="Clothing">New Gowns & Dresses</a></li>
                <li><a href="#" data-route="shop" data-cat="Bags">Leather Handbags</a></li>
                <li><a href="#" data-route="shop" data-cat="Footwear">Stiletto Heels</a></li>
                <li><a href="#" data-route="shop" data-cat="Accessories">Fine Jewelry</a></li>
              </ul>
            </div>

            <div>
              <div class="footer-col-title">ATELIER</div>
              <ul class="footer-links">
                <li><a href="#" data-route="home">Our Story</a></li>
                <li><a href="#" data-route="home">Journal & Craft</a></li>
                <li><a href="#" data-route="home">Archive Collection</a></li>
                <li><a href="#" data-route="account">Style DNA Quiz</a></li>
              </ul>
            </div>

            <div>
              <div class="footer-col-title">CLIENT CARE</div>
              <ul class="footer-links">
                <li><a href="#" id="footer-size-guide-btn">Size Guide</a></li>
                <li><a href="#" data-route="account">Track Order</a></li>
                <li><a href="#">Shipping & Returns</a></li>
                <li><a href="#">FAQ & Support</a></li>
              </ul>
            </div>

            <div>
              <div class="footer-col-title">JOIN THE ATELIER</div>
              <p style="font-size: 0.8rem; color: #A0A0A0;">Receive private invitations to new season drops.</p>
              <div class="newsletter-form">
                <input type="email" placeholder="Your email address..." class="newsletter-input" />
                <button class="btn btn-gold" style="padding: 10px 16px;">JOIN</button>
              </div>
            </div>
          </div>

          <div class="footer-bottom">
            <div>© 2026 THE ATELIER. All Rights Reserved.</div>
            <div class="flex gap-lg">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms & Conditions</a>
              <a href="#">Instagram @TheAtelier</a>
            </div>
          </div>
        </div>
      </footer>
    `
        : ''
    }

    <!-- Slide-over Cart Drawer -->
    ${renderCartDrawer()}

    <!-- Modals -->
    ${store.selectedProductForModal ? renderProductModal() : ''}
    ${isQuizOpen ? renderStyleDNAQuizModal(quizStep, quizAnswers) : ''}
    ${isSearchOpen ? renderSearchOverlay(searchQuery) : ''}

    <!-- Toast Notifications Container -->
    <div id="toast-container" class="toast-container"></div>
  `;

  // 3. Update Cart & Search Drawer classes
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  if (cartDrawer && cartOverlay && isCartOpen) {
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
  }

  // 4. Attach Event Handlers
  attachEventHandlers();

  // 5. Hide Brand Reveal Intro Loader after initial view
  const brandLoader = document.getElementById('brand-loader');
  if (brandLoader && !hasBrandLoaded) {
    hasBrandLoaded = true;
    setTimeout(() => {
      brandLoader.classList.add('fade-out');
      setTimeout(() => brandLoader.remove(), 800);
    }, 1200);
  }
}

function attachEventHandlers() {
  // Navigation Links
  document.querySelectorAll('[data-route]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const targetRoute = el.getAttribute('data-route') as any;
      const targetCat = el.getAttribute('data-cat');
      const targetTab = el.getAttribute('data-tab');

      if (targetCat) currentShopCategory = targetCat;
      if (targetTab) accountTab = targetTab;

      store.navigateTo(targetRoute);
    });
  });

  // Cart Drawer Triggers
  document.getElementById('cart-drawer-trigger')?.addEventListener('click', () => {
    isCartOpen = true;
    renderApp();
  });

  document.getElementById('close-cart-btn')?.addEventListener('click', () => {
    isCartOpen = false;
    renderApp();
  });

  document.getElementById('cart-overlay')?.addEventListener('click', () => {
    isCartOpen = false;
    renderApp();
  });

  document.getElementById('drawer-shop-now-btn')?.addEventListener('click', () => {
    isCartOpen = false;
    store.navigateTo('shop');
  });

  // Cart Actions (+, -, Remove)
  document.querySelectorAll('[data-cart-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-cart-action');
      const itemId = btn.getAttribute('data-item-id')!;
      if (action === 'inc') store.updateCartQuantity(itemId, 1);
      if (action === 'dec') store.updateCartQuantity(itemId, -1);
      if (action === 'remove') store.removeFromCart(itemId);
    });
  });

  // Coupon application
  document.getElementById('apply-coupon-btn')?.addEventListener('click', () => {
    const input = document.getElementById('coupon-input-code') as HTMLInputElement;
    if (input && input.value) {
      const success = store.applyCouponCode(input.value);
      if (!success) store.showToast('Invalid coupon code. Try ATELIER10');
    }
  });

  document.getElementById('proceed-checkout-btn')?.addEventListener('click', () => {
    isCartOpen = false;
    confirmedOrderData = null;
    store.navigateTo('checkout');
  });

  // Product Card Click (Open detail modal)
  document.querySelectorAll('[data-action="open-detail"]').forEach((el) => {
    el.addEventListener('click', () => {
      const pId = el.getAttribute('data-product-id');
      const product = PRODUCTS_DATA.find((p) => p.id === pId);
      if (product) store.openProductModal(product);
    });
  });

  // Wishlist Toggle
  document.querySelectorAll('[data-action="wishlist"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pId = btn.getAttribute('data-product-id')!;
      store.toggleWishlist(pId);
    });
  });

  // Product Modal Controls
  document.getElementById('close-modal-btn')?.addEventListener('click', () => {
    store.closeProductModal();
  });

  document.getElementById('product-modal-overlay')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('product-modal-overlay')) {
      store.closeProductModal();
    }
  });

  // Modal Image Thumbnail Swapper
  document.querySelectorAll('.thumb-img').forEach((thumb) => {
    thumb.addEventListener('click', () => {
      const src = thumb.getAttribute('data-thumb');
      const mainImg = document.getElementById('modal-main-image') as HTMLImageElement;
      if (mainImg && src) {
        mainImg.src = src;
        document.querySelectorAll('.thumb-img').forEach((t) => t.classList.remove('active'));
        thumb.classList.add('active');
      }
    });
  });

  // Modal Color Swatch & Size Chips
  document.querySelectorAll('.color-swatch').forEach((swatch) => {
    swatch.addEventListener('click', () => {
      document.querySelectorAll('.color-swatch').forEach((s) => s.classList.remove('selected'));
      swatch.classList.add('selected');
      const colorName = swatch.getAttribute('data-color');
      const colorImg = swatch.getAttribute('data-color-image');
      const label = document.getElementById('selected-color-label');
      if (label && colorName) label.textContent = colorName;

      // Update main product modal image to selected color image with smooth transition
      const mainImg = document.getElementById('modal-main-image') as HTMLImageElement;
      if (mainImg && colorImg) {
        mainImg.style.transition = 'opacity 0.2s ease-in-out';
        mainImg.style.opacity = '0.3';
        setTimeout(() => {
          mainImg.src = colorImg;
          mainImg.style.opacity = '1';
        }, 150);
      }
    });
  });

  document.querySelectorAll('#modal-size-chips .size-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#modal-size-chips .size-chip').forEach((s) => s.classList.remove('selected'));
      chip.classList.add('selected');
    });
  });

  // Modal Qty
  let modalQty = 1;
  document.getElementById('modal-qty-plus')?.addEventListener('click', () => {
    modalQty++;
    const el = document.getElementById('modal-qty-val');
    if (el) el.textContent = String(modalQty);
  });
  document.getElementById('modal-qty-minus')?.addEventListener('click', () => {
    if (modalQty > 1) modalQty--;
    const el = document.getElementById('modal-qty-val');
    if (el) el.textContent = String(modalQty);
  });

  document.getElementById('modal-add-to-cart-btn')?.addEventListener('click', () => {
    if (store.selectedProductForModal) {
      const selectedSizeEl = document.querySelector('#modal-size-chips .size-chip.selected');
      const selectedSize = selectedSizeEl ? selectedSizeEl.textContent! : 'M';
      const selectedColorLabel = document.getElementById('selected-color-label')?.textContent || 'Default';

      store.addToCart(store.selectedProductForModal, modalQty, selectedSize, selectedColorLabel);
      store.closeProductModal();
      isCartOpen = true;
      renderApp();
    }
  });

  // Index Magazine Hover Preview
  document.querySelectorAll('.index-item').forEach((item) => {
    item.addEventListener('mouseenter', () => {
      const idx = item.getAttribute('data-preview');
      document.querySelectorAll('.index-preview-img').forEach((img) => img.classList.remove('active'));
      document.getElementById(`idx-img-${idx}`)?.classList.add('active');
    });
  });

  // Add Complete Look Bundle Button
  document.getElementById('add-complete-look-btn')?.addEventListener('click', () => {
    store.addToCart(PRODUCTS_DATA[0], 1, 'M', 'Noir Black');
    store.addToCart(PRODUCTS_DATA[2], 1, 'One Size', 'Champagne Gold');
    store.addToCart(PRODUCTS_DATA[3], 1, '38', 'Gold');
    isCartOpen = true;
    renderApp();
  });

  // Mood Switcher Buttons
  document.querySelectorAll('.mood-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      store.activeMood = btn.getAttribute('data-mood') as any;
      renderApp();
    });
  });

  // Day/Night Slider
  const slider = document.getElementById('day-night-slider') as HTMLInputElement;
  if (slider) {
    slider.addEventListener('input', () => {
      store.dayNightTime = parseInt(slider.value, 10);
      renderApp();
    });
  }

  // Look Builder Interaction
  document.querySelectorAll('.builder-item-card').forEach((card) => {
    card.addEventListener('click', () => {
      const pId = card.getAttribute('data-builder-product-id')!;
      const prod = PRODUCTS_DATA.find((p) => p.id === pId);
      if (prod) {
        builderSelected[prod.category] = prod.id;
        store.showToast(`Updated styled look with "${prod.name}"`);
        renderApp();
      }
    });
  });

  document.getElementById('builder-add-bundle-btn')?.addEventListener('click', () => {
    Object.values(builderSelected).forEach((pId) => {
      const p = PRODUCTS_DATA.find((prod) => prod.id === pId);
      if (p) store.addToCart(p, 1);
    });
    isCartOpen = true;
    renderApp();
  });

  // Style DNA Quiz Triggers
  document.getElementById('dna-quiz-btn')?.addEventListener('click', () => {
    isQuizOpen = true;
    quizStep = 0;
    quizAnswers = [];
    renderApp();
  });

  document.getElementById('start-dna-quiz-cta')?.addEventListener('click', () => {
    isQuizOpen = true;
    quizStep = 0;
    quizAnswers = [];
    renderApp();
  });

  document.getElementById('close-quiz-btn')?.addEventListener('click', () => {
    isQuizOpen = false;
    renderApp();
  });

  document.querySelectorAll('.quiz-option-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-quiz-type')!;
      quizAnswers.push(type);
      quizStep++;
      renderApp();
    });
  });

  document.getElementById('view-dna-curated-btn')?.addEventListener('click', (e) => {
    const mood = (e.currentTarget as HTMLElement).getAttribute('data-mood');
    isQuizOpen = false;
    if (mood) store.activeMood = mood as any;
    store.navigateTo('home');
  });

  document.getElementById('save-dna-btn')?.addEventListener('click', () => {
    isQuizOpen = false;
    accountTab = 'dna';
    store.navigateTo('account');
    store.showToast('Saved Style DNA Profile to your account.');
  });

  // Search Overlay
  document.getElementById('search-trigger-btn')?.addEventListener('click', () => {
    isSearchOpen = true;
    renderApp();
  });

  document.getElementById('mobile-search-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    isSearchOpen = true;
    renderApp();
  });

  document.getElementById('close-search-btn')?.addEventListener('click', () => {
    isSearchOpen = false;
    renderApp();
  });

  const searchInput = document.getElementById('live-search-input') as HTMLInputElement;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value;
      renderApp();
    });
  }

  document.querySelectorAll('.search-tag-btn').forEach((tag) => {
    tag.addEventListener('click', () => {
      searchQuery = tag.getAttribute('data-tag') || '';
      renderApp();
    });
  });

  // Checkout Actions
  document.getElementById('place-order-btn')?.addEventListener('click', () => {
    const nameEl = document.getElementById('chk-name') as HTMLInputElement;
    const emailEl = document.getElementById('chk-email') as HTMLInputElement;
    const phoneEl = document.getElementById('chk-phone') as HTMLInputElement;
    const addressEl = document.getElementById('chk-address') as HTMLInputElement;
    const cityEl = document.getElementById('chk-city') as HTMLSelectElement;
    const paymentOptEl = document.querySelector('input[name="payment-opt"]:checked') as HTMLInputElement;

    const newOrder = store.placeOrder({
      customerName: nameEl?.value || 'Ayesha Khan',
      email: emailEl?.value || 'ayesha.khan@atelier.com',
      phone: phoneEl?.value || '+92 300 1234567',
      address: addressEl?.value || 'Penthouse 14B, Ocean Towers',
      city: cityEl?.value || 'Karachi',
      paymentMethod: paymentOptEl?.value || 'Cash on Delivery'
    });

    confirmedOrderData = newOrder;
    renderApp();
  });

  // Account Tabs
  document.querySelectorAll('.account-nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      accountTab = btn.getAttribute('data-tab')!;
      renderApp();
    });
  });

  // Admin Tabs
  document.querySelectorAll('.admin-nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      adminTab = btn.getAttribute('data-admin-tab')!;
      renderApp();
    });
  });

  // Admin status update
  document.querySelectorAll('.admin-status-select').forEach((sel) => {
    sel.addEventListener('change', (e) => {
      const orderId = sel.getAttribute('data-order-id')!;
      const val = (e.target as HTMLSelectElement).value as any;
      store.updateOrderStatus(orderId, val);
    });
  });
}

// Initial App Mount & Store Subscription
store.subscribe(renderApp);
renderApp();
