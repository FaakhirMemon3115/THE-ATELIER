import { store } from '../data/mockState';
import type { Order } from '../data/mockState';

export function renderCheckoutPage(confirmedOrder: Order | null = null): string {
  if (confirmedOrder) {
    return `
      <div class="container" style="padding: var(--space-3xl) 0; max-width: 700px; text-align: center;">
        <div style="font-size: 3rem; color: var(--color-gold); margin-bottom: 16px;">
          <i class="fa-solid fa-circle-check"></i>
        </div>
        <div class="subtitle">HAUTE COUTURE CONFIRMATION</div>
        <h1 class="heading-1 font-serif" style="margin-bottom: 12px;">THANK YOU FOR YOUR ORDER</h1>
        <p style="font-size: 1rem; color: var(--color-muted); margin-bottom: 24px;">
          Your order number is <strong style="color: var(--color-black); font-family: monospace;">#${confirmedOrder.id}</strong>. A private order receipt has been sent to <strong>${confirmedOrder.customerEmail}</strong>.
        </p>

        <div style="background: #FFF; border: 1px solid var(--color-border); padding: 24px; text-align: left; margin-bottom: 32px; border-radius: var(--radius-sm);">
          <div class="flex justify-between" style="border-bottom: 1px solid var(--color-border-light); padding-bottom: 12px; margin-bottom: 16px;">
            <div>
              <span class="form-label">Tracking Code:</span>
              <strong style="color: var(--color-gold); font-family: monospace;">${confirmedOrder.trackingNumber}</strong>
            </div>
            <div>
              <span class="form-label">Estimated Delivery:</span>
              <strong>3-5 Business Days</strong>
            </div>
          </div>

          <div style="font-weight: 600; font-size: 0.85rem; margin-bottom: 12px;">ORDER SUMMARY</div>
          ${confirmedOrder.items
        .map(
          (item: Order['items'][number]) => `
            <div class="flex justify-between items-center" style="margin-bottom: 8px; font-size: 0.85rem;">
              <span>${item.quantity}x ${item.productName} (${item.selectedSize} / ${item.selectedColor})</span>
              <strong>Rs. ${(item.price * item.quantity).toLocaleString()}</strong>
            </div>
          `
        )
        .join('')}

          <div style="border-top: 1px solid var(--color-border-light); margin-top: 12px; padding-top: 12px;" class="flex justify-between">
            <span style="font-weight: 700;">TOTAL PAID:</span>
            <strong style="font-size: 1.1rem; color: var(--color-gold);">Rs. ${confirmedOrder.total.toLocaleString()}</strong>
          </div>
        </div>

        <div class="flex gap-md justify-center">
          <button class="btn btn-primary" data-route="account" data-tab="orders">TRACK MY ORDER</button>
          <button class="btn btn-outline" data-route="shop" data-cat="ALL">CONTINUE SHOPPING</button>
        </div>
      </div>
    `;
  }

  const cart = store.cart;
  const subtotal = store.getCartSubtotal();
  const discount = store.getDiscountAmount();
  const shipping = store.getShippingFee();
  const total = store.getCartTotal();
  const appliedCoupon = store.appliedCoupon;
  const user = store.currentUser;

  if (cart.length === 0) {
    return `
      <div class="container" style="padding: var(--space-3xl) 0; text-align: center;">
        <i class="fa-solid fa-bag-shopping" style="font-size: 3rem; color: var(--color-muted); margin-bottom: 16px;"></i>
        <h2 class="heading-2 font-serif" style="margin-bottom: 12px;">YOUR ATELIER BAG IS EMPTY</h2>
        <p style="font-size: 0.9rem; color: var(--color-muted); margin-bottom: 24px;">Add luxury pieces to your bag before proceeding to checkout.</p>
        <button class="btn btn-primary" data-route="shop" data-cat="ALL">EXPLORE CATALOG</button>
      </div>
    `;
  }

  return `
    <div class="checkout-container" style="padding: var(--space-2xl) 0 var(--space-3xl);">
      <div class="container">
        
        <div style="margin-bottom: 24px;">
          <div class="subtitle">COMPLIMENTARY COMPLIANCE</div>
          <h1 class="heading-2 font-serif">SECURE ATELIER CHECKOUT</h1>
        </div>

        <div class="checkout-grid" style="display: grid; grid-template-columns: 3fr 2fr; gap: 32px;">
          <!-- Form Section -->
          <div>
            <form id="checkout-form">
              <!-- Contact Information -->
              <div style="background: #FFF; border: 1px solid var(--color-border); padding: 24px; border-radius: var(--radius-sm); margin-bottom: 24px;">
                <h3 class="heading-3 font-serif" style="margin-bottom: 16px;">1. Client Contact Details</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                  <div>
                    <label class="form-label">Full Name *</label>
                    <input type="text" id="checkout-name" value="${user?.name || ''}" class="newsletter-input" style="width: 100%; border: 1px solid var(--color-border); color: var(--color-black);" required placeholder="Full Name" />
                  </div>
                  <div>
                    <label class="form-label">Email Address *</label>
                    <input type="email" id="checkout-email" value="${user?.email || ''}" class="newsletter-input" style="width: 100%; border: 1px solid var(--color-border); color: var(--color-black);" required placeholder="Email Address" />
                  </div>
                </div>
                <div>
                  <label class="form-label">Phone Number *</label>
                  <input type="tel" id="checkout-phone" class="newsletter-input" style="width: 100%; border: 1px solid var(--color-border); color: var(--color-black);" required placeholder="+92 300 1234567" />
                </div>
              </div>

              <!-- Shipping Address -->
              <div style="background: #FFF; border: 1px solid var(--color-border); padding: 24px; border-radius: var(--radius-sm); margin-bottom: 24px;">
                <h3 class="heading-3 font-serif" style="margin-bottom: 16px;">2. Delivery Address</h3>
                <div style="margin-bottom: 16px;">
                  <label class="form-label">Street Address *</label>
                  <input type="text" id="checkout-address" class="newsletter-input" style="width: 100%; border: 1px solid var(--color-border); color: var(--color-black);" required placeholder="House/Apartment #, Street, Block" />
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                  <div>
                    <label class="form-label">City *</label>
                    <input type="text" id="checkout-city" class="newsletter-input" style="width: 100%; border: 1px solid var(--color-border); color: var(--color-black);" required placeholder="Karachi, Lahore, Islamabad..." />
                  </div>
                  <div>
                    <label class="form-label">Postal Code</label>
                    <input type="text" id="checkout-zip" class="newsletter-input" style="width: 100%; border: 1px solid var(--color-border); color: var(--color-black);" placeholder="75500" />
                  </div>
                </div>
              </div>

              <!-- Payment Method -->
              <div style="background: #FFF; border: 1px solid var(--color-border); padding: 24px; border-radius: var(--radius-sm); margin-bottom: 24px;">
                <h3 class="heading-3 font-serif" style="margin-bottom: 16px;">3. Payment Method</h3>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                  <label style="display: flex; align-items: center; gap: 12px; padding: 14px; border: 1px solid var(--color-gold); background: var(--color-ivory); border-radius: var(--radius-sm); cursor: pointer;">
                    <input type="radio" name="payment-method" value="Cash on Delivery" checked style="accent-color: var(--color-gold);" />
                    <div>
                      <strong style="display: block; font-size: 0.9rem;">Cash on Delivery (COD)</strong>
                      <span style="font-size: 0.75rem; color: var(--color-muted);">Pay upon delivery via express courier service.</span>
                    </div>
                  </label>
                  <label style="display: flex; align-items: center; gap: 12px; padding: 14px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); cursor: pointer;">
                    <input type="radio" name="payment-method" value="JazzCash" style="accent-color: var(--color-gold);" />
                    <div>
                      <strong style="display: block; font-size: 0.9rem;"><i class="fa-solid fa-mobile-screen" style="color:#D3242A;"></i> JazzCash Mobile Wallet</strong>
                      <span style="font-size: 0.75rem; color: var(--color-muted);">Pay instantly via JazzCash mobile account (OTP verified).</span>
                    </div>
                  </label>
                  <label style="display: flex; align-items: center; gap: 12px; padding: 14px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); cursor: pointer;">
                    <input type="radio" name="payment-method" value="EasyPaisa" style="accent-color: var(--color-gold);" />
                    <div>
                      <strong style="display: block; font-size: 0.9rem;"><i class="fa-solid fa-mobile-screen" style="color:#0A8A3F;"></i> EasyPaisa Mobile Account</strong>
                      <span style="font-size: 0.75rem; color: var(--color-muted);">Pay instantly via EasyPaisa mobile account.</span>
                    </div>
                  </label>
                </div>

                <!-- Mobile Wallet Number (shown for JazzCash/EasyPaisa) -->
                <div id="wallet-mobile-field" style="display:none; margin-top: 14px;">
                  <label class="form-label">Mobile Wallet Number *</label>
                  <input type="tel" id="checkout-wallet-mobile" class="newsletter-input" style="width: 100%; border: 1px solid var(--color-border); color: var(--color-black);" placeholder="03XXXXXXXXX" />
                </div>
              </div>

              <button type="submit" class="btn btn-primary" style="width: 100%; height: 54px; font-size: 1rem;">
                <i class="fa-solid fa-lock"></i> PLACE ORDER (RS. ${total.toLocaleString()})
              </button>
            </form>
          </div>

          <!-- Order Summary Sidebar -->
          <div>
            <div style="background: #FFF; border: 1px solid var(--color-border); padding: 24px; border-radius: var(--radius-sm); position: sticky; top: 100px;">
              <h3 class="heading-3 font-serif" style="margin-bottom: 16px; border-bottom: 1px solid var(--color-border-light); padding-bottom: 12px;">
                Order Summary (${cart.reduce((s, i) => s + i.quantity, 0)})
              </h3>

              <!-- Cart items list -->
              <div style="max-height: 240px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
                ${cart
      .map(
        (item) => `
                  <div class="flex items-center gap-sm">
                    <img src="${item.product.primaryImage}" style="width: 44px; height: 56px; object-fit: cover; border-radius: 2px;" />
                    <div style="flex: 1; font-size: 0.8rem;">
                      <div style="font-weight: 600;">${item.product.name}</div>
                      <div style="color: var(--color-muted);">Size: ${item.selectedSize} | Color: ${item.selectedColor}</div>
                      <div style="color: var(--color-muted);">Qty: ${item.quantity} &times; Rs. ${item.product.price.toLocaleString()}</div>
                    </div>
                    <div style="font-weight: 700; font-size: 0.85rem;">Rs. ${(item.product.price * item.quantity).toLocaleString()}</div>
                  </div>
                `
      )
      .join('')}
              </div>

              <!-- Coupon Code Form -->
              <div style="border-top: 1px solid var(--color-border-light); padding-top: 16px; margin-bottom: 20px;">
                <div class="form-label" style="margin-bottom: 6px;">Single-Use Coupon Promo Code</div>
                ${appliedCoupon
      ? `
                  <div style="display: flex; justify-between; items-center; background: #E8F8F5; border: 1px solid #A3E4D7; padding: 8px 12px; border-radius: var(--radius-sm); font-size: 0.8rem;">
                    <span style="color: #117864; font-weight: 600;"><i class="fa-solid fa-ticket"></i> ${appliedCoupon.code} (${appliedCoupon.discountPercent}% OFF)</span>
                    <button id="remove-coupon-btn" style="background: none; border: none; color: var(--color-sale-red); cursor: pointer; text-decoration: underline;">Remove</button>
                  </div>
                `
      : `
                  <form id="coupon-form" class="flex gap-xs">
                    <input type="text" id="coupon-code-input" placeholder="Enter Coupon Code" class="newsletter-input" style="flex: 1; border: 1px solid var(--color-border); font-size: 0.8rem; text-transform: uppercase;" required />
                    <button type="submit" class="btn btn-gold" style="padding: 8px 14px; font-size: 0.75rem;">APPLY</button>
                  </form>
                  <div style="font-size: 0.7rem; color: var(--color-muted); margin-top: 4px;">*Each promotional coupon code can only be redeemed once.</div>
                `
    }
              </div>

              <!-- Pricing breakdown -->
              <div style="border-top: 1px solid var(--color-border-light); padding-top: 16px; display: flex; flex-direction: column; gap: 8px; font-size: 0.85rem;">
                <div class="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rs. ${subtotal.toLocaleString()}</span>
                </div>
                ${discount > 0
      ? `
                  <div class="flex justify-between" style="color: green;">
                    <span>Coupon Discount</span>
                    <span>- Rs. ${discount.toLocaleString()}</span>
                  </div>
                `
      : ''
    }
                <div class="flex justify-between">
                  <span>Shipping Fee</span>
                  <span>${shipping === 0 ? '<strong class="text-gold">FREE</strong>' : `Rs. ${shipping}`}</span>
                </div>
                <div class="flex justify-between" style="border-top: 1px solid var(--color-border); padding-top: 12px; font-size: 1.1rem; font-weight: 700;">
                  <span>Total Amount</span>
                  <span class="text-gold">Rs. ${total.toLocaleString()}</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  `;
}
