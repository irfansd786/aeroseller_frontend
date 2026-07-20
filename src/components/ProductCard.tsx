import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import { formatINR } from '../utils/currency';

export interface ProductReview {
  id: string;
  user: string;
  date: string;
  rating: number;
  comment: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  discount: number;
  quantity: number;
  rating: number;
  images: string[];
  status: string;
  reviews?: ProductReview[];
  lowStockThreshold?: number;
  specifications?: Record<string, string | number | boolean>;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { toggleWishlist, hasItem } = useWishlistStore();
  const { addItem } = useCartStore();
  const { addToast } = useToastStore();

  const isFavorite = hasItem(product.id);
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
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 rounded-[20px] shadow-sm hover:shadow-xl dark:hover:border-zinc-700/60 overflow-hidden relative flex flex-col h-full group"
    >
      {/* Wishlist Heart Button */}
      <button
        onClick={handleWishlistClick}
        className={`absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center border shadow-sm transition-all bg-white/85 backdrop-blur-xs cursor-pointer ${
          isFavorite 
            ? 'text-red-500 border-red-100 dark:border-red-950/20' 
            : 'text-neutral-400 border-neutral-100 dark:border-zinc-800 hover:text-red-500'
        }`}
      >
        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
      </button>

      {/* Image Gallery Mock / Main Image */}
      <Link to={`/product/${product.id}`} className="block overflow-hidden relative pt-[80%] flex-shrink-0 bg-neutral-50 dark:bg-zinc-950">
        <img
          src={product.images[0]}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.discount > 0 && (
          <span className="absolute bottom-4 left-4 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-xs">
            {product.discount}% OFF
          </span>
        )}
        {isOutOfStock && (
          <span className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white font-bold text-sm tracking-wide">
            OUT OF STOCK
          </span>
        )}
      </Link>

      {/* Details Box */}
      <div className="p-5 flex flex-col flex-grow">
        <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase mb-1">
          {product.brand} • {product.category}
        </span>
        
        <Link to={`/product/${product.id}`} className="hover:text-primary transition-colors mb-2">
          <h3 className="font-semibold text-neutral-800 dark:text-neutral-100 text-sm line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Rating Stars */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center text-amber-400">
            <Star className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{product.rating}</span>
          <span className="text-[10px] text-neutral-400">(45 reviews)</span>
        </div>

        {/* Pricing & Add to Cart button */}
        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex flex-col">
            {product.discount > 0 ? (
              <>
                <span className="text-neutral-400 dark:text-neutral-500 text-xs line-through">
                  {formatINR(product.price)}
                </span>
                <span className="text-neutral-900 dark:text-white font-bold text-base">
                  {formatINR(discountPrice)}
                </span>
              </>
            ) : (
              <span className="text-neutral-900 dark:text-white font-bold text-base">
                {formatINR(product.price)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              isOutOfStock 
                ? 'bg-neutral-100 dark:bg-zinc-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
                : 'bg-primary hover:bg-primary-hover text-white hover:scale-105 shadow-md shadow-primary/20'
            }`}
            title={isOutOfStock ? "Out of stock" : "Add to Cart"}
          >
            <ShoppingCart className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
