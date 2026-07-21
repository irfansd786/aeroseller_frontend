import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Laptop, Shirt, Home as HomeIcon, Sparkles, Dumbbell, ChevronRight, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '../components/ProductCard';

interface Category {
  id: string;
  name: string;
  icon: string;
}

const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Laptop': return Laptop;
    case 'Shirt': return Shirt;
    case 'Home': return HomeIcon;
    case 'Sparkles': return Sparkles;
    case 'Dumbbell': return Dumbbell;
    default: return Laptop;
  }
};

const STATIC_HERO_SLIDES = [
  {
    id: 1,
    title: "The Next Generation AeroBook Pro M3",
    subtitle: "Thinness meets raw processing efficiency. Powered by Apple M3 Pro core architecture.",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1600&auto=format&fit=crop&q=80",
    link: "/product/prod-1",
    tag: "NEW RELEASE"
  },
  {
    id: 2,
    title: "Curated Precision Swiss Movement Chronos",
    subtitle: "Automatic calibration mechanical timepiece. 100 meters water depth rating.",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=1600&auto=format&fit=crop&q=80",
    link: "/product/prod-2",
    tag: "LUXURY STYLE"
  },
  {
    id: 3,
    title: "Specialty Third-Wave Coffee At Home",
    subtitle: "Digital thermal PID heating with 15 bar pump pressure controls. Restocking now.",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&auto=format&fit=crop&q=80",
    link: "/product/prod-8",
    tag: "HOME COMFORT"
  }
];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentHero, setCurrentHero] = useState(0);

  // Live countdown timer for Flash Sale
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 34, seconds: 12 });

  const fetchHomeData = () => {
    setLoading(true);
    return Promise.all([
      axios.get('https://aeroseller-backend.onrender.com/api/categories'),
      axios.get('https://aeroseller-backend.onrender.com/api/products')
    ])
      .then(([catRes, prodRes]) => {
        setCategories(catRes.data);
        setProducts(prodRes.data.filter((p: Product) => p.status === 'active'));
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load home page data:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHomeData();

    const handleFocus = () => {
      fetchHomeData();
    };
    window.addEventListener('focus', handleFocus);

    // Flash sale countdown logic
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 4, minutes: 34, seconds: 12 }; // Loop reset
        }
      });
    }, 1000);

    // Hero banner automatic scroll
    const heroInterval = setInterval(() => {
      setCurrentHero(prev => (prev + 1) % STATIC_HERO_SLIDES.length);
    }, 6000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
      clearInterval(heroInterval);
    };
  }, []);

  const heroSlides = products.length >= 3
    ? products.slice(0, 3).map((product, index) => ({
        id: product.id,
        title: product.name,
        subtitle: product.description,
        image: product.images[0] || STATIC_HERO_SLIDES[index]?.image,
        link: `/product/${product.id}`,
        tag: product.discount > 0 ? `${product.discount}% OFF` : 'Featured'
      }))
    : STATIC_HERO_SLIDES;

  if (loading) {
    return (
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="h-96 bg-neutral-100 dark:bg-zinc-900 rounded-[20px] animate-pulse" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="w-32 h-32 bg-neutral-100 dark:bg-zinc-900 rounded-2xl flex-shrink-0 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-64 bg-neutral-100 dark:bg-zinc-900 rounded-[20px] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Subsetting products
  const featuredProducts = products.slice(0, 4);
  const trendingProducts = products.slice(2, 6);
  const bestSellers = products.filter(p => p.rating >= 4.7).slice(0, 4);
  const flashSaleProducts = products.filter(p => p.discount >= 10).slice(0, 4);

  return (
    <div className="pb-16 space-y-12 sm:space-y-16 max-w-full mx-auto">
      
      {/* 1. Hero Carousel */}
      <div className="relative w-full h-[320px] sm:h-[450px] lg:h-[550px] overflow-hidden bg-neutral-950">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentHero}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 w-full h-full"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent z-10" />
            <img
              src={heroSlides[currentHero].image}
              alt={heroSlides[currentHero].title}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 sm:px-12 lg:px-24 text-white max-w-2xl gap-2 sm:gap-4">
              <span className="text-[10px] sm:text-xs font-bold tracking-widest bg-primary px-3 py-1 rounded-full w-max text-white">
                {heroSlides[currentHero].tag}
              </span>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
                {heroSlides[currentHero].title}
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-neutral-350 line-clamp-2">
                {heroSlides[currentHero].subtitle}
              </p>
              <button
                onClick={() => navigate(heroSlides[currentHero].link)}
                className="mt-2 w-max bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 cursor-pointer"
              >
                Explore Product
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel indicators */}
        <div className="absolute bottom-6 right-6 sm:right-12 z-20 flex gap-2">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentHero(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                idx === currentHero ? 'bg-primary w-6' : 'bg-white/40 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 2. Categories Scrollbar */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg sm:text-2xl font-extrabold text-neutral-900 dark:text-white">Shop by Category</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.icon);
            return (
              <button
                key={cat.id}
                onClick={() => navigate(`/products?category=${cat.id}`)}
                className="flex flex-col items-center gap-3 bg-neutral-50 hover:bg-white dark:bg-zinc-900 dark:hover:bg-zinc-800/80 p-5 rounded-[20px] border border-neutral-100 dark:border-zinc-850 min-w-[130px] flex-shrink-0 transition-all cursor-pointer hover:shadow-lg dark:hover:border-zinc-700"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-light dark:bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-neutral-700 dark:text-zinc-300">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Flash Sale + Live Countdown */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="bg-primary/5 dark:bg-zinc-900/30 border border-primary/20 dark:border-zinc-800 rounded-[28px] p-6 sm:p-8 flex flex-col lg:flex-row items-center gap-8">
          <div className="lg:w-1/4 space-y-4 text-center lg:text-left">
            <span className="text-red-500 text-xs font-extrabold uppercase tracking-widest flex items-center gap-1.5 justify-center lg:justify-start">
              <Clock className="w-4 h-4" /> Live Flash Sale
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-neutral-900 dark:text-white leading-tight">
              Hot Deals, Short Window.
            </h2>
            <p className="text-xs text-neutral-500 max-w-xs">
              Check out these selected premium items matching higher discounts. Only for a short duration.
            </p>
            {/* Live Count clock */}
            <div className="flex gap-2 justify-center lg:justify-start font-mono text-zinc-800 dark:text-zinc-150">
              <div className="bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 p-2.5 rounded-xl shadow-xs">
                <span className="text-lg font-black">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-[10px] block text-neutral-400 font-sans">Hrs</span>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 p-2.5 rounded-xl shadow-xs">
                <span className="text-lg font-black">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-[10px] block text-neutral-400 font-sans">Min</span>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 p-2.5 rounded-xl shadow-xs">
                <span className="text-lg font-black text-red-500">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-[10px] block text-neutral-400 font-sans">Sec</span>
              </div>
            </div>
          </div>
          
          <div className="lg:w-3/4 w-full grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {flashSaleProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>

      {/* 4. Featured Products Grid */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg sm:text-2xl font-extrabold text-neutral-900 dark:text-white">Featured Products</h2>
          <button onClick={() => navigate('/products')} className="flex items-center gap-1 text-primary font-bold text-xs sm:text-sm hover:underline">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      {/* 5. Trending Products Grid */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg sm:text-2xl font-extrabold text-neutral-900 dark:text-white">Trending Products</h2>
          <button onClick={() => navigate('/products')} className="flex items-center gap-1 text-primary font-bold text-xs sm:text-sm hover:underline">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {trendingProducts.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      {/* 6. Best Sellers Grid */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg sm:text-2xl font-extrabold text-neutral-900 dark:text-white">Best Sellers</h2>
          <button onClick={() => navigate('/products')} className="flex items-center gap-1 text-primary font-bold text-xs sm:text-sm hover:underline">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {bestSellers.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      {/* 7. Brands list */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="bg-neutral-50 dark:bg-zinc-950 border border-neutral-100 dark:border-zinc-900/60 rounded-[28px] p-8 text-center">
          <h3 className="font-extrabold text-sm tracking-wider uppercase text-neutral-400 mb-6">Partnering Brands</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6 items-center">
            {['Aero', 'Chronos', 'SoundSphere', 'Luna', 'HydroFit', 'Nirvana'].map((brand, i) => (
              <div key={i} className="bg-white dark:bg-zinc-900 border border-neutral-150 dark:border-zinc-800/80 px-6 py-4 rounded-xl flex items-center justify-center font-black text-neutral-400 dark:text-zinc-650 tracking-widest text-sm hover:text-primary dark:hover:text-primary transition-all">
                {brand.toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
