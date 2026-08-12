import './style.css';
import { store } from './js/data/mockState';
import type { Order } from './js/data/mockState';
import type { Product } from './js/data/products';
import { renderNavbar } from './js/components/Navbar';
import { renderCartDrawer } from './js/components/CartDrawer';
import { renderProductModal } from './js/components/ProductModal';
import { renderStyleDNAQuizModal } from './js/components/StyleDNAQuiz';
import { renderSearchOverlay } from './js/components/SearchOverlay';
import { renderAuthModal, validatePassword } from './js/components/AuthModal';
import { renderAdminProductModal } from './js/components/AdminProductModal';
import { renderHomePage } from './js/pages/Home';
import { renderShopPage } from './js/pages/ShopPage';
import type { FilterState } from './js/pages/ShopPage';
import { renderCheckoutPage } from './js/pages/CheckoutPage';
import { renderAccountPage } from './js/pages/AccountPage';
import { renderAdminPage } from './js/pages/AdminPage';
import { api, redirectToGateway } from './js/data/api';

// Local UI State flags
let isCartOpen = false;
let isSearchOpen = false;
let searchQuery = '';
let isQuizOpen = false;
let quizStep = 0;
let quizAnswers: string[] = [];

let isAuthModalOpen = false;
let authActiveTab: 'login' | 'register' = 'login';

let isAdminProdModalOpen = false;
let editingAdminProduct: Product | null = null;

