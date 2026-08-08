import { PRODUCTS_DATA } from '../data/products';
import { renderProductCard } from '../components/ProductCard';

export function renderShopPage(selectedCategory = 'ALL'): string {
  const filteredProducts =
    selectedCategory === 'ALL'
      ? PRODUCTS_DATA
      : PRODUCTS_DATA.filter((p) => p.category === selectedCategory || p.subcategory === selectedCategory);

  return `
    <div class="shop-container">
      <div class="container">
        <!-- Shop Header -->
        <div class="shop-header">
          <div class="subtitle">HAUTE COUTURE CATALOG</div>
          <h1 class="shop-title font-serif">${selectedCategory.toUpperCase()} COLLECTION</h1>
          <p style="font-size: 0.95rem; color: var(--color-muted); max-width: 500px; margin: 0 auto;">
            Explore handcrafted gowns, structured leather handbags, fine metallic heels, and statement jewelry pieces.
          </p>
        </div>

        <!-- Layout Grid -->
        <div class="shop-layout">
          <!-- Sidebar Filters -->
          <aside class="filter-sidebar">
            <div class="flex justify-between items-center" style="margin-bottom: 20px;">
              <span class="font-serif heading-3">FILTERS</span>
              <button id="reset-filters-btn" style="font-size: 0.75rem; text-decoration: underline; color: var(--color-gold);">Reset All</button>
            </div>

            <!-- Categories -->
            <div class="filter-group">
              <div class="filter-group-title">CATEGORIES</div>
              <ul class="filter-options-list">
                <li><label class="filter-checkbox-label"><input type="checkbox" checked /> All Products (124)</label></li>
                <li><label class="filter-checkbox-label"><input type="checkbox" /> Evening Dresses (38)</label></li>
                <li><label class="filter-checkbox-label"><input type="checkbox" /> Leather Handbags (24)</label></li>
                <li><label class="filter-checkbox-label"><input type="checkbox" /> Stiletto Heels & Sandals (22)</label></li>
                <li><label class="filter-checkbox-label"><input type="checkbox" /> Jewelry & Accessories (18)</label></li>
                <li><label class="filter-checkbox-label"><input type="checkbox" /> Tailored Tops & Blazers (22)</label></li>
              </ul>
            </div>

            <!-- Size Filter -->
            <div class="filter-group">
              <div class="filter-group-title">SIZE</div>
              <div class="size-chips">
                <div class="size-chip">XS</div>
                <div class="size-chip">S</div>
                <div class="size-chip">M</div>
                <div class="size-chip">L</div>
                <div class="size-chip">XL</div>
              </div>
            </div>

            <!-- Color Filter -->
            <div class="filter-group">
              <div class="filter-group-title">COLOR</div>
              <div class="color-swatches">
                <div class="color-swatch" style="background-color: #151515;" title="Noir Black"></div>
                <div class="color-swatch" style="background-color: #F8F5F0;" title="Ivory White"></div>
                <div class="color-swatch" style="background-color: #C5A880;" title="Champagne Gold"></div>
                <div class="color-swatch" style="background-color: #D4A59A;" title="Dusty Rose"></div>
                <div class="color-swatch" style="background-color: #2A2A2A;" title="Espresso"></div>
              </div>
            </div>

            <!-- Price Range -->
            <div class="filter-group">
              <div class="filter-group-title">PRICE RANGE (RS)</div>
              <input type="range" min="2000" max="15000" value="15000" style="width: 100%; accent-color: var(--color-gold);" />
              <div class="flex justify-between" style="font-size: 0.8rem; margin-top: 6px;">
                <span>Rs. 2,000</span>
                <span>Rs. 15,000</span>
              </div>
            </div>
          </aside>

          <!-- Main Products Column -->
          <div>
            <!-- Toolbar -->
            <div class="shop-toolbar">
              <div class="product-count">${filteredProducts.length} PRODUCTS FOUND</div>
              
              <div class="flex items-center gap-sm">
                <span style="font-size: 0.8rem; color: var(--color-muted);">SORT BY:</span>
                <select class="sort-select">
                  <option>FEATURED EDIT</option>
                  <option>NEWEST ARRIVALS</option>
                  <option>PRICE: LOW TO HIGH</option>
                  <option>PRICE: HIGH TO LOW</option>
                  <option>BEST RATED</option>
                </select>
              </div>
            </div>

            <!-- Grid -->
            <div class="products-grid">
              ${filteredProducts.map(renderProductCard).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
