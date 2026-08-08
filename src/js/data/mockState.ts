import { db } from './db';
import type { Product } from './products';
import type { Order, Coupon, User, HeroBannerConfig } from './types';

export type { Product, Order, Coupon, User, HeroBannerConfig };

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

class Store {
  public cart: CartItem[] = [];
  public wishlist: string[] = [];
  public activeRoute: 'home' | 'shop' | 'checkout' | 'account' | 'admin' = 'home';
  public selectedProductForModal: Product | null = null;
  public currentUser: User | null = null;
  public appliedCoupon: Coupon | null = null;
  public activeMood: 'ALL' | 'CONFIDENT' | 'ROMANTIC' | 'MINIMAL' | 'BOLD' = 'ALL';
  public dayNightTime: number = 14;

  private listeners: (() => void)[] = [];

  constructor() {
    this.loadSessionFromStorage();
  }

  private loadSessionFromStorage() {
    try {
      const savedUser = localStorage.getItem('atelier_session_user');
      if (savedUser) this.currentUser = JSON.parse(savedUser);

      const savedCart = localStorage.getItem('atelier_cart');
      if (savedCart) this.cart = JSON.parse(savedCart);

      const savedWishlist = localStorage.getItem('atelier_wishlist');
      if (savedWishlist) this.wishlist = JSON.parse(savedWishlist);
    } catch (e) {
      console.warn('Session load error:', e);
    }
  }

  private saveSessionToStorage() {
    try {
      if (this.currentUser) localStorage.setItem('atelier_session_user', JSON.stringify(this.currentUser));
      else localStorage.removeItem('atelier_session_user');

      localStorage.setItem('atelier_cart', JSON.stringify(this.cart));
      localStorage.setItem('atelier_wishlist', JSON.stringify(this.wishlist));
    } catch (e) {
      console.warn('Session save error:', e);
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
  }

  public notify() {
    this.saveSessionToStorage();
    this.listeners.forEach((fn) => fn());
  }

  // --- Reactive Getters (from db) ---
  public get products(): Product[] {
    return db.getProducts();
  }

  public get registeredUsers(): User[] {
    return db.getUsers();
  }

  public get orders(): Order[] {
    return db.getOrders();
  }

  public get coupons(): Coupon[] {
    return db.getCoupons();
  }

  public get heroBanner(): HeroBannerConfig {
    return db.getHero();
  }

  // --- Router ---
  public navigateTo(route: 'home' | 'shop' | 'checkout' | 'account' | 'admin') {
    this.activeRoute = route;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.notify();
  }

  public setMood(mood: 'ALL' | 'CONFIDENT' | 'ROMANTIC' | 'MINIMAL' | 'BOLD') {
    this.activeMood = mood;
    this.notify();
  }

  public setDayNightTime(time: number) {
    this.dayNightTime = time;
    this.notify();
  }

  // --- Auth & User Database Sync ---
  public login(email: string, role: 'USER' | 'ADMIN' = 'USER', name = 'Valued Client'): { success: boolean; message: string } {
    const users = db.getUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (existing?.isBanned) {
      return { success: false, message: 'This account has been banned by Administrator.' };
    }

    const loginTime = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    if (existing) {
      existing.lastLoginAt = loginTime;
      db.updateUser(existing);
      this.currentUser = { ...existing };
    } else {
      const newUser: User = {
        id: `usr-${Date.now()}`,
        email,
        name,
        role,
        avatar: '/images/hero_model.png',
        registeredAt: loginTime,
        lastLoginAt: loginTime,
        isBanned: false
      };
      db.addUser(newUser);
      this.currentUser = { ...newUser };
    }

    this.notify();
    return { success: true, message: `Welcome ${this.currentUser.name}!` };
  }

  public register(name: string, email: string, password: string): { success: boolean; message: string } {
    const users = db.getUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { success: false, message: 'An account with this email address already exists.' };
    }

    const regTime = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const newUser: User = {
      id: `usr-${Date.now()}`,
      email,
      name,
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      registeredAt: regTime,
      lastLoginAt: regTime,
      isBanned: false,
      password
    };

    db.addUser(newUser);
    this.currentUser = { ...newUser };
    this.notify();
    return { success: true, message: `Account created successfully. Welcome ${name}!` };
  }

