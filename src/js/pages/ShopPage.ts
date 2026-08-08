import { store } from '../data/mockState';
import { renderProductCard } from '../components/ProductCard';

export interface FilterState {
  category: string;
  selectedSizes: string[];
  selectedColors: string[];
  maxPrice: number;
  sortBy: string;
}

export function renderShopPage(
  filterState: FilterState = {
    category: 'ALL',
    selectedSizes: [],
    selectedColors: [],
    maxPrice: 15000,
    sortBy: 'FEATURED EDIT'
  }
): string {
  const allProducts = store.products;
  const totalCount = allProducts.length;

  // Dynamic Category Counts
  const clothingCount = allProducts.filter((p) => p.category === 'Clothing').length;
  const dressesCount = allProducts.filter((p) => p.subcategory === 'Dresses').length;
  const topsCount = allProducts.filter((p) => p.subcategory === 'Tops' || (p.category === 'Clothing' && p.subcategory !== 'Dresses')).length;
  const bagsCount = allProducts.filter((p) => p.category === 'Bags').length;
  const footwearCount = allProducts.filter((p) => p.category === 'Footwear').length;
  const accessoriesCount = allProducts.filter((p) => p.category === 'Accessories').length;

  // Apply Category Filter
  let filtered =
    filterState.category === 'ALL'
      ? allProducts
      : allProducts.filter((p) => p.category === filterState.category || p.subcategory === filterState.category);

  // Apply Size Filter
  if (filterState.selectedSizes.length > 0) {
    filtered = filtered.filter((p) => p.sizes.some((size) => filterState.selectedSizes.includes(size)));
  }

  // Apply Color Filter
  if (filterState.selectedColors.length > 0) {
    filtered = filtered.filter((p) =>
      p.colors.some((colorObj) =>
        filterState.selectedColors.some((sc) => colorObj.name.toLowerCase().includes(sc.toLowerCase()))
      )
    );
  }

  // Apply Price Filter
  filtered = filtered.filter((p) => p.price <= filterState.maxPrice);

  // Apply Sorting
  if (filterState.sortBy === 'PRICE: LOW TO HIGH') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (filterState.sortBy === 'PRICE: HIGH TO LOW') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (filterState.sortBy === 'BEST RATED') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (filterState.sortBy === 'NEWEST ARRIVALS') {
    filtered.sort((a, b) => (b.badge === 'NEW' ? 1 : -1));
  }

  const sizesList = ['XS', 'S', 'M', 'L', 'XL'];
  const colorsList = [
    { name: 'Noir Black', hex: '#151515' },
    { name: 'Ivory White', hex: '#F8F5F0' },
    { name: 'Champagne Gold', hex: '#C5A880' },
    { name: 'Dusty Rose', hex: '#D4A59A' },
    { name: 'Espresso', hex: '#2A2A2A' }
  ];

  return `
    <div class="shop-container">
      <div class="container">
        <!-- Shop Header -->
        <div class="shop-header">
          <div class="subtitle">HAUTE COUTURE CATALOG</div>
          <h1 class="shop-title font-serif">${filterState.category.toUpperCase()} COLLECTION</h1>
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
              <button id="reset-filters-btn" style="font-size: 0.75rem; text-decoration: underline; color: var(--color-gold); background: none; border: none; cursor: pointer;">Reset All</button>
            </div>

            <!-- Categories -->
            <div class="filter-group">
              <div class="filter-group-title">CATEGORIES</div>
              <ul class="filter-options-list">
                <li>
                  <label class="filter-checkbox-label">
                    <input type="radio" name="shop-cat" data-filter-cat="ALL" ${filterState.category === 'ALL' ? 'checked' : ''} /> 
                    All Products (${totalCount})
                  </label>
                </li>
                <li>
                  <label class="filter-checkbox-label">
                    <input type="radio" name="shop-cat" data-filter-cat="Clothing" ${filterState.category === 'Clothing' ? 'checked' : ''} /> 
                    Clothing (${clothingCount})
                  </label>
                </li>
                <li>
                  <label class="filter-checkbox-label" style="padding-left: 14px; font-size: 0.85rem;">
                    <input type="radio" name="shop-cat" data-filter-cat="Dresses" ${filterState.category === 'Dresses' ? 'checked' : ''} /> 
                    Dresses & Gowns (${dressesCount})
                  </label>
                </li>
                <li>
                  <label class="filter-checkbox-label" style="padding-left: 14px; font-size: 0.85rem;">
                    <input type="radio" name="shop-cat" data-filter-cat="Tops" ${filterState.category === 'Tops' ? 'checked' : ''} /> 
                    Tops, Kurtis & Blazers (${topsCount})
                  </label>
                </li>
                <li>
                  <label class="filter-checkbox-label">
                    <input type="radio" name="shop-cat" data-filter-cat="Bags" ${filterState.category === 'Bags' ? 'checked' : ''} /> 
                    Leather Handbags (${bagsCount})
                  </label>
                </li>
                <li>
                  <label class="filter-checkbox-label">
                    <input type="radio" name="shop-cat" data-filter-cat="Footwear" ${filterState.category === 'Footwear' ? 'checked' : ''} /> 
                    Footwear & Heels (${footwearCount})
                  </label>
                </li>
                <li>
                  <label class="filter-checkbox-label">
                    <input type="radio" name="shop-cat" data-filter-cat="Accessories" ${filterState.category === 'Accessories' ? 'checked' : ''} /> 
                    Jewelry & Accessories (${accessoriesCount})
                  </label>
                </li>
              </ul>
            </div>

            <!-- Size Filter -->
            <div class="filter-group">
              <div class="filter-group-title">SIZE</div>
              <div class="size-chips" id="filter-size-chips">
                ${sizesList
                  .map(
                    (s) => `
                  <div class="size-chip ${filterState.selectedSizes.includes(s) ? 'selected' : ''}" data-filter-size="${s}">${s}</div>
                `
                  )
                  .join('')}
              </div>
            </div>

            <!-- Color Filter -->
            <div class="filter-group">
              <div class="filter-group-title">COLOR</div>
              <div class="color-swatches" id="filter-color-swatches">
                ${colorsList
                  .map(
                    (c) => `
                  <div class="color-swatch ${filterState.selectedColors.includes(c.name.split(' ')[0]) ? 'selected' : ''}" style="background-color: ${c.hex};" data-filter-color="${c.name.split(' ')[0]}" title="${c.name}"></div>
                `
                  )
                  .join('')}
              </div>
            </div>

            <!-- Price Range -->
            <div class="filter-group">
              <div class="filter-group-title">PRICE RANGE (RS)</div>
              <input type="range" id="filter-price-range" min="2000" max="15000" step="500" value="${filterState.maxPrice}" style="width: 100%; accent-color: var(--color-gold);" />
              <div class="flex justify-between" style="font-size: 0.8rem; margin-top: 6px;">
                <span>Rs. 2,000</span>
                <span id="price-range-val" class="text-gold" style="font-weight: 600;">Rs. ${filterState.maxPrice.toLocaleString()}</span>
              </div>
            </div>
          </aside>

          <!-- Main Products Column -->
          <div>
            <!-- Toolbar -->
            <div class="shop-toolbar">
              <div class="product-count">${filtered.length} PRODUCTS FOUND</div>
              
              <div class="flex items-center gap-sm">
                <span style="font-size: 0.8rem; color: var(--color-muted);">SORT BY:</span>
                <select class="sort-select" id="shop-sort-select">
                  <option ${filterState.sortBy === 'FEATURED EDIT' ? 'selected' : ''}>FEATURED EDIT</option>
                  <option ${filterState.sortBy === 'NEWEST ARRIVALS' ? 'selected' : ''}>NEWEST ARRIVALS</option>
                  <option ${filterState.sortBy === 'PRICE: LOW TO HIGH' ? 'selected' : ''}>PRICE: LOW TO HIGH</option>
                  <option ${filterState.sortBy === 'PRICE: HIGH TO LOW' ? 'selected' : ''}>PRICE: HIGH TO LOW</option>
                  <option ${filterState.sortBy === 'BEST RATED' ? 'selected' : ''}>BEST RATED</option>
                </select>
              </div>
            </div>

            <!-- Grid -->
            <div class="products-grid">
              ${filtered.length > 0 ? filtered.map(renderProductCard).join('') : `<div style="grid-column: 1 / -1; padding: 48px 0; text-align: center; color: var(--color-muted);"><i class="fa-solid fa-filter-circle-xmark" style="font-size: 2rem; margin-bottom: 12px;"></i><p>No products match your selected filters. Try resetting filters.</p></div>`}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
