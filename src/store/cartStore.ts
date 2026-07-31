import { create } from 'zustand';
import { apiService } from '../services/api';
import { PROMO_COUPONS } from '../data/mockData';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  discount: number;
  quantity: number;
  image: string;
  selectedColor?: string;
  selectedVariant?: string;
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

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  coupon: null,
  loading: false,
  error: null,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const cartItems = await apiService.getCart();
      set({ items: cartItems || [], loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  addItem: async (item) => {
    const currentItems = get().items;
    const existingIndex = currentItems.findIndex(
      i => i.productId === item.productId &&
           i.selectedColor === item.selectedColor &&
           i.selectedVariant === item.selectedVariant
    );
    let newItems = [...currentItems];

    if (existingIndex > -1) {
      newItems[existingIndex].quantity += item.quantity;
    } else {
      newItems.push(item);
    }

    set({ items: newItems });
    await apiService.syncCart(newItems);
  },

  removeItem: async (productId) => {
    const newItems = get().items.filter(i => i.productId !== productId);
    set({ items: newItems });
    await apiService.syncCart(newItems);
  },

  updateQuantity: async (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    const newItems = get().items.map(item => {
      if (item.productId === productId) {
        return { ...item, quantity };
      }
      return item;
    });
    set({ items: newItems });
    await apiService.syncCart(newItems);
  },

  applyCoupon: async (code) => {
    const match = PROMO_COUPONS.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
    if (match) {
      set({ coupon: { code: match.code, value: match.value, discountType: match.discountType } });
      return true;
    }
    return false;
  },

  clearCart: async () => {
    set({ items: [], coupon: null });
    await apiService.syncCart([]);
  }
}));
