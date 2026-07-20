import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, Ticket, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import { useAuthStore } from '../store/authStore';
import { formatINR } from '../utils/currency';

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, fetchCart, applyCoupon, coupon, loading } = useCartStore();
  const { addToast } = useToastStore();
  const { token } = useAuthStore();

  const [couponCode, setCouponCode] = useState('');
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const handleQuantityDecrease = (productId: string, currentQty: number) => {
    if (currentQty <= 1) {
      removeItem(productId);
      addToast("Item removed from cart", "success");
    } else {
      updateQuantity(productId, currentQty - 1);
    }
  };

  const handleQuantityIncrease = (productId: string, currentQty: number) => {
    updateQuantity(productId, currentQty + 1);
  };

  const handleRemove = (productId: string) => {
    removeItem(productId);
    addToast("Item removed from cart", "success");
  };

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCheckingCoupon(true);

    const success = await applyCoupon(couponCode);
    setCheckingCoupon(false);

    if (success) {
      addToast("Coupon applied successfully!", "success");
      setCouponCode('');
    } else {
      addToast("Invalid or expired coupon code", "error");
    }
  };

  // Calculations
  const subtotal = items.reduce((acc, item) => {
    const finalPrice = item.price * (1 - item.discount / 100);
    return acc + (finalPrice * item.quantity);
  }, 0);

  // Discount
  let discountAmt = 0;
  if (coupon) {
    if (coupon.discountType === 'percentage') {
      discountAmt = subtotal * (coupon.value / 100);
    } else if (coupon.discountType === 'fixed') {
      discountAmt = Math.min(coupon.value, subtotal);
    }
  }

  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 15;
  const tax = (subtotal - discountAmt) * 0.08; // 8% tax rate
  const total = Math.max(0, subtotal - discountAmt + shipping + tax);

  if (loading && items.length === 0) {
    return (
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="h-10 w-48 bg-neutral-100 dark:bg-zinc-900 rounded-md animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 h-80 bg-neutral-100 dark:bg-zinc-900 rounded-[28px] animate-pulse" />
          <div className="lg:col-span-4 h-80 bg-neutral-100 dark:bg-zinc-900 rounded-[28px] animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h1 className="text-2xl font-black text-neutral-900 dark:text-white">Shopping Cart</h1>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Items List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-850 rounded-[28px] p-6 divide-y divide-neutral-100 dark:divide-zinc-850">
              {items.map((item) => {
                const finalPrice = item.price * (1 - item.discount / 100);
                return (
                  <div key={item.productId} className="flex flex-col sm:flex-row items-center gap-4 py-5 first:pt-0 last:pb-0">
                    {/* Item Thumbnail */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-50 dark:bg-zinc-950 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Metadata */}
                    <div className="flex-grow text-center sm:text-left space-y-1">
                      <Link to={`/product/${item.productId}`} className="hover:text-primary transition-colors">
                        <h3 className="font-bold text-sm text-neutral-800 dark:text-zinc-200 line-clamp-1">{item.name}</h3>
                      </Link>
                      <p className="text-xs text-neutral-450">
                        Price: {formatINR(finalPrice)}
                        {item.discount > 0 && <span className="text-red-500 font-bold ml-1">{item.discount}% off</span>}
                      </p>
                    </div>

                    {/* Controls & Removal */}
                    <div className="flex items-center gap-6">
                      
                      {/* Qty adjustments */}
                      <div className="flex items-center gap-3 border border-neutral-200 dark:border-zinc-800 rounded-full px-2.5 py-1 bg-neutral-55 dark:bg-zinc-900">
                        <button
                          onClick={() => handleQuantityDecrease(item.productId, item.quantity)}
                          className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-neutral-700 dark:text-zinc-300 w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityIncrease(item.productId, item.quantity)}
                          className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Line total price */}
                      <div className="text-right min-w-[70px]">
                        <span className="font-extrabold text-neutral-800 dark:text-zinc-150 text-sm">
                          {formatINR(finalPrice * item.quantity)}
                        </span>
                      </div>

                      {/* Remove trash */}
                      <button
                        onClick={() => handleRemove(item.productId)}
                        className="p-2.5 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coupon Code section */}
            <div className="bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-850 rounded-[28px] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-350">
                <Ticket className="w-5 h-5 text-primary" />
                <div>
                  <h4 className="font-bold text-xs">Have a Coupon Code?</h4>
                  <p className="text-[10px] text-neutral-400">Try applying 'SAVE10' (10% Off) or 'WELCOME20' (₹20 Off).</p>
                </div>
              </div>
              <form onSubmit={handleCouponSubmit} className="flex gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Enter code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="bg-neutral-50 dark:bg-zinc-950 text-zinc-805 dark:text-zinc-100 px-4 py-2 rounded-xl border border-neutral-200 dark:border-zinc-800 focus:outline-none focus:border-primary text-xs w-full sm:w-32 shadow-xs"
                />
                <button
                  type="submit"
                  disabled={checkingCoupon}
                  className="bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-bold px-4 py-2 rounded-xl transition-all"
                >
                  Apply
                </button>
              </form>
            </div>
          </div>

          {/* Checkout Summary panel */}
          <div className="lg:col-span-4 bg-neutral-50 dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-850 rounded-[28px] p-6 space-y-6">
            <h3 className="font-extrabold text-neutral-850 dark:text-white text-base">Order Summary</h3>

            <div className="space-y-3 text-xs text-neutral-600 dark:text-zinc-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold">{formatINR(subtotal)}</span>
              </div>
              {coupon && (
                <div className="flex justify-between text-red-500 font-bold">
                  <span>Coupon Discount ({coupon.code})</span>
                  <span>-{formatINR(discountAmt)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : formatINR(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%)</span>
                <span>{formatINR(tax)}</span>
              </div>
              <div className="border-t border-neutral-200 dark:border-zinc-800 pt-3 flex justify-between text-sm font-extrabold text-neutral-850 dark:text-white">
                <span>Total</span>
                <span>{formatINR(total)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (!token) {
                  addToast('Please sign in before proceeding to checkout.', 'error');
                  navigate('/auth');
                  return;
                }
                navigate('/checkout');
              }}
              className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3.5 rounded-full flex items-center justify-center gap-1.5 transition-all shadow-md shadow-primary/20 hover:scale-102 cursor-pointer"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      ) : (
        // EMPTY STATE CART
        <div className="flex flex-col items-center justify-center text-center py-20 px-4 bg-neutral-50 dark:bg-zinc-950 border border-dashed border-neutral-200 dark:border-zinc-900 rounded-[28px] max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 animate-pulse">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-neutral-900 dark:text-white mb-2">Your Cart is Empty</h3>
          <p className="text-xs text-neutral-500 mb-6 max-w-xs">
            Looks like you haven't added any premium products yet. Browse our collections and discover something special.
          </p>
          <Link
            to="/products"
            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-md transition-all hover:scale-105"
          >
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
};
