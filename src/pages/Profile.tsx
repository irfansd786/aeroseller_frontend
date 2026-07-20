import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { User, MapPin, Heart, History, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useToastStore } from '../store/toastStore';
import { ProductCard } from '../components/ProductCard';
import { formatINR } from '../utils/currency';
import type { Product } from '../components/ProductCard';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  summary: { subtotal: number; total: number };
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
  shippingAddress: { street: string; city: string };
}

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  zipCode: string;
  country: string;
}

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTabQuery = searchParams.get('tab') || 'personal';

  const { user, login } = useAuthStore();
  const { items: wishlistIds, fetchWishlist, loading: wishlistLoading } = useWishlistStore();
  const { addToast } = useToastStore();

  const [activeTab, setActiveTab] = useState(activeTabQuery);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Profile forms states
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Address add form states
  const [newAddrName, setNewAddrName] = useState('');
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('');
  const [newAddrZip, setNewAddrZip] = useState('');
  const [newAddrCountry, setNewAddrCountry] = useState('');
  const [showAddAddr, setShowAddAddr] = useState(false);

  useEffect(() => {
    setActiveTab(activeTabQuery);
  }, [activeTabQuery]);

  const loadOrderHistory = () => {
    setLoadingOrders(true);
    axios.get('http://localhost:5000/api/orders')
      .then(res => {
        const guestEmail = localStorage.getItem('orderCustomerEmail');
        const emailFilter = user?.email || guestEmail || 'customer@gmail.com';
        const list = res.data.filter((o: any) => o.customerEmail.toLowerCase() === emailFilter.toLowerCase());
        setOrders(list);
        setLoadingOrders(false);
      })
      .catch(err => {
        console.error("Error loading orders", err);
        setLoadingOrders(false);
      });
  };

  const loadProfile = () => {
    axios.get('http://localhost:5000/api/profile')
      .then(res => {
        const profile = res.data;
        setAddresses(profile.addresses || []);
        if (profile.name) setName(profile.name);
        if (profile.phone) setPhone(profile.phone);
      })
      .catch(err => console.error("Error loading profile info", err));
  };

  // Load initial resources
  useEffect(() => {
    fetchWishlist();
    loadProfile();

    if (activeTab === 'orders') {
      loadOrderHistory();
    }
  }, [activeTab, user]);

  // Resolve wishlist product structures
  useEffect(() => {
    if (wishlistIds.length === 0) {
      setWishlistProducts([]);
      return;
    }
    axios.get('http://localhost:5000/api/products')
      .then(res => {
        const matches = res.data.filter((p: Product) => wishlistIds.includes(p.id));
        setWishlistProducts(matches);
      })
      .catch(err => console.error(err));
  }, [wishlistIds]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await axios.put('http://localhost:5000/api/profile', {
        name,
        phone
      });
      if (res.data.success) {
        addToast("Profile details updated!", "success");
        // Sync local authStore user details
        const token = localStorage.getItem('token') || '';
        const role = localStorage.getItem('role') || '';
        login(token, role, { name, email: user?.email || 'customer@gmail.com', phone });
      }
    } catch (err) {
      addToast("Failed to save changes", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrName || !newAddrStreet || !newAddrCity || !newAddrZip || !newAddrCountry) return;

    const newAddrObj: Address = {
      id: `addr-${Date.now()}`,
      name: newAddrName,
      street: newAddrStreet,
      city: newAddrCity,
      zipCode: newAddrZip,
      country: newAddrCountry
    };

    const updated = [...addresses, newAddrObj];
    try {
      const res = await axios.put('http://localhost:5000/api/profile', { addresses: updated });
      if (res.data.success) {
        addToast("Address added successfully", "success");
        setAddresses(updated);
        setShowAddAddr(false);
        // Clear fields
        setNewAddrName('');
        setNewAddrStreet('');
        setNewAddrCity('');
        setNewAddrZip('');
        setNewAddrCountry('');
      }
    } catch (err) {
      addToast("Failed to add address", "error");
    }
  };

  const handleDeleteAddress = async (addrId: string) => {
    const updated = addresses.filter(a => a.id !== addrId);
    try {
      const res = await axios.put('http://localhost:5000/api/profile', { addresses: updated });
      if (res.data.success) {
        addToast("Address deleted", "success");
        setAddresses(updated);
      }
    } catch (err) {
      addToast("Failed to delete address", "error");
    }
  };

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side Tab selectors */}
        <div className="lg:col-span-3 bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-850 rounded-[28px] p-5 space-y-4">
          <div className="text-center pb-4 border-b border-neutral-100 dark:border-zinc-800">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center text-xl font-bold mb-3">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <h3 className="font-extrabold text-neutral-850 dark:text-white text-base">{user?.name || "Premium Customer"}</h3>
            <p className="text-[10px] text-neutral-400 mt-0.5">{user?.email}</p>
          </div>
          
          <div className="flex flex-col gap-1.5 font-semibold text-xs">
            {[
              { id: 'personal', label: 'Personal Details', icon: User },
              { id: 'orders', label: 'Order History', icon: History },
              { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
              { id: 'wishlist', label: 'My Wishlist', icon: Heart }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    navigate(`/profile?tab=${tab.id}`);
                  }}
                  className={`flex items-center gap-3 py-3 px-4 rounded-xl text-left transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'text-neutral-550 hover:bg-neutral-50 dark:hover:bg-zinc-850/50 hover:text-neutral-850 dark:hover:text-zinc-200'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side Content Box */}
        <div className="lg:col-span-9 bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-850 rounded-[28px] p-6 sm:p-8 min-h-[480px]">
          
          {/* TAB 1: PERSONAL DETAILS */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-neutral-900 dark:text-white">Personal Information</h2>
                <p className="text-xs text-neutral-450 mt-0.5">Control registration metadata credentials.</p>
              </div>
              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-neutral-450 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-zinc-800 focus:outline-none focus:border-primary text-sm shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-450 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-neutral-100 dark:bg-zinc-950/40 text-neutral-400 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-zinc-850 text-sm cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-450 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-zinc-800 focus:outline-none focus:border-primary text-sm shadow-xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {savingProfile ? "Saving changes..." : "Save Changes"}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: ORDER HISTORY */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-neutral-900 dark:text-white">Order History</h2>
                <p className="text-xs text-neutral-450 mt-0.5">Track and view prior invoices.</p>
              </div>

              {loadingOrders ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="h-28 bg-neutral-100 dark:bg-zinc-950 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map(order => {
                    let statusColor = 'bg-amber-100 border-amber-200 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/30';
                    if (order.status === 'Delivered') statusColor = 'bg-green-100 border-green-200 text-green-600 dark:bg-green-950/20 dark:border-green-900/30';
                    else if (order.status === 'Cancelled') statusColor = 'bg-red-100 border-red-200 text-red-600 dark:bg-red-950/20 dark:border-red-900/30';
                    else if (order.status === 'Processing' || order.status === 'Shipped') statusColor = 'bg-blue-100 border-blue-200 text-blue-600 dark:bg-blue-950/20 dark:border-blue-900/30';

                    return (
                      <div key={order.id} className="border border-neutral-150 dark:border-zinc-850 rounded-2xl overflow-hidden divide-y divide-neutral-100 dark:divide-zinc-850">
                        {/* Summary Header */}
                        <div className="bg-neutral-50 dark:bg-zinc-950/60 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div className="flex gap-4">
                            <div>
                              <span className="block text-neutral-450">Date Ordered</span>
                              <span className="font-bold text-neutral-700 dark:text-zinc-300">{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div>
                              <span className="block text-neutral-450">Total Amount</span>
                              <span className="font-extrabold text-neutral-900 dark:text-white">{formatINR(order.summary.total)}</span>
                            </div>
                            <div>
                              <span className="block text-neutral-450">Reference ID</span>
                              <span className="font-bold text-primary">{order.id}</span>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold w-max self-start sm:self-center ${statusColor}`}>
                            {order.status}
                          </span>
                        </div>

                        {/* Items list */}
                        <div className="p-5 space-y-3">
                          {order.items.map(item => (
                            <div key={item.productId} className="flex items-center gap-3 text-xs">
                              <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                              <div className="flex-grow">
                                <h4 className="font-bold text-neutral-805 dark:text-zinc-200 line-clamp-1">{item.name}</h4>
                                <span className="text-neutral-400">Qty: {item.quantity} • Price: {formatINR(item.price)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-neutral-50 dark:bg-zinc-950 border border-dashed border-neutral-250 dark:border-zinc-900 rounded-[28px]">
                  <p className="text-xs text-neutral-450">No transaction records found.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SAVED ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-neutral-900 dark:text-white">Saved Addresses</h2>
                  <p className="text-xs text-neutral-450 mt-0.5">Edit location details for shipping.</p>
                </div>
                <button
                  onClick={() => setShowAddAddr(!showAddAddr)}
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-primary/20"
                >
                  <Plus className="w-4 h-4" /> Add Address
                </button>
              </div>

              {/* Add form */}
              {showAddAddr && (
                <form onSubmit={handleAddAddress} className="bg-neutral-50 dark:bg-zinc-950 p-6 rounded-2xl border border-neutral-100 dark:border-zinc-850 space-y-4 max-w-md">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400">Add Location</h4>
                  <div>
                    <label className="block text-xs font-bold text-neutral-450 uppercase mb-1">Tag (Home / Work)</label>
                    <input
                      type="text"
                      required
                      placeholder="Home"
                      value={newAddrName}
                      onChange={(e) => setNewAddrName(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 text-neutral-900 dark:text-neutral-100 px-4 py-2 rounded-xl border border-neutral-205 dark:border-zinc-800 focus:outline-none focus:border-primary text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-450 uppercase mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      placeholder="124 Baker St"
                      value={newAddrStreet}
                      onChange={(e) => setNewAddrStreet(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 text-neutral-900 dark:text-neutral-100 px-4 py-2 rounded-xl border border-neutral-205 dark:border-zinc-800 focus:outline-none focus:border-primary text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-450 uppercase mb-1">City</label>
                      <input
                        type="text"
                        required
                        placeholder="London"
                        value={newAddrCity}
                        onChange={(e) => setNewAddrCity(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 text-neutral-900 dark:text-neutral-100 px-4 py-2 rounded-xl border border-neutral-205 dark:border-zinc-800 focus:outline-none focus:border-primary text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-450 uppercase mb-1">Zip Code</label>
                      <input
                        type="text"
                        required
                        placeholder="NW1 6XE"
                        value={newAddrZip}
                        onChange={(e) => setNewAddrZip(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 text-neutral-900 dark:text-neutral-100 px-4 py-2 rounded-xl border border-neutral-205 dark:border-zinc-800 focus:outline-none focus:border-primary text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-450 uppercase mb-1">Country</label>
                    <input
                      type="text"
                      required
                      placeholder="United Kingdom"
                      value={newAddrCountry}
                      onChange={(e) => setNewAddrCountry(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 text-neutral-900 dark:text-neutral-100 px-4 py-2 rounded-xl border border-neutral-205 dark:border-zinc-800 focus:outline-none focus:border-primary text-xs"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
                    >
                      Save Location
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddAddr(false)}
                      className="bg-neutral-200 dark:bg-zinc-800 hover:bg-neutral-300 text-neutral-700 dark:text-zinc-300 text-xs font-bold px-4 py-2 rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* List of addresses */}
              {addresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map(addr => (
                    <div key={addr.id} className="p-5 rounded-2xl border border-neutral-150 dark:border-zinc-800 flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-neutral-800 dark:text-zinc-200 capitalize mb-1">{addr.name}</h4>
                        <p className="text-xs text-neutral-500 leading-normal">
                          {addr.street}, {addr.city}<br />
                          {addr.zipCode}, {addr.country}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 text-neutral-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-neutral-50 dark:bg-zinc-950 border border-dashed border-neutral-200 dark:border-zinc-900 rounded-[28px]">
                  <p className="text-xs text-neutral-450">No address records found. Add one to complete checkout.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-neutral-900 dark:text-white">My Wishlist</h2>
                <p className="text-xs text-neutral-450 mt-0.5">Items bookmarked for later purchase.</p>
              </div>

              {wishlistLoading ? (
                <div className="grid grid-cols-2 gap-6 animate-pulse">
                  <div className="h-64 bg-neutral-100 rounded-2xl" />
                  <div className="h-64 bg-neutral-100 rounded-2xl" />
                </div>
              ) : wishlistProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {wishlistProducts.map(prod => (
                    <ProductCard key={prod.id} product={prod} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-neutral-50 dark:bg-zinc-950 border border-dashed border-neutral-200 dark:border-zinc-900 rounded-[28px]">
                  <p className="text-xs text-neutral-450">Your wishlist is empty.</p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
