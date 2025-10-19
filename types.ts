
export enum View {
  PRODUCT = 'product-view',
  PRODUCT_DETAIL = 'product-detail-view',
  CHECKOUT = 'checkout-view',
  ORDER_CONFIRMATION = 'order-confirmation-view',
  ADMIN = 'admin-view',
  ACCOUNT = 'account-view',
  WISHLIST = 'wishlist-view',
}

export interface Product {
  id: number;
  name: string;
  mainCategory: string;
  category: string;
  price: number;
  originalPrice?: number;
  stock: number;
  image: string;
  description: string;
  rating: number;
  reviewCount: number;
  sku: string;
  barcode: string;
  features: string[];
  tags: string[];
  isFeatured?: boolean;
}

export interface CartItem {
  id: number;
  quantity: number;
}

export interface Subcategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  subcategories: Subcategory[];
}

export interface User {
  id: string | number;
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin' | 'manager';
  phone?: string;
  address?: string;
  loyaltyPoints: number;
  paymentMethods?: SavedPaymentMethod[];
}

export interface Store {
  id: string | number;
  name: string;
  address: string;
  phone: string;
  hours: string;
  lat: string;
  lng: string;
}

export interface Order {
  id: string;
  userId?: string | number;
  customerName: string;
  date: string;
  total: number;
  status: 'Completado' | 'Pendiente' | 'Cancelado';
  items: CartItem[];
  delivery: {
    method: 'pickup' | 'shipping' | 'express';
    address?: string;
    storeId?: string | number;
  };
  paymentMethod: string;
}

export interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  startDate: string;
  endDate: string;
  usageLimit: number | null;
  usedCount: number;
  minOrder: number;
}

export interface Banner {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  image?: string;
  link?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'welcome' | 'promotion' | 'info' | 'success' | 'error' | 'warning';
}

export interface SavedPaymentMethod {
  id: string;
  last4: string;
  brand: string;
  expiry: string;
}