  public logout() {
    this.currentUser = null;
    if (this.activeRoute === 'admin' || this.activeRoute === 'account') {
      this.activeRoute = 'home';
    }
    this.notify();
  }

  public updateUserProfile(name: string, avatarUrl?: string): { success: boolean; message: string } {
    if (!this.currentUser) return { success: false, message: 'No active session.' };

    this.currentUser.name = name;
    if (avatarUrl) this.currentUser.avatar = avatarUrl;

    const user = db.getUsers().find((u) => u.id === this.currentUser?.id);
    if (user) {
      user.name = name;
      if (avatarUrl) user.avatar = avatarUrl;
      db.updateUser(user);
    }

    this.notify();
    return { success: true, message: 'Profile updated successfully!' };
  }

  public changeUserPassword(oldPass: string, newPass: string): { success: boolean; message: string } {
    if (!this.currentUser) return { success: false, message: 'No active session.' };

    const user = db.getUsers().find((u) => u.id === this.currentUser?.id);
    if (user) {
      if (user.password && user.password !== oldPass) {
        return { success: false, message: 'Current password is incorrect.' };
      }
      user.password = newPass;
      db.updateUser(user);
      this.currentUser.password = newPass;
      this.notify();
      return { success: true, message: 'Password updated successfully!' };
    }
    return { success: false, message: 'User record not found.' };
  }

  public banUser(userId: string) {
    const user = db.getUsers().find((u) => u.id === userId);
    if (user && user.role !== 'ADMIN') {
      user.isBanned = true;
      db.updateUser(user);
      if (this.currentUser?.id === userId) this.logout();
      else this.notify();
    }
  }

  public unbanUser(userId: string) {
    const user = db.getUsers().find((u) => u.id === userId);
    if (user) {
      user.isBanned = false;
      db.updateUser(user);
      this.notify();
    }
  }

  public removeUser(userId: string) {
    const user = db.getUsers().find((u) => u.id === userId);
    if (user && user.role !== 'ADMIN') {
      db.deleteUser(userId);
      if (this.currentUser?.id === userId) this.logout();
      else this.notify();
    }
  }

  public updateHeroBanner(config: Partial<HeroBannerConfig>) {
    const current = db.getHero();
    const updated = { ...current, ...config };
    db.updateHero(updated);
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
    const coupon = db.getCoupons().find((c) => c.code === cleanCode);

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
    if (db.getCoupons().some((c) => c.code === cleanCode)) return;
    db.addCoupon({ code: cleanCode, discountPercent, isUsed: false });
    this.notify();
  }

  public deleteCoupon(code: string) {
    db.deleteCoupon(code);
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

    if (this.appliedCoupon) {
      const c = db.getCoupons().find((cp) => cp.code === this.appliedCoupon?.code);
      if (c) {
        c.isUsed = true;
        c.usedByEmail = this.currentUser?.email;
        db.updateCoupon(c);
      }
      this.appliedCoupon = null;
    }

    newOrder.items.forEach((item) => {
      const prod = db.getProductById(item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
        db.updateProduct(prod);
      }
    });

    db.addOrder(newOrder);
    this.cart = [];
    this.notify();
    return newOrder;
  }

  public updateOrderStatus(orderId: string, status: Order['status']) {
    db.updateOrderStatus(orderId, status);
    this.notify();
  }

  // --- Product CRUD (Admin) ---
  public addProduct(product: Product) {
    db.addProduct(product);
    this.notify();
  }

  public updateProduct(updatedProduct: Product) {
    db.updateProduct(updatedProduct);
    this.notify();
  }

  public deleteProduct(productId: string) {
    db.deleteProduct(productId);
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
    return db.getOrders().filter((o) => o.customerEmail.toLowerCase() === this.currentUser?.email.toLowerCase());
  }

  public getLowStockProducts(): Product[] {
    return db.getProducts().filter((p) => p.stock < 10);
  }
}

export const store = new Store();
