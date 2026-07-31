import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, CreditCard, Shield, Truck, RotateCcw, Headset, ShoppingBag } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-900 text-neutral-400 dark:bg-black dark:border-t dark:border-zinc-900 pt-16 pb-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Core Trust Badges Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 pb-12 border-b border-neutral-800 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-800 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold">100% Original</h4>
              <p className="text-[10px] text-neutral-500">Authentic products only</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-800 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold">Secure Payments</h4>
              <p className="text-[10px] text-neutral-500">Multiple payment options</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-800 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold">30 Days Returns</h4>
              <p className="text-[10px] text-neutral-500">Hassle free returns</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-800 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold">Fast Delivery</h4>
              <p className="text-[10px] text-neutral-500">Quick & reliable delivery</p>
            </div>
          </div>
          <div className="flex items-center gap-3 col-span-2 lg:col-span-1">
            <div className="w-10 h-10 rounded-2xl bg-neutral-800 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Headset className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold">24/7 Support</h4>
              <p className="text-[10px] text-neutral-500">Always here to help</p>
            </div>
          </div>
        </div>

        {/* 5-Column Detailed Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-sm">
                <ShoppingBag className="w-4 h-4 fill-current" />
              </div>
              <span className="font-black text-lg tracking-tight text-white">
                Aero<span className="text-emerald-400">Seller</span>
              </span>
            </Link>
            <p className="text-xs text-neutral-500 leading-relaxed">
              AeroSeller is India's most loved online shopping platform. Shop the latest products from top brands at best prices.
            </p>
            <div className="flex flex-col gap-2 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Tech Park, Bengaluru, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>1800 123 4567 (Toll Free)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>support@aeroseller.com</span>
              </div>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/products?category=mobiles" className="hover:text-emerald-400 transition-colors">Electronics</Link></li>
              <li><Link to="/products?category=fashion" className="hover:text-emerald-400 transition-colors">Fashion</Link></li>
              <li><Link to="/products?category=home" className="hover:text-emerald-400 transition-colors">Home & Living</Link></li>
              <li><Link to="/products?category=beauty" className="hover:text-emerald-400 transition-colors">Beauty</Link></li>
              <li><Link to="/products?category=sports" className="hover:text-emerald-400 transition-colors">Sports</Link></li>
              <li><Link to="/products?category=grocery" className="hover:text-emerald-400 transition-colors">Grocery</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Customer Service</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#help" className="hover:text-emerald-400 transition-colors">Help Center</a></li>
              <li><Link to="/profile?tab=orders" className="hover:text-emerald-400 transition-colors">Track Order</Link></li>
              <li><a href="#returns" className="hover:text-emerald-400 transition-colors">Returns & Refunds</a></li>
              <li><a href="#cancellation" className="hover:text-emerald-400 transition-colors">Cancellation</a></li>
              <li><a href="#shipping" className="hover:text-emerald-400 transition-colors">Shipping Info</a></li>
              <li><a href="#contact" className="hover:text-emerald-400 transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* My Account */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">My Account</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/profile" className="hover:text-emerald-400 transition-colors">My Profile</Link></li>
              <li><Link to="/profile?tab=orders" className="hover:text-emerald-400 transition-colors">Orders</Link></li>
              <li><Link to="/profile?tab=wishlist" className="hover:text-emerald-400 transition-colors">Wishlist</Link></li>
              <li><Link to="/profile?tab=addresses" className="hover:text-emerald-400 transition-colors">Addresses</Link></li>
              <li><Link to="/profile?tab=coupons" className="hover:text-emerald-400 transition-colors">Coupons</Link></li>
              <li><a href="http://localhost:5174" target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-bold hover:underline">Seller Hub</a></li>
            </ul>
          </div>

          {/* Popular Categories & Newsletter */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Popular Categories</h4>
            <ul className="space-y-2 text-xs mb-6">
              <li><Link to="/products?category=mobiles" className="hover:text-emerald-400 transition-colors">Mobiles</Link></li>
              <li><Link to="/products?category=laptops" className="hover:text-emerald-400 transition-colors">Laptops</Link></li>
              <li><Link to="/products?category=audio" className="hover:text-emerald-400 transition-colors">TV & Audio</Link></li>
            </ul>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-2">Newsletter</h4>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Enter email..."
                className="bg-neutral-800 text-white placeholder-neutral-500 border border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600"
              />
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl transition-all shadow-md">
                Subscribe
              </button>
            </form>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="border-t border-neutral-800 pt-8 mt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© 2026 AeroSeller Inc. All rights reserved.</p>
          <div className="flex gap-6 font-medium">
            <a href="#privacy" className="hover:text-neutral-300 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-neutral-300 transition-colors">Terms & Conditions</a>
            <a href="#security" className="hover:text-neutral-300 transition-colors">Security</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
