import { PRODUCTS_DATA } from './products';
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
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

class Store {
  public products: Product[] = [...PRODUCTS_DATA];
  public cart: CartItem[] = [];
  public wishlist: string[] = [];
  public orders: Order[] = [];
  public coupons: Coupon[] = [
    { code: 'ATELIER10', discountPercent: 10, isUsed: false },
    { code: 'LUXE20', discountPercent: 20, isUsed: false },
    { code: 'SPRING500', discountPercent: 15, isUsed: false }
  ];

  public activeRoute: 'home' | 'shop' | 'checkout' | 'account' | 'admin' = 'home';
  public selectedProductForModal: Product | null = null;
  public currentUser: User | null = null;
  public appliedCoupon: Coupon | null = null;

  private listeners: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const savedUser = localStorage.getItem('atelier_user');
      if (savedUser) this.currentUser = JSON.parse(savedUser);

      const savedCart = localStorage.getItem('atelier_cart');
      if (savedCart) this.cart = JSON.parse(savedCart);

      const savedWishlist = localStorage.getItem('atelier_wishlist');
      if (savedWishlist) this.wishlist = JSON.parse(savedWishlist);

      const savedOrders = localStorage.getItem('atelier_orders');
      if (savedOrders) this.orders = JSON.parse(savedOrders);

      const savedCoupons = localStorage.getItem('atelier_coupons');
      if (savedCoupons) this.coupons = JSON.parse(savedCoupons);

