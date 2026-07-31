import { create } from 'zustand';
import { apiService } from '../services/api';

interface WishlistState {
  items: string[]; // array of productIds
  loading: boolean;
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  hasItem: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: ['prod-iphone15', 'prod-airpods-pro'],
  loading: false,

  fetchWishlist: async () => {
    set({ loading: true });
    try {
      const list = await apiService.getWishlist();
      set({ items: list || [], loading: false });
    } catch (err) {
      console.error("Wishlist fetch error:", err);
      set({ loading: false });
    }
  },

  toggleWishlist: async (productId) => {
    try {
      const updated = await apiService.toggleWishlist(productId);
      set({ items: updated });
    } catch (err) {
      // optimistic toggle fallback
      const isFav = get().items.includes(productId);
      const newItems = isFav
        ? get().items.filter(id => id !== productId)
        : [...get().items, productId];
      set({ items: newItems });
    }
  },

  hasItem: (productId) => {
    return get().items.includes(productId);
  }
}));
