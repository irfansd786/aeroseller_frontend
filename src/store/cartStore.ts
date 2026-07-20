import { create } from 'zustand';
import axios from 'axios';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  discount: number;
  quantity: number;
  image: string;
}

interface CartState {
  items: CartItem[];
  coupon: { code: string; value: number; discountType: string } | null;
  loading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  applyCoupon: (code: string) => Promise<boolean>;
  clearCart: () => Promise<void>;
}

const API_URL = 'http://localhost:5000/api';

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  coupon: null,
  loading: false,
  error: null,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const res = await axios.get(`${API_URL}/profile`);
      set({ items: res.data.cart || [], loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  addItem: async (item) => {
    const currentItems = get().items;
    const existingIndex = currentItems.findIndex(i => i.productId === item.productId);
    let newItems = [...currentItems];

    if (existingIndex > -1) {
      newItems[existingIndex].quantity += item.quantity;
    } else {
      newItems.push(item);
    }

    set({ items: newItems });
    try {
      await axios.post(`${API_URL}/cart`, { cart: newItems });
    } catch (err) {
      console.error("Cart sync failed:", err);
    }
  },

  removeItem: async (productId) => {
    const newItems = get().items.filter(i => i.productId !== productId);
    set({ items: newItems });
    try {
      await axios.post(`${API_URL}/cart`, { cart: newItems });
    } catch (err) {
      console.error("Cart sync failed:", err);
    }
  },

  updateQuantity: async (productId, quantity) => {
    const newItems = get().items.map(item => {
      if (item.productId === productId) {
        return { ...item, quantity };
      }
      return item;
    });
    set({ items: newItems });
    try {
      await axios.post(`${API_URL}/cart`, { cart: newItems });
    } catch (err) {
      console.error("Cart sync failed:", err);
    }
  },

  applyCoupon: async (code) => {
    const coupons = [
      { code: "SAVE10", discountType: "percentage", value: 10 },
      { code: "WELCOME20", discountType: "fixed", value: 20 }
    ];
    const match = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (match) {
      set({ coupon: match });
      return true;
    }
    return false;
  },

  clearCart: async () => {
    set({ items: [], coupon: null });
    try {
      await axios.post(`${API_URL}/cart`, { cart: [] });
    } catch (err) {
      console.error("Cart clear failed:", err);
    }
  }
}));
