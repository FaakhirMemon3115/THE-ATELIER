import type { Product } from './products';
import type { Order, Coupon, User, HeroBannerConfig } from './types';

/**
 * ATELIER DATABASE LAYER
 * ========================
 * This is now a PASS-THROUGH layer that stores data fetched from the API.
 * NO LOCAL CACHING, NO MOCK DATA, NO FALLBACK.
 * All data comes exclusively from MySQL via the Express backend.
 */

class AtelierDatabase {
  private products: Product[] = [];
  private users: User[] = [];
  private orders: Order[] = [];
  private coupons: Coupon[] = [];
  private hero: HeroBannerConfig = {
    title: 'THE NEW ERA SS26',
    subtitle: 'HAUTE COUTURE COLLECTION',
    tagline: 'Sculpted silhouettes, liquid silk gowns, and artisan leather craft.',
    imageUrl: '/images/hero_model.png'
  };

  constructor() {
    // No initialization from localStorage — data must come from API
  }

  // --- Products CRUD (From API only) ---
  public getProducts(): Product[] {
    return this.products;
  }

  public getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  public addProduct(product: Product) {
    this.products.unshift(product);
  }

  public updateProduct(updated: Product) {
    const idx = this.products.findIndex((p) => p.id === updated.id);
    if (idx !== -1) {
      this.products[idx] = updated;
    }
  }

  public deleteProduct(id: string) {
    this.products = this.products.filter((p) => p.id !== id);
  }

  // --- Users CRUD (From API only) ---
  public getUsers(): User[] {
    return this.users;
  }

  public addUser(user: User) {
    this.users.unshift(user);
  }

  public updateUser(updated: User) {
    const idx = this.users.findIndex((u) => u.id === updated.id);
    if (idx !== -1) {
      this.users[idx] = updated;
    }
  }

  public deleteUser(id: string) {
    this.users = this.users.filter((u) => u.id !== id);
  }

  // --- Orders CRUD (From API only) ---
  public getOrders(): Order[] {
    return this.orders;
  }

  public addOrder(order: Order) {
    this.orders.unshift(order);
  }

  public updateOrderStatus(id: string, status: Order['status']) {
    const order = this.orders.find((o) => o.id === id);
    if (order) {
      order.status = status;
    }
  }

  // --- Coupons CRUD (From API only) ---
  public getCoupons(): Coupon[] {
    return this.coupons;
  }

  public addCoupon(coupon: Coupon) {
    this.coupons.unshift(coupon);
  }

  public updateCoupon(coupon: Coupon) {
    const idx = this.coupons.findIndex((c) => c.code === coupon.code);
    if (idx !== -1) {
      this.coupons[idx] = coupon;
    }
  }

  public deleteCoupon(code: string) {
    this.coupons = this.coupons.filter((c) => c.code !== code);
  }

  // --- Bulk sync from API (replaces entire collection) ---
  public setProducts(products: Product[]) {
    this.products = products;
  }

  public setCoupons(coupons: Coupon[]) {
    this.coupons = coupons;
  }

  public setOrders(orders: Order[]) {
    this.orders = orders;
  }

  public setUsers(users: User[]) {
    this.users = users;
  }

  // --- Hero Config (From API only) ---
  public getHero(): HeroBannerConfig {
    return this.hero;
  }

  public updateHero(hero: HeroBannerConfig) {
    this.hero = { ...hero };
  }
}

export const db = new AtelierDatabase();
