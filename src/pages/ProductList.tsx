import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, RefreshCw, X } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { apiService } from '../services/api';
import { INITIAL_CATEGORIES, type Product } from '../data/mockData';

export const ProductList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(150000);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [minDiscount, setMinDiscount] = useState<number>(0);
  const [selectedStorage] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('popularity');

  const [, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const prodRes = await apiService.getProducts();
      setProducts(prodRes);
    } catch (err) {
      console.error("Failed to load product catalog:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const categoryQuery = searchParams.get('category');
    const brandQuery = searchParams.get('brand');
    const searchQuery = searchParams.get('search');
    const discountQuery = searchParams.get('discount');

    if (categoryQuery) setSelectedCategories([categoryQuery.toLowerCase()]);
    if (brandQuery) setSelectedBrands([brandQuery]);
    if (discountQuery) setMinDiscount(Number(discountQuery));
    if (searchQuery) setCurrentPage(1);
  }, [searchParams]);

  const resetAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setMaxPrice(150000);
    setMinRating(null);
    setOnlyInStock(false);
    setMinDiscount(0);
    setSortBy('popularity');
    setSearchParams({});
    setCurrentPage(1);
  };

  const availableBrands = Array.from(new Set(products.map(p => p.brand)));

  const filteredProducts = products
    .filter(p => {
      if (p.status !== 'active') return false;

      if (selectedCategories.length > 0 && !selectedCategories.includes(p.category.toLowerCase())) {
        return false;
      }

      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) {
        return false;
      }

      const q = searchParams.get('search')?.toLowerCase() || '';
      if (q) {
        const match = p.name.toLowerCase().includes(q) ||
                      p.brand.toLowerCase().includes(q) ||
                      p.category.toLowerCase().includes(q) ||
                      p.description.toLowerCase().includes(q);
        if (!match) return false;
      }

      const finalPrice = p.price * (1 - p.discount / 100);
      if (finalPrice > maxPrice) return false;

      if (minRating !== null && p.rating < minRating) return false;

      if (onlyInStock && p.quantity === 0) return false;

      if (p.discount < minDiscount) return false;

      if (selectedStorage.length > 0 && p.variants?.storage) {
        const hasStorage = p.variants.storage.some(st => selectedStorage.includes(st));
        if (!hasStorage) return false;
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
        case 'rating':
          return b.rating - a.rating;
        case 'popularity':
        default:
          return b.reviewsCount - a.reviewsCount;
      }
    });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCategoryToggle = (catId: string) => {
    setCurrentPage(1);
    const cat = catId.toLowerCase();
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleBrandToggle = (brand: string) => {
    setCurrentPage(1);
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
            {searchParams.get('search') 
              ? `Search results for "${searchParams.get('search')}"`
              : selectedCategories.length === 1 
                ? `${selectedCategories[0].charAt(0).toUpperCase() + selectedCategories[0].slice(1)} Products`
                : "Explore Catalog"
            }
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Showing {filteredProducts.length} items
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-1.5 border border-neutral-200 dark:border-zinc-800 rounded-2xl px-4 py-2 text-xs font-bold text-neutral-700 dark:text-zinc-300"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" /> Filters
          </button>

          <div className="flex items-center gap-2 border border-neutral-200 dark:border-zinc-800 rounded-2xl px-3 py-2 bg-white dark:bg-zinc-900 shadow-xs text-xs">
            <ArrowUpDown className="w-4 h-4 text-neutral-400" />
            <span className="font-bold text-neutral-400 hidden sm:inline">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="font-bold text-neutral-800 dark:text-zinc-200 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="popularity">Popularity</option>
              <option value="rating">Customer Rating</option>
              <option value="newest">Newest Arrival</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {(selectedCategories.length > 0 || selectedBrands.length > 0 || minRating || minDiscount > 0 || onlyInStock) && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs font-bold text-neutral-400">Active Filters:</span>
          {selectedCategories.map(cat => (
            <span key={cat} className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 px-3 py-1 rounded-full">
              {cat}
              <X className="w-3 h-3 cursor-pointer hover:text-emerald-800" onClick={() => handleCategoryToggle(cat)} />
            </span>
          ))}
          {selectedBrands.map(b => (
            <span key={b} className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 px-3 py-1 rounded-full">
              {b}
              <X className="w-3 h-3 cursor-pointer hover:text-emerald-800" onClick={() => handleBrandToggle(b)} />
            </span>
          ))}
          {minRating && (
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 px-3 py-1 rounded-full">
              {minRating}★ & Above
              <X className="w-3 h-3 cursor-pointer" onClick={() => setMinRating(null)} />
            </span>
          )}
          <button onClick={resetAllFilters} className="text-xs text-red-500 font-bold hover:underline ml-2">
            Clear All
          </button>
        </div>
      )}

      <div className="flex gap-8 items-start">
        
        <div className="hidden lg:block w-64 flex-shrink-0 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-3xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-zinc-850 pb-4">
            <h3 className="font-black text-sm text-neutral-900 dark:text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" /> Filters
            </h3>
            <button onClick={resetAllFilters} className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400 mb-3">Categories</h4>
            <div className="space-y-2">
              {INITIAL_CATEGORIES.map(cat => (
                <label key={cat.id} className="flex items-center gap-2.5 text-xs font-semibold text-neutral-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.id.toLowerCase())}
                    onChange={() => handleCategoryToggle(cat.id)}
                    className="accent-emerald-600 rounded w-4 h-4"
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400 mb-3">Max Price</h4>
            <div className="space-y-2">
              <input
                type="range"
                min="1000"
                max="150000"
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-emerald-600 h-1 bg-neutral-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs font-bold text-neutral-500">
                <span>₹1,000</span>
                <span className="text-emerald-600">Up to ₹{maxPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400 mb-3">Brand</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1 no-scrollbar">
              {availableBrands.map(brand => (
                <label key={brand} className="flex items-center gap-2.5 text-xs font-semibold text-neutral-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandToggle(brand)}
                    className="accent-emerald-600 rounded w-4 h-4"
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400 mb-3">Minimum Rating</h4>
            <div className="flex flex-col gap-2">
              {[4.5, 4.0, 3.5].map(rating => (
                <button
                  key={rating}
                  onClick={() => setMinRating(minRating === rating ? null : rating)}
                  className={`text-left text-xs py-2 px-3 rounded-xl border font-bold transition-all cursor-pointer ${
                    minRating === rating
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-600 text-emerald-600'
                      : 'border-neutral-200 dark:border-zinc-800 text-neutral-600 dark:text-zinc-400 hover:border-neutral-300'
                  }`}
                >
                  {rating}★ & Above
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400 mb-3">Stock Status</h4>
            <label className="flex items-center justify-between cursor-pointer text-xs font-semibold text-neutral-700 dark:text-zinc-300">
              <span>In Stock Only</span>
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="accent-emerald-600 rounded w-4 h-4"
              />
            </label>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400 mb-3">Discounts</h4>
            <div className="flex gap-2">
              {[10, 20, 50].map(disc => (
                <button
                  key={disc}
                  onClick={() => setMinDiscount(minDiscount === disc ? 0 : disc)}
                  className={`flex-1 text-center text-xs py-2 rounded-xl border font-bold transition-all cursor-pointer ${
                    minDiscount === disc
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-600 text-emerald-600'
                      : 'border-neutral-200 dark:border-zinc-800 text-neutral-600 dark:text-zinc-400'
                  }`}
                >
                  {disc}%+
                </button>
              ))}
            </div>
          </div>

        </div>

        <div className="flex-grow space-y-8">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="h-72 bg-neutral-100 dark:bg-zinc-900 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : paginatedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-8 border-t border-neutral-200 dark:border-zinc-850">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2.5 border border-neutral-200 dark:border-zinc-800 rounded-2xl hover:bg-neutral-50 dark:hover:bg-zinc-800 disabled:opacity-40 text-neutral-700 dark:text-zinc-300 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <span className="text-xs font-black text-neutral-800 dark:text-zinc-200">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2.5 border border-neutral-200 dark:border-zinc-800 rounded-2xl hover:bg-neutral-50 dark:hover:bg-zinc-800 disabled:opacity-40 text-neutral-700 dark:text-zinc-300 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 px-4 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-3xl max-w-md mx-auto shadow-sm">
              <SlidersHorizontal className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-base font-black text-neutral-900 dark:text-white mb-1">No Products Found</h3>
              <p className="text-xs text-neutral-500 mb-6">
                Try expanding your search query or resetting active filters.
              </p>
              <button
                onClick={resetAllFilters}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-md transition-all hover:scale-105 cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
