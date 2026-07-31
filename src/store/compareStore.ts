import { create } from 'zustand';
import type { Product } from '../data/mockData';

interface CompareState {
  comparedProducts: Product[];
  isOpen: boolean;
  toggleCompare: (product: Product) => void;
  removeProduct: (productId: string) => void;
  clearCompare: () => void;
  setIsOpen: (isOpen: boolean) => void;
  isCompared: (productId: string) => boolean;
}

export const useCompareStore = create<CompareState>((set, get) => ({
  comparedProducts: [],
  isOpen: false,

  toggleCompare: (product) => {
    const current = get().comparedProducts;
    const exists = current.some(p => p.id === product.id);

    if (exists) {
      set({ comparedProducts: current.filter(p => p.id !== product.id) });
    } else {
      if (current.length >= 4) {
        const updated = [...current.slice(1), product];
        set({ comparedProducts: updated, isOpen: true });
      } else {
        set({ comparedProducts: [...current, product], isOpen: true });
      }
    }
  },

  removeProduct: (productId) => {
    set({ comparedProducts: get().comparedProducts.filter(p => p.id !== productId) });
  },

  clearCompare: () => {
    set({ comparedProducts: [], isOpen: false });
  },

  setIsOpen: (isOpen) => {
    set({ isOpen });
  },

  isCompared: (productId) => {
    return get().comparedProducts.some(p => p.id === productId);
  }
}));
