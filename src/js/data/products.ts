export interface Product {
  id: string;
  sku: string;
  name: string;
  category: 'Clothing' | 'Bags' | 'Footwear' | 'Accessories';
  subcategory: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  badge?: 'NEW' | 'SALE' | 'BESTSELLER';
  rating: number;
  reviewsCount: number;
  primaryImage: string;
  secondaryImage: string;
  description: string;
  material: string;
  care: string;
  fit: string;
  sizes: string[];
  colors: { name: string; hex: string; image?: string }[];
  stock: number;
  mood: 'CONFIDENT' | 'ROMANTIC' | 'MINIMAL' | 'BOLD';
  isDay: boolean;
  isNight: boolean;
  featured?: boolean;
}

// Dummy/seed catalog removed — the store starts empty.
// Add real products from the Admin Dashboard (Admin > Products > Add Product).
export const PRODUCTS_DATA: Product[] = [];
