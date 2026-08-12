// ─────────────────────────────────────────────────────────────
// API Client — talks to the Express + MySQL backend in /server
// ─────────────────────────────────────────────────────────────
// The base URL can be overridden with VITE_API_URL in a .env file
// at the project root. Defaults to the local dev server.

const API_BASE: string = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3306/api';

function getAuthToken(): string | null {
  return localStorage.getItem('atelier_auth_token');
}

export function setAuthToken(token: string | null) {
  if (token) localStorage.setItem('atelier_auth_token', token);
  else localStorage.removeItem('atelier_auth_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.error || message;
    } catch {
      /* ignore non-json error body */
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

export const api = {
  // ── Health ──
  health: () => request<{ status: string }>('/health'),

  // ── Auth ──
  login: (email: string, password: string) =>
    request<{ user: any; token: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (name: string, email: string, password: string) =>
    request<{ user: any; token: string }>('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  me: () => request<any>('/auth/me'),

  // ── Products ──
  getProducts: () => request<any[]>('/products'),
  createProduct: (product: any) => request<any>('/products', { method: 'POST', body: JSON.stringify(product) }),
  updateProduct: (id: string, product: any) => request<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(product) }),
  deleteProduct: (id: string) => request<{ success: boolean }>(`/products/${id}`, { method: 'DELETE' }),
  restockProduct: (id: string, qty: number) => request<any>(`/products/${id}/restock`, { method: 'PATCH', body: JSON.stringify({ qty }) }),

  // ── Users ──
  getUsers: () => request<any[]>('/users'),
  banUser: (id: string, isBanned: boolean) => request<{ success: boolean }>(`/users/${id}/ban`, { method: 'PATCH', body: JSON.stringify({ isBanned }) }),
  deleteUser: (id: string) => request<{ success: boolean }>(`/users/${id}`, { method: 'DELETE' }),
  updateProfile: (name: string, avatar?: string) =>
    request<any>('/users/profile', { method: 'PUT', body: JSON.stringify({ name, avatar }) }),
  changePassword: (oldPassword: string, newPassword: string) =>
    request<{ success: boolean }>('/users/change-password', { method: 'PUT', body: JSON.stringify({ oldPassword, newPassword }) }),

  // ── Coupons ──
  getCoupons: () => request<any[]>('/coupons'),
  validateCoupon: (code: string) => request<{ code: string; discountPercent: number }>('/coupons/validate', { method: 'POST', body: JSON.stringify({ code }) }),
  createCoupon: (code: string, discountPercent: number) => request<any>('/coupons', { method: 'POST', body: JSON.stringify({ code, discountPercent }) }),
  deleteCoupon: (code: string) => request<{ success: boolean }>(`/coupons/${code}`, { method: 'DELETE' }),

  // ── Orders ──
  getOrders: () => request<any[]>('/orders'),
  placeOrder: (payload: any) => request<any>('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  updateOrderStatus: (id: string, status: string) => request<{ success: boolean }>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // ── Payments ──
  initiateJazzCash: (orderId: string, mobileNumber: string) =>
    request<{ gatewayUrl: string; params: Record<string, string> }>('/payments/jazzcash/initiate', {
      method: 'POST',
      body: JSON.stringify({ orderId, mobileNumber })
    }),
  initiateEasyPaisa: (orderId: string) =>
    request<{ gatewayUrl: string; params: Record<string, string> }>('/payments/easypaisa/initiate', {
      method: 'POST',
      body: JSON.stringify({ orderId })
    }),
  getPaymentStatus: (orderId: string) => request<{ paymentStatus: string; orderStatus: string }>(`/payments/status/${orderId}`),

  // ── Hero Banner ──
  getHero: () => request<any>('/hero'),
  updateHero: (hero: any) => request<any>('/hero', { method: 'PUT', body: JSON.stringify(hero) })
};

/** Submits a set of params to an external URL as a real HTML form POST
 *  (required for JazzCash/EasyPaisa hosted checkout — this actually
 *  navigates the browser to their payment page). */
export function redirectToGateway(gatewayUrl: string, params: Record<string, string>) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = gatewayUrl;

  Object.entries(params).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = String(value ?? '');
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}
