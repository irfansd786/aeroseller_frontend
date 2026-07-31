import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, Star, ShoppingCart, Zap, Check, ArrowRightLeft, Tag, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useToastStore } from '../store/toastStore';
import { useCompareStore } from '../store/compareStore';
import { useAuthStore } from '../store/authStore';
import { ProductCard } from '../components/ProductCard';
import { apiService } from '../services/api';
import { formatINR } from '../utils/currency';
import type { Product } from '../data/mockData';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { addItem } = useCartStore();
  const { toggleWishlist, hasItem } = useWishlistStore();
  const { addToast } = useToastStore();
  const { toggleCompare, isCompared } = useCompareStore();
  const { user } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [pincode, setPincode] = useState('560001');
  const [pincodeChecked, setPincodeChecked] = useState(true);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews' | 'faqs'>('description');

  const [zoomStyle, setZoomStyle] = useState({ display: 'none', transformOrigin: '0% 0%', scale: '1' });

  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProductDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const pData = await apiService.getProductById(id);
      setProduct(pData);
      setActiveImage(pData.images[0]);
      if (pData.colors && pData.colors.length > 0) setSelectedColor(pData.colors[0].name);
      if (pData.variants?.storage && pData.variants.storage.length > 0) setSelectedStorage(pData.variants.storage[0]);
      setReviewName(user?.name || '');

      const all = await apiService.getProducts();
      const related = all.filter(p => p.id !== id && (p.category === pData.category || p.brand === pData.brand)).slice(0, 4);
      setRelatedProducts(related);
    } catch (err) {
      console.error("Product fetch error:", err);
      addToast("Failed to load product details", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id, user]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      transformOrigin: `${x}% ${y}%`,
      scale: '2'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      display: 'none',
      transformOrigin: '0% 0%',
      scale: '1'
    });
  };

  const handleAddToCart = () => {
    if (!product || product.quantity === 0) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      discount: product.discount,
      quantity,
      image: product.images[0],
      selectedColor,
      selectedVariant: selectedStorage
    });
    addToast(`Added ${product.name} to cart`, "success");
  };

  const handleBuyNow = () => {
    if (!product || product.quantity === 0) return;
    handleAddToCart();
    navigate('/checkout');
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    toggleWishlist(product.id);
    addToast(
      hasItem(product.id) ? "Removed from wishlist" : "Added to wishlist",
      "success"
    );
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !reviewName.trim() || !reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      await apiService.submitReview(product.id, {
        user: reviewName,
        rating: reviewRating,
        comment: reviewComment
      });
      addToast("Review posted successfully!", "success");
      setReviewComment('');
      fetchProductDetails();
    } catch (err) {
      addToast("Failed to post review", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-96 bg-neutral-100 dark:bg-zinc-900 rounded-3xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-6 w-1/3 bg-neutral-100 dark:bg-zinc-900 rounded-md animate-pulse" />
            <div className="h-10 w-3/4 bg-neutral-100 dark:bg-zinc-900 rounded-md animate-pulse" />
            <div className="h-16 bg-neutral-100 dark:bg-zinc-900 rounded-md animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-white">Product Not Found</h2>
        <button onClick={() => navigate('/products')} className="mt-4 bg-emerald-600 text-white px-6 py-2 rounded-full font-bold text-xs">
          Back to Products
        </button>
      </div>
    );
  }

  const isFavorite = hasItem(product.id);
  const compared = isCompared(product.id);
  const discountPrice = product.price * (1 - product.discount / 100);
  const isOutOfStock = product.quantity === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      <nav className="flex items-center gap-2 text-xs text-neutral-400 font-medium">
        <Link to="/" className="hover:text-emerald-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-emerald-600">Electronics</Link>
        <span>/</span>
        <Link to={`/products?category=${product.category}`} className="hover:text-emerald-600 capitalize">{product.category}</Link>
        <span>/</span>
        <span className="text-neutral-800 dark:text-zinc-200 font-bold truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        <div className="lg:col-span-5 space-y-4">
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative pt-[90%] rounded-3xl overflow-hidden bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-850 cursor-zoom-in shadow-sm"
          >
            <img
              src={activeImage}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                transform: zoomStyle.scale === '2' ? 'scale(2)' : 'none',
                transformOrigin: zoomStyle.transformOrigin,
                transition: zoomStyle.scale === '2' ? 'none' : 'transform 0.15s ease-out'
              }}
            />
            {product.discount > 0 && (
              <span className="absolute bottom-4 left-4 bg-red-500 text-white text-xs font-black px-3 py-1 rounded-md shadow-md">
                {product.discount}% OFF
              </span>
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white font-extrabold text-base">
                OUT OF STOCK
              </div>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 bg-neutral-50 dark:bg-zinc-900 transition-all ${
                    activeImage === img ? 'border-emerald-600' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-600 tracking-wider uppercase bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full">
                {product.brand}
              </span>
              <span className="text-xs text-neutral-400 font-semibold">1000+ bought in past month</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center text-amber-400">
                <Star className="w-4 h-4 fill-current" />
              </div>
              <span className="font-extrabold text-neutral-900 dark:text-white">{product.rating}</span>
              <span className="text-neutral-400 font-medium">({product.reviewsCount || 45} customer reviews)</span>
            </div>

            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl font-black text-neutral-900 dark:text-white">
                {formatINR(discountPrice)}
              </span>
              {product.discount > 0 && (
                <>
                  <span className="text-base text-neutral-400 line-through">
                    {formatINR(product.price)}
                  </span>
                  <span className="text-xs font-bold text-emerald-600">
                    Save {formatINR(product.price - discountPrice)}
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-neutral-400">Inclusive of all taxes</p>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 space-y-2">
              <h4 className="font-bold text-xs text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-emerald-600" /> Available Offers
              </h4>
              <ul className="space-y-1.5 text-xs text-neutral-600 dark:text-zinc-400">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Bank Offer:</strong> 10% Instant Discount on SBI Credit Cards up to ₹1,500</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span><strong>No Cost EMI:</strong> Available on orders above ₹3,000 with major banks</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Exchange Offer:</strong> Up to ₹15,000 off on your old smartphone exchange</span>
                </li>
              </ul>
            </div>

            {product.variants?.storage && (
              <div className="pt-2">
                <span className="block text-xs font-bold text-neutral-500 uppercase mb-2">Storage Option</span>
                <div className="flex gap-2">
                  {product.variants.storage.map(st => (
                    <button
                      key={st}
                      onClick={() => setSelectedStorage(st)}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedStorage === st
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600'
                          : 'border-neutral-200 dark:border-zinc-800 text-neutral-700 dark:text-zinc-300'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div className="pt-2">
                <span className="block text-xs font-bold text-neutral-500 uppercase mb-2">Color: <strong className="text-neutral-900 dark:text-white">{selectedColor}</strong></span>
                <div className="flex gap-3">
                  {product.colors.map(c => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                        selectedColor === c.name ? 'scale-110 border-emerald-600 ring-2 ring-emerald-600/30' : 'border-white dark:border-zinc-800'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 space-y-2">
              <span className="block text-xs font-bold text-neutral-500 uppercase">Delivery & Services</span>
              <div className="flex items-center gap-2 max-w-sm">
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter pincode"
                  className="bg-neutral-100 dark:bg-zinc-900 text-neutral-900 dark:text-white px-4 py-2 rounded-xl text-xs border border-neutral-200 dark:border-zinc-800 focus:outline-none"
                />
                <button
                  onClick={() => setPincodeChecked(true)}
                  className="bg-neutral-900 hover:bg-neutral-800 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Check
                </button>
              </div>
              {pincodeChecked && (
                <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Usually delivered in 2-4 days | Free Delivery
                </p>
              )}
            </div>

            <div className="pt-2">
              <span className="block text-xs font-bold text-neutral-500 uppercase mb-2">Quantity</span>
              <div className="flex items-center gap-3 border border-neutral-200 dark:border-zinc-800 rounded-2xl w-max px-3 py-1.5 bg-neutral-50 dark:bg-zinc-900">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-neutral-500 font-bold p-1 cursor-pointer">-</button>
                <span className="text-xs font-black w-6 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="text-neutral-500 font-bold p-1 cursor-pointer">+</button>
              </div>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-neutral-200 dark:border-zinc-850">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="flex-1 aero-btn-outline text-xs flex items-center justify-center gap-2 py-3.5"
            >
              <ShoppingCart className="w-4.5 h-4.5" /> Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="flex-1 aero-btn-primary text-xs flex items-center justify-center gap-2 py-3.5"
            >
              <Zap className="w-4.5 h-4.5 fill-current" /> Buy Now
            </button>
            <button
              onClick={handleWishlistToggle}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                isFavorite ? 'text-red-500 border-red-200 bg-red-50/50' : 'text-neutral-400 border-neutral-200'
              }`}
              title="Wishlist"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => toggleCompare(product)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                compared ? 'text-emerald-600 border-emerald-600 bg-emerald-50' : 'text-neutral-400 border-neutral-200'
              }`}
              title="Compare"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>

      <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex border-b border-neutral-200 dark:border-zinc-850 gap-6 text-xs font-bold overflow-x-auto no-scrollbar">
          {(['description', 'specifications', 'reviews', 'faqs'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 uppercase tracking-wider transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === tab
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-neutral-400 hover:text-neutral-700 dark:hover:text-zinc-300'
              }`}
            >
              {tab} {tab === 'reviews' && `(${product.reviews?.length || 0})`}
            </button>
          ))}
        </div>

        {activeTab === 'description' && (
          <div className="space-y-4 text-xs text-neutral-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
            <p>{product.description}</p>
            {product.highlights && (
              <div className="pt-2">
                <h4 className="font-bold text-neutral-900 dark:text-white mb-2 text-sm">Key Highlights</h4>
                <ul className="list-disc list-inside space-y-1">
                  {product.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'specifications' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
            {Object.entries(product.specifications || {}).map(([k, v]) => (
              <div key={k} className="flex justify-between py-2.5 border-b border-neutral-100 dark:border-zinc-850 text-xs">
                <span className="font-bold text-neutral-400 uppercase">{k}</span>
                <span className="font-bold text-neutral-800 dark:text-zinc-200">{v}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-neutral-50 dark:bg-zinc-950 p-6 rounded-2xl border border-neutral-200 dark:border-zinc-800 space-y-4">
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white">Write a Customer Review</h4>
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 text-neutral-900 dark:text-white px-3 py-2 rounded-xl text-xs border border-neutral-200 dark:border-zinc-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setReviewRating(st)}
                        className="cursor-pointer"
                      >
                        <Star className={`w-5 h-5 ${st <= reviewRating ? 'text-amber-400 fill-current' : 'text-neutral-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Comments</label>
                  <textarea
                    required
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 text-neutral-900 dark:text-white px-3 py-2 rounded-xl text-xs border border-neutral-200 dark:border-zinc-800 focus:outline-none resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 space-y-4">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map(rev => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-850 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-neutral-900 dark:text-white">{rev.user}</span>
                      <span className="text-[10px] text-neutral-400">{rev.date}</span>
                    </div>
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map(st => (
                        <Star key={st} className={`w-3.5 h-3.5 ${st <= rev.rating ? 'fill-current' : 'text-neutral-300'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-zinc-400 leading-snug">{rev.comment}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-neutral-400">No reviews yet.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'faqs' && (
          <div className="space-y-4 max-w-3xl text-xs">
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-850">
              <h5 className="font-bold text-neutral-900 dark:text-white mb-1">What is covered under brand warranty?</h5>
              <p className="text-neutral-500">Brand warranty covers manufacturing defects and internal hardware failures for 1 year from purchase date.</p>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-850">
              <h5 className="font-bold text-neutral-900 dark:text-white mb-1">Can I return this product if damaged?</h5>
              <p className="text-neutral-500">Yes, AeroSeller offers a 7-day hassle-free replacement for damaged or incorrect deliveries.</p>
            </div>
          </div>
        )}

      </div>

      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-4">
          <h3 className="text-xl font-black text-neutral-900 dark:text-white">Related Products</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