      const savedProducts = localStorage.getItem('atelier_products');
      if (savedProducts) this.products = JSON.parse(savedProducts);
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  private saveToStorage() {
    try {
      if (this.currentUser) localStorage.setItem('atelier_user', JSON.stringify(this.currentUser));
      else localStorage.removeItem('atelier_user');

      localStorage.setItem('atelier_cart', JSON.stringify(this.cart));
      localStorage.setItem('atelier_wishlist', JSON.stringify(this.wishlist));
      localStorage.setItem('atelier_orders', JSON.stringify(this.orders));
      localStorage.setItem('atelier_coupons', JSON.stringify(this.coupons));
      localStorage.setItem('atelier_products', JSON.stringify(this.products));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
  }

  private notify() {
    this.saveToStorage();
    this.listeners.forEach((fn) => fn());
  }

  public navigateTo(route: 'home' | 'shop' | 'checkout' | 'account' | 'admin') {
    this.activeRoute = route;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.notify();
  }

  // --- Auth Methods ---
  public login(email: string, role: 'USER' | 'ADMIN' = 'USER', name = 'Valued Client') {
    this.currentUser = { email, role, name };
    this.notify();
  }

  public logout() {
    this.currentUser = null;
    if (this.activeRoute === 'admin' || this.activeRoute === 'account') {
      this.activeRoute = 'home';
    }
    this.notify();
  }

  // --- Cart & Wishlist ---
  public addToCart(product: Product, quantity = 1, selectedSize?: string, selectedColor?: string) {
    const size = selectedSize || product.sizes[0] || 'S';
    const color = selectedColor || (product.colors[0] ? product.colors[0].name : 'Default');
    const cartItemId = `${product.id}-${size}-${color}`;

    const existing = this.cart.find((item) => item.id === cartItemId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cart.push({
        id: cartItemId,
        product,
        quantity,
        selectedSize: size,
        selectedColor: color
      });
    }
    this.notify();
  }

  public removeFromCart(cartItemId: string) {
    this.cart = this.cart.filter((item) => item.id !== cartItemId);
    this.notify();
  }

  public updateCartQuantity(cartItemId: string, delta: number) {
    const item = this.cart.find((i) => i.id === cartItemId);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        this.removeFromCart(cartItemId);
      } else {
        this.notify();
      }
    }
  }

  public toggleWishlist(productId: string) {
    if (this.wishlist.includes(productId)) {
      this.wishlist = this.wishlist.filter((id) => id !== productId);
    } else {
      this.wishlist.push(productId);
    }
    this.notify();
  }

  // --- Modal & Product Selection ---
  public openProductModal(product: Product) {
    this.selectedProductForModal = product;
    this.notify();
  }

  public closeProductModal() {
    this.selectedProductForModal = null;
    this.notify();
  }

  // --- Coupons ---
  public applyCoupon(code: string): { success: boolean; message: string } {
    const cleanCode = code.trim().toUpperCase();
    const coupon = this.coupons.find((c) => c.code === cleanCode);

    if (!coupon) {
      return { success: false, message: 'Invalid coupon code.' };
    }
    if (coupon.isUsed) {
      return { success: false, message: 'This coupon code has already been used.' };
    }

    this.appliedCoupon = coupon;
    this.notify();
    return { success: true, message: `Coupon ${coupon.code} (${coupon.discountPercent}% OFF) applied!` };
  }

  public removeCoupon() {
    this.appliedCoupon = null;
    this.notify();
  }

  public addCoupon(code: string, discountPercent: number) {
    const cleanCode = code.trim().toUpperCase();
    if (this.coupons.some((c) => c.code === cleanCode)) return;
    this.coupons.push({ code: cleanCode, discountPercent, isUsed: false });
    this.notify();
  }

  public deleteCoupon(code: string) {
    this.coupons = this.coupons.filter((c) => c.code !== code);
    if (this.appliedCoupon?.code === code) this.appliedCoupon = null;
    this.notify();
  }

  // --- Orders ---
  public placeOrder(orderData: Omit<Order, 'id' | 'date' | 'status' | 'trackingNumber'>): Order {
    const orderId = `ATL-${Math.floor(100000 + Math.random() * 900000)}`;
    const tracking = `ATL-TRK-${Math.floor(1000000 + Math.random() * 9000000)}`;

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Processing',
      trackingNumber: tracking
    };

    // Mark applied coupon as used
    if (this.appliedCoupon) {
      const c = this.coupons.find((cp) => cp.code === this.appliedCoupon?.code);
      if (c) {
        c.isUsed = true;
        c.usedByEmail = this.currentUser?.email;
      }
      this.appliedCoupon = null;
    }

    // Reduce product stock
    newOrder.items.forEach((item) => {
      const prod = this.products.find((p) => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    });

    this.orders.unshift(newOrder);
    this.cart = [];
    this.notify();
    return newOrder;
  }

  public updateOrderStatus(orderId: string, status: Order['status']) {
    const order = this.orders.find((o) => o.id === orderId);
    if (order) {
      order.status = status;
      this.notify();
    }
  }

  // --- Product CRUD (Admin) ---
  public addProduct(product: Product) {
    this.products.unshift(product);
    this.notify();
  }

  public updateProduct(updatedProduct: Product) {
    const index = this.products.findIndex((p) => p.id === updatedProduct.id);
    if (index !== -1) {
      this.products[index] = updatedProduct;
      this.notify();
    }
  }

  public deleteProduct(productId: string) {
    this.products = this.products.filter((p) => p.id !== productId);
    this.notify();
  }

  // --- Calculations ---
  public getCartSubtotal(): number {
    return this.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  public getDiscountAmount(): number {
    if (!this.appliedCoupon) return 0;
    const subtotal = this.getCartSubtotal();
    return Math.round((subtotal * this.appliedCoupon.discountPercent) / 100);
  }

  public getShippingFee(): number {
    const subtotal = this.getCartSubtotal() - this.getDiscountAmount();
    if (subtotal === 0) return 0;
    return subtotal >= 5000 ? 0 : 250;
  }

  public getCartTotal(): number {
    return this.getCartSubtotal() - this.getDiscountAmount() + this.getShippingFee();
  }

  public getUserOrders(): Order[] {
    if (!this.currentUser) return [];
    return this.orders.filter((o) => o.customerEmail.toLowerCase() === this.currentUser?.email.toLowerCase());
  }

  public getLowStockProducts(): Product[] {
    return this.products.filter((p) => p.stock < 10);
  }
}

export const store = new Store();
