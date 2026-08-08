import type { Product } from './products';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  image: string;
}

export interface Order {
  id: string;
  date: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod: string;
  shippingAddress: string;
  trackingNumber: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  isUsed: boolean;
  usedByEmail?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  avatar?: string;
  registeredAt: string;
  lastLoginAt: string;
  isBanned?: boolean;
  password?: string;
}

export interface HeroBannerConfig {
  title: string;
  subtitle: string;
  tagline: string;
  imageUrl: string;
}
