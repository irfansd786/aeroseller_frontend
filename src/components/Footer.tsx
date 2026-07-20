import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, CreditCard, Shield, Truck, RotateCcw } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-900 text-neutral-400 dark:bg-black dark:border-t dark:border-zinc-900 pt-16 pb-8 transition-colors duration-250">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Core Value Props */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center text-primary flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Free Express Shipping</h4>
              <p className="text-xs text-neutral-500">For all orders over ₹150</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center text-primary flex-shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">30-Day Easy Returns</h4>
              <p className="text-xs text-neutral-500">No questions asked guarantee</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center text-primary flex-shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Secure Payment Gateway</h4>
              <p className="text-xs text-neutral-500">100% SSL encrypted payments</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center text-primary flex-shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">UPI & COD Available</h4>
              <p className="text-xs text-neutral-500">Flexible payment options</p>
            </div>
          </div>
        </div>

        {/* Detailed Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-12">
          
          {/* Brand Col */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-base">A</span>
              <span className="font-extrabold text-lg tracking-tight text-white">
                Aero<span className="text-primary">Cart</span>
              </span>
            </Link>
            <p className="text-sm text-neutral-500 mb-6 max-w-sm">
              Discover curated luxury items, consumer electronics, and daily essentials built with exceptional design, premium support, and high-fidelity logistics.
            </p>
            <div className="flex flex-col gap-2.5 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <span>100 Innovation Way, San Francisco, CA 94103</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span>+1 (555) 019-9000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span>support@aerocart.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products?category=electronics" className="hover:text-primary transition-colors">Electronics</Link></li>
              <li><Link to="/products?category=fashion" className="hover:text-primary transition-colors">Fashion & Apparel</Link></li>
              <li><Link to="/products?category=home" className="hover:text-primary transition-colors">Home & Living</Link></li>
              <li><Link to="/products?category=beauty" className="hover:text-primary transition-colors">Beauty & Wellness</Link></li>
              <li><Link to="/products?category=sports" className="hover:text-primary transition-colors">Sports & Outdoors</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Customer Care</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/profile?tab=orders" className="hover:text-primary transition-colors">Track Order</Link></li>
              <li><Link to="/cart" className="hover:text-primary transition-colors">My Cart</Link></li>
              <li><Link to="/profile" className="hover:text-primary transition-colors">Address Book</Link></li>
              <li><Link to="/profile?tab=wishlist" className="hover:text-primary transition-colors">My Wishlist</Link></li>
              <li><a href="http://localhost:5174" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Seller Hub Portal</a></li>
            </ul>
          </div>

          {/* Newsletter signup */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Join Newsletter</h4>
            <p className="text-xs text-neutral-500 mb-4">Subscribe to receive notifications about flashing deals, restocks, and exclusive coupons.</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Enter email address"
                className="bg-neutral-800 text-white placeholder-neutral-550 border border-transparent rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary text-xs shadow-inner"
              />
              <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold py-2.5 rounded-xl transition-all shadow-md">
                Subscribe
              </button>
            </form>
          </div>

        </div>

        {/* Footer Base */}
        <div className="border-t border-neutral-800 pt-8 mt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-600">
          <p>© 2026 AeroCart Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-neutral-450 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-neutral-450 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-neutral-450 transition-colors">Security Policy</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
