import React, { useState } from 'react';
import { X, Star, ShoppingCart, Heart, Zap, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '../data/mockData';
import { formatINR } from '../utils/currency';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useToastStore } from '../store/toastStore';
import { useNavigate } from 'react-router-dom';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { toggleWishlist, hasItem } = useWishlistStore();
  const { addToast } = useToastStore();

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedStorage, setSelectedStorage] = useState<string>('');

  if (!product) return null;

  const currentImage = selectedImage || product.images[0];
  const discountPrice = product.price * (1 - product.discount / 100);
  const isFavorite = hasItem(product.id);
  const isOutOfStock = product.quantity === 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      discount: product.discount,
      quantity: 1,
      image: product.images[0],
      selectedColor,
      selectedVariant: selectedStorage
    });
    addToast(`Added ${product.name} to cart`, 'success');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    onClose();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden z-10 my-8"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-neutral-100 dark:bg-zinc-800 hover:bg-neutral-200 dark:hover:bg-zinc-700 text-neutral-600 dark:text-neutral-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8">
            <div className="space-y-4">
              <div className="relative pt-[85%] rounded-2xl overflow-hidden bg-neutral-50 dark:bg-zinc-950 border border-neutral-100 dark:border-zinc-800">
                <img
                  src={currentImage}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {product.discount > 0 && (
                  <span className="absolute bottom-4 left-4 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                    {product.discount}% OFF
                  </span>
                )}
              </div>

              {product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(img)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                        currentImage === img ? 'border-emerald-600' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full w-max block">
                  {product.brand} • {product.category}
                </span>

                <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white leading-tight">
                  {product.name}
                </h2>

                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center text-amber-400">
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <span className="font-bold text-neutral-800 dark:text-zinc-200">{product.rating}</span>
                  <span className="text-neutral-400">({product.reviewsCount} reviews)</span>
                </div>

                <div className="flex items-baseline gap-3 pt-2">
                  <span className="text-2xl font-black text-neutral-900 dark:text-white">
                    {formatINR(discountPrice)}
                  </span>
                  {product.discount > 0 && (
                    <span className="text-sm text-neutral-400 line-through">
                      {formatINR(product.price)}
                    </span>
                  )}
                </div>

                <p className="text-xs text-neutral-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                  {product.description}
                </p>

                {product.colors && product.colors.length > 0 && (
                  <div className="pt-2">
                    <span className="block text-xs font-bold text-neutral-500 uppercase mb-2">Color</span>
                    <div className="flex gap-2">
                      {product.colors.map(c => (
                        <button
                          key={c.name}
                          onClick={() => setSelectedColor(c.name)}
                          className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                            selectedColor === c.name ? 'scale-115 border-emerald-600' : 'border-white dark:border-zinc-800'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {product.variants?.storage && (
                  <div className="pt-2">
                    <span className="block text-xs font-bold text-neutral-500 uppercase mb-2">Storage</span>
                    <div className="flex gap-2">
                      {product.variants.storage.map(st => (
                        <button
                          key={st}
                          onClick={() => setSelectedStorage(st)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            selectedStorage === st
                              ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600'
                              : 'border-neutral-200 dark:border-zinc-800 text-neutral-700 dark:text-zinc-300'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-zinc-800">
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="flex-1 aero-btn-outline text-xs flex items-center justify-center gap-2 py-3"
                  >
                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className="flex-1 aero-btn-primary text-xs flex items-center justify-center gap-2 py-3"
                  >
                    <Zap className="w-4 h-4 fill-current" /> Buy Now
                  </button>
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-3 rounded-2xl border transition-colors cursor-pointer ${
                      isFavorite ? 'text-red-500 border-red-200 bg-red-50/50' : 'text-neutral-400 border-neutral-200'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    navigate(`/product/${product.id}`);
                  }}
                  className="w-full text-center text-xs font-bold text-neutral-500 hover:text-emerald-600 flex items-center justify-center gap-1 py-1"
                >
                  View Full Product Details <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
