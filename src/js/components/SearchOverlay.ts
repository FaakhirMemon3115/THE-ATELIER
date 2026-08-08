import { PRODUCTS_DATA } from '../data/products';
import type { Product } from '../data/products';

export function renderSearchOverlay(query = ''): string {
  const filteredProducts: Product[] = query.trim()
    ? PRODUCTS_DATA.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          p.subcategory.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return `
    <div class="modal-overlay active" id="search-overlay">
      <div style="background-color: var(--color-ivory-warm); width: 100%; max-width: 900px; padding: var(--space-2xl); border-radius: var(--radius-sm); position: relative; border: 1px solid var(--color-border);">
        <button class="modal-close-btn" id="close-search-btn"><i class="fa-solid fa-xmark"></i></button>

        <div class="subtitle" style="text-align: center; margin-bottom: 12px;">WHAT ARE YOU LOOKING FOR?</div>

        <div style="position: relative; margin-bottom: 24px;">
          <input type="text" id="live-search-input" value="${query}" placeholder="Type to search (e.g. Satin dress, tote bag, heels)..." autofocus
            style="width: 100%; padding: 18px 24px; font-family: var(--font-serif); font-size: 1.5rem; border: 1px solid var(--color-border); background-color: #FFFFFF; border-radius: var(--radius-sm); outline: none;" />
          <i class="fa-solid fa-magnifying-glass" style="position: absolute; right: 24px; top: 50%; transform: translateY(-50%); font-size: 1.25rem; color: var(--color-gold);"></i>
        </div>

        <!-- Trending Keywords Tag Pills -->
        <div style="margin-bottom: 24px;">
          <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-muted); margin-right: 12px;">TRENDING:</span>
          <div style="display: inline-flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn-secondary search-tag-btn" data-tag="Dresses" style="padding: 6px 14px; font-size: 0.75rem;">Dresses</button>
            <button class="btn btn-secondary search-tag-btn" data-tag="Silk" style="padding: 6px 14px; font-size: 0.75rem;">Silk Gowns</button>
            <button class="btn btn-secondary search-tag-btn" data-tag="Handbags" style="padding: 6px 14px; font-size: 0.75rem;">Leather Handbags</button>
            <button class="btn btn-secondary search-tag-btn" data-tag="Heels" style="padding: 6px 14px; font-size: 0.75rem;">Gold Heels</button>
          </div>
        </div>

        <!-- Live Search Results Grid -->
        <div style="max-height: 420px; overflow-y: auto;">
          ${
            query.trim() === ''
              ? `<div style="text-align: center; color: var(--color-muted); padding: 40px 0; font-size: 0.9rem;">Start typing to explore products live across our Atelier catalog.</div>`
              : filteredProducts.length === 0
              ? `<div style="text-align: center; color: var(--color-muted); padding: 40px 0;">No fashion products found for "${query}". Try another search term.</div>`
              : `
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;">
                ${filteredProducts
                  .map(
                    (p) => `
                  <div class="product-card" data-product-id="${p.id}" style="cursor: pointer;">
                    <img src="${p.primaryImage}" alt="${p.name}" style="height: 160px; width: 100%; object-fit: cover;" />
                    <div style="padding: 10px;">
                      <div class="product-category-tag">${p.subcategory}</div>
                      <div style="font-family: var(--font-serif); font-size: 0.95rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.name}</div>
                      <div style="font-weight: 700; font-size: 0.9rem; margin-top: 4px;">Rs. ${p.price.toLocaleString()}</div>
                    </div>
                  </div>
                `
                  )
                  .join('')}
              </div>
            `
          }
        </div>

      </div>
    </div>
  `;
}
