import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingCart, User, Sun, Moon, Menu, X, ArrowRight } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';
import { signOutFirebase } from '../firebase';
import { formatINR } from '../utils/currency';

interface ProductSuggestion {
  id: string;
  name: string;
  category: string;
  price: number;
}

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useThemeStore();
  const { items: cartItems } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { token, logout, user } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<ProductSuggestion[]>([]);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Fetch all products on mount to facilitate instant auto-suggestions
  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(res => setAllProducts(res.data))
      .catch(err => console.error("Error loading products for suggestions", err));
  }, []);

  // Update suggestions based on query
  useEffect(() => {
    if (searchQuery.trim().length < 1) {
      setSuggestions([]);
      return;
    }
    const filtered = allProducts.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
    setSuggestions(filtered);
  }, [searchQuery, allProducts]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (prodId: string) => {
    setSearchQuery('');
    setShowSuggestions(false);
    navigate(`/product/${prodId}`);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-40 w-full bg-gradient-to-r from-sky-600 via-cyan-500 to-emerald-500 text-white backdrop-blur-xl shadow-2xl border-b border-white/20 transition-all duration-250">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20 gap-4 py-3">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <span className="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-xl shadow-xl shadow-white/20">A</span>
            <span className="font-extrabold text-2xl tracking-tight text-white">
              Aero<span className="text-sky-100">Cart</span>
            </span>
          </Link>

          {/* Search bar */}
          <div ref={searchRef} className="hidden md:flex flex-grow max-w-2xl relative">
            <form onSubmit={handleSearchSubmit} className="w-full flex items-center relative">
              <input
                type="text"
                placeholder="Search products, brands, categories..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full bg-white text-neutral-900 placeholder:text-slate-500 pl-5 pr-12 py-3 rounded-full border border-white/50 shadow-lg shadow-slate-900/10 focus:border-white focus:ring-2 focus:ring-white/30 focus:outline-none text-sm transition-all duration-200"
              />
              <button type="submit" className="absolute right-3 text-neutral-500 hover:text-primary transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-neutral-100 dark:divide-zinc-850">
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSuggestionClick(item.id)}
                    className="w-full text-left px-5 py-3 hover:bg-neutral-50 dark:hover:bg-zinc-800/50 flex items-center justify-between text-sm transition-colors text-zinc-700 dark:text-zinc-300"
                  >
                    <span>{item.name}</span>
                    <span className="text-xs text-neutral-400 dark:text-neutral-500 capitalize">{item.category} • {formatINR(item.price)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-3 rounded-full text-slate-700 hover:text-white bg-white/90 hover:bg-white shadow-sm transition-all duration-200"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Wishlist */}
            <Link
              to="/profile?tab=wishlist"
              className="p-3 rounded-full text-slate-700 hover:text-white bg-white/90 hover:bg-white shadow-sm relative transition-all duration-200"
            >
              <Heart className="w-5 h-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="p-3 rounded-full text-slate-700 hover:text-white bg-white/90 hover:bg-white shadow-sm relative transition-all duration-200"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div ref={profileRef} className="relative">
              {token ? (
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-semibold text-sm hover:bg-primary/20 transition-colors cursor-pointer"
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </button>
              ) : (
                <Link
                  to="/auth"
                  className="hidden sm:flex items-center gap-1.5 bg-white text-slate-900 px-4 py-2 rounded-full font-semibold text-xs hover:bg-slate-100 transition-all shadow-xl"
                >
                  Login <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}

              {/* Profile Dropdown Options */}
              {profileDropdownOpen && token && (
                <div className="absolute right-0 mt-2.5 w-48 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-neutral-100 dark:divide-zinc-850">
                  <div className="px-4 py-2.5">
                    <p className="text-xs text-neutral-400">Signed in as</p>
                    <p className="text-sm font-semibold truncate text-zinc-800 dark:text-zinc-100">{user?.name}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/profile?tab=orders"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300"
                    >
                      Orders History
                    </Link>
                    <a
                      href="http://localhost:5174"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-zinc-800/50 text-primary font-medium"
                    >
                      Seller Panel
                    </a>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        signOutFirebase().catch(() => null);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-neutral-50 dark:hover:bg-zinc-800/50"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden rounded-full text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-zinc-900"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile search & actions list */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200/50 dark:border-zinc-900/50 bg-white dark:bg-black p-4 flex flex-col gap-4">
          <form onSubmit={handleSearchSubmit} className="w-full relative">
            <input
              type="text"
              placeholder="Search products, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-100 dark:bg-zinc-900 text-neutral-900 dark:text-neutral-100 pl-4 pr-10 py-2.5 rounded-full focus:outline-none focus:bg-white text-sm"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-neutral-400">
              <Search className="w-5 h-5" />
            </button>
          </form>

          <div className="flex flex-col gap-2 font-medium">
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-sm"
            >
              All Products
            </Link>
            <Link
              to="/profile?tab=wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-sm"
            >
              Wishlist ({wishlistItems.length})
            </Link>
            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-sm"
            >
              Cart ({totalCartCount})
            </Link>
            {!token ? (
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="mx-4 mt-2 text-center bg-primary text-white py-2.5 rounded-full text-sm shadow-md"
              >
                Login / Register
              </Link>
            ) : (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-sm"
                >
                  My Profile
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOutFirebase().catch(() => null);
                    logout();
                  }}
                  className="text-left px-4 py-2 rounded-lg text-red-500 hover:bg-neutral-100 dark:hover:bg-zinc-900 text-sm"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
