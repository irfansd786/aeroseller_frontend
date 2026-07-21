import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Wallet, DollarSign, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import axios from 'axios';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import { useAuthStore } from '../store/authStore';
import { saveCustomerOrder } from '../firebase';
import { formatINR } from '../utils/currency';

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  zipCode: string;
  country: string;
}

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, coupon, clearCart } = useCartStore();
  const { addToast } = useToastStore();
  const { token, user } = useAuthStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'UPI' | 'Cash on Delivery'>('Card');
  
  // Payment detail states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      addToast('Please login to continue with checkout.', 'error');
      navigate('/auth');
      return;
    }

    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    // Load addresses from profile details
    axios.get('https://aeroseller-backend.onrender.com/api/profile')
      .then(res => {
        const saved = res.data.addresses || [];
        setAddresses(saved);
        if (saved.length > 0) {
          setSelectedAddressId(saved[0].id);
        }
      })
      .catch(err => console.error("Error loading addresses", err));
  }, [items]);

  // Calculations
  const subtotal = items.reduce((acc, item) => {
    const finalPrice = item.price * (1 - item.discount / 100);
    return acc + (finalPrice * item.quantity);
  }, 0);

  let discountAmt = 0;
  if (coupon) {
    if (coupon.discountType === 'percentage') {
      discountAmt = subtotal * (coupon.value / 100);
    } else if (coupon.discountType === 'fixed') {
      discountAmt = Math.min(coupon.value, subtotal);
    }
  }

  const shipping = subtotal > 150 ? 0 : 15;
  const tax = (subtotal - discountAmt) * 0.08;
  const total = Math.max(0, subtotal - discountAmt + shipping + tax);

  const handlePlaceOrder = async () => {
    const address = addresses.find(a => a.id === selectedAddressId);
    if (!address) {
      addToast("Please select a shipping address", "error");
      return;
    }

    if (paymentMethod === 'Card') {
      if (!cardNumber || !cardExpiry || !cardCvv) {
        addToast("Please fill in all credit card details", "error");
        return;
      }
    } else if (paymentMethod === 'UPI') {
      if (!upiId || !upiId.includes('@')) {
        addToast("Please enter a valid UPI ID (e.g., user@upi)", "error");
        return;
      }
    }

    setLoading(true);
    try {
      const orderPayload = {
        customerId: user?.email || '',
        customerName: user?.name || "Customer",
        customerEmail: user?.email || "",
        items,
        summary: {
          subtotal,
          discount: discountAmt,
          shipping,
          tax,
          total
        },
        shippingAddress: {
          name: user?.name || "Guest Customer",
          street: address.street,
          city: address.city,
          zipCode: address.zipCode,
          country: address.country,
          phone: user?.phone || "+1 555 0199"
        },
        paymentMethod
      };

      const res = await axios.post('https://aeroseller-backend.onrender.com/api/orders', orderPayload);
      if (res.data.success) {
        // Persist customer email so order history can resolve guest orders
        localStorage.setItem('orderCustomerEmail', orderPayload.customerEmail);
        localStorage.setItem('orderReferenceId', res.data.order.id);

        // Save order to Firebase
        try {
          await saveCustomerOrder(res.data.order);
        } catch (fbErr) {
          console.error('Failed to save order to Firebase:', fbErr);
          // Continue even if Firebase save fails
        }
        
        addToast("Order placed successfully!", "success");
        await clearCart();
        navigate(`/order-success?orderId=${res.data.order.id}`);
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Checkout failed. Please verify stock counts.";
      addToast(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-black text-neutral-900 dark:text-white mb-8">Checkout Securely</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Checkout Forms (Address & Payment) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Address Cards */}
          <div className="bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-850 rounded-[28px] p-6 space-y-4">
            <h3 className="font-extrabold text-sm text-neutral-800 dark:text-zinc-200 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Shipping Address
            </h3>
            {addresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map(addr => (
                  <button
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between h-36 relative cursor-pointer ${
                      selectedAddressId === addr.id
                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                        : 'border-neutral-150 dark:border-zinc-800 hover:border-neutral-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-xs text-neutral-800 dark:text-zinc-200 capitalize mb-1">{addr.name}</h4>
                      <p className="text-[10px] text-neutral-500 leading-normal">
                        {addr.street}, {addr.city}<br />
                        {addr.zipCode}, {addr.country}
                      </p>
                    </div>
                    {selectedAddressId === addr.id && (
                      <span className="absolute bottom-4 right-4 w-4 h-4 bg-primary rounded-full border-2 border-white dark:border-zinc-900" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-neutral-200 dark:border-zinc-850 rounded-2xl">
                <p className="text-xs text-neutral-450 mb-2">No address records found.</p>
                <button
                  onClick={() => navigate('/profile?tab=addresses')}
                  className="text-xs text-primary font-bold hover:underline"
                >
                  Add Shipping Address
                </button>
              </div>
            )}
          </div>

          {/* Payment Selection & Card Form */}
          <div className="bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-850 rounded-[28px] p-6 space-y-6">
            <h3 className="font-extrabold text-sm text-neutral-800 dark:text-zinc-200 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" /> Payment Method
            </h3>

            {/* Radio Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { type: 'Card', icon: CreditCard, title: 'Card Payment' },
                { type: 'UPI', icon: Wallet, title: 'UPI Transfer' },
                { type: 'Cash on Delivery', icon: DollarSign, title: 'Cash on Delivery' }
              ].map(opt => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.type}
                    onClick={() => setPaymentMethod(opt.type as any)}
                    className={`flex items-center gap-3 p-4 border rounded-2xl transition-all cursor-pointer ${
                      paymentMethod === opt.type
                        ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary'
                        : 'border-neutral-150 dark:border-zinc-850 hover:border-neutral-300 dark:hover:border-zinc-700 text-neutral-600 dark:text-zinc-400'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-xs font-bold">{opt.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Form details box */}
            <div className="border-t border-neutral-100 dark:border-zinc-850 pt-6">
              {paymentMethod === 'Card' && (
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-bold text-neutral-450 uppercase mb-1">Card Number</label>
                    <input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-neutral-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-zinc-800 focus:outline-none focus:border-primary text-xs font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-450 uppercase mb-1">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-neutral-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-zinc-800 focus:outline-none focus:border-primary text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-450 uppercase mb-1">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full bg-neutral-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-zinc-800 focus:outline-none focus:border-primary text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'UPI' && (
                <div className="max-w-md">
                  <label className="block text-xs font-bold text-neutral-450 uppercase mb-1">UPI ID</label>
                  <input
                    type="text"
                    placeholder="name@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-zinc-800 focus:outline-none focus:border-primary text-xs"
                  />
                </div>
              )}

              {paymentMethod === 'Cash on Delivery' && (
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-zinc-950 border border-neutral-100 dark:border-zinc-900 text-xs text-neutral-500">
                  <p>Order validation executes immediately. You will verify cash handoff upon shipping delivery to your address.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Side Checkout Summary */}
        <div className="lg:col-span-4 bg-neutral-50 dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-850 rounded-[28px] p-6 space-y-6">
          <h3 className="font-extrabold text-neutral-850 dark:text-white text-base">Order Summary</h3>

          {/* List of items */}
          <div className="divide-y divide-neutral-100 dark:divide-zinc-850 max-h-48 overflow-y-auto pr-2 no-scrollbar">
            {items.map(item => {
              const finalPrice = item.price * (1 - item.discount / 100);
              return (
                <div key={item.productId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 text-xs">
                  <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  <div className="flex-grow min-w-0">
                    <h4 className="font-bold text-neutral-800 dark:text-zinc-200 truncate">{item.name}</h4>
                    <span className="text-neutral-400">Qty: {item.quantity}</span>
                  </div>
                          <span className="font-extrabold text-neutral-805 dark:text-zinc-150">{formatINR(finalPrice * item.quantity)}</span>
                </div>
              );
            })}
          </div>

          {/* Summary pricing */}
          <div className="border-t border-neutral-200 dark:border-zinc-800 pt-4 space-y-3 text-xs text-neutral-600 dark:text-zinc-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            {coupon && (
              <div className="flex justify-between text-red-500 font-bold">
                <span>Discount ({coupon.code})</span>
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
            <div className="border-t border-neutral-200 dark:border-zinc-800 pt-3 flex justify-between text-sm font-extrabold text-neutral-855 dark:text-white">
              <span>Total</span>
              <span>{formatINR(total)}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3.5 rounded-full flex items-center justify-center gap-1.5 transition-all shadow-md shadow-primary/20 hover:scale-102 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Processing Securely..." : `Pay ${formatINR(total)}`} <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
