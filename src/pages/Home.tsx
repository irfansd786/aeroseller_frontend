import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Laptop, Shirt, Home as HomeIcon, Sparkles, Dumbbell, ChevronRight, Clock, Truck, RotateCcw, ShieldCheck, ChevronLeft, Smartphone, Headphones, ShoppingBag, BookOpen, Gamepad2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCard } from '../components/ProductCard';
import { apiService } from '../services/api';
import { HERO_SLIDES, INITIAL_BRANDS, type Product } from '../data/mockData';

const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Smartphone': return Smartphone;
    case 'Laptop': return Laptop;
    case 'Headphones': return Headphones;
    case 'Shirt': return Shirt;
    case 'Home': return HomeIcon;
    case 'Sparkles': return Sparkles;
    case 'Dumbbell': return Dumbbell;
    case 'ShoppingBag': return ShoppingBag;
    case 'BookOpen': return BookOpen;
    case 'Gamepad2': return Gamepad2;
    default: return Laptop;
  }
};

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentHero, setCurrentHero] = useState(0);

  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 15, seconds: 36 });

  const fetchHomeData = async () => {
    setLoading(true);
    try {
      const [catData, prodData] = await Promise.all([
        apiService.getCategories(),
        apiService.getProducts()
      ]);
      setCategories(catData);
      setProducts(prodData.filter(p => p.status === 'active'));
    } catch (err) {
      console.error("Failed to load home page data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 2, minutes: 15, seconds: 36 };
        }
      });
    }, 1000);

    const heroInterval = setInterval(() => {
      setCurrentHero(prev => (prev + 1) % HERO_SLIDES.length);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(heroInterval);
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="h-96 bg-neutral-100 dark:bg-zinc-900 rounded-3xl animate-pulse" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="w-28 h-28 bg-neutral-100 dark:bg-zinc-900 rounded-2xl flex-shrink-0 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-72 bg-neutral-100 dark:bg-zinc-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const flashSaleProducts = products.filter(p => p.isFlashDeal || p.discount >= 20).slice(0, 4);
  const bestSellers = products.filter(p => p.isBestSeller || p.rating >= 4.7).slice(0, 4);
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="pb-16 space-y-12 sm:space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      
      {/* HERO CAROUSEL */}
      <div className="relative w-full h-[360px] sm:h-[480px] lg:h-[520px] rounded-3xl overflow-hidden shadow-2xl bg-neutral-950">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentHero}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 w-full h-full"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent z-10" />
            <img
              src={HERO_SLIDES[currentHero].image}
              alt={HERO_SLIDES[currentHero].title}
              className="w-full h-full object-cover object-center"
            />
            
            <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 sm:px-14 lg:px-20 text-white max-w-2xl gap-3">
              <span className="text-xs font-black tracking-widest bg-emerald-600 px-3.5 py-1 rounded-full w-max text-white shadow-lg">
                {HERO_SLIDES[currentHero].badge}
              </span>
              <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight">
                {HERO_SLIDES[currentHero].title}
              </h1>
              <h2 className="text-lg sm:text-2xl font-bold text-emerald-400">
                {HERO_SLIDES[currentHero].subtitle}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 line-clamp-2 leading-relaxed max-w-lg">
                {HERO_SLIDES[currentHero].description}
              </p>
              <button
                onClick={() => navigate(HERO_SLIDES[currentHero].link)}
                className="mt-4 w-max bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-7 py-3.5 rounded-full shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 cursor-pointer flex items-center gap-2"
              >
                {HERO_SLIDES[currentHero].buttonText} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={() => setCurrentHero(prev => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1))}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/40 hover:bg-black/80 text-white transition-colors cursor-pointer backdrop-blur-xs"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setCurrentHero(prev => (prev + 1) % HERO_SLIDES.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/40 hover:bg-black/80 text-white transition-colors cursor-pointer backdrop-blur-xs"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="absolute bottom-6 right-8 z-30 flex gap-2">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentHero(idx)}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                idx === currentHero ? 'bg-emerald-500 w-8' : 'bg-white/40 hover:bg-white w-2.5'
              }`}
            />
          ))}
        </div>
      </div>

      {/* TRUST FEATURES BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-neutral-900 dark:text-white">Free Delivery</h4>
            <p className="text-[10px] text-neutral-500">On orders above ₹499</p>
          </div>
        </div>
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-neutral-900 dark:text-white">Easy Returns</h4>
            <p className="text-[10px] text-neutral-500">30-days return policy</p>
          </div>
        </div>
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-neutral-900 dark:text-white">Secure Payment</h4>
            <p className="text-[10px] text-neutral-500">100% secure payment</p>
          </div>
        </div>
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-neutral-900 dark:text-white">24/7 Support</h4>
            <p className="text-[10px] text-neutral-500">Dedicated assistance</p>
          </div>
        </div>
      </div>

      {/* CATEGORIES SECTION */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">Shop by Category</h2>
            <p className="text-xs text-neutral-500">Explore items tailored to your lifestyle</p>
          </div>
          <button onClick={() => navigate('/products')} className="flex items-center gap-1 text-emerald-600 font-bold text-xs hover:underline">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-10 gap-4">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.icon);
            return (
              <button
                key={cat.id}
                onClick={() => navigate(`/products?category=${cat.id}`)}
                className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl hover:border-emerald-600 dark:hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold text-neutral-800 dark:text-zinc-200 text-center truncate w-full">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FLASH SALE WITH LIVE TIMER */}
      <div className="bg-emerald-900/5 dark:bg-zinc-900/40 border border-emerald-600/20 dark:border-zinc-800 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="lg:w-1/4 space-y-4 text-center lg:text-left">
            <span className="text-red-500 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 justify-center lg:justify-start">
              <Clock className="w-4 h-4" /> Flash Deals
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white leading-tight">
              Limited Time Offers
            </h2>
            <p className="text-xs text-neutral-500">
              Grab premium electronics, audio gear, and fashion at high discount rates.
            </p>
            
            <div className="flex gap-2 justify-center lg:justify-start font-mono">
              <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-2.5 rounded-xl shadow-xs text-center min-w-[50px]">
                <span className="text-xl font-black text-neutral-900 dark:text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-[9px] block text-neutral-400 font-sans uppercase font-bold">Hours</span>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-2.5 rounded-xl shadow-xs text-center min-w-[50px]">
                <span className="text-xl font-black text-neutral-900 dark:text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-[9px] block text-neutral-400 font-sans uppercase font-bold">Mins</span>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-2.5 rounded-xl shadow-xs text-center min-w-[50px]">
                <span className="text-xl font-black text-red-500">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-[9px] block text-neutral-400 font-sans uppercase font-bold">Secs</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/products?discount=20')}
              className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-3 rounded-full shadow-md transition-all hover:scale-105 cursor-pointer"
            >
              View All Deals
            </button>
          </div>

          <div className="lg:w-3/4 w-full grid grid-cols-2 md:grid-cols-4 gap-6">
            {flashSaleProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>

      {/* BEST SELLERS */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">Best Sellers</h2>
            <p className="text-xs text-neutral-500">Top rated products this week</p>
          </div>
          <button onClick={() => navigate('/products')} className="flex items-center gap-1 text-emerald-600 font-bold text-xs hover:underline">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {bestSellers.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      {/* TOP BRANDS */}
      <div className="bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-3xl p-8 text-center">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-sm uppercase tracking-wider text-neutral-400">Top Brands</h3>
          <button onClick={() => navigate('/products')} className="text-xs font-bold text-emerald-600 hover:underline">
            View All
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 items-center">
          {INITIAL_BRANDS.map((brand) => (
            <button
              key={brand.id}
              onClick={() => navigate(`/products?brand=${brand.name}`)}
              className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 px-4 py-3 rounded-2xl flex items-center justify-center font-black text-neutral-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-600 transition-all cursor-pointer shadow-xs text-sm"
            >
              {brand.name}
            </button>
          ))}
        </div>
      </div>

      {/* FEATURED & NEW ARRIVALS */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">Featured & New Arrivals</h2>
            <p className="text-xs text-neutral-500">Handpicked premium products just arrived</p>
          </div>
          <button onClick={() => navigate('/products')} className="flex items-center gap-1 text-emerald-600 font-bold text-xs hover:underline">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featuredProducts.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

    </div>
  );
};
