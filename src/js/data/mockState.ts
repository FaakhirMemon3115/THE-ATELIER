import { db } from './db';
import type { Product } from './products';
import type { Order, Coupon, User, HeroBannerConfig } from './types';
import { api, setAuthToken } from './api';

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

  public async initializeStore() {
    // MANDATORY API CALL — no offline fallback
    try {
      await api.health();
    } catch (e) {
      console.error('❌ API unreachable. Backend must be running on http://localhost:4000');
      throw e;
    }

    const token = localStorage.getItem('atelier_auth_token');
    if (token) {
      try {
        const user = await api.me();
        this.currentUser = user;
        localStorage.setItem('atelier_session_user', JSON.stringify(this.currentUser));
      } catch (err) {
        console.error('Session restoration failed:', err);
        this.logout();
      }
    }

    // Fetch ALL data from API — NO FALLBACK TO MOCK DATA
    const backendProds = await api.getProducts();
    db.setProducts(backendProds);

    const backendCoupons = await api.getCoupons();
    const mapped = backendCoupons.map((c: any) => ({
      code: c.code,
      discountPercent: c.discountPercent || c.discount_percent,
      isUsed: c.isUsed || c.is_used === 1 || c.is_used === true,
      usedByEmail: c.usedByEmail || c.used_by_email
    }));
    db.setCoupons(mapped);

    const backendHero = await api.getHero();
    if (backendHero) {
      db.updateHero(backendHero);
    }

    if (this.currentUser) {
      const backendOrders = await api.getOrders();
      db.setOrders(backendOrders);
    }

    this.notify();
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
  public async login(email: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await api.login(email, password);
      setAuthToken(res.token);
      this.currentUser = res.user;
      localStorage.setItem('atelier_session_user', JSON.stringify(res.user));
      this.notify();
      return { success: true, message: `Welcome back, ${res.user.name}!` };
    } catch (e: any) {
      console.error('❌ Login failed (API required):', e.message);
      return { success: false, message: e.message || 'Login failed. Backend must be running.' };
    }
  }

  public async register(name: string, email: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await api.register(name, email, password);
      setAuthToken(res.token);
      this.currentUser = res.user;
      localStorage.setItem('atelier_session_user', JSON.stringify(res.user));
      this.notify();
      return { success: true, message: `Account created successfully. Welcome ${name}!` };
    } catch (e: any) {
      console.error('❌ Registration failed (API required):', e.message);
      return { success: false, message: e.message || 'Registration failed. Backend must be running.' };
    }
  }

  public logout() {
    setAuthToken(null);
    this.currentUser = null;
    localStorage.removeItem('atelier_session_user');
    if (this.activeRoute === 'admin' || this.activeRoute === 'account') {
      this.activeRoute = 'home';
    }
    this.notify();
  }

  public async updateUserProfile(name: string, avatarUrl?: string): Promise<{ success: boolean; message: string }> {
    if (!this.currentUser) return { success: false, message: 'No active session.' };

    try {
      const updatedUser = await api.updateProfile(name, avatarUrl);
      this.currentUser = { ...this.currentUser, ...updatedUser };
    } catch (e: any) {
      console.warn('API profile update failed, using local DB:', e.message);
      this.currentUser!.name = name;
      if (avatarUrl) this.currentUser!.avatar = avatarUrl;
    }

    const user = db.getUsers().find((u) => u.id === this.currentUser?.id);
    if (user) {
      user.name = name;
      if (avatarUrl) user.avatar = avatarUrl;
      db.updateUser(user);
    }
    this.notify();
    return { success: true, message: 'Profile updated successfully!' };
  }

  public async changeUserPassword(oldPass: string, newPass: string): Promise<{ success: boolean; message: string }> {
    if (!this.currentUser) return { success: false, message: 'No active session.' };

    try {
      await api.changePassword(oldPass, newPass);
    } catch (e: any) {
      console.warn('API change password failed, using local DB:', e.message);
      if (e.message.includes('Incorrect current password')) {
        return { success: false, message: 'Current password is incorrect.' };
      }
      
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
    }

    const user = db.getUsers().find((u) => u.id === this.currentUser?.id);
    if (user) {
      user.password = newPass;
      db.updateUser(user);
    }
    if (this.currentUser) {
      this.currentUser.password = newPass;
    }
    this.notify();
    return { success: true, message: 'Password updated successfully!' };
  }

  public async banUser(userId: string) {
    try {
      await api.banUser(userId, true);
      const user = db.getUsers().find((u) => u.id === userId);
      if (user) {
        user.isBanned = true;
        db.updateUser(user);
        if (this.currentUser?.id === userId) this.logout();
        else this.notify();
      }
    } catch (e) {
      console.error('❌ Ban failed (API required):', e);
      throw e;
    }
  }

  public async unbanUser(userId: string) {
    try {
      await api.banUser(userId, false);
      const user = db.getUsers().find((u) => u.id === userId);
      if (user) {
        user.isBanned = false;
        db.updateUser(user);
        this.notify();
      }
    } catch (e) {
      console.error('❌ Unban failed (API required):', e);
      throw e;
    }
  }

  public async removeUser(userId: string) {
    try {
      await api.deleteUser(userId);
      db.deleteUser(userId);
      if (this.currentUser?.id === userId) this.logout();
      else this.notify();
    } catch (e) {
      console.error('❌ Remove user failed (API required):', e);
      throw e;
    }
  }

  public async updateHeroBanner(config: Partial<HeroBannerConfig>) {
    try {
      const current = db.getHero();
      const updated = { ...current, ...config };
      await api.updateHero(updated);
      db.updateHero(updated);
      this.notify();
    } catch (e) {
      console.error('❌ Hero update failed (API required):', e);
      throw e;
    }
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

  public async addCoupon(code: string, discountPercent: number) {
    const cleanCode = code.trim().toUpperCase();
    try {
      const coupon = await api.createCoupon(cleanCode, discountPercent);
      db.addCoupon(coupon);
      this.notify();
      return coupon;
    } catch (e) {
      console.error('❌ Coupon creation failed (API required):', e);
      throw e;
    }
  }

  public async deleteCoupon(code: string) {
    try {
      await api.deleteCoupon(code);
      db.deleteCoupon(code);
      if (this.appliedCoupon?.code === code) this.appliedCoupon = null;
      this.notify();
    } catch (e) {
      console.error('❌ Coupon deletion failed (API required):', e);
      throw e;
    }
  }

  // --- Orders ---
  public async placeOrder(orderData: Omit<Order, 'id' | 'date' | 'status' | 'trackingNumber'>): Promise<Order> {
    try {
      const backendOrder = await api.placeOrder(orderData);
      
      // Update local cache with backend response
      db.addOrder(backendOrder);
      
      // Mark coupon as used if applied
      if (this.appliedCoupon) {
        const c = db.getCoupons().find((cp) => cp.code === this.appliedCoupon?.code);
        if (c) {
          c.isUsed = true;
          c.usedByEmail = this.currentUser?.email;
          db.updateCoupon(c);
        }
        this.appliedCoupon = null;
      }

      // Reduce stock locally to match backend
      backendOrder.items.forEach((item: Order['items'][number]) => {
        const prod = db.getProductById(item.productId);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - item.quantity);
          db.updateProduct(prod);
        }
      });

      this.cart = [];
      this.notify();
      return backendOrder;
    } catch (e) {
      console.error('❌ Order placement failed (API required):', e);
      throw e;
    }
  }

  public async updateOrderStatus(orderId: string, status: Order['status']) {
    try {
      await api.updateOrderStatus(orderId, status);
      db.updateOrderStatus(orderId, status);
      this.notify();
      return db.getOrders().find((o) => o.id === orderId);
    } catch (e) {
      console.error('❌ Order status update failed (API required):', e);
      throw e;
    }
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

  public async deleteProduct(productId: string) {
    try {
      await api.deleteProduct(productId);
      db.deleteProduct(productId);
      this.notify();
    } catch (e) {
      console.error('❌ Product deletion failed (API required):', e);
      throw e;
    }
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
