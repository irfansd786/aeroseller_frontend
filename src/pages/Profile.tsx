import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { User, Package, Heart, MapPin, Ticket, Bell, Settings, LogOut, ChevronRight, Copy, Check } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useNotificationStore } from '../store/notificationStore';
import { useToastStore } from '../store/toastStore';
import { ProductCard } from '../components/ProductCard';
import { apiService } from '../services/api';
import { formatINR } from '../utils/currency';
import { PROMO_COUPONS, type Product } from '../data/mockData';

interface OrderItem {
  id: string;
  date: string;
  total: number;
  status: 'Delivered' | 'In Transit' | 'Processing';
  itemsCount: number;
  productName: string;
  image: string;
}

const MOCK_ORDERS: OrderItem[] = [
  {
    id: 'ORD-894210',
    date: '2026-07-28',
    total: 59900,
    status: 'In Transit',
    itemsCount: 1,
    productName: 'Apple iPhone 15 (128GB) - Pink',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'ORD-762104',
    date: '2026-07-10',
    total: 24900,
    status: 'Delivered',
    itemsCount: 1,
    productName: 'Apple AirPods Pro (2nd Generation)',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&auto=format&fit=crop&q=80'
  }
];

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, token, logout } = useAuthStore();
  const { items: wishlistIds } = useWishlistStore();
  const { notifications } = useNotificationStore();
  const { addToast } = useToastStore();

  const activeTab = searchParams.get('tab') || 'profile';

  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [orders] = useState<OrderItem[]>(MOCK_ORDERS);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  const [name, setName] = useState(user?.name || 'S.D. Irfan');
  const [phone, setPhone] = useState(user?.phone || '+91 9876543210');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/auth');
      return;
    }

    apiService.getProducts()
      .then(all => {
        const favs = all.filter(p => wishlistIds.includes(p.id));
        setWishlistProducts(favs);
      })
      .catch(err => console.error(err));
  }, [token, wishlistIds]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setTimeout(() => {
      setSavingProfile(false);
      addToast("Profile updated successfully!", "success");
    }, 500);
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    addToast(`Coupon '${code}' copied to clipboard!`, "success");
    setTimeout(() => setCopiedCoupon(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <div className="lg:col-span-3 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-3xl p-6 space-y-6 shadow-sm">
          
          <div className="flex items-center gap-3 border-b border-neutral-100 dark:border-zinc-850 pb-6">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-md">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-grow">
              <h3 className="font-black text-sm text-neutral-900 dark:text-white truncate">{user?.name || 'Customer'}</h3>
              <p className="text-[11px] text-neutral-400 truncate">{user?.email || 'customer@aeroseller.com'}</p>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-bold">
            {[
              { id: 'profile', label: 'My Profile', icon: User },
              { id: 'orders', label: 'Orders & Tracking', icon: Package },
              { id: 'wishlist', label: 'Wishlist Grid', icon: Heart, count: wishlistIds.length },
              { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
              { id: 'coupons', label: 'Coupons & Offers', icon: Ticket },
              { id: 'notifications', label: 'Notifications', icon: Bell, count: notifications.filter(n => n.unread).length },
              { id: 'settings', label: 'Account Settings', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSearchParams({ tab: tab.id })}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 font-extrabold'
                      : 'text-neutral-600 dark:text-zinc-400 hover:bg-neutral-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}

            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="w-full flex items-center gap-3 p-3 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer mt-4"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout Account</span>
            </button>
          </nav>

        </div>

        <div className="lg:col-span-9 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-neutral-900 dark:text-white">Personal Information</h2>
              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-zinc-950 text-neutral-900 dark:text-white px-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-zinc-800 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-neutral-100 dark:bg-zinc-950 text-neutral-500 px-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-zinc-800 text-xs cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-zinc-950 text-neutral-900 dark:text-white px-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-zinc-800 text-xs focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="aero-btn-primary text-xs py-3 px-6"
                >
                  {savingProfile ? "Saving..." : "Update Details"}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-neutral-900 dark:text-white">Orders & Tracking</h2>
              <div className="space-y-4">
                {orders.map(ord => (
                  <div key={ord.id} className="p-5 rounded-2xl bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-850 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200/60 dark:border-zinc-850 pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">Order ID</span>
                        <h4 className="font-black text-sm text-neutral-900 dark:text-white">{ord.id}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                          ord.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {ord.status}
                        </span>
                        <span className="text-xs text-neutral-400">{ord.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <img src={ord.image} alt="" className="w-16 h-16 rounded-xl object-cover" />
                      <div className="flex-grow min-w-0">
                        <h5 className="font-bold text-xs text-neutral-900 dark:text-white truncate">{ord.productName}</h5>
                        <p className="text-xs text-neutral-400">Total: {formatINR(ord.total)}</p>
                      </div>
                      <button
                        onClick={() => addToast(`Tracking info for ${ord.id} sent to SMS`, "success")}
                        className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Track <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-neutral-900 dark:text-white">Saved Wishlist</h2>
              {wishlistProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {wishlistProducts.map(p => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-neutral-400">Your wishlist is currently empty.</div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-neutral-900 dark:text-white">Saved Addresses</h2>
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-850 space-y-1">
                <span className="text-xs font-bold text-neutral-900 dark:text-white">S.D. Irfan (Home)</span>
                <p className="text-xs text-neutral-500">125, 4th Cross, 2nd Main, Koramangala, Bengaluru - 560034</p>
                <p className="text-[11px] text-neutral-400">+91 9876543210</p>
              </div>
            </div>
          )}

          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-neutral-900 dark:text-white">Coupons & Rewards</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PROMO_COUPONS.map(c => (
                  <div key={c.code} className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-600/30 flex items-center justify-between gap-4">
                    <div>
                      <span className="font-black text-sm text-emerald-600 uppercase tracking-widest">{c.code}</span>
                      <p className="text-xs text-neutral-600 dark:text-zinc-400">{c.description}</p>
                    </div>
                    <button
                      onClick={() => handleCopyCoupon(c.code)}
                      className="p-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 cursor-pointer hover:bg-emerald-700 transition-colors"
                    >
                      {copiedCoupon === c.code ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-neutral-900 dark:text-white">Notifications Center</h2>
              <div className="space-y-3">
                {notifications.map(n => (
                  <div key={n.id} className="p-4 rounded-2xl bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-850 space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold text-neutral-900 dark:text-white">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-neutral-400">{n.time}</span>
                    </div>
                    <p className="text-xs text-neutral-500">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-neutral-900 dark:text-white">Account Settings</h2>
              <p className="text-xs text-neutral-500">Manage communication preferences and password updates.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
