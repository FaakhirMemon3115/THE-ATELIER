import { store } from '../data/mockState';

export function renderProductModal(): string {
  const product = store.selectedProductForModal;
  if (!product) return '';

  return `
    <div class="modal-overlay active" id="product-modal-overlay">
      <div class="product-detail-modal">
        <button class="modal-close-btn" id="close-modal-btn"><i class="fa-solid fa-xmark"></i></button>

        <div class="product-modal-grid">
          <!-- Gallery Column -->
          <div>
            <img src="${product.primaryImage}" alt="${product.name}" class="gallery-main-image" id="modal-main-image" />
            <div class="gallery-thumbs">
              <img src="${product.primaryImage}" class="thumb-img active" data-thumb="${product.primaryImage}" />
              <img src="${product.secondaryImage}" class="thumb-img" data-thumb="${product.secondaryImage}" />
            </div>
          </div>

          <!-- Product Info Details -->
          <div>
            <div class="subtitle" style="margin-bottom: 6px;">${product.sku}</div>
            <h2 class="heading-2 font-serif" style="margin-bottom: 10px;">${product.name}</h2>
            
            <div class="product-rating" style="margin-bottom: 16px;">
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
              <span style="font-size: 0.85rem; font-weight: 600; color: var(--color-black);">${product.rating}</span>
              <span>(${product.reviewsCount} Customer Reviews)</span>
            </div>

            <div class="product-prices" style="margin-bottom: 24px;">
              <span class="current-price" style="font-size: 1.75rem;">Rs. ${product.price.toLocaleString()}</span>
              ${product.originalPrice ? `<span class="original-price" style="font-size: 1.1rem;">Rs. ${product.originalPrice.toLocaleString()}</span>` : ''}
              ${product.discountPercentage ? `<span class="discount-tag" style="font-size: 0.9rem;">${product.discountPercentage}% OFF</span>` : ''}
            </div>

            <!-- Color Options -->
            <div style="margin-bottom: 20px;">
              <div class="form-label">Color: <span id="selected-color-label" class="text-gold">${product.colors[0].name}</span></div>
              <div class="color-swatches">
                ${product.colors
                  .map(
                    (c, i) => `
                  <div class="color-swatch ${i === 0 ? 'selected' : ''}" style="background-color: ${c.hex};" data-color="${c.name}"></div>
                `
                  )
                  .join('')}
              </div>
            </div>

            <!-- Size Selection -->
            <div style="margin-bottom: 24px;">
              <div class="flex justify-between items-center" style="margin-bottom: 6px;">
                <div class="form-label" style="margin-bottom: 0;">Size</div>
                <button id="open-size-guide-btn" style="font-size: 0.75rem; text-decoration: underline; color: var(--color-gold);">
                  <i class="fa-solid fa-ruler"></i> Size Guide
                </button>
              </div>

              <div class="size-chips" id="modal-size-chips">
                ${product.sizes
                  .map(
                    (s, i) => `
                  <div class="size-chip ${i === 0 ? 'selected' : ''}" data-size="${s}">${s}</div>
                `
                  )
                  .join('')}
              </div>
            </div>

            <!-- Quantity & Add to Cart -->
            <div class="flex gap-md" style="margin-bottom: 24px;">
              <div class="qty-controls" style="height: 48px; padding: 0 8px;">
                <button class="qty-btn" id="modal-qty-minus">-</button>
                <span class="qty-val" id="modal-qty-val">1</span>
                <button class="qty-btn" id="modal-qty-plus">+</button>
              </div>

              <button class="btn btn-primary" id="modal-add-to-cart-btn" style="flex: 1; height: 48px;">
                <i class="fa-solid fa-bag-shopping"></i> ADD TO ATELIER BAG
              </button>
            </div>

            <!-- Trust Badges -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; padding: 16px; background-color: #FAF5EE; border-radius: var(--radius-sm); font-size: 0.75rem;">
              <div><i class="fa-solid fa-truck text-gold"></i> Complimentary Delivery over Rs. 5,000</div>
              <div><i class="fa-solid fa-rotate-left text-gold"></i> Easy 14-Day Returns</div>
              <div><i class="fa-solid fa-lock text-gold"></i> 100% Secure Checkout</div>
              <div><i class="fa-solid fa-shield-check text-gold"></i> Authentic Couture</div>
            </div>

            <!-- Story Accordions -->
            <div style="border-top: 1px solid var(--color-border); padding-top: 16px;">
              <details open style="margin-bottom: 12px; cursor: pointer;">
                <summary style="font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.08em; padding: 6px 0;">Product Description</summary>
                <p style="font-size: 0.85rem; color: var(--color-muted); margin-top: 8px;">${product.description}</p>
              </details>
              <details style="margin-bottom: 12px; cursor: pointer;">
                <summary style="font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.08em; padding: 6px 0;">Materials & Care</summary>
                <p style="font-size: 0.85rem; color: var(--color-muted); margin-top: 8px;"><strong>Material:</strong> ${product.material}<br><strong>Care:</strong> ${product.care}</p>
              </details>
              <details style="cursor: pointer;">
                <summary style="font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.08em; padding: 6px 0;">Shipping & Easy Returns</summary>
                <p style="font-size: 0.85rem; color: var(--color-muted); margin-top: 8px;">Standard delivery takes 3-5 business days across Pakistan. Express 24-hour delivery is available for Karachi, Lahore, and Islamabad.</p>
              </details>
            </div>

          </div>
        </div>
      </div>
    </div>
  `;
}
