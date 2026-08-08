import './style.css';
import { store } from './js/data/mockState';
import type { Product, Order } from './js/data/mockState';
import { renderNavbar } from './js/components/Navbar';
import { renderCartDrawer } from './js/components/CartDrawer';
import { renderProductModal } from './js/components/ProductModal';
import { renderStyleDNAQuizModal } from './js/components/StyleDNAQuiz';
import { renderSearchOverlay } from './js/components/SearchOverlay';
import { renderAuthModal, validatePassword } from './js/components/AuthModal';
import { renderHomePage } from './js/pages/Home';
import { renderShopPage, FilterState } from './js/pages/ShopPage';
import { renderCheckoutPage } from './js/pages/CheckoutPage';
import { renderAccountPage } from './js/pages/AccountPage';
import { renderAdminPage } from './js/pages/AdminPage';

// Local UI State flags
let isCartOpen = false;
let isSearchOpen = false;
let searchQuery = '';
let isQuizOpen = false;
let quizStep = 0;
let quizAnswers: string[] = [];

let isAuthModalOpen = false;
let authActiveTab: 'login' | 'register' = 'login';

let accountTab = 'orders';
let adminTab = 'dashboard';
let confirmedOrderData: Order | null = null;
let hasBrandLoaded = false;

// Shop filter state
let shopFilterState: FilterState = {
  category: 'ALL',
  selectedSizes: [],
  selectedColors: [],
  maxPrice: 15000,
  sortBy: 'FEATURED EDIT'
};

