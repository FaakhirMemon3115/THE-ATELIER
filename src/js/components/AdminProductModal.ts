import type { Product } from '../data/products';

export function renderAdminProductModal(product: Product | null = null): string {
  const isEdit = !!product;

  return `
    <div class="modal-overlay active" id="admin-product-modal-overlay">
      <div class="product-detail-modal" style="max-width: 680px; padding: 28px;">
        <button class="modal-close-btn" id="close-admin-prod-modal-btn"><i class="fa-solid fa-xmark"></i></button>

        <div style="margin-bottom: 20px; border-bottom: 1px solid var(--color-border); padding-bottom: 12px;">
          <div class="subtitle">${isEdit ? 'EDIT CATALOG ITEM' : 'ADD NEW CATALOG ITEM'}</div>
          <h2 class="heading-2 font-serif">${isEdit ? `Edit: ${product.name}` : 'Create Haute Piece'}</h2>
        </div>

        <form id="admin-product-form">
          <input type="hidden" id="prod-form-id" value="${product?.id || ''}" />

          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label class="form-label">Product Name *</label>
              <input type="text" id="prod-form-name" value="${product?.name || ''}" class="newsletter-input" style="width: 100%; border: 1px solid var(--color-border); color: var(--color-black);" required placeholder="e.g. Noir Satin Evening Gown" />
            </div>
            <div>
              <label class="form-label">SKU Code *</label>
              <input type="text" id="prod-form-sku" value="${product?.sku || `ATL-SKU-${Math.floor(100 + Math.random() * 900)}`}" class="newsletter-input" style="width: 100%; border: 1px solid var(--color-border); color: var(--color-black);" required />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label class="form-label">Category *</label>
              <select id="prod-form-category" class="newsletter-input" style="width: 100%; border: 1px solid var(--color-border); color: var(--color-black);" required>
                <option value="Clothing" ${product?.category === 'Clothing' ? 'selected' : ''}>Clothing</option>
                <option value="Bags" ${product?.category === 'Bags' ? 'selected' : ''}>Bags</option>
                <option value="Footwear" ${product?.category === 'Footwear' ? 'selected' : ''}>Footwear</option>
                <option value="Accessories" ${product?.category === 'Accessories' ? 'selected' : ''}>Accessories</option>
              </select>
            </div>
            <div>
              <label class="form-label">Subcategory *</label>
              <input type="text" id="prod-form-subcategory" value="${product?.subcategory || 'Dresses'}" class="newsletter-input" style="width: 100%; border: 1px solid var(--color-border); color: var(--color-black);" required placeholder="e.g. Dresses / Handbags / Heels" />
            </div>
            <div>
              <label class="form-label">Price (RS) *</label>
              <input type="number" id="prod-form-price" value="${product?.price || 4999}" class="newsletter-input" style="width: 100%; border: 1px solid var(--color-border); color: var(--color-black);" required min="100" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label class="form-label">Inventory Stock Units *</label>
              <input type="number" id="prod-form-stock" value="${product?.stock ?? 15}" class="newsletter-input" style="width: 100%; border: 1px solid var(--color-border); color: var(--color-black);" required min="0" />
            </div>
            <div>
              <label class="form-label">Primary Image URL *</label>
              <input type="text" id="prod-form-primary-img" value="${product?.primaryImage || '/images/hero_model.png'}" class="newsletter-input" style="width: 100%; border: 1px solid var(--color-border); color: var(--color-black);" required />
            </div>
          </div>

          <div style="margin-bottom: 16px;">
            <label class="form-label">Secondary Hover Image URL</label>
            <input type="text" id="prod-form-secondary-img" value="${product?.secondaryImage || '/images/shop_look_model.png'}" class="newsletter-input" style="width: 100%; border: 1px solid var(--color-border); color: var(--color-black);" />
          </div>

          <div style="margin-bottom: 16px;">
            <label class="form-label">Description *</label>
            <textarea id="prod-form-desc" class="newsletter-input" style="width: 100%; height: 60px; border: 1px solid var(--color-border); color: var(--color-black);" required>${product?.description || 'Sculpted from liquid silk, crafted for elegance.'}</textarea>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
            <div>
              <label class="form-label">Material Composition</label>
              <input type="text" id="prod-form-material" value="${product?.material || '100% Pure Silk'}" class="newsletter-input" style="width: 100%; border: 1px solid var(--color-border); color: var(--color-black);" />
            </div>
            <div>
              <label class="form-label">Care Instructions</label>
              <input type="text" id="prod-form-care" value="${product?.care || 'Dry clean only'}" class="newsletter-input" style="width: 100%; border: 1px solid var(--color-border); color: var(--color-black);" />
            </div>
          </div>

          <div class="flex gap-md justify-end">
            <button type="button" class="btn btn-outline" id="cancel-admin-prod-modal-btn">CANCEL</button>
            <button type="submit" class="btn btn-primary" style="padding: 10px 24px;">${isEdit ? 'SAVE CHANGES' : 'CREATE PRODUCT'}</button>
          </div>
        </form>
      </div>
    </div>
  `;
}
