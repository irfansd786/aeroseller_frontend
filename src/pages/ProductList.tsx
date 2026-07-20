import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '../components/ProductCard';

export const ProductList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1500 });
  const [minRating, setMinRating] = useState<number | null>(null);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [minDiscount, setMinDiscount] = useState<number>(0);
  const [sortBy, setSortBy] = useState('popularity');

  // Mobile Filter Drawer Toggle
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Sync with search params
  const fetchProducts = () => {
    setLoading(true);
    const categoryQuery = searchParams.get('category');
    const searchQuery = searchParams.get('search');
    const params: Record<string, string> = {};

    if (categoryQuery) params.category = categoryQuery;
    if (searchQuery) params.search = searchQuery;

    return Promise.all([
      axios.get('http://localhost:5000/api/categories'),
      axios.get('http://localhost:5000/api/products', { params })
    ])
      .then(([catRes, prodRes]) => {
        setCategories(catRes.data);
        setProducts(prodRes.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load products/filters:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
    const handleFocus = () => {
      fetchProducts();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [searchParams]);

  const resetAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange({ min: 0, max: 1500 });
    setMinRating(null);
    setOnlyInStock(false);
    setMinDiscount(0);
    setSortBy('popularity');
  };

  useEffect(() => {
    // Read from search params
    const categoryQuery = searchParams.get('category');
    const searchQuery = searchParams.get('search');

    if (searchQuery) {
      resetAllFilters();
      setCurrentPage(1);
    }

    if (categoryQuery) {
      setSelectedCategories([categoryQuery]);
    } else {
      setSelectedCategories([]);
    }
  }, [searchParams]);

  // Unique Brands calculation
  const allBrands = Array.from(new Set(products.map(p => p.brand)));

  // Filter & Sort Logic
  const filteredProducts = products
    .filter(p => {
      // Status check
      if (p.status !== 'active') return false;

      // Category check
      if (selectedCategories.length > 0 && !selectedCategories.includes(p.category)) {
        return false;
      }

      // Brand check
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) {
        return false;
      }

      // Search query check
      const searchQuery = searchParams.get('search')?.toLowerCase() || '';
      const categoryName = categories.find(cat => cat.id === p.category)?.name.toLowerCase() || p.category.toLowerCase();
      if (searchQuery &&
          !p.name.toLowerCase().includes(searchQuery) &&
          !p.brand.toLowerCase().includes(searchQuery) &&
          !p.description.toLowerCase().includes(searchQuery) &&
          !categoryName.includes(searchQuery) &&
          !p.category.toLowerCase().includes(searchQuery)) {
        return false;
      }

      // Price check (account for discount)
      const finalPrice = p.price * (1 - p.discount / 100);
      if (finalPrice < priceRange.min || finalPrice > priceRange.max) {
        return false;
      }

      // Rating check
      if (minRating !== null && p.rating < minRating) {
        return false;
      }

      // Availability check
      if (onlyInStock && p.quantity === 0) {
        return false;
      }

      // Discount check
      if (p.discount < minDiscount) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      const aPrice = a.price * (1 - a.discount / 100);
      const bPrice = b.price * (1 - b.discount / 100);

      switch (sortBy) {
        case 'newest':
          return b.id.localeCompare(a.id);
        case 'price-asc':
          return aPrice - bPrice;
        case 'price-desc':
          return bPrice - aPrice;
        case 'popularity':
        default:
          return b.rating - a.rating;
      }
    });

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange({ min: 0, max: 1500 });
    setMinRating(null);
    setOnlyInStock(false);
    setMinDiscount(0);
    setSortBy('popularity');
    setSearchParams({});
    setCurrentPage(1);
  };

  const handleCategoryChange = (catId: string) => {
    setCurrentPage(1);
    setSelectedCategories(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const handleBrandChange = (brand: string) => {
    setCurrentPage(1);
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  // Pagination bounds
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Search Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
            {searchParams.get('search') 
              ? `Search results for "${searchParams.get('search')}"` 
              : "Explore Catalog"
            }
          </h1>
          <p className="text-xs text-neutral-450 mt-1">
            Showing {filteredProducts.length} products
          </p>
        </div>

        {/* Sorting and mobile triggers */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-1.5 border border-neutral-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>

          <button
            onClick={fetchProducts}
            className="hidden md:inline-flex items-center gap-1.5 border border-neutral-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>

          <div className="flex items-center gap-2 border border-neutral-200 dark:border-zinc-800 rounded-xl px-3 py-2 bg-white dark:bg-zinc-900">
            <ArrowUpDown className="w-4 h-4 text-neutral-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none bg-transparent cursor-pointer"
            >
              <option value="popularity">Popularity</option>
              <option value="newest">Newest Arrival</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        
        {/* ==========================================
            DESKTOP SIDEBAR FILTERS
            ========================================== */}
        <div className="hidden lg:block w-64 flex-shrink-0 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-zinc-800 pb-4">
            <h3 className="font-extrabold text-sm text-neutral-800 dark:text-zinc-250">Filters</h3>
            <button onClick={handleResetFilters} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Reset All
            </button>
          </div>

          {/* Categories Filter */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400 mb-3">Category</h4>
            <div className="space-y-2">
              {categories.map(cat => (
                <label key={cat.id} className="flex items-center gap-2.5 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.id)}
                    onChange={() => handleCategoryChange(cat.id)}
                    className="accent-primary rounded w-4 h-4"
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400 mb-3">Price Limit</h4>
            <div className="space-y-3">
              <input
                type="range"
                min="0"
                max="1500"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                className="w-full accent-primary h-1 bg-neutral-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs font-bold text-neutral-500">
                <span>₹0</span>
                <span className="text-primary">₹{priceRange.max}</span>
              </div>
            </div>
          </div>

          {/* Brands Filter */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400 mb-3">Brand</h4>
            <div className="space-y-2">
              {allBrands.map(brand => (
                <label key={brand} className="flex items-center gap-2.5 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandChange(brand)}
                    className="accent-primary rounded w-4 h-4"
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400 mb-3">Minimum Rating</h4>
            <div className="flex flex-col gap-2">
              {[4.5, 4.0, 3.5].map(rating => (
                <button
                  key={rating}
                  onClick={() => setMinRating(minRating === rating ? null : rating)}
                  className={`text-left text-sm py-1.5 px-3 rounded-lg transition-colors border font-semibold ${
                    minRating === rating
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'border-neutral-100 dark:border-zinc-850 hover:bg-neutral-50 dark:hover:bg-zinc-850/50 text-zinc-650 dark:text-zinc-350'
                  }`}
                >
                  {rating}★ & Above
                </button>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400 mb-3">Stock Status</h4>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-zinc-700 dark:text-zinc-300">In Stock Only</span>
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="accent-primary rounded w-4 h-4"
              />
            </label>
          </div>

          {/* Discount */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400 mb-3">Discounts</h4>
            <div className="flex gap-2">
              {[5, 10, 15].map(disc => (
                <button
                  key={disc}
                  onClick={() => setMinDiscount(minDiscount === disc ? 0 : disc)}
                  className={`flex-1 text-center text-xs py-2 rounded-xl transition-all border font-semibold ${
                    minDiscount === disc
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'border-neutral-150 dark:border-zinc-800 hover:bg-neutral-50 dark:hover:bg-zinc-850/50 text-zinc-650 dark:text-zinc-350'
                  }`}
                >
                  {disc}%+ Off
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* ==========================================
            PRODUCTS LIST GRID & EMPTY STATE
            ========================================== */}
        <div className="flex-grow space-y-8">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-72 bg-neutral-100 dark:bg-zinc-900 rounded-[20px] animate-pulse" />
              ))}
            </div>
          ) : paginatedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-6 border-t border-neutral-100 dark:border-zinc-900">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-neutral-200 dark:border-zinc-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-transparent text-neutral-600 dark:text-zinc-400 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-extrabold text-neutral-800 dark:text-zinc-200">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-neutral-200 dark:border-zinc-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-transparent text-neutral-600 dark:text-zinc-400 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            // EMPTY STATE
            <div className="flex flex-col items-center justify-center text-center py-20 px-4 bg-neutral-50 dark:bg-zinc-950 border border-dashed border-neutral-200 dark:border-zinc-900 rounded-[28px] max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 animate-bounce">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-neutral-900 dark:text-white mb-2">No Matching Products</h3>
              <p className="text-xs text-neutral-500 mb-6 max-w-xs">
                We couldn't find any products fitting the current filters or query selection. Try relaxing your filters or resetting the view.
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-md transition-all hover:scale-105"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ==========================================
          MOBILE FILTER DRAWER / DIALOG
          ========================================== */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Backdrop */}
          <div onClick={() => setMobileFiltersOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          
          {/* Drawer Panel */}
          <div className="relative w-80 max-w-full bg-white dark:bg-zinc-950 h-full overflow-y-auto p-6 shadow-2xl flex flex-col gap-6 z-10 transition-transform">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-zinc-900 pb-4">
              <h3 className="font-extrabold text-sm text-neutral-850 dark:text-zinc-200">Refine Search</h3>
              <button onClick={() => setMobileFiltersOpen(false)} className="text-xs font-bold text-neutral-450 hover:underline">Done</button>
            </div>

            {/* Mobile Filters Body (identical to desktop) */}
            <div className="flex items-center justify-between">
              <button onClick={handleResetFilters} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Reset Filters
              </button>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400 mb-3">Category</h4>
              <div className="space-y-2">
                {categories.map(cat => (
                  <label key={cat.id} className="flex items-center gap-2.5 text-sm text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.id)}
                      onChange={() => handleCategoryChange(cat.id)}
                      className="accent-primary rounded w-4 h-4"
                    />
                    <span>{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400 mb-3">Price Limit</h4>
              <div className="space-y-3">
                <input
                  type="range"
                  min="0"
                  max="1500"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                  className="w-full accent-primary h-1 bg-neutral-250 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs font-bold text-neutral-500">
                  <span>₹0</span>
                  <span className="text-primary">₹{priceRange.max}</span>
                </div>
              </div>
            </div>

            {/* Brands */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400 mb-3">Brand</h4>
              <div className="space-y-2">
                {allBrands.map(brand => (
                  <label key={brand} className="flex items-center gap-2.5 text-sm text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandChange(brand)}
                      className="accent-primary rounded w-4 h-4"
                    />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Ratings */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400 mb-3">Minimum Rating</h4>
              <div className="flex flex-col gap-2">
                {[4.5, 4.0, 3.5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setMinRating(minRating === rating ? null : rating)}
                    className={`text-left text-sm py-1.5 px-3 rounded-lg border font-semibold ${
                      minRating === rating
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'border-neutral-100 dark:border-zinc-850 text-zinc-650 dark:text-zinc-350'
                    }`}
                  >
                    {rating}★ & Above
                  </button>
                ))}
              </div>
            </div>

            {/* Stock */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400 mb-3">Stock Status</h4>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-zinc-750 dark:text-zinc-300">In Stock Only</span>
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="accent-primary rounded w-4 h-4"
                />
              </label>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};
