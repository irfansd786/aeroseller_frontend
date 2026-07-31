import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, Ticket, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import { useAuthStore } from '../store/authStore';
import { ProductCard } from '../components/ProductCard';
import { apiService } from '../services/api';
import { formatINR } from '../utils/currency';
import type { Product } from '../data/mockData';

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, fetchCart, applyCoupon, coupon, loading } = useCartStore();
  const { addToast } = useToastStore();
  const { token } = useAuthStore();

  const [couponCode, setCouponCode] = useState('');
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchCart();
    apiService.getProducts()
      .then(res => setRecommendedProducts(res.slice(0, 4)))
      .catch(err => console.error(err));
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
      addToast("Invalid coupon. Try 'SAVE10', 'WELCOME20', or 'AERO500'", "error");
    }
  };

  const rawSubtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const itemDiscounts = items.reduce((acc, item) => acc + (item.price * (item.discount / 100) * item.quantity), 0);
  const subtotalAfterProductDiscount = rawSubtotal - itemDiscounts;

  let couponDiscountAmt = 0;
  if (coupon) {
    if (coupon.discountType === 'percentage') {
      couponDiscountAmt = subtotalAfterProductDiscount * (coupon.value / 100);
    } else if (coupon.discountType === 'fixed') {
      couponDiscountAmt = Math.min(coupon.value, subtotalAfterProductDiscount);
    }
  }

  const totalDiscount = itemDiscounts + couponDiscountAmt;
  const shipping = subtotalAfterProductDiscount > 499 || items.length === 0 ? 0 : 49;
  const tax = (subtotalAfterProductDiscount - couponDiscountAmt) * 0.08;
  const totalAmount = Math.max(0, subtotalAfterProductDiscount - couponDiscountAmt + shipping + tax);

  if (loading && items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="h-10 w-48 bg-neutral-100 dark:bg-zinc-900 rounded-md animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 h-80 bg-neutral-100 dark:bg-zinc-900 rounded-3xl animate-pulse" />
          <div className="lg:col-span-4 h-80 bg-neutral-100 dark:bg-zinc-900 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
        My Cart ({items.reduce((acc, item) => acc + item.quantity, 0)} items)
      </h1>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-3xl p-6 divide-y divide-neutral-100 dark:divide-zinc-850 shadow-sm">
              {items.map((item) => {
                const finalPrice = item.price * (1 - item.discount / 100);
                return (
                  <div key={item.productId} className="flex flex-col sm:flex-row items-center gap-4 py-5 first:pt-0 last:pb-0">
                    <img src={item.image} alt={item.name} className="w-20 h-20 rounded-2xl object-cover bg-neutral-50 dark:bg-zinc-950 flex-shrink-0" />

                    <div className="flex-grow text-center sm:text-left space-y-1 min-w-0">
                      <Link to={`/product/${item.productId}`} className="hover:text-emerald-600 transition-colors">
                        <h3 className="font-bold text-sm text-neutral-900 dark:text-white truncate">{item.name}</h3>
                      </Link>
                      <div className="flex items-center gap-2 justify-center sm:justify-start text-xs text-neutral-400">
                        {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                        {item.selectedVariant && <span>Variant: {item.selectedVariant}</span>}
                      </div>
                      <div className="flex items-center gap-2 justify-center sm:justify-start text-xs">
                        <span className="font-black text-neutral-900 dark:text-white">{formatINR(finalPrice)}</span>
                        {item.discount > 0 && (
                          <span className="text-neutral-400 line-through text-[11px]">{formatINR(item.price)}</span>
                        )}
                        {item.discount > 0 && (
                          <span className="text-emerald-600 font-bold text-[11px]">{item.discount}% off</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3 border border-neutral-200 dark:border-zinc-800 rounded-full px-3 py-1 bg-neutral-50 dark:bg-zinc-950">
                        <button
                          onClick={() => handleQuantityDecrease(item.productId, item.quantity)}
                          className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-black text-neutral-800 dark:text-zinc-200 w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityIncrease(item.productId, item.quantity)}
                          className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right min-w-[80px]">
                        <span className="font-black text-sm text-neutral-900 dark:text-white">
                          {formatINR(finalPrice * item.quantity)}
                        </span>
                      </div>

                      <button
                        onClick={() => handleRemove(item.productId)}
                        className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <Ticket className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-xs text-neutral-900 dark:text-white">Apply Promo Coupon</h4>
                  <p className="text-[10px] text-neutral-400">Available: SAVE10, WELCOME20, AERO500</p>
                </div>
              </div>
              <form onSubmit={handleCouponSubmit} className="flex gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="bg-neutral-100 dark:bg-zinc-950 text-neutral-900 dark:text-white px-4 py-2 rounded-2xl border border-neutral-200 dark:border-zinc-800 focus:outline-none text-xs uppercase font-bold w-full sm:w-40"
                />
                <button
                  type="submit"
                  disabled={checkingCoupon}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2 rounded-2xl transition-all cursor-pointer shadow-md"
                >
                  Apply
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-3xl p-6 space-y-6 shadow-sm">
            <h3 className="font-black text-neutral-900 dark:text-white text-base border-b border-neutral-100 dark:border-zinc-850 pb-3">
              Price Details
            </h3>

            <div className="space-y-3 text-xs text-neutral-600 dark:text-zinc-400">
              <div className="flex justify-between">
                <span>Price ({items.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                <span className="font-bold text-neutral-900 dark:text-white">{formatINR(rawSubtotal)}</span>
              </div>
              
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount</span>
                <span>-{formatINR(totalDiscount)}</span>
              </div>

              {coupon && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount ({coupon.code})</span>
                  <span>-{formatINR(couponDiscountAmt)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="text-emerald-600 font-bold">{shipping === 0 ? "FREE" : formatINR(shipping)}</span>
              </div>

              <div className="flex justify-between">
                <span>GST Tax (8%)</span>
                <span>{formatINR(tax)}</span>
              </div>

              <div className="border-t border-neutral-200 dark:border-zinc-800 pt-4 flex justify-between text-base font-black text-neutral-900 dark:text-white">
                <span>Total Amount</span>
                <span>{formatINR(totalAmount)}</span>
              </div>
            </div>

            {totalDiscount > 0 && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 text-xs font-extrabold text-center">
                You will save {formatINR(totalDiscount)} on this order!
              </div>
            )}

            <button
              onClick={() => {
                if (!token) {
                  addToast('Please login to proceed to checkout.', 'error');
                  navigate('/auth');
                  return;
                }
                navigate('/checkout');
              }}
              className="w-full aero-btn-primary text-xs flex items-center justify-center gap-2 py-3.5"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 font-semibold pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Secured by 256-bit SSL Encryption
            </div>
          </div>

        </div>
      ) : (
        <div className="text-center py-20 px-4 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-3xl max-w-md mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-neutral-900 dark:text-white mb-2">Your Cart is Empty</h3>
          <p className="text-xs text-neutral-500 mb-6">
            Looks like you haven't added any products yet. Browse catalog and save deals.
          </p>
          <Link
            to="/products"
            className="aero-btn-primary text-xs px-8 py-3 inline-block"
          >
            Start Shopping
          </Link>
        </div>
      )}

      {recommendedProducts.length > 0 && (
        <div className="space-y-6 pt-4">
          <h3 className="text-xl font-black text-neutral-900 dark:text-white">You May Also Like</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recommendedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
