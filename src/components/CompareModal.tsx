import React from 'react';
import { X, Trash2, ShoppingCart, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompareStore } from '../store/compareStore';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import { formatINR } from '../utils/currency';

export const CompareModal: React.FC = () => {
  const { comparedProducts, isOpen, setIsOpen, removeProduct, clearCompare } = useCompareStore();
  const { addItem } = useCartStore();
  const { addToast } = useToastStore();

  if (!isOpen || comparedProducts.length === 0) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden z-10 my-8 p-6 sm:p-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-neutral-100 dark:border-zinc-800">
            <div>
              <h3 className="text-xl font-black text-neutral-900 dark:text-white">Compare Products</h3>
              <p className="text-xs text-neutral-500">Side-by-side spec comparison of up to 4 items</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={clearCompare}
                className="text-xs text-red-500 hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-zinc-800 text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto pt-6">
            <div className="grid grid-cols-5 min-w-[700px] divide-x divide-neutral-100 dark:divide-zinc-850">
              
              {/* Labels Column */}
              <div className="pr-4 space-y-6 font-bold text-xs text-neutral-400 uppercase tracking-wider">
                <div className="h-44">Product</div>
                <div className="py-2 border-t border-neutral-100 dark:border-zinc-850">Price</div>
                <div className="py-2 border-t border-neutral-100 dark:border-zinc-850">Rating</div>
                <div className="py-2 border-t border-neutral-100 dark:border-zinc-850">Brand</div>
                <div className="py-2 border-t border-neutral-100 dark:border-zinc-850">Discount</div>
                <div className="py-2 border-t border-neutral-100 dark:border-zinc-850">Action</div>
              </div>

              {/* Products Columns */}
              {comparedProducts.map((prod) => {
                const discountPrice = prod.price * (1 - prod.discount / 100);
                return (
                  <div key={prod.id} className="px-4 space-y-6 text-center relative flex flex-col justify-between">
                    <button
                      onClick={() => removeProduct(prod.id)}
                      className="absolute top-0 right-2 p-1 text-neutral-400 hover:text-red-500 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Image & Title */}
                    <div className="h-44 flex flex-col items-center justify-between">
                      <img src={prod.images[0]} alt={prod.name} className="w-24 h-24 object-cover rounded-xl shadow-xs" />
                      <h4 className="font-bold text-xs text-neutral-900 dark:text-white line-clamp-2 mt-2">{prod.name}</h4>
                    </div>

                    {/* Price */}
                    <div className="py-2 border-t border-neutral-100 dark:border-zinc-850 font-black text-sm text-neutral-900 dark:text-white">
                      {formatINR(discountPrice)}
                    </div>

                    {/* Rating */}
                    <div className="py-2 border-t border-neutral-100 dark:border-zinc-850 flex items-center justify-center gap-1 text-xs font-bold text-neutral-700 dark:text-zinc-300">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-current" /> {prod.rating}
                    </div>

                    {/* Brand */}
                    <div className="py-2 border-t border-neutral-100 dark:border-zinc-850 text-xs font-semibold text-neutral-600 dark:text-zinc-400">
                      {prod.brand}
                    </div>

                    {/* Discount */}
                    <div className="py-2 border-t border-neutral-100 dark:border-zinc-850 text-xs font-bold text-emerald-600">
                      {prod.discount > 0 ? `${prod.discount}% Off` : 'No Discount'}
                    </div>

                    {/* Add to Cart */}
                    <div className="py-2 border-t border-neutral-100 dark:border-zinc-850">
                      <button
                        onClick={() => {
                          addItem({
                            productId: prod.id,
                            name: prod.name,
                            price: prod.price,
                            discount: prod.discount,
                            quantity: 1,
                            image: prod.images[0]
                          });
                          addToast(`Added ${prod.name} to cart`, 'success');
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1 shadow-md shadow-emerald-600/20"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" /> Cart
                      </button>
                    </div>

                  </div>
                );
              })}

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
