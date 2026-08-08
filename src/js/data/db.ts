import { PRODUCTS_DATA } from './products';
import type { Product } from './products';
import type { Order, Coupon, User, HeroBannerConfig } from './types';

const STORAGE_KEYS = {
  PRODUCTS: 'atelier_db_products',
  USERS: 'atelier_db_users',
  ORDERS: 'atelier_db_orders',
  COUPONS: 'atelier_db_coupons',
  HERO: 'atelier_db_hero',
  CURRENT_USER: 'atelier_db_current_user'
};

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
    this.initDatabase();
  }

  private initDatabase() {
    try {
      const savedProds = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (savedProds) {
        this.products = JSON.parse(savedProds);
      } else {
        this.products = [...PRODUCTS_DATA];
        this.saveProducts();
      }

      const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      if (savedUsers) {
        this.users = JSON.parse(savedUsers);
      } else {
        this.users = [
          {
            id: 'usr-admin',
            email: 'atif@admin.com',
            name: 'Atelier Administrator',
            role: 'ADMIN',
            avatar: '/images/hero_model.png',
            registeredAt: 'Jan 01, 2026 10:00 AM',
            lastLoginAt: new Date().toLocaleString(),
            isBanned: false,
            password: 'atif@access.com'
          },
          {
            id: 'usr-001',
            email: 'eleanor@vance.com',
            name: 'Eleanor Vance',
            role: 'USER',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            registeredAt: 'Feb 12, 2026 02:30 PM',
            lastLoginAt: 'Feb 14, 2026 09:15 AM',
            isBanned: false,
            password: 'Password123!'
          }
        ];
        this.saveUsers();
      }

      const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (savedOrders) {
        this.orders = JSON.parse(savedOrders);
      } else {
        this.orders = [];
        this.saveOrders();
      }

      const savedCoupons = localStorage.getItem(STORAGE_KEYS.COUPONS);
      if (savedCoupons) {
        this.coupons = JSON.parse(savedCoupons);
      } else {
        this.coupons = [
          { code: 'ATELIER10', discountPercent: 10, isUsed: false },
          { code: 'LUXE20', discountPercent: 20, isUsed: false },
          { code: 'SPRING500', discountPercent: 15, isUsed: false }
        ];
        this.saveCoupons();
      }

      const savedHero = localStorage.getItem(STORAGE_KEYS.HERO);
      if (savedHero) {
        this.hero = JSON.parse(savedHero);
      } else {
        this.saveHero();
      }
    } catch (e) {
      console.error('Failed to initialize Atelier Database:', e);
    }
  }

  // --- Save helpers ---
  public saveProducts() {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
  }

  public saveUsers() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
  }

  public saveOrders() {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(this.orders));
  }

  public saveCoupons() {
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(this.coupons));
  }

  public saveHero() {
    localStorage.setItem(STORAGE_KEYS.HERO, JSON.stringify(this.hero));
  }

  // --- Products CRUD ---
  public getProducts(): Product[] {
    return this.products;
  }

  public getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  public addProduct(product: Product) {
    this.products.unshift(product);
    this.saveProducts();
  }

  public updateProduct(updated: Product) {
    const idx = this.products.findIndex((p) => p.id === updated.id);
    if (idx !== -1) {
      this.products[idx] = updated;
      this.saveProducts();
    }
  }

  public deleteProduct(id: string) {
    this.products = this.products.filter((p) => p.id !== id);
    this.saveProducts();
  }

  // --- Users CRUD ---
  public getUsers(): User[] {
    return this.users;
  }

  public addUser(user: User) {
    this.users.unshift(user);
    this.saveUsers();
  }

  public updateUser(updated: User) {
    const idx = this.users.findIndex((u) => u.id === updated.id);
    if (idx !== -1) {
      this.users[idx] = updated;
      this.saveUsers();
    }
  }

  public deleteUser(id: string) {
    this.users = this.users.filter((u) => u.id !== id);
    this.saveUsers();
  }

  // --- Orders CRUD ---
  public getOrders(): Order[] {
    return this.orders;
  }

  public addOrder(order: Order) {
    this.orders.unshift(order);
    this.saveOrders();
  }

  public updateOrderStatus(id: string, status: Order['status']) {
    const order = this.orders.find((o) => o.id === id);
    if (order) {
      order.status = status;
      this.saveOrders();
    }
  }

  // --- Coupons CRUD ---
  public getCoupons(): Coupon[] {
    return this.coupons;
  }

  public addCoupon(coupon: Coupon) {
    this.coupons.unshift(coupon);
    this.saveCoupons();
  }

  public updateCoupon(coupon: Coupon) {
    const idx = this.coupons.findIndex((c) => c.code === coupon.code);
    if (idx !== -1) {
      this.coupons[idx] = coupon;
      this.saveCoupons();
    }
  }

  public deleteCoupon(code: string) {
    this.coupons = this.coupons.filter((c) => c.code !== code);
    this.saveCoupons();
  }

  // --- Hero Config ---
  public getHero(): HeroBannerConfig {
    return this.hero;
  }

  public updateHero(hero: HeroBannerConfig) {
    this.hero = { ...hero };
    this.saveHero();
  }
}

export const db = new AtelierDatabase();
