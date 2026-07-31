export interface ProductReview {
  id: string;
  user: string;
  date: string;
  rating: number;
  comment: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  discount: number;
  quantity: number;
  rating: number;
  reviewsCount: number;
  images: string[];
  status: 'active' | 'inactive';
  reviews: ProductReview[];
  lowStockThreshold: number;
  specifications: Record<string, string>;
  highlights?: string[];
  offers?: string[];
  warranty?: string;
  colors?: { name: string; hex: string }[];
  variants?: { storage?: string[]; ram?: string[]; size?: string[] };
  isFlashDeal?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isFeatured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
  itemCount: number;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  rating: number;
}

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'mobiles', name: 'Mobiles', icon: 'Smartphone', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80', itemCount: 120 },
  { id: 'laptops', name: 'Laptops', icon: 'Laptop', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80', itemCount: 85 },
  { id: 'audio', name: 'TV & Audio', icon: 'Headphones', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80', itemCount: 94 },
  { id: 'fashion', name: 'Fashion', icon: 'Shirt', image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&auto=format&fit=crop&q=80', itemCount: 210 },
  { id: 'home', name: 'Home & Living', icon: 'Home', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&auto=format&fit=crop&q=80', itemCount: 150 },
  { id: 'beauty', name: 'Beauty', icon: 'Sparkles', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&auto=format&fit=crop&q=80', itemCount: 76 },
  { id: 'sports', name: 'Sports & Fitness', icon: 'Dumbbell', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80', itemCount: 64 },
  { id: 'grocery', name: 'Grocery', icon: 'ShoppingBag', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80', itemCount: 180 },
  { id: 'books', name: 'Books', icon: 'BookOpen', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80', itemCount: 110 },
  { id: 'gaming', name: 'Gaming', icon: 'Gamepad2', image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&auto=format&fit=crop&q=80', itemCount: 52 },
];

export const INITIAL_BRANDS: Brand[] = [
  { id: 'apple', name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', rating: 4.9 },
  { id: 'samsung', name: 'Samsung', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg', rating: 4.8 },
  { id: 'boat', name: 'boAt', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Boat_Logo.png', rating: 4.6 },
  { id: 'nike', name: 'Nike', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg', rating: 4.8 },
  { id: 'puma', name: 'Puma', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/88/Puma_Logo.png', rating: 4.7 },
  { id: 'adidas', name: 'Adidas', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg', rating: 4.7 },
  { id: 'sony', name: 'Sony', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg', rating: 4.9 },
  { id: 'lg', name: 'LG', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/LG_logo_%282015%29.svg', rating: 4.6 }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-iphone15',
    name: 'Apple iPhone 15 (128GB) - Pink',
    brand: 'Apple',
    category: 'mobiles',
    description: 'Dynamic Island displays alerts and Live Activities. 48MP Main camera with 2x Telephoto for high-resolution photos. Durable color-infused glass and aluminum design.',
    price: 79900,
    discount: 25,
    quantity: 18,
    rating: 4.7,
    reviewsCount: 14246,
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'active',
    lowStockThreshold: 5,
    specifications: {
      'Display': '6.1-inch Super Retina XDR',
      'Chip': 'A16 Bionic chip',
      'Camera': '48MP Main + 12MP Ultra Wide',
      'Connector': 'USB-C',
      'Battery Life': 'Up to 20 hours video playback',
      'Water Resistance': 'IP68 rating'
    },
    highlights: [
      'Dynamic Island brings alerts and Live Activities to front',
      '48MP Main camera with 2x Telephoto lens',
      'Durable color-infused glass and aerospace-grade aluminum',
      'USB-C connector for universal charging'
    ],
    offers: [
      'Bank Offer: 10% Instant Discount on SBI Credit Cards',
      'No Cost EMI: Available on orders above ₹3,000',
      'Exchange Offer: Up to ₹15,000 off on your old smartphone'
    ],
    warranty: '1 Year Brand Warranty',
    colors: [
      { name: 'Pink', hex: '#fbcfe8' },
      { name: 'Yellow', hex: '#fef08a' },
      { name: 'Green', hex: '#bbf7d0' },
      { name: 'Blue', hex: '#bfdbfe' },
      { name: 'Black', hex: '#18181b' }
    ],
    variants: {
      storage: ['128GB', '256GB', '512GB']
    },
    isFlashDeal: true,
    isBestSeller: true,
    isFeatured: true,
    reviews: [
      { id: 'rev-1', user: 'Rahul Sharma', date: '2026-07-20', rating: 5, comment: 'Incredible camera quality and battery life! The Dynamic Island makes notifications feel so slick.' },
      { id: 'rev-2', user: 'Priya Patel', date: '2026-07-15', rating: 4, comment: 'Super smooth performance and beautiful pink color finish. Delivered in 2 days!' }
    ]
  },
  {
    id: 'prod-s24',
    name: 'Samsung Galaxy S24 Ultra 5G (256GB)',
    brand: 'Samsung',
    category: 'mobiles',
    description: 'Welcome to the era of mobile AI. With Galaxy S24 Ultra, unleash whole new levels of creativity, productivity and possibility.',
    price: 129999,
    discount: 15,
    quantity: 12,
    rating: 4.8,
    reviewsCount: 8940,
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'active',
    lowStockThreshold: 4,
    specifications: {
      'Display': '6.8-inch QHD+ Dynamic AMOLED 2X',
      'Processor': 'Snapdragon 8 Gen 3 for Galaxy',
      'Camera': '200MP + 50MP + 12MP + 10MP',
      'Stylus': 'Built-in S Pen included',
      'Battery': '5000 mAh Fast Charging'
    },
    highlights: [
      'Circle to Search with Google AI integration',
      'Live Translate two-way real-time voice call translation',
      '200MP camera sensor with ProVisual Engine',
      'Titanium Frame armor protection'
    ],
    offers: [
      'Bank Offer: ₹5,000 Cashback on HDFC Cards',
      'No Cost EMI starting at ₹5,416/month'
    ],
    warranty: '1 Year Manufacturer Warranty',
    colors: [
      { name: 'Titanium Gray', hex: '#64748b' },
      { name: 'Titanium Black', hex: '#0f172a' },
      { name: 'Titanium Violet', hex: '#5b21b6' }
    ],
    variants: {
      storage: ['256GB', '512GB', '1TB'],
      ram: ['12GB']
    },
    isFlashDeal: true,
    isBestSeller: true,
    isFeatured: true,
    reviews: [
      { id: 'rev-3', user: 'Amit Verma', date: '2026-07-22', rating: 5, comment: 'The 200MP camera zoom is mind blowing! S Pen feels natural.' }
    ]
  },
  {
    id: 'prod-airpods-pro',
    name: 'Apple AirPods Pro (2nd Generation) USB-C',
    brand: 'Apple',
    category: 'audio',
    description: 'Up to 2x more Active Noise Cancellation than the previous generation. Transparency mode lets you comfortably hear the world around you.',
    price: 24900,
    discount: 10,
    quantity: 25,
    rating: 4.8,
    reviewsCount: 6540,
    images: [
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'active',
    lowStockThreshold: 5,
    specifications: {
      'Chip': 'Apple H2 Headphone Chip',
      'Audio Tech': 'Custom high-excursion Apple driver',
      'Noise Control': 'Active Noise Cancellation & Adaptive Audio',
      'Battery': 'Up to 6 hours listening time (30 hrs with MagSafe case)',
      'Water Rating': 'IP54 dust, sweat, and water resistant'
    },
    highlights: [
      'Apple-designed H2 chip delivers immersive audio acoustics',
      'Adaptive Audio dynamically blends Transparency and Noise Cancellation',
      'Personalized Spatial Audio with dynamic head tracking'
    ],
    offers: ['Instant Discount of ₹1,500 on ICICI Bank Cards'],
    warranty: '1 Year Warranty',
    isFlashDeal: true,
    isBestSeller: true,
    isFeatured: true,
    reviews: [
      { id: 'rev-4', user: 'Sneha Roy', date: '2026-07-18', rating: 5, comment: 'Noise cancellation is spooky quiet on flights!' }
    ]
  },
  {
    id: 'prod-boat-airdopes',
    name: 'boAt Airdopes 141 TWS Earbuds',
    brand: 'boAt',
    category: 'audio',
    description: 'Enjoy 42 hours of playback time with Beast mode low latency, ENx tech clear voice calls, and ASAP Charge (5 mins charge = 75 mins playtime).',
    price: 2990,
    discount: 57,
    quantity: 45,
    rating: 4.4,
    reviewsCount: 22400,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'active',
    lowStockThreshold: 10,
    specifications: {
      'Playtime': '42 Hours total playtime',
      'Driver Size': '8mm dynamic drivers',
      'Charging': 'ASAP Fast Charge via Type-C',
      'Water Resistance': 'IPX4 rating'
    },
    highlights: ['42 Hours total playback', '80ms Low Latency Beast Mode', 'ENx Environmental Noise Cancellation'],
    offers: ['Get 5% extra discount on UPI payments'],
    warranty: '1 Year boAt Warranty',
    isFlashDeal: true,
    isBestSeller: true,
    isNewArrival: false,
    reviews: []
  },
  {
    id: 'prod-macbook-m3',
    name: 'Apple MacBook Air 15-inch M3 Chip',
    brand: 'Apple',
    category: 'laptops',
    description: 'Leaps tall projects in a single bound. Superlight, under half an inch thin, and up to 18 hours of battery life.',
    price: 134900,
    discount: 12,
    quantity: 8,
    rating: 4.9,
    reviewsCount: 3120,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'active',
    lowStockThreshold: 3,
    specifications: {
      'Processor': 'Apple M3 chip 8-core CPU',
      'RAM': '16GB Unified Memory',
      'SSD': '512GB SSD Storage',
      'Display': '15.3-inch Liquid Retina display',
      'Weight': '1.51 kg'
    },
    highlights: ['M3 chip with 10-core GPU', 'Silent fanless design', 'MagSafe 3 charging port'],
    offers: ['Flat ₹8,000 instant discount on Axis Bank Credit Cards'],
    warranty: '1 Year Apple Care Warranty',
    colors: [
      { name: 'Midnight', hex: '#0f172a' },
      { name: 'Starlight', hex: '#fef08a' },
      { name: 'Space Gray', hex: '#475569' }
    ],
    variants: {
      ram: ['8GB', '16GB', '24GB'],
      storage: ['256GB', '512GB', '1TB']
    },
    isBestSeller: true,
    isNewArrival: true,
    isFeatured: true,
    reviews: []
  },
  {
    id: 'prod-nike-airmax',
    name: 'Nike Air Max 270 React Sneakers',
    brand: 'Nike',
    category: 'fashion',
    description: 'The Nike Air Max 270 React merges Nike lightweight foam with 270 Max Air cushioning for unmatched spring in every step.',
    price: 13995,
    discount: 30,
    quantity: 20,
    rating: 4.7,
    reviewsCount: 1540,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'active',
    lowStockThreshold: 4,
    specifications: {
      'Upper': 'Lightweight woven fabric and synthetic materials',
      'Sole': 'React foam midsole + Air Max heel unit',
      'Fit': 'Snug sock-like inner sleeve',
      'Closure': 'Lace-up'
    },
    highlights: ['270 Max Air unit delivers cushion underfoot', 'Nike React technology delivers extremely smooth ride'],
    offers: ['10% off for Nike Member Pass holders'],
    warranty: '6 Months Brand Warranty',
    colors: [
      { name: 'Red/Black', hex: '#dc2626' },
      { name: 'White/Blue', hex: '#2563eb' }
    ],
    variants: {
      size: ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11']
    },
    isBestSeller: true,
    isNewArrival: true,
    reviews: []
  },
  {
    id: 'prod-sony-bravia',
    name: 'Sony BRAVIA 55-inch 4K Ultra HD Smart Google TV',
    brand: 'Sony',
    category: 'audio',
    description: '4K Processor X1 delivers picture quality filled with rich colors and detailed contrast. Google TV brings your favorite content together.',
    price: 74900,
    discount: 33,
    quantity: 9,
    rating: 4.8,
    reviewsCount: 4210,
    images: [
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'active',
    lowStockThreshold: 2,
    specifications: {
      'Display': '55-inch 4K LED (3840 x 2160)',
      'OS': 'Google TV',
      'Sound': '20W Dolby Audio + X-Balanced Speaker',
      'Refresh Rate': '60 Hz',
      'Ports': '3 HDMI, 2 USB'
    },
    highlights: ['Live Color technology for vivid imagery', 'Google Assistant voice remote included', 'Dolby Audio sound system'],
    offers: ['Free installation & wall mount bracket included'],
    warranty: '2 Year Sony Comprehensive Warranty',
    isFeatured: true,
    reviews: []
  },
  {
    id: 'prod-puma-shoes',
    name: 'Puma Men Running Shoes Velocity Nitro',
    brand: 'Puma',
    category: 'fashion',
    description: 'Nitrogen-infused foam technology provides superior responsiveness and cushioning in a lightweight package for serious runners.',
    price: 10999,
    discount: 40,
    quantity: 16,
    rating: 4.6,
    reviewsCount: 980,
    images: [
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'active',
    lowStockThreshold: 5,
    specifications: {
      'Midsole': 'NITRO FOAM technology',
      'Outsole': 'PUMAGRIP rubber traction',
      'Upper': 'Engineered mesh for breathability'
    },
    highlights: ['NITRO FOAM cushioning', 'PUMAGRIP all-surface rubber outsole'],
    offers: ['Buy 2 Get extra 15% off'],
    warranty: '3 Months Manufacturer Warranty',
    variants: {
      size: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10']
    },
    isBestSeller: true,
    reviews: []
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Flash Sale is Live! ⚡',
    message: 'Up to 70% off on Apple, Samsung, and boAt products for the next 4 hours.',
    time: '10 minutes ago',
    unread: true,
    type: 'promo'
  },
  {
    id: 'notif-2',
    title: 'Order Delivered 🎉',
    message: 'Your order #ORD-1002 has been successfully delivered.',
    time: '2 hours ago',
    unread: true,
    type: 'order'
  },
  {
    id: 'notif-3',
    title: 'Item Restocked 📦',
    message: 'Apple AirPods Pro 2nd Gen is now back in stock!',
    time: '1 day ago',
    unread: false,
    type: 'system'
  }
];

export const HERO_SLIDES = [
  {
    id: 1,
    title: "MEGA SUMMER SALE",
    subtitle: "Up To 70% Off On Top Brands",
    description: "Upgrade your lifestyle with flagship smartphones, premium audio, stylish apparel, and home essentials.",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&auto=format&fit=crop&q=80",
    badge: "SUPER DEALS",
    buttonText: "Shop Sale Now",
    link: "/products?discount=20"
  },
  {
    id: 2,
    title: "ELECTRONICS FESTIVAL",
    subtitle: "Next-Gen Laptops & Smart Devices",
    description: "Experience lightning speed performance powered by M3 chips & AI processors with zero-cost EMI.",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1600&auto=format&fit=crop&q=80",
    badge: "NEW LAUNCH",
    buttonText: "Explore Electronics",
    link: "/products?category=laptops"
  },
  {
    id: 3,
    title: "FASHION & FOOTWEAR",
    subtitle: "Trending Styles from Nike, Puma, Adidas",
    description: "Step into ultra-comfortable sneakers and iconic luxury fashion collections designed for everyday confidence.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80",
    badge: "FASHION WEEK",
    buttonText: "Discover Fashion",
    link: "/products?category=fashion"
  },
  {
    id: 4,
    title: "GAMING & AUDIO WEEK",
    subtitle: "Immersive Sound & High FPS Performance",
    description: "Noise cancelling headphones, mechanical keyboards, and 4K smart TVs engineered for gaming perfection.",
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1600&auto=format&fit=crop&q=80",
    badge: "LIMITED OFFERS",
    buttonText: "Shop Gaming",
    link: "/products?category=audio"
  }
];

export const PROMO_COUPONS = [
  { code: 'SAVE10', discountType: 'percentage', value: 10, minSpend: 500, description: '10% Instant Discount on orders over ₹500' },
  { code: 'WELCOME20', discountType: 'percentage', value: 20, minSpend: 1000, description: '20% off for new AeroSeller shoppers' },
  { code: 'AERO500', discountType: 'fixed', value: 500, minSpend: 2500, description: 'Flat ₹500 off on purchases above ₹2,500' }
];
