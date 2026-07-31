import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingCart, Eye, ArrowRightLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Product } from '../data/mockData';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import { useCompareStore } from '../store/compareStore';
import { QuickViewModal } from './QuickViewModal';
import { formatINR } from '../utils/currency';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { toggleWishlist, hasItem } = useWishlistStore();
  const { addItem } = useCartStore();
  const { addToast } = useToastStore();
  const { toggleCompare, isCompared } = useCompareStore();

  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const isFavorite = hasItem(product.id);
  const compared = isCompared(product.id);
  const isOutOfStock = product.quantity === 0;
  
  const discountPrice = product.price * (1 - product.discount / 100);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    addToast(
      isFavorite ? "Removed from wishlist" : "Added to wishlist",
      "success"
    );
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompare(product);
    addToast(
      compared ? "Removed from comparison" : "Added to comparison",
      "success"
    );
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      discount: product.discount,
      quantity: 1,
      image: product.images[0]
    });
    
    addToast(`Added ${product.name} to cart`, "success");
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -6, transition: { duration: 0.2 } }}
        className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-xl dark:hover:border-zinc-700 overflow-hidden relative flex flex-col h-full group"
      >
        {/* Badges Top Left */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
          {product.isBestSeller && (
            <span className="bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
              BESTSELLER
            </span>
          )}
          {product.discount > 0 && (
            <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
              {product.discount}% OFF
            </span>
          )}
        </div>

        {/* Action icons Top Right */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleWishlistClick}
            className={`w-8 h-8 rounded-full flex items-center justify-center border shadow-xs transition-all bg-white/90 dark:bg-zinc-900/90 cursor-pointer ${
              isFavorite 
                ? 'text-red-500 border-red-200 dark:border-red-950/20' 
                : 'text-neutral-400 border-neutral-200 dark:border-zinc-800 hover:text-red-500'
            }`}
            title={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuickViewOpen(true);
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-neutral-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 text-neutral-400 hover:text-emerald-600 shadow-xs transition-all cursor-pointer"
            title="Quick View"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={handleCompareClick}
            className={`w-8 h-8 rounded-full flex items-center justify-center border shadow-xs transition-all bg-white/90 dark:bg-zinc-900/90 cursor-pointer ${
              compared
                ? 'text-emerald-600 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                : 'text-neutral-400 border-neutral-200 dark:border-zinc-800 hover:text-emerald-600'
            }`}
            title={compared ? "Remove comparison" : "Compare"}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Product Main Image */}
        <Link to={`/product/${product.id}`} className="block overflow-hidden relative pt-[82%] flex-shrink-0 bg-neutral-50 dark:bg-zinc-950">
          <img
            src={product.images[0]}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white font-bold text-xs tracking-wider">
              OUT OF STOCK
            </div>
          )}
        </Link>

        {/* Product Details Box */}
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-neutral-400 uppercase mb-1">
            <span>{product.brand}</span>
            <span className="text-emerald-600 dark:text-emerald-400">Free Delivery</span>
          </div>
          
          <Link to={`/product/${product.id}`} className="hover:text-emerald-600 transition-colors mb-2">
            <h3 className="font-semibold text-neutral-800 dark:text-neutral-100 text-xs sm:text-sm line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Rating Stars */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">{product.rating}</span>
            <span className="text-[10px] text-neutral-400">({product.reviewsCount || 45})</span>
          </div>

          {/* Pricing & Add to Cart */}
          <div className="mt-auto flex items-center justify-between gap-2 pt-2 border-t border-neutral-100 dark:border-zinc-850">
            <div className="flex flex-col">
              {product.discount > 0 ? (
                <>
                  <span className="text-neutral-400 dark:text-neutral-500 text-[11px] line-through">
                    {formatINR(product.price)}
                  </span>
                  <span className="text-neutral-900 dark:text-white font-black text-sm sm:text-base">
                    {formatINR(discountPrice)}
                  </span>
                </>
              ) : (
                <span className="text-neutral-900 dark:text-white font-black text-sm sm:text-base">
                  {formatINR(product.price)}
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                isOutOfStock 
                  ? 'bg-neutral-100 dark:bg-zinc-800 text-neutral-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105 shadow-md shadow-emerald-600/20'
              }`}
              title={isOutOfStock ? "Out of stock" : "Add to Cart"}
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {quickViewOpen && (
        <QuickViewModal product={product} onClose={() => setQuickViewOpen(false)} />
      )}
    </>
  );
};
