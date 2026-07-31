import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Wallet, DollarSign, ArrowRight, ShieldCheck, MapPin, CheckCircle2, Plus, Building2 } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import { useAuthStore } from '../store/authStore';
import { formatINR } from '../utils/currency';

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  zipCode: string;
  phone: string;
  type: 'Home' | 'Office';
}

const DEFAULT_ADDRESSES: Address[] = [
  {
    id: 'addr-1',
    name: 'S.D. Irfan',
    street: '125, 4th Cross, 2nd Main, Koramangala',
    city: 'Bengaluru, Karnataka',
    zipCode: '560034',
    phone: '+91 9876543210',
    type: 'Home'
  },
  {
    id: 'addr-2',
    name: 'S.D. Irfan (Office)',
    street: 'Tech Park Tower 3, Whitefield',
    city: 'Bengaluru, Karnataka',
    zipCode: '560066',
    phone: '+91 9876543210',
    type: 'Office'
  }
];

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, coupon, clearCart } = useCartStore();
  const { addToast } = useToastStore();
  const { token } = useAuthStore();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [addresses, setAddresses] = useState<Address[]>(DEFAULT_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('addr-1');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Net Banking' | 'Cash on Delivery'>('UPI');
  
  // Payment Details State
  const [upiId, setUpiId] = useState('irfan@upi');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Add Address Modal state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddrName, setNewAddrName] = useState('');
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('');
  const [newAddrZip, setNewAddrZip] = useState('');
  const [newAddrPhone, setNewAddrPhone] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      addToast('Please login to complete checkout.', 'error');
      navigate('/auth');
      return;
    }
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [token, items]);

  // Calculations
  const rawSubtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const itemDiscounts = items.reduce((acc, item) => acc + (item.price * (item.discount / 100) * item.quantity), 0);
  const subtotal = rawSubtotal - itemDiscounts;

  let couponDiscountAmt = 0;
  if (coupon) {
    if (coupon.discountType === 'percentage') {
      couponDiscountAmt = subtotal * (coupon.value / 100);
    } else if (coupon.discountType === 'fixed') {
      couponDiscountAmt = Math.min(coupon.value, subtotal);
    }
  }

  const shipping = subtotal > 499 ? 0 : 49;
  const tax = (subtotal - couponDiscountAmt) * 0.08;
  const grandTotal = Math.max(0, subtotal - couponDiscountAmt + shipping + tax);

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrName || !newAddrStreet || !newAddrCity || !newAddrZip) return;
    const newAddr: Address = {
      id: `addr-${Date.now()}`,
      name: newAddrName,
      street: newAddrStreet,
      city: newAddrCity,
      zipCode: newAddrZip,
      phone: newAddrPhone || '+91 9876543210',
      type: 'Home'
    };
    setAddresses([...addresses, newAddr]);
    setSelectedAddressId(newAddr.id);
    setShowAddAddress(false);
    addToast("New shipping address added!", "success");
  };

  const handlePlaceOrder = async () => {
    const address = addresses.find(a => a.id === selectedAddressId);
    if (!address) {
      addToast("Please select a valid shipping address", "error");
      return;
    }

    if (paymentMethod === 'Card') {
      if (!cardNumber || !cardExpiry || !cardCvv) {
        addToast("Please fill in card number, expiry, and CVV", "error");
        return;
      }
    } else if (paymentMethod === 'UPI') {
      if (!upiId || !upiId.includes('@')) {
        addToast("Please enter a valid UPI ID (e.g. user@upi)", "error");
        return;
      }
    }

    setLoading(true);
    setTimeout(async () => {
      const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      addToast("Order placed successfully!", "success");
      await clearCart();
      setLoading(false);
      navigate(`/order-success?orderId=${orderId}`);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Checkout Stepper Header */}
      <div className="flex items-center justify-between max-w-2xl mx-auto border-b border-neutral-200 dark:border-zinc-800 pb-6 text-xs font-bold">
        <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-emerald-600' : 'text-neutral-400'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black ${currentStep >= 1 ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-600'}`}>1</div>
          <span>Delivery Address</span>
        </div>
        <div className="w-12 h-0.5 bg-neutral-200 dark:bg-zinc-800" />
        <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-emerald-600' : 'text-neutral-400'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black ${currentStep >= 2 ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-600'}`}>2</div>
          <span>Payment Method</span>
        </div>
        <div className="w-12 h-0.5 bg-neutral-200 dark:bg-zinc-800" />
        <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-emerald-600' : 'text-neutral-400'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black ${currentStep >= 3 ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-600'}`}>3</div>
          <span>Order Summary</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Stepper Details */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* STEP 1: Delivery Address */}
          <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" /> 1. Delivery Address
              </h3>
              <button
                onClick={() => setShowAddAddress(true)}
                className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add New Address
              </button>
            </div>

            {/* Address Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map(addr => (
                <button
                  key={addr.id}
                  onClick={() => {
                    setSelectedAddressId(addr.id);
                    setCurrentStep(2);
                  }}
                  className={`text-left p-4 rounded-2xl border transition-all relative cursor-pointer ${
                    selectedAddressId === addr.id
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-emerald-600/20'
                      : 'border-neutral-200 dark:border-zinc-800 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-neutral-900 dark:text-white">{addr.name}</span>
                    <span className="text-[10px] font-bold uppercase bg-neutral-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-neutral-500">
                      {addr.type}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed mb-2">
                    {addr.street}, {addr.city} - {addr.zipCode}
                  </p>
                  <p className="text-[11px] text-neutral-400 font-semibold">{addr.phone}</p>
                  {selectedAddressId === addr.id && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 absolute top-4 right-4" />
                  )}
                </button>
              ))}
            </div>

            {/* Add Address Form Modal */}
            {showAddAddress && (
              <form onSubmit={handleAddNewAddress} className="p-4 bg-neutral-50 dark:bg-zinc-950 rounded-2xl border border-neutral-200 dark:border-zinc-800 space-y-3 pt-4">
                <h4 className="font-bold text-xs text-neutral-900 dark:text-white">Add Shipping Address</h4>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    value={newAddrName}
                    onChange={(e) => setNewAddrName(e.target.value)}
                    className="bg-white dark:bg-zinc-900 text-xs px-3 py-2 rounded-xl border border-neutral-200 dark:border-zinc-800 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Mobile Phone"
                    required
                    value={newAddrPhone}
                    onChange={(e) => setNewAddrPhone(e.target.value)}
                    className="bg-white dark:bg-zinc-900 text-xs px-3 py-2 rounded-xl border border-neutral-200 dark:border-zinc-800 focus:outline-none"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Street Address, House No."
                  required
                  value={newAddrStreet}
                  onChange={(e) => setNewAddrStreet(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 text-xs px-3 py-2 rounded-xl border border-neutral-200 dark:border-zinc-800 focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="City, State"
                    required
                    value={newAddrCity}
                    onChange={(e) => setNewAddrCity(e.target.value)}
                    className="bg-white dark:bg-zinc-900 text-xs px-3 py-2 rounded-xl border border-neutral-200 dark:border-zinc-800 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    required
                    value={newAddrZip}
                    onChange={(e) => setNewAddrZip(e.target.value)}
                    className="bg-white dark:bg-zinc-900 text-xs px-3 py-2 rounded-xl border border-neutral-200 dark:border-zinc-800 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => setShowAddAddress(false)} className="text-xs font-bold text-neutral-400 px-4 py-2">Cancel</button>
                  <button type="submit" className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md">Save Address</button>
                </div>
              </form>
            )}
          </div>

          {/* STEP 2: Payment Method */}
          <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-3xl p-6 space-y-6 shadow-sm">
            <h3 className="font-black text-sm text-neutral-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> 2. Payment Method
            </h3>

            {/* Options grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'UPI', label: 'UPI (GPay/PhonePe)', icon: Wallet },
                { id: 'Card', label: 'Credit / Debit Card', icon: CreditCard },
                { id: 'Net Banking', label: 'Net Banking', icon: Building2 },
                { id: 'Cash on Delivery', label: 'Cash on Delivery', icon: DollarSign }
              ].map(opt => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setPaymentMethod(opt.id as any);
                      setCurrentStep(3);
                    }}
                    className={`p-3.5 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === opt.id
                        ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 font-bold'
                        : 'border-neutral-200 dark:border-zinc-800 text-neutral-600 dark:text-zinc-400 hover:border-neutral-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[11px] leading-tight">{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Inputs based on payment method */}
            <div className="p-4 bg-neutral-50 dark:bg-zinc-950 rounded-2xl border border-neutral-200 dark:border-zinc-850">
              {paymentMethod === 'UPI' && (
                <div className="space-y-3 max-w-sm">
                  <label className="block text-xs font-bold text-neutral-500 uppercase">Enter UPI ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="user@upi"
                    className="w-full bg-white dark:bg-zinc-900 text-neutral-900 dark:text-white px-3 py-2 rounded-xl text-xs border border-neutral-200 dark:border-zinc-800 focus:outline-none"
                  />
                  <p className="text-[10px] text-neutral-400">Pay via Google Pay, PhonePe, Paytm, or BHIM UPI.</p>
                </div>
              )}

              {paymentMethod === 'Card' && (
                <div className="space-y-3 max-w-md">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Card Number</label>
                    <input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 text-neutral-900 dark:text-white px-3 py-2 rounded-xl text-xs border border-neutral-200 dark:border-zinc-800 focus:outline-none font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 text-neutral-900 dark:text-white px-3 py-2 rounded-xl text-xs border border-neutral-200 dark:border-zinc-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">CVV</label>
                      <input
                        type="password"
                        placeholder="123"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 text-neutral-900 dark:text-white px-3 py-2 rounded-xl text-xs border border-neutral-200 dark:border-zinc-800 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'Net Banking' && (
                <div className="max-w-sm space-y-2">
                  <label className="block text-xs font-bold text-neutral-500 uppercase">Select Bank</label>
                  <select className="w-full bg-white dark:bg-zinc-900 text-neutral-900 dark:text-white px-3 py-2 rounded-xl text-xs border border-neutral-200 dark:border-zinc-800 focus:outline-none">
                    <option>HDFC Bank</option>
                    <option>State Bank of India (SBI)</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                    <option>Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              {paymentMethod === 'Cash on Delivery' && (
                <p className="text-xs text-neutral-500">Pay cash upon delivery at your doorstep. Exact amount required.</p>
              )}
            </div>

          </div>

        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-3xl p-6 space-y-6 shadow-sm">
          <h3 className="font-black text-neutral-900 dark:text-white text-base border-b border-neutral-100 dark:border-zinc-850 pb-3">
            Order Summary
          </h3>

          <div className="divide-y divide-neutral-100 dark:divide-zinc-850 max-h-48 overflow-y-auto pr-1 no-scrollbar space-y-2">
            {items.map(item => {
              const finalPrice = item.price * (1 - item.discount / 100);
              return (
                <div key={item.productId} className="flex items-center gap-3 py-2 first:pt-0">
                  <img src={item.image} alt="" className="w-10 h-10 rounded-xl object-cover" />
                  <div className="flex-grow min-w-0">
                    <h4 className="font-bold text-xs text-neutral-900 dark:text-white truncate">{item.name}</h4>
                    <span className="text-[10px] text-neutral-400">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-black text-xs text-neutral-900 dark:text-white flex-shrink-0">
                    {formatINR(finalPrice * item.quantity)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-neutral-100 dark:border-zinc-850 pt-4 space-y-2.5 text-xs text-neutral-600 dark:text-zinc-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-neutral-900 dark:text-white">{formatINR(subtotal)}</span>
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
            <div className="border-t border-neutral-200 dark:border-zinc-800 pt-3 flex justify-between text-base font-black text-neutral-900 dark:text-white">
              <span>Grand Total</span>
              <span>{formatINR(grandTotal)}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full aero-btn-primary text-xs flex items-center justify-center gap-2 py-3.5"
          >
            {loading ? "Processing Order..." : `Place Order (${formatINR(grandTotal)})`} <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