let accountTab = 'orders';
let adminTab = 'dashboard';
let confirmedOrderData: Order | null = null;
let hasBrandLoaded = false;
let modalQuantity = 1;

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
  // Admin page is full-screen (no navbar/footer)
  if (store.activeRoute === 'admin') {
    appEl.innerHTML = `
      <main class="fade-in">${mainContent}</main>
      ${isAdminProdModalOpen ? renderAdminProductModal(editingAdminProduct) : ''}
      <div id="toast-container" class="toast-container"></div>
    `;
  } else {
    appEl.innerHTML = `
      ${renderNavbar()}
      <main class="fade-in">${mainContent}</main>

      <!-- Footer -->
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
                  <li><a href="#" data-route="shop" data-cat="Clothing">New Gowns &amp; Dresses</a></li>
                  <li><a href="#" data-route="shop" data-cat="Bags">Leather Handbags</a></li>
                  <li><a href="#" data-route="shop" data-cat="Footwear">Stiletto Heels</a></li>
                  <li><a href="#" data-route="shop" data-cat="Accessories">Fine Jewelry</a></li>
                </ul>
              </div>

              <div>
                <div class="footer-col-title">ATELIER</div>
                <ul class="footer-links">
                  <li><a href="#" data-route="home">Our Story</a></li>
                  <li><a href="#" data-route="home">Journal &amp; Craft</a></li>
                  <li><a href="#" data-route="home">Archive Collection</a></li>
                </ul>
              </div>

              <div>
                <div class="footer-col-title">CLIENT CARE</div>
                <ul class="footer-links">
                  <li><a href="#" id="footer-size-guide-btn">Size Guide</a></li>
                  <li><a href="#" data-route="account" data-tab="orders">Track Order</a></li>
                  <li><a href="#">Shipping &amp; Returns</a></li>
                  <li><a href="#">FAQ &amp; Support</a></li>
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
                <a href="#">Terms &amp; Conditions</a>
                <a href="#">Instagram @TheAtelier</a>
              </div>
            </div>
          </div>
        </footer>
      `
          : ''
      }

      <!-- Cart Drawer -->
      ${renderCartDrawer()}

      <!-- Modals -->
      ${store.selectedProductForModal ? renderProductModal(modalQuantity) : ''}
      ${isQuizOpen ? renderStyleDNAQuizModal(quizStep, quizAnswers) : ''}
      ${isSearchOpen ? renderSearchOverlay(searchQuery) : ''}
      ${isAuthModalOpen ? renderAuthModal(authActiveTab) : ''}
      ${isAdminProdModalOpen ? renderAdminProductModal(editingAdminProduct) : ''}

      <!-- Toast Container -->
      <div id="toast-container" class="toast-container"></div>
    `;
  };

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

  // Account Menu Tabs
  document.querySelectorAll('[data-acc-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-acc-tab');
      if (tab) {
        accountTab = tab;
        renderApp();
      }
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

  // Real-Time Password Requirements Checklist Listener
  const regPasswordInput = document.getElementById('reg-password') as HTMLInputElement;
  if (regPasswordInput) {
    regPasswordInput.addEventListener('input', () => {
      const pass = regPasswordInput.value;

      const updateRule = (ruleId: string, isMet: boolean) => {
        const el = document.getElementById(ruleId);
        if (el) {
          if (isMet) {
            el.style.color = 'var(--color-black)';
            el.style.fontWeight = '700';
            const icon = el.querySelector('i');
            if (icon) {
              icon.className = 'fa-solid fa-circle-check';
              icon.style.color = 'var(--color-black)';
            }
          } else {
            el.style.color = '#999';
            el.style.fontWeight = '400';
            const icon = el.querySelector('i');
            if (icon) {
              icon.className = 'fa-regular fa-circle';
              icon.style.color = '#999';
            }
          }
        }
      };

      updateRule('rule-len', pass.length >= 8);
      updateRule('rule-upper', /[A-Z]/.test(pass));
      updateRule('rule-lower', /[a-z]/.test(pass));
      updateRule('rule-num', /[0-9]/.test(pass));
      updateRule('rule-sym', /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass));
    });
  }

  // Login Form Submission
  const loginForm = document.getElementById('auth-login-form') as HTMLFormElement;
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = (document.getElementById('login-email') as HTMLInputElement).value.trim();
      const password = (document.getElementById('login-password') as HTMLInputElement).value.trim();

      const res = await store.login(email, password);
      if (!res.success) {
        const alertBox = document.getElementById('auth-error-alert');
        if (alertBox) {
          alertBox.style.display = 'block';
          alertBox.textContent = res.message;
        }
        return;
      }

      isAuthModalOpen = false;
      showToast(res.message, store.currentUser?.role === 'ADMIN' ? 'fa-user-shield' : undefined);
      if (store.currentUser?.role === 'ADMIN') {
        store.navigateTo('admin');
      } else {
        renderApp();
      }
    });
  }

  // Registration Form Submission
  const registerForm = document.getElementById('auth-register-form') as HTMLFormElement;
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
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

      const res = await store.register(name, email, password);
      if (!res.success) {
        if (alertBox) {
          alertBox.style.display = 'block';
          alertBox.textContent = res.message;
        }
        return;
      }

      isAuthModalOpen = false;
      showToast(res.message);
      renderApp();
    });
  }

  // Profile Edit Form Submission
  const editProfileForm = document.getElementById('edit-profile-form') as HTMLFormElement;
  if (editProfileForm) {
    editProfileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newName = (document.getElementById('profile-edit-name') as HTMLInputElement).value.trim();
      const newAvatar = (document.getElementById('profile-edit-avatar') as HTMLInputElement).value.trim();

      const res = await store.updateUserProfile(newName, newAvatar);
      showToast(res.message);
      renderApp();
    });
  }

  // Password Change Form Submission
  const changePassForm = document.getElementById('change-password-form') as HTMLFormElement;
  if (changePassForm) {
    changePassForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const oldPass = (document.getElementById('pass-old') as HTMLInputElement).value;
      const newPass = (document.getElementById('pass-new') as HTMLInputElement).value;
      const confirmPass = (document.getElementById('pass-confirm') as HTMLInputElement).value;

      if (newPass !== confirmPass) {
        showToast('New passwords do not match.', 'fa-triangle-exclamation');
        return;
      }

      const validation = validatePassword(newPass);
      if (!validation.isValid) {
        showToast(validation.errors[0], 'fa-triangle-exclamation');
        return;
      }

      const res = await store.changeUserPassword(oldPass, newPass);
      showToast(res.message, res.success ? 'fa-circle-check' : 'fa-triangle-exclamation');
      if (res.success) {
        changePassForm.reset();
      }
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
  document.querySelectorAll('[data-cart-action="inc"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-item-id');
      if (id) store.updateCartQuantity(id, 1);
    });
  });

  document.querySelectorAll('[data-cart-action="dec"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-item-id');
      if (id) store.updateCartQuantity(id, -1);
    });
  });

  document.querySelectorAll('[data-cart-action="remove"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-item-id');
      if (id) {
        store.removeFromCart(id);
        showToast('Item removed from Atelier bag.');
      }
    });
  });

  // User Menu Button
  const userMenuBtn = document.getElementById('user-menu-btn');
  if (userMenuBtn) {
    userMenuBtn.addEventListener('click', () => {
      store.navigateTo('account');
    });
  }

  // Wishlist Button (Navbar)
  const openWishlistBtn = document.getElementById('open-wishlist-btn');
  if (openWishlistBtn) {
    openWishlistBtn.addEventListener('click', () => {
      if (!store.currentUser) {
        isAuthModalOpen = true;
        authActiveTab = 'login';
        showToast('Please sign in or create an account first.', 'fa-user-lock');
        renderApp();
        return;
      }
      accountTab = 'wishlist';
      store.navigateTo('account');
    });
  }

  // Admin Exit Button
  const adminExitBtn = document.getElementById('admin-exit-btn');
  if (adminExitBtn) {
    adminExitBtn.addEventListener('click', () => {
      store.navigateTo('home');
    });
  }

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
    const prodId = card.getAttribute('data-product-id');
    const product = store.products.find((p) => p.id === prodId);

    if (product) {
      card.querySelectorAll('[data-action="open-detail"]').forEach((el) => {
        el.addEventListener('click', () => {
          modalQuantity = 1;
          store.openProductModal(product);
        });
      });

      const addBtn = card.querySelector('[data-action="quick-add"]');
      if (addBtn) {
        addBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          store.addToCart(product, 1, product.sizes[0], product.colors[0]?.name || 'Default');
          showToast(`Added ${product.name} to Atelier bag!`);
        });
      }

      const wishBtn = card.querySelector('[data-action="wishlist"]');
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
          renderApp();
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

  // Modal — Size chip selection
  document.querySelectorAll('#modal-size-chips .size-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#modal-size-chips .size-chip').forEach((c) => c.classList.remove('selected'));
      chip.classList.add('selected');
    });
  });

  // Modal — Color swatch selection (also swaps the main gallery image if the color has one)
  document.querySelectorAll('.product-detail-modal .color-swatch').forEach((swatch) => {
    swatch.addEventListener('click', () => {
      document.querySelectorAll('.product-detail-modal .color-swatch').forEach((s) => s.classList.remove('selected'));
      swatch.classList.add('selected');

      const colorName = swatch.getAttribute('data-color');
      const colorImage = swatch.getAttribute('data-color-image');
      const label = document.getElementById('selected-color-label');
      if (label && colorName) label.textContent = colorName;

      const mainImg = document.getElementById('modal-main-image') as HTMLImageElement;
      if (mainImg && colorImage) mainImg.src = colorImage;
    });
  });

  // Modal — Gallery thumbnail click
  document.querySelectorAll('.product-detail-modal .thumb-img').forEach((thumb) => {
    thumb.addEventListener('click', () => {
      document.querySelectorAll('.product-detail-modal .thumb-img').forEach((t) => t.classList.remove('active'));
      thumb.classList.add('active');
      const src = thumb.getAttribute('data-thumb');
      const mainImg = document.getElementById('modal-main-image') as HTMLImageElement;
      if (mainImg && src) mainImg.src = src;
    });
  });

  // Modal — Quantity stepper
  const modalQtyVal = document.getElementById('modal-qty-val');
  const modalQtyPlus = document.getElementById('modal-qty-plus');
  const modalQtyMinus = document.getElementById('modal-qty-minus');
  if (modalQtyPlus && modalQtyVal) {
    modalQtyPlus.addEventListener('click', () => {
      modalQuantity++;
      modalQtyVal.textContent = String(modalQuantity);
    });
  }
  if (modalQtyMinus && modalQtyVal) {
    modalQtyMinus.addEventListener('click', () => {
      if (modalQuantity > 1) {
        modalQuantity--;
        modalQtyVal.textContent = String(modalQuantity);
      }
    });
  }

  // Modal — Wishlist toggle
  const modalWishlistBtn = document.getElementById('modal-wishlist-btn');
  if (modalWishlistBtn && store.selectedProductForModal) {
    modalWishlistBtn.addEventListener('click', () => {
      const product = store.selectedProductForModal!;
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
      renderApp();
    });
  }

  const modalAddCartBtn = document.getElementById('modal-add-to-cart-btn');
  if (modalAddCartBtn && store.selectedProductForModal) {
    modalAddCartBtn.addEventListener('click', () => {
      const product = store.selectedProductForModal!;
      const selectedSize = document.querySelector('#modal-size-chips .size-chip.selected')?.getAttribute('data-size') || 'S';
      const selectedColor = document.querySelector('.product-detail-modal .color-swatch.selected')?.getAttribute('data-color') || 'Default';
      const qtyVal = modalQuantity;

      store.addToCart(product, qtyVal, selectedSize, selectedColor);
      store.closeProductModal();
      isCartOpen = true;
      showToast(`Added ${product.name} to bag!`);
      renderApp();
    });
  }

  // Modal — Buy Now (adds to cart then jumps straight to checkout)
  const modalBuyNowBtn = document.getElementById('modal-buy-now-btn');
  if (modalBuyNowBtn && store.selectedProductForModal) {
    modalBuyNowBtn.addEventListener('click', () => {
      const product = store.selectedProductForModal!;
      const selectedSize = document.querySelector('#modal-size-chips .size-chip.selected')?.getAttribute('data-size') || 'S';
      const selectedColor = document.querySelector('.product-detail-modal .color-swatch.selected')?.getAttribute('data-color') || 'Default';
      const qtyVal = modalQuantity;

      store.addToCart(product, qtyVal, selectedSize, selectedColor);
      store.closeProductModal();

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

  // Shop Page Filters
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

  // Day / Night Atmospheric Ambiance Slider (Home page)
  const dayNightSlider = document.getElementById('day-night-slider') as HTMLInputElement;
  if (dayNightSlider) {
    dayNightSlider.addEventListener('input', () => {
      store.setDayNightTime(parseInt(dayNightSlider.value, 10));
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

  // Coupon Application
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

  // Payment method toggle → show/hide the wallet mobile number field
  document.querySelectorAll('input[name="payment-method"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const walletField = document.getElementById('wallet-mobile-field');
      const selected = (document.querySelector('input[name="payment-method"]:checked') as HTMLInputElement)?.value;
      if (walletField) {
        walletField.style.display = selected === 'JazzCash' || selected === 'EasyPaisa' ? 'block' : 'none';
      }
    });
  });

  // Checkout Form Submission (Place Order)
  const checkoutForm = document.getElementById('checkout-form') as HTMLFormElement;
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = (document.getElementById('checkout-name') as HTMLInputElement).value.trim();
      const email = (document.getElementById('checkout-email') as HTMLInputElement).value.trim();
      const phone = (document.getElementById('checkout-phone') as HTMLInputElement).value.trim();
      const address = (document.getElementById('checkout-address') as HTMLInputElement).value.trim();
      const city = (document.getElementById('checkout-city') as HTMLInputElement).value.trim();
      const zip = (document.getElementById('checkout-zip') as HTMLInputElement)?.value.trim();
      const paymentMethod = (document.querySelector('input[name="payment-method"]:checked') as HTMLInputElement)?.value || 'Cash on Delivery';
      const walletMobile = (document.getElementById('checkout-wallet-mobile') as HTMLInputElement)?.value.trim();

      if ((paymentMethod === 'JazzCash' || paymentMethod === 'EasyPaisa') && !walletMobile) {
        showToast('Please enter your mobile wallet number.', 'fa-triangle-exclamation');
        return;
      }

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

      const submitBtn = checkoutForm.querySelector('button[type="submit"]') as HTMLButtonElement;

      // ── JazzCash / EasyPaisa → real gateway redirect ──
      if (paymentMethod === 'JazzCash' || paymentMethod === 'EasyPaisa') {
        try {
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Redirecting to ${paymentMethod}...`;
          }

          // 1. Create the order in MySQL via the backend (server re-prices from DB)
          const backendOrder = await api.placeOrder({
            customerName: name,
            customerEmail: email,
            customerPhone: phone,
            address,
            city,
            postalCode: zip,
            items: orderItems.map((i) => ({ productId: i.productId, quantity: i.quantity, selectedSize: i.selectedSize, selectedColor: i.selectedColor })),
            couponCode: store.appliedCoupon?.code,
            paymentMethod,
            userId: store.currentUser?.id
          });

          // 2. Ask the backend to build a signed JazzCash/EasyPaisa payment request
          const { gatewayUrl, params } =
            paymentMethod === 'JazzCash'
              ? await api.initiateJazzCash(backendOrder.id, walletMobile)
              : await api.initiateEasyPaisa(backendOrder.id);

          // 3. Redirect the browser to the gateway's hosted payment page.
          //    (JazzCash/EasyPaisa will redirect back to our server, which
          //    then redirects to this app with ?payment=success|failed)
          redirectToGateway(gatewayUrl, params);
        } catch (err: any) {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="fa-solid fa-lock"></i> PLACE ORDER (RS. ${total.toLocaleString()})`;
          }
          showToast(
            err?.message?.includes('fetch') || err?.message?.includes('Failed to fetch')
              ? 'Cannot reach payment server. Make sure the backend is running (see server/README).'
              : err?.message || 'Payment could not be started. Please try again.',
            'fa-triangle-exclamation'
          );
        }
        return;
      }

      // ── Cash on Delivery → create order via API (database only) ──
      try {
        const newOrder = await store.placeOrder({
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
      } catch (err: any) {
        console.error('❌ Order placement failed:', err);
        showToast(
          err?.message?.includes('fetch') || err?.message?.includes('Failed to fetch')
            ? 'Cannot reach database server. Make sure the backend is running (see server/README).'
            : err?.message || 'Order could not be placed. Please try again.',
          'fa-triangle-exclamation'
        );
      }
    });
  }

  // Admin Panel Tab Switcher
  document.querySelectorAll('[data-admin-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-admin-tab');
      if (tab) {
        adminTab = tab;
        renderApp();
      }
    });
  });

  // Admin User Ban / Unban / Remove Handlers
  document.querySelectorAll('.btn-ban-user').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-user-id');
      if (id && confirm('Ban this user from logging in and accessing the platform?')) {
        try {
          await store.banUser(id);
          showToast('User has been banned.', 'fa-user-slash');
          renderApp();
        } catch (err: any) {
          showToast(err?.message || 'Failed to ban user. Backend may be offline.', 'fa-triangle-exclamation');
        }
      }
    });
  });

  document.querySelectorAll('.btn-unban-user').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-user-id');
      if (id) {
        try {
          await store.unbanUser(id);
          showToast('User access restored.');
          renderApp();
        } catch (err: any) {
          showToast(err?.message || 'Failed to unban user. Backend may be offline.', 'fa-triangle-exclamation');
        }
      }
    });
  });

  document.querySelectorAll('.btn-remove-user').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-user-id');
      if (id && confirm('Permanently remove this user record?')) {
        try {
          await store.removeUser(id);
          showToast('User removed from database.');
          renderApp();
        } catch (err: any) {
          showToast(err?.message || 'Failed to remove user. Backend may be offline.', 'fa-triangle-exclamation');
        }
      }
    });
  });

  // Hero Bar Customizer Form
  const heroForm = document.getElementById('hero-customizer-form') as HTMLFormElement;
  if (heroForm) {
    heroForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = (document.getElementById('hero-title-input') as HTMLInputElement).value;
      const subtitle = (document.getElementById('hero-subtitle-input') as HTMLInputElement).value;
      const tagline = (document.getElementById('hero-tagline-input') as HTMLInputElement).value;
      const imageUrl = (document.getElementById('hero-image-input') as HTMLInputElement).value;

      try {
        await store.updateHeroBanner({ title, subtitle, tagline, imageUrl });
        showToast('Hero Bar Banner updated in database!');
        renderApp();
      } catch (err: any) {
        console.error('Hero update failed:', err);
        showToast(
          err?.message?.includes('fetch') || err?.message?.includes('Failed to fetch')
            ? 'Cannot reach database. Backend must be running.'
            : err?.message || 'Hero update failed. Please try again.',
          'fa-triangle-exclamation'
        );
      }
    });
  }

  // Admin Product Modal Triggers (Add & Edit)
  const openAddProdModalBtn = document.getElementById('admin-add-prod-modal-btn');
  if (openAddProdModalBtn) {
    openAddProdModalBtn.addEventListener('click', () => {
      editingAdminProduct = null;
      isAdminProdModalOpen = true;
      renderApp();
    });
  }

  document.querySelectorAll('.btn-edit-prod-modal').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-prod-id');
      const prod = store.products.find((p) => p.id === id);
      if (prod) {
        editingAdminProduct = prod;
        isAdminProdModalOpen = true;
        renderApp();
      }
    });
  });

  const closeAdminProdModalBtn = document.getElementById('close-admin-prod-modal-btn');
  const cancelAdminProdModalBtn = document.getElementById('cancel-admin-prod-modal-btn');
  const adminProdOverlay = document.getElementById('admin-product-modal-overlay');

  if (closeAdminProdModalBtn) {
    closeAdminProdModalBtn.addEventListener('click', () => {
      isAdminProdModalOpen = false;
      renderApp();
    });
  }

  if (cancelAdminProdModalBtn) {
    cancelAdminProdModalBtn.addEventListener('click', () => {
      isAdminProdModalOpen = false;
      renderApp();
    });
  }

  if (adminProdOverlay) {
    adminProdOverlay.addEventListener('click', (e) => {
      if (e.target === adminProdOverlay) {
        isAdminProdModalOpen = false;
        renderApp();
      }
    });
  }

  // Admin Product Modal Form Submit (Create / Edit CRUD Database)
  const adminProdForm = document.getElementById('admin-product-form') as HTMLFormElement;
  if (adminProdForm) {
    adminProdForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = (document.getElementById('prod-form-id') as HTMLInputElement).value;
      const name = (document.getElementById('prod-form-name') as HTMLInputElement).value.trim();
      const sku = (document.getElementById('prod-form-sku') as HTMLInputElement).value.trim();
      const category = (document.getElementById('prod-form-category') as HTMLSelectElement).value as any;
      const subcategory = (document.getElementById('prod-form-subcategory') as HTMLInputElement).value.trim();
      const price = parseInt((document.getElementById('prod-form-price') as HTMLInputElement).value, 10);
      const stock = parseInt((document.getElementById('prod-form-stock') as HTMLInputElement).value, 10);
      const primaryImage = (document.getElementById('prod-form-primary-img') as HTMLInputElement).value.trim();
      const secondaryImage = (document.getElementById('prod-form-secondary-img') as HTMLInputElement).value.trim();
      const description = (document.getElementById('prod-form-desc') as HTMLTextAreaElement).value.trim();
      const material = (document.getElementById('prod-form-material') as HTMLInputElement).value.trim();
      const care = (document.getElementById('prod-form-care') as HTMLInputElement).value.trim();

      if (id) {
        // Update existing product: persist to backend first so homepage reflects DB state.
        const existing = store.products.find((p) => p.id === id);
        if (existing) {
          const updatedProd: Product = {
            ...existing,
            name,
            sku,
            category,
            subcategory,
            price,
            stock,
            primaryImage,
            secondaryImage: secondaryImage || existing.secondaryImage,
            description,
            material: material || existing.material,
            care: care || existing.care
          };
          try {
            const backendUpdated = await api.updateProduct(updatedProd.id, updatedProd);
            store.updateProduct(backendUpdated);
            showToast(`Updated product "${name}" in database.`);
          } catch (err) {
            console.error('Product update backend failed:', err);
            showToast(`Failed to update "${name}" in database.`, 'fa-triangle-exclamation');
            return;
          }
        }
      } else {
        // Create new product: save to backend first, then add local store copy.
        const newProd: Product = {
          id: `prod-${Date.now()}`,
          sku,
          name,
          category,
          subcategory,
          price,
          rating: 5.0,
          reviewsCount: 1,
          primaryImage,
          secondaryImage: secondaryImage || primaryImage,
          description,
          material: material || 'Silk Satin',
          care: care || 'Dry clean only',
          fit: 'Regular fit',
          sizes: ['XS', 'S', 'M', 'L', 'XL'],
          colors: [{ name: 'Ivory', hex: '#F8F5F0' }],
          stock,
          mood: 'CONFIDENT',
          isDay: true,
          isNight: true
        };
        try {
          const createdProd = await api.createProduct(newProd);
          store.addProduct(createdProd);
          showToast(`Created new product "${name}" in database!`);
        } catch (err) {
          console.error('Product creation backend failed:', err);
          showToast(`Failed to save "${name}" to database.`, 'fa-triangle-exclamation');
          return;
        }
      }

      isAdminProdModalOpen = false;
      renderApp();
    });

    const primaryFileBtn = document.getElementById('prod-form-primary-file-btn');
    const secondaryFileBtn = document.getElementById('prod-form-secondary-file-btn');
    const primaryFileInput = document.getElementById('prod-form-primary-file') as HTMLInputElement | null;
    const secondaryFileInput = document.getElementById('prod-form-secondary-file') as HTMLInputElement | null;

    if (primaryFileBtn && primaryFileInput) {
      primaryFileBtn.addEventListener('click', () => primaryFileInput.click());
      primaryFileInput.addEventListener('change', () => {
        if (!primaryFileInput.files?.length) return;
        const file = primaryFileInput.files[0];
        const blobUrl = URL.createObjectURL(file);
        const input = document.getElementById('prod-form-primary-img') as HTMLInputElement | null;
        if (input) input.value = blobUrl;
      });
    }

    if (secondaryFileBtn && secondaryFileInput) {
      secondaryFileBtn.addEventListener('click', () => secondaryFileInput.click());
      secondaryFileInput.addEventListener('change', () => {
        if (!secondaryFileInput.files?.length) return;
        const file = secondaryFileInput.files[0];
        const blobUrl = URL.createObjectURL(file);
        const input = document.getElementById('prod-form-secondary-img') as HTMLInputElement | null;
        if (input) input.value = blobUrl;
      });
    }
  }

  // Admin Product Delete
  document.querySelectorAll('.btn-del-prod').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-prod-id');
      if (id && confirm('Are you sure you want to delete this product from database?')) {
        try {
          await store.deleteProduct(id);
          showToast('Product deleted from database.');
          renderApp();
        } catch (err: any) {
          console.error('Product deletion failed:', err);
          showToast(
            err?.message?.includes('fetch') || err?.message?.includes('Failed to fetch')
              ? 'Cannot reach database. Backend must be running.'
              : err?.message || 'Failed to delete product. Please try again.',
            'fa-triangle-exclamation'
          );
        }
      }
    });
  });

  // Admin Restock (form submit)
  document.querySelectorAll('.restock-form').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = form.getAttribute('data-prod-id');
      const qtyInput = form.querySelector('.restock-qty-input') as HTMLInputElement;
      const qty = parseInt(qtyInput?.value || '20', 10);
      
      const prod = store.products.find((p) => p.id === id);
      if (prod && id) {
        try {
          await api.restockProduct(prod.id, qty);
          prod.stock += qty;
          store.updateProduct(prod);
          showToast(`Added +${qty} stock units to ${prod.name}!`);
          renderApp();
        } catch (err: any) {
          console.error('Restock failed:', err);
          showToast(
            err?.message?.includes('fetch') || err?.message?.includes('Failed to fetch')
              ? 'Cannot reach database. Backend must be running.'
              : err?.message || 'Restock failed. Please try again.',
            'fa-triangle-exclamation'
          );
        }
      }
    });
  });

  // Coupon Creation & Deletion
  const addCouponForm = document.getElementById('add-coupon-form') as HTMLFormElement;
  if (addCouponForm) {
    addCouponForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const code = (document.getElementById('new-coupon-code') as HTMLInputElement).value.trim();
      const discount = parseInt((document.getElementById('new-coupon-discount') as HTMLInputElement).value, 10);
      if (code && discount) {
        try {
          await store.addCoupon(code, discount);
          showToast(`Coupon code ${code} created in database!`);
          renderApp();
        } catch (err: any) {
          console.error('Coupon creation failed:', err);
          showToast(
            err?.message?.includes('fetch') || err?.message?.includes('Failed to fetch')
              ? 'Cannot reach database. Backend must be running.'
              : err?.message || 'Coupon creation failed. Please try again.',
            'fa-triangle-exclamation'
          );
        }
      }
    });
  }

  document.querySelectorAll('.btn-del-coupon').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const code = btn.getAttribute('data-code');
      if (code) {
        try {
          await store.deleteCoupon(code);
          showToast(`Coupon ${code} deleted.`);
          renderApp();
        } catch (err: any) {
          console.error('Coupon deletion failed:', err);
          showToast(
            err?.message?.includes('fetch') || err?.message?.includes('Failed to fetch')
              ? 'Cannot reach database. Backend must be running.'
              : err?.message || 'Coupon deletion failed. Please try again.',
            'fa-triangle-exclamation'
          );
        }
      }
    });
  });

  // Order Status Updater
  document.querySelectorAll('.order-status-select').forEach((select) => {
    select.addEventListener('change', async (e) => {
      const orderId = select.getAttribute('data-order-id');
      const newStatus = (e.target as HTMLSelectElement).value as Order['status'];
      if (orderId && newStatus) {
        try {
          await store.updateOrderStatus(orderId, newStatus);
          showToast(`Order #${orderId} status changed to ${newStatus}.`);
        } catch (err: any) {
          console.error('Order status update failed:', err);
          showToast(
            err?.message?.includes('fetch') || err?.message?.includes('Failed to fetch')
              ? 'Cannot reach database. Backend must be running.'
              : err?.message || 'Status update failed. Please try again.',
            'fa-triangle-exclamation'
          );
        }
      }
    });
  });
}

// Handle JazzCash/EasyPaisa return redirect (?payment=success|failed&order=...&provider=...)
function handlePaymentRedirectResult() {
  const url = new URL(window.location.href);
  const payment = url.searchParams.get('payment');
  const orderId = url.searchParams.get('order');
  const provider = url.searchParams.get('provider');
  if (!payment) return;

  if (payment === 'success') {
    showToast(`${provider === 'easypaisa' ? 'EasyPaisa' : 'JazzCash'} payment successful for order #${orderId}!`, 'fa-circle-check');
  } else {
    showToast(`${provider === 'easypaisa' ? 'EasyPaisa' : 'JazzCash'} payment failed or was cancelled for order #${orderId}.`, 'fa-triangle-exclamation');
  }

  // Clean the query string so a page refresh doesn't re-show the toast
  url.searchParams.delete('payment');
  url.searchParams.delete('order');
  url.searchParams.delete('provider');
  window.history.replaceState({}, '', url.pathname + url.hash);
}

// Initial Subscribe & Render
  store.subscribe(() => renderApp());
  renderApp();
  handlePaymentRedirectResult();
  store.initializeStore();
