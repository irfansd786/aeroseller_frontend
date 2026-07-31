import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingCart, User, Sun, Moon, Menu, X, ArrowRight, Bell, ChevronDown, Store, HelpCircle, PackageCheck, Sparkles, ShoppingBag } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { NotificationsPopover } from './NotificationsPopover';
import { apiService } from '../services/api';
import { formatINR } from '../utils/currency';
import { INITIAL_CATEGORIES, type Product } from '../data/mockData';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useThemeStore();
  const { items: cartItems } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { token, logout, user } = useAuthStore();
  const { notifications } = useNotificationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSearchCat, setSelectedSearchCat] = useState('All Categories');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(['iPhone 15', 'MacBook Air M3', 'Nike Air Max']);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    apiService.getProducts()
      .then(res => setAllProducts(res))
      .catch(err => console.error("Error loading products for search suggestions", err));
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length < 1) {
      setSuggestions([]);
      return;
    }
    const filtered = allProducts.filter(p => {
      const matchQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedSearchCat === 'All Categories' || p.category.toLowerCase() === selectedSearchCat.toLowerCase();
      return matchQuery && matchCat;
    }).slice(0, 6);
    setSuggestions(filtered);
  }, [searchQuery, selectedSearchCat, allProducts]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (!recentSearches.includes(searchQuery.trim())) {
        setRecentSearches([searchQuery.trim(), ...recentSearches.slice(0, 4)]);
      }
      setShowSuggestions(false);
      const catParam = selectedSearchCat !== 'All Categories' ? `&category=${selectedSearchCat.toLowerCase()}` : '';
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}${catParam}`);
    }
  };

  const handleSuggestionClick = (prodId: string) => {
    setSearchQuery('');
    setShowSuggestions(false);
    navigate(`/product/${prodId}`);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartValue = cartItems.reduce((acc, item) => acc + (item.price * (1 - item.discount / 100) * item.quantity), 0);
  const unreadNotifCount = notifications.filter(n => n.unread).length;

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-neutral-900 text-neutral-300 text-[11px] py-1.5 px-4 sm:px-8 flex items-center justify-between border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-medium">Super Value Deals - Save more with <strong className="text-white">AeroSeller</strong>!</span>
        </div>
        <div className="hidden md:flex items-center gap-6 font-medium">
          <a href="http://localhost:5174" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
            <Store className="w-3 h-3" /> Become a Seller
          </a>
          <Link to="/profile?tab=orders" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
            <PackageCheck className="w-3 h-3" /> Track Order
          </Link>
          <a href="#help" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
            <HelpCircle className="w-3 h-3" /> Help & Support
          </a>
        </div>
      </div>

      {/* 2. MAIN HEADER */}
      <div className={`w-full bg-white dark:bg-zinc-950 border-b border-neutral-200 dark:border-zinc-850 backdrop-blur-xl transition-all duration-300 ${
        isScrolled ? 'py-2 shadow-md' : 'py-3.5 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-600/30 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tight text-neutral-900 dark:text-white leading-none">
                Aero<span className="text-emerald-600">Seller</span>
              </span>
              <span className="text-[9px] font-bold text-neutral-400 tracking-widest uppercase">Premium Marketplace</span>
            </div>
          </Link>

          {/* Search Bar */}
          <div ref={searchRef} className="hidden md:flex flex-grow max-w-2xl relative">
            <form onSubmit={handleSearchSubmit} className="w-full flex items-center bg-neutral-100 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl overflow-hidden focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/20 transition-all">
              
              <div className="relative border-r border-neutral-200 dark:border-zinc-800 px-3 py-2 bg-neutral-50 dark:bg-zinc-950 flex items-center gap-1 text-xs font-bold text-neutral-700 dark:text-zinc-300 flex-shrink-0">
                <select
                  value={selectedSearchCat}
                  onChange={(e) => setSelectedSearchCat(e.target.value)}
                  className="bg-transparent focus:outline-none cursor-pointer pr-4 font-semibold text-neutral-700 dark:text-zinc-300"
                >
                  <option value="All Categories">All Categories</option>
                  {INITIAL_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                placeholder="Search products, brands, categories..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full bg-transparent text-neutral-900 dark:text-white placeholder:text-neutral-400 px-4 py-2.5 text-xs focus:outline-none"
              />

              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-neutral-100 dark:divide-zinc-850">
                {suggestions.length > 0 ? (
                  <div className="p-2 space-y-1">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-3 py-1 block">Matching Products</span>
                    {suggestions.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSuggestionClick(item.id)}
                        className="w-full text-left p-2 hover:bg-neutral-50 dark:hover:bg-zinc-800/60 rounded-xl flex items-center gap-3 transition-colors text-xs text-neutral-800 dark:text-zinc-200"
                      >
                        <img src={item.images[0]} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                        <div className="flex-grow min-w-0">
                          <p className="font-bold truncate">{item.name}</p>
                          <span className="text-[10px] text-neutral-400 capitalize">{item.brand} • {item.category}</span>
                        </div>
                        <span className="font-black text-emerald-600 flex-shrink-0">{formatINR(item.price * (1 - item.discount / 100))}</span>
                      </button>
                    ))}
                  </div>
                ) : searchQuery.trim().length > 0 ? (
                  <div className="p-4 text-center text-xs text-neutral-400">No matching products found</div>
                ) : null}

                {recentSearches.length > 0 && searchQuery.trim().length === 0 && (
                  <div className="p-3">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">Recent Searches</span>
                    <div className="flex flex-wrap gap-1.5">
                      {recentSearches.map((term, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSearchQuery(term);
                            setShowSuggestions(true);
                          }}
                          className="text-xs bg-neutral-100 dark:bg-zinc-800 hover:bg-neutral-200 dark:hover:bg-zinc-700 text-neutral-700 dark:text-zinc-300 px-3 py-1 rounded-full transition-colors cursor-pointer"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Toggle Dark Mode"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div ref={notifRef} className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2.5 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-zinc-800 relative transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadNotifCount}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <NotificationsPopover onClose={() => setNotificationsOpen(false)} />
              )}
            </div>

            <Link
              to="/profile?tab=wishlist"
              className="p-2.5 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-zinc-800 relative transition-colors"
              title="Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlistItems.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors relative"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 bg-emerald-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {totalCartCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[9px] uppercase font-bold text-neutral-400 leading-none">Cart</span>
                <span className="text-xs font-black leading-tight">{formatINR(totalCartValue)}</span>
              </div>
            </Link>

            <div ref={profileRef} className="relative">
              {token ? (
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-500 hidden sm:block" />
                </button>
              ) : (
                <Link
                  to="/auth"
                  className="hidden sm:flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-2xl font-bold text-xs shadow-md shadow-emerald-600/20 transition-all hover:scale-105"
                >
                  Login <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}

              {profileDropdownOpen && token && (
                <div className="absolute right-0 mt-3 w-52 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-neutral-100 dark:divide-zinc-850">
                  <div className="p-3.5 bg-neutral-50 dark:bg-zinc-950">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase">Signed in as</p>
                    <p className="text-xs font-bold truncate text-neutral-900 dark:text-white">{user?.name}</p>
                    <p className="text-[10px] text-neutral-500 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1 text-xs font-medium text-neutral-700 dark:text-zinc-300">
                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="block px-4 py-2 hover:bg-neutral-50 dark:hover:bg-zinc-800/60"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/profile?tab=orders"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="block px-4 py-2 hover:bg-neutral-50 dark:hover:bg-zinc-800/60"
                    >
                      Orders & Tracking
                    </Link>
                    <Link
                      to="/profile?tab=wishlist"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="block px-4 py-2 hover:bg-neutral-50 dark:hover:bg-zinc-800/60"
                    >
                      Wishlist ({wishlistItems.length})
                    </Link>
                    <a
                      href="http://localhost:5174"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 hover:bg-neutral-50 dark:hover:bg-zinc-800/60 text-emerald-600 font-bold"
                    >
                      Seller Portal
                    </a>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-neutral-50 dark:hover:bg-zinc-800/60 cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden rounded-full text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-zinc-900"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* 3. SUB-HEADER CATEGORY NAV BAR */}
      <div className="hidden md:block bg-neutral-50 dark:bg-zinc-900 border-b border-neutral-200/80 dark:border-zinc-800 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-zinc-300">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            {INITIAL_CATEGORIES.map(cat => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap"
              >
                {cat.name}
              </Link>
            ))}
          </div>
          <Link to="/products?discount=20" className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1 hover:underline flex-shrink-0">
            Mega Sale Offers <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 space-y-4 shadow-xl">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-100 dark:bg-zinc-900 text-neutral-900 dark:text-white pl-4 pr-10 py-2 rounded-2xl text-xs focus:outline-none"
            />
            <button type="submit" className="absolute right-3 top-2 text-neutral-400">
              <Search className="w-4 h-4" />
            </button>
          </form>

          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-xl bg-neutral-100 dark:bg-zinc-900">All Products</Link>
            <Link to="/profile?tab=orders" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-xl bg-neutral-100 dark:bg-zinc-900">Orders</Link>
            <Link to="/profile?tab=wishlist" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-xl bg-neutral-100 dark:bg-zinc-900">Wishlist ({wishlistItems.length})</Link>
            <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-xl bg-neutral-100 dark:bg-zinc-900">Cart ({totalCartCount})</Link>
          </div>
        </div>
      )}

    </header>
  );
};
