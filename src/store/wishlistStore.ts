import { create } from 'zustand';
import axios from 'axios';

interface WishlistState {
  items: string[]; // array of productIds
  loading: boolean;
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  hasItem: (productId: string) => boolean;
}

const API_URL = 'http://localhost:5000/api';

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  loading: false,

  fetchWishlist: async () => {
    set({ loading: true });
    try {
      const res = await axios.get(`${API_URL}/profile`);
      set({ items: res.data.wishlist || [], loading: false });
    } catch (err) {
      console.error("Wishlist fetch failed:", err);
      set({ loading: false });
    }
  },

  toggleWishlist: async (productId) => {
    const isFav = get().items.includes(productId);
    let newItems = [];
    if (isFav) {
      newItems = get().items.filter(id => id !== productId);
      set({ items: newItems });
      try {
        await axios.delete(`${API_URL}/wishlist/${productId}`);
      } catch (err) {
        console.error("Remove from wishlist failed:", err);
      }
    } else {
      newItems = [...get().items, productId];
      set({ items: newItems });
      try {
        await axios.post(`${API_URL}/wishlist`, { productId });
      } catch (err) {
        console.error("Add to wishlist failed:", err);
      }
    }
  },

  hasItem: (productId) => {
    return get().items.includes(productId);
  }
}));
