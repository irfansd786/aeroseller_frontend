import axios from 'axios';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_BRANDS, type Product, type Category, type Brand } from '../data/mockData';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 4000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Helper for localStorage initializations
const getStoredData = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(`aeroseller_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    return fallback;
  }
};

const setStoredData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(`aeroseller_${key}`, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save ${key} to localStorage:`, err);
  }
};

export const apiService = {
  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      const res = await apiClient.get('/categories');
      return res.data;
    } catch (error) {
      return getStoredData('categories', INITIAL_CATEGORIES);
    }
  },

  // Products
  async getProducts(params?: { category?: string; search?: string; brand?: string; discount?: number }): Promise<Product[]> {
    try {
      const res = await apiClient.get('/products', { params });
      return res.data;
    } catch (error) {
      let products = getStoredData('products', INITIAL_PRODUCTS);
      
      if (params?.category) {
        products = products.filter(p => p.category.toLowerCase() === params.category?.toLowerCase());
      }
      if (params?.brand) {
        products = products.filter(p => p.brand.toLowerCase() === params.brand?.toLowerCase());
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        products = products.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );
      }
      return products;
    }
  },

  async getProductById(id: string): Promise<Product> {
    try {
      const res = await apiClient.get(`/products/${id}`);
      return res.data;
    } catch (error) {
      const products = getStoredData('products', INITIAL_PRODUCTS);
      const match = products.find(p => p.id === id);
      if (!match) {
        throw new Error('Product not found');
      }
      return match;
    }
  },

  // Brands
  async getBrands(): Promise<Brand[]> {
    try {
      const res = await apiClient.get('/brands');
      return res.data;
    } catch (error) {
      return getStoredData('brands', INITIAL_BRANDS);
    }
  },

  // Wishlist
  async getWishlist(): Promise<string[]> {
    try {
      const res = await apiClient.get('/profile');
      return res.data.wishlist || [];
    } catch (error) {
      return getStoredData('wishlist', ['prod-iphone15', 'prod-airpods-pro']);
    }
  },

  async toggleWishlist(productId: string): Promise<string[]> {
    let current = await this.getWishlist();
    if (current.includes(productId)) {
      current = current.filter(id => id !== productId);
      try { await apiClient.delete(`/wishlist/${productId}`); } catch (e) {}
    } else {
      current.push(productId);
      try { await apiClient.post('/wishlist', { productId }); } catch (e) {}
    }
    setStoredData('wishlist', current);
    return current;
  },

  // Cart
  async getCart(): Promise<any[]> {
    try {
      const res = await apiClient.get('/profile');
      return res.data.cart || [];
    } catch (error) {
      return getStoredData('cart', []);
    }
  },

  async syncCart(cartItems: any[]): Promise<any[]> {
    setStoredData('cart', cartItems);
    try {
      await apiClient.post('/cart', { cart: cartItems });
    } catch (e) {}
    return cartItems;
  },

  // Submit Review
  async submitReview(productId: string, review: { user: string; rating: number; comment: string }): Promise<any> {
    try {
      const res = await apiClient.post(`/products/${productId}/reviews`, review);
      return res.data;
    } catch (error) {
      const products = getStoredData('products', INITIAL_PRODUCTS);
      const prodIndex = products.findIndex(p => p.id === productId);
      if (prodIndex !== -1) {
        const newReview = {
          id: `rev-${Date.now()}`,
          user: review.user,
          rating: review.rating,
          comment: review.comment,
          date: new Date().toISOString().split('T')[0]
        };
        products[prodIndex].reviews = products[prodIndex].reviews || [];
        products[prodIndex].reviews.push(newReview);
        products[prodIndex].reviewsCount = products[prodIndex].reviews.length;
        setStoredData('products', products);
        return { success: true, review: newReview };
      }
      throw error;
    }
  }
};
