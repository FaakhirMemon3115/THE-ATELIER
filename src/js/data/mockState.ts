import { PRODUCTS_DATA } from './products';
import type { Product } from './products';

export interface CartItem {
  id: string; // unique cart item key
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  paymentMethod: string;
  status: 'Pending' | 'Confirmed' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';
  estimatedDelivery: string;
}

class AppStore {
  private listeners: Function[] = [];

  // State
  public activeRoute: 'home' | 'shop' | 'checkout' | 'account' | 'admin' = 'home';
  public selectedProductForModal: Product | null = null;
  public cart: CartItem[] = [];
  public wishlist: string[] = ['prod-001', 'prod-003']; // pre-populated wishlist items
  public appliedCoupon: { code: string; discountPercent: number } | null = null;
  public activeMood: 'ALL' | 'CONFIDENT' | 'ROMANTIC' | 'MINIMAL' | 'BOLD' = 'ALL';
  public dayNightTime: number = 10; // 10 = 10 AM (day), 22 = 10 PM (night)
  public styleDnaResult: string | null = null;

  // User Session
  public user = {
    name: 'Ayesha Khan',
    email: 'ayesha.khan@atelier.com',
    phone: '+92 300 1234567',
    address: 'Penthouse 14B, Ocean Towers, Clifton Block 5',
    city: 'Karachi',
    postalCode: '75500'
  };

  // Orders History
  public orders: Order[] = [
    {
      id: 'ORD-2026-00125',
      date: '06 August 2026',
      items: [
        {
          id: 'item-1',
          product: PRODUCTS_DATA[0],
          quantity: 1,
          selectedSize: 'M',
          selectedColor: 'Noir Black'
        },
        {
          id: 'item-2',
          product: PRODUCTS_DATA[2],
          quantity: 1,
          selectedSize: 'One Size',
          selectedColor: 'Champagne Gold'
        }
      ],
      subtotal: 12499,
      discount: 1249,
      shipping: 0,
      total: 11250,
      customerName: 'Ayesha Khan',
      email: 'ayesha.khan@atelier.com',
      phone: '+92 300 1234567',
      address: 'Penthouse 14B, Ocean Towers, Clifton Block 5',
      city: 'Karachi',
      paymentMethod: 'Credit Card',
      status: 'Shipped',
      estimatedDelivery: '12 August 2026'
    }
  ];

  // Admin Data
  public adminStats = {
    totalSales: 1245500,
    totalOrders: 328,
    totalCustomers: 1842,
    totalProducts: PRODUCTS_DATA.length
  };

  public productsList: Product[] = [...PRODUCTS_DATA];

  constructor() {
    // Load pre-added item into cart for demonstration
    this.cart.push({
      id: 'cart-demo-1',
      product: PRODUCTS_DATA[0],
      quantity: 1,
      selectedSize: 'M',
      selectedColor: 'Noir Black'
    });
  }

  // Subscribe to changes
  public subscribe(fn: Function) {
    this.listeners.push(fn);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // Navigation
  public navigateTo(route: 'home' | 'shop' | 'checkout' | 'account' | 'admin') {
    this.activeRoute = route;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.notify();
  }

  // Product Modal
  public openProductModal(product: Product) {
    this.selectedProductForModal = product;
    this.notify();
  }

  public closeProductModal() {
    this.selectedProductForModal = null;
    this.notify();
  }

  // Cart Management
  public addToCart(product: Product, quantity = 1, size = 'M', color = 'Default') {
    const existingIndex = this.cart.findIndex(
      (item) => item.product.id === product.id && item.selectedSize === size && item.selectedColor === color
    );

    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += quantity;
    } else {
      this.cart.push({
        id: `cart-${Date.now()}-${Math.random()}`,
        product,
        quantity,
        selectedSize: size,
        selectedColor: color
      });
    }

    this.notify();
    this.showToast(`Added "${product.name}" to your Atelier Bag`);
  }

  public updateCartQuantity(cartItemId: string, delta: number) {
    const item = this.cart.find((i) => i.id === cartItemId);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        this.cart = this.cart.filter((i) => i.id !== cartItemId);
      }
    }
    this.notify();
  }

  public removeFromCart(cartItemId: string) {
    this.cart = this.cart.filter((i) => i.id !== cartItemId);
    this.notify();
  }

  public getCartSubtotal(): number {
    return this.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  public getDiscountAmount(): number {
    if (!this.appliedCoupon) return 0;
    return Math.round((this.getCartSubtotal() * this.appliedCoupon.discountPercent) / 100);
  }

  public getShippingFee(): number {
    const subtotal = this.getCartSubtotal();
    if (subtotal >= 5000 || subtotal === 0) return 0; // Free delivery over Rs 5,000
    return 250;
  }

  public getCartTotal(): number {
    return this.getCartSubtotal() - this.getDiscountAmount() + this.getShippingFee();
  }

  public applyCouponCode(code: string): boolean {
    if (code.trim().toUpperCase() === 'ATELIER10') {
      this.appliedCoupon = { code: 'ATELIER10', discountPercent: 10 };
      this.notify();
      this.showToast('Coupon "ATELIER10" applied! 10% discount subtracted.');
      return true;
    }
    return false;
  }

  // Wishlist
  public toggleWishlist(productId: string) {
    if (this.wishlist.includes(productId)) {
      this.wishlist = this.wishlist.filter((id) => id !== productId);
      this.showToast('Removed from your Wishlist ❤️');
    } else {
      this.wishlist.push(productId);
      this.showToast('Saved to your Wishlist ❤️');
    }
    this.notify();
  }

  // Orders
  public placeOrder(orderData: Partial<Order>): Order {
    const newOrder: Order = {
      id: `ORD-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
      items: [...this.cart],
      subtotal: this.getCartSubtotal(),
      discount: this.getDiscountAmount(),
      shipping: this.getShippingFee(),
      total: this.getCartTotal(),
      customerName: orderData.customerName || this.user.name,
      email: orderData.email || this.user.email,
      phone: orderData.phone || this.user.phone,
      address: orderData.address || this.user.address,
      city: orderData.city || this.user.city,
      paymentMethod: orderData.paymentMethod || 'Cash on Delivery',
      status: 'Confirmed',
      estimatedDelivery: '3 - 5 Business Days'
    };

    this.orders.unshift(newOrder);
    this.cart = []; // clear cart
    this.appliedCoupon = null;
    this.notify();
    return newOrder;
  }

  // Admin Product Actions
  public addProduct(product: Product) {
    this.productsList.unshift(product);
    this.adminStats.totalProducts = this.productsList.length;
    this.notify();
    this.showToast(`Product "${product.name}" added to Atelier inventory.`);
  }

  public updateOrderStatus(orderId: string, status: Order['status']) {
    const order = this.orders.find((o) => o.id === orderId);
    if (order) {
      order.status = status;
      this.notify();
      this.showToast(`Order ${orderId} updated to status "${status}".`);
    }
  }

  // Toast Notification Dispatcher
  public showToast(msg: string) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-sparkles text-gold"></i> <span>${msg}</span>`;
    container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 50);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

export const store = new AppStore();
