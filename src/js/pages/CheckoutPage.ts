import { store, Order } from '../data/mockState';

export function renderCheckoutPage(confirmedOrder: Order | null = null): string {
  if (confirmedOrder) {
    return `
      <div class="container" style="padding: var(--space-3xl) 0; max-width: 700px; text-align: center;">
        <div style="width: 80px; height: 80px; background-color: var(--color-black); color: var(--color-gold-bright); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin: 0 auto 24px;">
          <i class="fa-solid fa-check"></i>
        </div>

        <div class="subtitle">ORDER CONFIRMED</div>
        <h1 class="heading-1 font-serif" style="margin: 10px 0 16px;">THANK YOU FOR YOUR ORDER</h1>
        <p style="font-size: 1.05rem; color: var(--color-muted); margin-bottom: 24px;">
          Your order number is <strong class="text-gold" style="font-size: 1.2rem;">#${confirmedOrder.id}</strong>. We have sent a confirmation receipt to <strong>${confirmedOrder.email}</strong>.
        </p>

        <!-- Delivery Date Timeline Card -->
        <div style="background-color: #FFFFFF; padding: 24px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); margin-bottom: 30px; text-align: left;">
          <div class="flex justify-between items-center" style="margin-bottom: 16px;">
            <span style="font-size: 0.8rem; text-transform: uppercase; color: var(--color-muted); font-weight: 600;">ESTIMATED DELIVERY</span>
            <span class="text-gold" style="font-weight: 700;">${confirmedOrder.estimatedDelivery}</span>
          </div>

          <div style="font-size: 0.85rem; line-height: 1.8;">
            <strong>Deliver To:</strong> ${confirmedOrder.customerName}<br>
            <strong>Shipping Address:</strong> ${confirmedOrder.address}, ${confirmedOrder.city}<br>
            <strong>Payment Method:</strong> ${confirmedOrder.paymentMethod}<br>
            <strong>Total Paid:</strong> Rs. ${confirmedOrder.total.toLocaleString()}
          </div>
        </div>

        <div class="flex gap-md justify-center">
          <button class="btn btn-primary" data-route="account" data-tab="orders">
            <i class="fa-solid fa-truck-fast"></i> TRACK ORDER STATUS
          </button>
          <button class="btn btn-secondary" data-route="shop">CONTINUE SHOPPING</button>
        </div>
      </div>
    `;
  }

  const subtotal = store.getCartSubtotal();
  const discount = store.getDiscountAmount();
  const shipping = store.getShippingFee();
  const total = store.getCartTotal();

  return `
    <div class="container" style="padding: var(--space-2xl) 0 var(--space-3xl);">
      <div style="text-align: center; margin-bottom: var(--space-2xl);">
        <div class="subtitle">DISTRACTION-FREE CHECKOUT</div>
        <h1 class="heading-1 font-serif">SECURE ATELIER CHECKOUT</h1>
      </div>

      <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: var(--space-2xl); align-items: start;">
        <!-- Left: Form Steps -->
        <div>
          <!-- Step 01: Information -->
          <div style="background-color: #FFFFFF; padding: 24px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); margin-bottom: 24px;">
            <h3 class="font-serif heading-3" style="margin-bottom: 16px;">01 CUSTOMER INFORMATION</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group" style="grid-column: span 2;">
                <label class="form-label">Full Name</label>
                <input type="text" id="chk-name" class="form-control" value="${store.user.name}" placeholder="Full Name" />
              </div>
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" id="chk-email" class="form-control" value="${store.user.email}" placeholder="Email Address" />
              </div>
              <div class="form-group">
                <label class="form-label">Phone Number</label>
                <input type="tel" id="chk-phone" class="form-control" value="${store.user.phone}" placeholder="+92 300 0000000" />
              </div>
            </div>
          </div>

          <!-- Step 02: Delivery Address -->
          <div style="background-color: #FFFFFF; padding: 24px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); margin-bottom: 24px;">
            <h3 class="font-serif heading-3" style="margin-bottom: 16px;">02 DELIVERY ADDRESS</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group" style="grid-column: span 2;">
                <label class="form-label">Street Address</label>
                <input type="text" id="chk-address" class="form-control" value="${store.user.address}" placeholder="House #, Street, Block" />
              </div>
              <div class="form-group">
                <label class="form-label">City</label>
                <select id="chk-city" class="form-control">
                  <option value="Karachi" selected>Karachi</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Faisalabad">Faisalabad</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Postal Code</label>
                <input type="text" id="chk-postal" class="form-control" value="${store.user.postalCode}" placeholder="75500" />
              </div>
            </div>
          </div>

          <!-- Step 03: Shipping Method -->
          <div style="background-color: #FFFFFF; padding: 24px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); margin-bottom: 24px;">
            <h3 class="font-serif heading-3" style="margin-bottom: 16px;">03 SHIPPING METHOD</h3>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <label class="flex justify-between items-center" style="padding: 14px 16px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); cursor: pointer;">
                <div class="flex items-center gap-md">
                  <input type="radio" name="shipping-opt" checked accent-color="var(--color-gold)" />
                  <div>
                    <strong>Standard Delivery (3-5 Business Days)</strong><br>
                    <span style="font-size: 0.75rem; color: var(--color-muted);">Complimentary on orders over Rs. 5,000</span>
                  </div>
                </div>
                <span>${shipping === 0 ? '<strong class="text-gold">FREE</strong>' : 'Rs. 250'}</span>
              </label>
            </div>
          </div>

          <!-- Step 04: Payment Method -->
          <div style="background-color: #FFFFFF; padding: 24px; border: 1px solid var(--color-border); border-radius: var(--radius-sm);">
            <h3 class="font-serif heading-3" style="margin-bottom: 16px;">04 PAYMENT METHOD</h3>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <label class="flex justify-between items-center" style="padding: 14px 16px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); cursor: pointer;">
                <div class="flex items-center gap-md">
                  <input type="radio" name="payment-opt" value="Cash on Delivery" checked />
                  <div>
                    <strong>Cash on Delivery (COD)</strong><br>
                    <span style="font-size: 0.75rem; color: var(--color-muted);">Pay cash when parcel arrives at your doorstep</span>
                  </div>
                </div>
                <i class="fa-solid fa-money-bill-wave text-gold"></i>
              </label>

              <label class="flex justify-between items-center" style="padding: 14px 16px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); cursor: pointer;">
                <div class="flex items-center gap-md">
                  <input type="radio" name="payment-opt" value="Credit/Debit Card" />
                  <div>
                    <strong>Credit / Debit Card</strong><br>
                    <span style="font-size: 0.75rem; color: var(--color-muted);">Visa, MasterCard, UnionPay</span>
                  </div>
                </div>
                <i class="fa-solid fa-credit-card text-gold"></i>
              </label>

              <label class="flex justify-between items-center" style="padding: 14px 16px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); cursor: pointer;">
                <div class="flex items-center gap-md">
                  <input type="radio" name="payment-opt" value="JazzCash / Easypaisa" />
                  <div>
                    <strong>JazzCash / Easypaisa Wallet</strong><br>
                    <span style="font-size: 0.75rem; color: var(--color-muted);">Instant mobile payment verification</span>
                  </div>
                </div>
                <i class="fa-solid fa-mobile-screen-button text-gold"></i>
              </label>
            </div>
          </div>
        </div>

        <!-- Right: Order Summary -->
        <div style="background-color: #FFFFFF; padding: 24px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); position: sticky; top: 100px;">
          <h3 class="font-serif heading-3" style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--color-border-light);">ORDER SUMMARY</h3>

          <!-- Items list -->
          <div style="max-height: 240px; overflow-y: auto; margin-bottom: 20px;">
            ${store.cart
              .map(
                (item) => `
              <div class="flex gap-md" style="margin-bottom: 12px;">
                <img src="${item.product.primaryImage}" style="width: 50px; height: 60px; object-fit: cover; border-radius: var(--radius-sm);" />
                <div style="flex: 1; font-size: 0.8rem;">
                  <div style="font-weight: 600;">${item.product.name}</div>
                  <div style="color: var(--color-muted);">Qty: ${item.quantity} | Size: ${item.selectedSize}</div>
                  <div style="font-weight: 700; margin-top: 2px;">Rs. ${(item.product.price * item.quantity).toLocaleString()}</div>
                </div>
              </div>
            `
              )
              .join('')}
          </div>

          <div class="cart-summary-row">
            <span>Subtotal</span>
            <span>Rs. ${subtotal.toLocaleString()}</span>
          </div>
          ${
            discount > 0
              ? `
            <div class="cart-summary-row text-gold">
              <span>Discount</span>
              <span>- Rs. ${discount.toLocaleString()}</span>
            </div>
          `
              : ''
          }
          <div class="cart-summary-row">
            <span>Shipping</span>
            <span>${shipping === 0 ? '<strong class="text-gold">FREE</strong>' : `Rs. ${shipping.toLocaleString()}`}</span>
          </div>

          <div class="cart-summary-row cart-total-row">
            <span>Grand Total</span>
            <span class="text-gold">Rs. ${total.toLocaleString()}</span>
          </div>

          <button class="btn btn-primary btn-full" id="place-order-btn" style="margin-top: 16px; height: 50px;">
            PLACE ORDER NOW
          </button>
        </div>
      </div>
    </div>
  `;
}
