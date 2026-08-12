import { store } from '../data/mockState';

export function renderCartDrawer(): string {
  const subtotal = store.getCartSubtotal();
  const discount = store.getDiscountAmount();
  const shipping = store.getShippingFee();
  const total = store.getCartTotal();
  const freeThreshold = 5000;
  const remainingForFree = Math.max(0, freeThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeThreshold) * 100));

  return `
    <div class="cart-drawer-overlay" id="cart-overlay"></div>
    <aside class="cart-drawer" id="cart-drawer">
      <div class="cart-drawer-header">
        <div class="cart-drawer-title font-serif">YOUR ATELIER BAG (${store.cart.reduce((s, i) => s + i.quantity, 0)})</div>
        <button class="action-btn" id="close-cart-btn"><i class="fa-solid fa-xmark"></i></button>
      </div>

      <!-- Free Delivery Progress Bar -->
      <div class="free-shipping-bar">
        <div class="free-shipping-text">
          ${remainingForFree > 0
      ? `🎁 Add <strong>Rs. ${remainingForFree.toLocaleString()}</strong> more to unlock <strong>FREE DELIVERY</strong>`
      : `🎉 Congratulations! You have unlocked <strong>COMPLIMENTARY FREE DELIVERY</strong>`
    }
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width: ${progressPercent}%;"></div>
        </div>
      </div>

      <!-- Cart Items Body -->
      <div class="cart-drawer-body">
        ${store.cart.length === 0
      ? `
            <div style="text-align: center; padding: 60px 20px;">
              <i class="fa-solid fa-bag-shopping" style="font-size: 3rem; color: var(--color-border); margin-bottom: 16px;"></i>
              <h3 class="font-serif heading-3">YOUR BAG IS EMPTY</h3>
              <p style="font-size: 0.85rem; color: var(--color-muted); margin-bottom: 24px;">Explore our new Spring / Summer 2026 collection.</p>
              <button class="btn btn-primary" id="drawer-shop-now-btn">EXPLORE SHOP</button>
            </div>
            `
      : store.cart
        .map(
          (item) => `
            <div class="cart-item">
              <img src="${item.product.primaryImage}" alt="${item.product.name}" class="cart-item-img" />
              <div class="cart-item-details">
                <div>
                  <div class="cart-item-name">${item.product.name}</div>
                  <div class="cart-item-meta">Size: ${item.selectedSize} | Color: ${item.selectedColor}</div>
                  <div class="cart-item-price" style="margin-top: 4px;">Rs. ${item.product.price.toLocaleString()}</div>
                </div>

                <div class="flex items-center justify-between" style="margin-top: 10px;">
                  <div class="qty-controls">
                    <button class="qty-btn" data-cart-action="dec" data-item-id="${item.id}">-</button>
                    <span class="qty-val">${item.quantity}</span>
                    <button class="qty-btn" data-cart-action="inc" data-item-id="${item.id}">+</button>
                  </div>
                  <button style="font-size: 0.75rem; color: var(--color-muted); text-decoration: underline;" data-cart-action="remove" data-item-id="${item.id}">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          `
        )
        .join('')
    }
      </div>

      <!-- Footer Summary -->
      ${store.cart.length > 0
      ? `
        <div class="cart-drawer-footer">
          <!-- Promo Code Input -->
          <div style="display: flex; gap: 8px; margin-bottom: 16px;">
            <input type="text" id="coupon-input-code" placeholder="Promo code" 
              value="${store.appliedCoupon ? store.appliedCoupon.code : ''}"
              style="flex: 1; padding: 10px 14px; border: 1px solid var(--color-border); font-size: 0.8rem; border-radius: var(--radius-sm);" />
            <button class="btn btn-gold" id="apply-coupon-btn" style="padding: 10px 16px;">APPLY</button>
          </div>

          <div class="cart-summary-row">
            <span>Subtotal</span>
            <span>Rs. ${subtotal.toLocaleString()}</span>
          </div>

          ${discount > 0
        ? `
            <div class="cart-summary-row text-gold">
              <span>Discount (${store.appliedCoupon?.code})</span>
              <span>- Rs. ${discount.toLocaleString()}</span>
            </div>
          `
        : ''
      }

          <div class="cart-summary-row">
            <span>Shipping Fee</span>
            <span>${shipping === 0 ? '<strong class="text-gold">FREE</strong>' : `Rs. ${shipping.toLocaleString()}`}</span>
          </div>

          <div class="cart-summary-row cart-total-row">
            <span>Total Amount</span>
            <span>Rs. ${total.toLocaleString()}</span>
          </div>

          <button class="btn btn-primary btn-full" id="proceed-checkout-btn">PROCEED TO CHECKOUT</button>
        </div>
      `
      : ''
    }
    </aside>
  `;
}
