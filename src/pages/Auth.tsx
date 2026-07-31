import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Lock, Mail, User, Phone, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { addToast } = useToastStore();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast("Please fill in email and password", "error");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const mockUser = {
        name: isLogin ? (name || 'S.D. Irfan') : name,
        email: email,
        phone: phone || '+91 9876543210'
      };
      login('mock-jwt-token-aeroseller', 'customer', mockUser);
      addToast(isLogin ? "Welcome back to AeroSeller!" : "Account created successfully!", "success");
      navigate('/profile');
    }, 600);
  };

  const handleDemoLogin = () => {
    const mockUser = {
      name: 'Demo Customer',
      email: 'customer@aeroseller.com',
      phone: '+91 9876543210'
    };
    login('mock-demo-token', 'customer', mockUser);
    addToast("Logged in as Demo Customer!", "success");
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-3xl p-8 space-y-6 shadow-xl">
        
        {/* AeroSeller Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl mx-auto shadow-lg shadow-emerald-600/30">
            <ShoppingBag className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
            Aero<span className="text-emerald-600">Seller</span>
          </h1>
          <p className="text-xs text-neutral-400">
            {isLogin ? "Welcome back! Login to access your account." : "Create a new AeroSeller account in seconds."}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-neutral-100 dark:bg-zinc-950 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
              isLogin ? 'bg-white dark:bg-zinc-800 text-emerald-600 shadow-sm' : 'text-neutral-500'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
              !isLogin ? 'bg-white dark:bg-zinc-800 text-emerald-600 shadow-sm' : 'text-neutral-500'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {!isLogin && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="S.D. Irfan"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-zinc-950 text-neutral-900 dark:text-white pl-9 pr-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-zinc-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Mobile Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-zinc-950 text-neutral-900 dark:text-white pl-9 pr-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-zinc-800 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="email"
                placeholder="irfan@aeroseller.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-zinc-950 text-neutral-900 dark:text-white pl-9 pr-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-zinc-800 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-zinc-950 text-neutral-900 dark:text-white pl-9 pr-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-zinc-800 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full aero-btn-primary text-xs flex items-center justify-center gap-2 py-3.5 mt-2"
          >
            {loading ? "Please wait..." : isLogin ? "Login Now" : "Create Account"} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-neutral-200 dark:border-zinc-800"></div>
          <span className="flex-shrink mx-4 text-[10px] text-neutral-400 font-bold uppercase">Or Quick Access</span>
          <div className="flex-grow border-t border-neutral-200 dark:border-zinc-800"></div>
        </div>

        <button
          onClick={handleDemoLogin}
          className="w-full bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-neutral-800 dark:text-zinc-200 font-bold text-xs py-3 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> One-Click Demo Customer Login
        </button>

      </div>
    </div>
  );
};