function showToast(message: string, icon = 'fa-circle-check') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function renderApp() {
  const appEl = document.querySelector<HTMLDivElement>('#app')!;

  // 1. Determine main content based on active route
  let mainContent = '';
  if (store.activeRoute === 'home') {
    mainContent = renderHomePage(!hasBrandLoaded);
  } else if (store.activeRoute === 'shop') {
    mainContent = renderShopPage(shopFilterState);
  } else if (store.activeRoute === 'checkout') {
    mainContent = renderCheckoutPage(confirmedOrderData);
  } else if (store.activeRoute === 'account') {
    mainContent = renderAccountPage(accountTab);
  } else if (store.activeRoute === 'admin') {
    // Only render admin page if authenticated as ADMIN
    if (store.currentUser?.role === 'ADMIN') {
      mainContent = renderAdminPage(adminTab);
    } else {
      store.navigateTo('home');
      isAuthModalOpen = true;
      authActiveTab = 'login';
      showToast('Admin login required.', 'fa-triangle-exclamation');
      return;
    }
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
              <div class="brand-logo" style="margin-bottom: 14px;"><img src="/assets/the-atelier-logo.svg" alt="THE ATELIER" style="height: 44px; width: auto; display: block; filter: brightness(0) invert(1) opacity(0.9);" /></div>
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
              </ul>
            </div>

            <div>
              <div class="footer-col-title">CLIENT CARE</div>
              <ul class="footer-links">
                <li><a href="#" id="footer-size-guide-btn">Size Guide</a></li>
                <li><a href="#" data-route="account" data-tab="orders">Track Order</a></li>
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
    ${isAuthModalOpen ? renderAuthModal(authActiveTab) : ''}

    <!-- Toast Container -->
    <div id="toast-container" class="toast-container"></div>
  `;

  // Update Cart Drawer state
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  if (cartDrawer && cartOverlay && isCartOpen) {
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
  }

  // Attach Event Handlers
  attachEventHandlers();

  // Hide Intro Loader after initial load
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

      if (targetCat) shopFilterState.category = targetCat;
      if (targetTab) accountTab = targetTab;

      // Gate account & checkout if not logged in
      if ((targetRoute === 'account' || targetRoute === 'checkout') && !store.currentUser) {
        isAuthModalOpen = true;
        authActiveTab = 'login';
        showToast('Please sign in or create an account first.', 'fa-user-lock');
        renderApp();
        return;
      }

      store.navigateTo(targetRoute);
    });
  });

  // Auth Button (Navbar)
  const openAuthBtn = document.getElementById('open-auth-btn');
  if (openAuthBtn) {
    openAuthBtn.addEventListener('click', () => {
      isAuthModalOpen = true;
      authActiveTab = 'login';
      renderApp();
    });
  }

  // Logout Buttons
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      store.logout();
      showToast('Signed out of Atelier session.');
    });
  }

  const accountLogoutBtn = document.getElementById('account-logout-btn');
  if (accountLogoutBtn) {
    accountLogoutBtn.addEventListener('click', () => {
      store.logout();
      showToast('Signed out of Atelier session.');
    });
  }

  // Close Auth Modal
  const closeAuthBtn = document.getElementById('close-auth-modal-btn');
  if (closeAuthBtn) {
    closeAuthBtn.addEventListener('click', () => {
      isAuthModalOpen = false;
      renderApp();
    });
  }

  // Auth Tabs
  const authTabLogin = document.getElementById('auth-tab-login');
  if (authTabLogin) {
    authTabLogin.addEventListener('click', () => {
      authActiveTab = 'login';
      renderApp();
    });
  }

  const authTabRegister = document.getElementById('auth-tab-register');
  if (authTabRegister) {
    authTabRegister.addEventListener('click', () => {
      authActiveTab = 'register';
      renderApp();
    });
  }

  // Login Form Submission
  const loginForm = document.getElementById('auth-login-form') as HTMLFormElement;
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = (document.getElementById('login-email') as HTMLInputElement).value.trim();
      const password = (document.getElementById('login-password') as HTMLInputElement).value.trim();

      // Check Default Admin Credentials
      if (email.toLowerCase() === 'atif@admin.com' && password === 'atif@access.com') {
        store.login('atif@admin.com', 'ADMIN', 'Atelier Administrator');
        isAuthModalOpen = false;
        showToast('Admin authenticated successfully! Opening Dashboard...', 'fa-user-shield');
        store.navigateTo('admin');
        return;
      }

      // Regular User Login
      if (email && password) {
        store.login(email, 'USER', email.split('@')[0]);
        isAuthModalOpen = false;
        showToast(`Welcome back, ${store.currentUser?.name}!`);
        renderApp();
      }
    });
  }

  // Registration Form Submission (With Password Validation)
  const registerForm = document.getElementById('auth-register-form') as HTMLFormElement;
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = (document.getElementById('reg-name') as HTMLInputElement).value.trim();
      const email = (document.getElementById('reg-email') as HTMLInputElement).value.trim();
      const password = (document.getElementById('reg-password') as HTMLInputElement).value.trim();

      const validation = validatePassword(password);
      const alertBox = document.getElementById('auth-error-alert');

      if (!validation.isValid) {
        if (alertBox) {
          alertBox.style.display = 'block';
          alertBox.innerHTML = `<strong>Password Validation Failed:</strong><ul style="margin-top: 4px; padding-left: 16px;">${validation.errors.map((err) => `<li>${err}</li>`).join('')}</ul>`;
        }
        return;
      }

      store.login(email, 'USER', name);
      isAuthModalOpen = false;
      showToast(`Account created successfully. Welcome ${name}!`);
      renderApp();
    });
  }

  // Cart Drawer Toggles
  const openCartBtn = document.getElementById('open-cart-btn');
  const closeCartBtn = document.getElementById('close-cart-btn');
  const cartOverlayEl = document.getElementById('cart-overlay');

  if (openCartBtn) {
    openCartBtn.addEventListener('click', () => {
      isCartOpen = true;
      renderApp();
    });
  }

  if (closeCartBtn) {
    closeCartBtn.addEventListener('click', () => {
      isCartOpen = false;
      renderApp();
    });
  }

  if (cartOverlayEl) {
    cartOverlayEl.addEventListener('click', () => {
      isCartOpen = false;
      renderApp();
    });
  }

  // Cart Item Quantity Adjusters
  document.querySelectorAll('.cart-qty-plus').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-cart-id');
      if (id) store.updateCartQuantity(id, 1);
    });
  });

  document.querySelectorAll('.cart-qty-minus').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-cart-id');
      if (id) store.updateCartQuantity(id, -1);
    });
  });

  document.querySelectorAll('.cart-remove-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-cart-id');
      if (id) {
        store.removeFromCart(id);
        showToast('Item removed from Atelier bag.');
      }
    });
  });

  // Proceed to Checkout Button (Cart Drawer)
  const proceedCheckoutBtn = document.getElementById('proceed-checkout-btn');
  if (proceedCheckoutBtn) {
    proceedCheckoutBtn.addEventListener('click', () => {
      isCartOpen = false;
      if (!store.currentUser) {
        isAuthModalOpen = true;
        authActiveTab = 'login';
        showToast('Please sign in or create an account to checkout.', 'fa-user-lock');
        renderApp();
        return;
      }
      confirmedOrderData = null;
      store.navigateTo('checkout');
    });
  }

  // Product Card Quick Add & Wishlist & Modal Triggers
  document.querySelectorAll('.product-card').forEach((card) => {
    const prodId = card.getAttribute('data-prod-id');
    const product = store.products.find((p) => p.id === prodId);

    if (product) {
      card.querySelectorAll('.product-img-wrap, .product-title').forEach((el) => {
        el.addEventListener('click', () => store.openProductModal(product));
      });

      const addBtn = card.querySelector('.btn-quick-add');
      if (addBtn) {
        addBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          store.addToCart(product, 1);
          showToast(`Added ${product.name} to Atelier bag!`);
        });
      }

      const wishBtn = card.querySelector('.btn-wishlist');
      if (wishBtn) {
        wishBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (!store.currentUser) {
            isAuthModalOpen = true;
            authActiveTab = 'login';
            showToast('Please sign in to save items to your wishlist.', 'fa-user-lock');
            renderApp();
            return;
          }
          store.toggleWishlist(product.id);
          const isWishlisted = store.wishlist.includes(product.id);
          showToast(isWishlisted ? 'Saved to your Wishlist!' : 'Removed from Wishlist.');
        });
      }
    }
  });

  // Modal Event Handlers
  const closeModalBtn = document.getElementById('close-modal-btn');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => store.closeProductModal());
  }

  const modalOverlay = document.getElementById('product-modal-overlay');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) store.closeProductModal();
    });
  }

  const modalAddCartBtn = document.getElementById('modal-add-to-cart-btn');
  if (modalAddCartBtn && store.selectedProductForModal) {
    modalAddCartBtn.addEventListener('click', () => {
      const selectedSize = document.querySelector('#modal-size-chips .size-chip.selected')?.getAttribute('data-size') || 'S';
      const selectedColor = document.querySelector('.color-swatch.selected')?.getAttribute('data-color') || 'Default';
      const qtyVal = parseInt(document.getElementById('modal-qty-val')?.textContent || '1', 10);

      store.addToCart(store.selectedProductForModal!, qtyVal, selectedSize, selectedColor);
      store.closeProductModal();
      isCartOpen = true;
      showToast(`Added ${store.selectedProductForModal!.name} to bag!`);
      renderApp();
    });
  }

  // Shop Page Filters (Interactive Real-Time binding)
  document.querySelectorAll('[data-filter-cat]').forEach((input) => {
    input.addEventListener('change', (e) => {
      const cat = (e.target as HTMLElement).getAttribute('data-filter-cat');
      if (cat) {
        shopFilterState.category = cat;
        renderApp();
      }
    });
  });

  document.querySelectorAll('#filter-size-chips .size-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const size = chip.getAttribute('data-filter-size');
      if (size) {
        if (shopFilterState.selectedSizes.includes(size)) {
          shopFilterState.selectedSizes = shopFilterState.selectedSizes.filter((s) => s !== size);
        } else {
          shopFilterState.selectedSizes.push(size);
        }
        renderApp();
      }
    });
  });

  document.querySelectorAll('#filter-color-swatches .color-swatch').forEach((swatch) => {
    swatch.addEventListener('click', () => {
      const color = swatch.getAttribute('data-filter-color');
      if (color) {
        if (shopFilterState.selectedColors.includes(color)) {
          shopFilterState.selectedColors = shopFilterState.selectedColors.filter((c) => c !== color);
        } else {
          shopFilterState.selectedColors.push(color);
        }
        renderApp();
      }
    });
  });

  const priceRangeInput = document.getElementById('filter-price-range') as HTMLInputElement;
  if (priceRangeInput) {
    priceRangeInput.addEventListener('input', () => {
      shopFilterState.maxPrice = parseInt(priceRangeInput.value, 10);
      renderApp();
    });
  }

  const sortSelect = document.getElementById('shop-sort-select') as HTMLSelectElement;
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      shopFilterState.sortBy = sortSelect.value;
      renderApp();
    });
  }

  const resetFiltersBtn = document.getElementById('reset-filters-btn');
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
      shopFilterState = {
        category: 'ALL',
        selectedSizes: [],
        selectedColors: [],
        maxPrice: 15000,
        sortBy: 'FEATURED EDIT'
      };
      renderApp();
    });
  }

  // Coupon Application (Single-Use Rule)
  const couponForm = document.getElementById('coupon-form') as HTMLFormElement;
  if (couponForm) {
    couponForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const codeInput = document.getElementById('coupon-code-input') as HTMLInputElement;
      if (codeInput) {
        const res = store.applyCoupon(codeInput.value);
        showToast(res.message, res.success ? 'fa-circle-check' : 'fa-triangle-exclamation');
        renderApp();
      }
    });
  }

  const removeCouponBtn = document.getElementById('remove-coupon-btn');
  if (removeCouponBtn) {
    removeCouponBtn.addEventListener('click', () => {
      store.removeCoupon();
      showToast('Coupon removed.');
      renderApp();
    });
  }

  // Checkout Form Submission (Place Order)
  const checkoutForm = document.getElementById('checkout-form') as HTMLFormElement;
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = (document.getElementById('checkout-name') as HTMLInputElement).value.trim();
      const email = (document.getElementById('checkout-email') as HTMLInputElement).value.trim();
      const phone = (document.getElementById('checkout-phone') as HTMLInputElement).value.trim();
      const address = (document.getElementById('checkout-address') as HTMLInputElement).value.trim();
      const city = (document.getElementById('checkout-city') as HTMLInputElement).value.trim();

      const orderItems = store.cart.map((ci) => ({
        productId: ci.product.id,
        productName: ci.product.name,
        price: ci.product.price,
        quantity: ci.quantity,
        selectedSize: ci.selectedSize,
        selectedColor: ci.selectedColor,
        image: ci.product.primaryImage
      }));

      const subtotal = store.getCartSubtotal();
      const discount = store.getDiscountAmount();
      const shipping = store.getShippingFee();
      const total = store.getCartTotal();

      const newOrder = store.placeOrder({
        customerName: name,
        customerEmail: email,
        items: orderItems,
        subtotal,
        discount,
        shipping,
        total,
        paymentMethod: 'Cash on Delivery',
        shippingAddress: `${address}, ${city} (Phone: ${phone})`
      });

      confirmedOrderData = newOrder;
      showToast(`Order #${newOrder.id} successfully placed!`, 'fa-circle-check');
      renderApp();
    });
  }

  // Admin Panel Event Handlers
  document.querySelectorAll('[data-admin-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-admin-tab');
      if (tab) {
        adminTab = tab;
        renderApp();
      }
    });
  });

  const adminAddProdBtn = document.getElementById('admin-add-product-btn');
  if (adminAddProdBtn) {
    adminAddProdBtn.addEventListener('click', () => {
      const name = prompt('Enter Product Name:', 'Silk Evening Robe');
      if (!name) return;
      const priceStr = prompt('Enter Product Price (Rs):', '8500');
      if (!priceStr) return;
      const category = (prompt('Enter Category (Clothing / Bags / Footwear / Accessories):', 'Clothing') || 'Clothing') as any;

      const newProd: Product = {
        id: `prod-${Date.now()}`,
        sku: `ATL-NEW-${Math.floor(100 + Math.random() * 900)}`,
        name,
        category,
        subcategory: 'Dresses',
        price: parseInt(priceStr, 10),
        rating: 5.0,
        reviewsCount: 1,
        primaryImage: '/images/hero_model.png',
        secondaryImage: '/images/shop_look_model.png',
        description: 'Exclusive haute couture piece newly crafted for Atelier catalog.',
        material: 'Silk Georgette',
        care: 'Dry clean only',
        fit: 'Regular fit',
        sizes: ['S', 'M', 'L'],
        colors: [{ name: 'Ivory', hex: '#F8F5F0' }],
        stock: 25,
        mood: 'CONFIDENT',
        isDay: true,
        isNight: true
      };

      store.addProduct(newProd);
      showToast(`Product "${name}" added to catalog!`);
      renderApp();
    });
  }

  document.querySelectorAll('.btn-del-prod').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-prod-id');
      if (id && confirm('Are you sure you want to delete this product from store?')) {
        store.deleteProduct(id);
        showToast('Product deleted from catalog.');
        renderApp();
      }
    });
  });

  document.querySelectorAll('.btn-edit-prod').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-prod-id');
      const prod = store.products.find((p) => p.id === id);
      if (prod) {
        const newPrice = prompt(`Edit Price for "${prod.name}":`, prod.price.toString());
        const newStock = prompt(`Edit Stock Units for "${prod.name}":`, prod.stock.toString());
        if (newPrice && newStock) {
          prod.price = parseInt(newPrice, 10);
          prod.stock = parseInt(newStock, 10);
          store.updateProduct(prod);
          showToast(`Updated "${prod.name}" price and stock.`);
          renderApp();
        }
      }
    });
  });

  document.querySelectorAll('.btn-restock').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-prod-id');
      const prod = store.products.find((p) => p.id === id);
      if (prod) {
        prod.stock += 20;
        store.updateProduct(prod);
        showToast(`Added +20 stock units to ${prod.name}!`);
        renderApp();
      }
    });
  });

  const addCouponForm = document.getElementById('add-coupon-form') as HTMLFormElement;
  if (addCouponForm) {
    addCouponForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = (document.getElementById('new-coupon-code') as HTMLInputElement).value.trim();
      const discount = parseInt((document.getElementById('new-coupon-discount') as HTMLInputElement).value, 10);
      if (code && discount) {
        store.addCoupon(code, discount);
        showToast(`Coupon code ${code} created successfully!`);
        renderApp();
      }
    });
  }

  document.querySelectorAll('.btn-del-coupon').forEach((btn) => {
    btn.addEventListener('click', () => {
      const code = btn.getAttribute('data-code');
      if (code) {
        store.deleteCoupon(code);
        showToast(`Coupon ${code} deleted.`);
        renderApp();
      }
    });
  });

  document.querySelectorAll('.order-status-select').forEach((select) => {
    select.addEventListener('change', (e) => {
      const orderId = select.getAttribute('data-order-id');
      const newStatus = (e.target as HTMLSelectElement).value as Order['status'];
      if (orderId && newStatus) {
        store.updateOrderStatus(orderId, newStatus);
        showToast(`Order #${orderId} status changed to ${newStatus}.`);
      }
    });
  });
}

// Initial Subscribe & Render
store.subscribe(() => renderApp());
renderApp();
