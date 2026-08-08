import type { Product } from '../data/products';
import { store } from '../data/mockState';

export function renderProductCard(product: Product): string {
  const isWishlisted = store.wishlist.includes(product.id);

  return `
    <div class="product-card" data-product-id="${product.id}">
      <div class="product-img-wrap" data-action="open-detail" data-product-id="${product.id}">
        <img src="${product.primaryImage}" alt="${product.name}" class="product-primary-img" loading="lazy" />
        <img src="${product.secondaryImage}" alt="${product.name}" class="product-secondary-img" loading="lazy" />
        
        ${product.badge ? `<span class="card-badge ${product.badge === 'SALE' ? 'sale' : ''}">${product.badge}</span>` : ''}

        <button class="wishlist-heart-btn ${isWishlisted ? 'active' : ''}" data-action="wishlist" data-product-id="${product.id}" title="Wishlist">
          <i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
        </button>
      </div>

      <div class="product-card-info">
        <div class="product-category-tag">${product.subcategory}</div>
        <h4 class="product-card-title" data-action="open-detail" data-product-id="${product.id}">${product.name}</h4>
        
        <div class="product-rating">
          <i class="fa-solid fa-star"></i>
          <span>${product.rating} (${product.reviewsCount})</span>
        </div>

        <div class="product-prices">
          <span class="current-price">Rs. ${product.price.toLocaleString()}</span>
          ${product.originalPrice ? `<span class="original-price">Rs. ${product.originalPrice.toLocaleString()}</span>` : ''}
          ${product.discountPercentage ? `<span class="discount-tag">${product.discountPercentage}% OFF</span>` : ''}
        </div>
      </div>
    </div>
  `;
}
