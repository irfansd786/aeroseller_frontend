import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Star, ShoppingCart, Truck, Calendar, Zap, Check, AlertTriangle, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useToastStore } from '../store/toastStore';
import { useAuthStore } from '../store/authStore';
import { ProductCard } from '../components/ProductCard';
import { formatINR } from '../utils/currency';
import type { Product } from '../components/ProductCard';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { addItem } = useCartStore();
  const { toggleWishlist, hasItem } = useWishlistStore();
  const { addToast } = useToastStore();
  const { user } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', transformOrigin: '0% 0%', scale: '1' });

  // Reviews submission form states
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProductDetails = () => {
    if (!id) return;
    setLoading(true);

    axios.get(`http://localhost:5000/api/products/${id}`)
      .then(res => {
        const productData = res.data;
        setProduct(productData);
        setActiveImage(productData.images[0]);
        setReviewName(user?.name || '');

        return axios.get('http://localhost:5000/api/products')
          .then(prodRes => {
            const related = prodRes.data.filter((p: Product) => 
              p.id !== id && 
              p.status === 'active' && 
              (p.category === productData.category || p.brand === productData.brand)
            ).slice(0, 4);
            setRelatedProducts(related);
          });
      })
      .then(() => {
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading product details:", err);
        setLoading(false);
        addToast("Error fetching product details", "error");
      });
  };

  useEffect(() => {
    fetchProductDetails();

    const handleFocus = () => {
      fetchProductDetails();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
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
      quantity: 1,
      image: product.images[0]
    });
    addToast(`Added ${product.name} to cart`, "success");
  };

  const handleBuyNow = () => {
    if (!product || product.quantity === 0) return;
    if (!user) {
      addToast('Please login to buy now and complete checkout.', 'error');
      navigate('/auth');
      return;
    }

    // Add to cart first
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      discount: product.discount,
      quantity: 1,
      image: product.images[0]
    }).then(() => {
      navigate('/checkout');
    });
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
      const res = await axios.post(`http://localhost:5000/api/products/${product.id}/reviews`, {
        user: reviewName,
        rating: reviewRating,
        comment: reviewComment
      });

      if (res.data.success) {
        addToast("Review submitted successfully!", "success");
        // Reload product details to show new review
        const updatedRes = await axios.get(`http://localhost:5000/api/products/${product.id}`);
        setProduct(updatedRes.data);
        setReviewComment('');
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to submit review", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-[450px] bg-neutral-100 dark:bg-zinc-900 rounded-[28px] animate-pulse" />
          <div className="space-y-4">
            <div className="h-6 w-1/4 bg-neutral-100 dark:bg-zinc-900 rounded-md animate-pulse" />
            <div className="h-10 w-3/4 bg-neutral-100 dark:bg-zinc-900 rounded-md animate-pulse" />
            <div className="h-6 w-1/2 bg-neutral-100 dark:bg-zinc-900 rounded-md animate-pulse" />
            <div className="h-24 bg-neutral-100 dark:bg-zinc-900 rounded-md animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-white">Product Not Found</h2>
        <button onClick={() => navigate('/products')} className="mt-4 bg-primary text-white px-6 py-2 rounded-full font-bold">
          Back to Products
        </button>
      </div>
    );
  }

  const isFavorite = hasItem(product.id);
  const discountPrice = product.price * (1 - product.discount / 100);
  const isOutOfStock = product.quantity === 0;

  // Mock delivery dates
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const formattedDelivery = deliveryDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Product top panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Main Zoom Container */}
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative pt-[80%] rounded-[28px] overflow-hidden bg-neutral-50 dark:bg-zinc-950 border border-neutral-150 dark:border-zinc-850 cursor-zoom-in"
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
              <span className="absolute bottom-6 left-6 bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-md shadow-md">
                {product.discount}% OFF
              </span>
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white font-extrabold text-lg">
                OUT OF STOCK
              </div>
            )}
          </div>

          {/* Thumbnails row */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 bg-neutral-50 dark:bg-zinc-900 transition-colors ${
                    activeImage === img ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Checkout Info & Specifications */}
        <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Meta */}
            <span className="text-xs font-black text-primary tracking-widest uppercase bg-primary-light dark:bg-primary/10 px-3 py-1 rounded-full w-max block">
              {product.brand} • {product.category}
            </span>

            <h1 className="text-xl sm:text-3xl font-black text-neutral-900 dark:text-white leading-tight">
              {product.name}
            </h1>

            {/* Ratings & reviews sum */}
            <div className="flex items-center gap-1.5 text-sm">
              <div className="flex items-center text-amber-400">
                <Star className="w-4 h-4 fill-current" />
              </div>
              <span className="font-extrabold text-neutral-800 dark:text-zinc-200">{product.rating}</span>
              <span className="text-neutral-400">({product.reviews?.length || 0} customer reviews)</span>
            </div>

            {/* Prices */}
            <div className="flex items-baseline gap-3">
              {product.discount > 0 ? (
                <>
                  <span className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
                    {formatINR(discountPrice)}
                  </span>
                  <span className="text-sm text-neutral-450 line-through">
                    {formatINR(product.price)}
                  </span>
                </>
              ) : (
                <span className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
                  {formatINR(product.price)}
                </span>
              )}
            </div>

            {/* Stock Alert block */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-850 flex items-center gap-3">
              {isOutOfStock ? (
                <>
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div>
                    <h5 className="font-bold text-sm text-red-500">Temporarily Out of Stock</h5>
                    <p className="text-[10px] text-neutral-400">This product has been sold out. You can check back shortly for a restock.</p>
                  </div>
                </>
              ) : product.quantity <= (product.lowStockThreshold || 3) ? (
                <>
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <div>
                    <h5 className="font-bold text-sm text-amber-500">Only {product.quantity} left in stock!</h5>
                    <p className="text-[10px] text-neutral-400">Order soon to avoid delay. Decreasing quantity automatically.</p>
                  </div>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <h5 className="font-bold text-sm text-primary">In Stock & Ready to Ship</h5>
                    <p className="text-[10px] text-neutral-400">Available quantity: {product.quantity}. Fast shipping eligible.</p>
                  </div>
                </>
              )}
            </div>

            {/* Shipping Info */}
            <div className="space-y-2 text-xs text-neutral-500">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-neutral-400" />
                <span>Eligible for Free Delivery on orders over ₹150</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-neutral-400" />
                <span>Estimated Delivery: <strong className="text-neutral-700 dark:text-zinc-300 font-semibold">{formattedDelivery}</strong></span>
              </div>
            </div>

            {/* Description */}
            <div className="text-sm text-neutral-600 dark:text-zinc-400 leading-relaxed pt-2 border-t border-neutral-100 dark:border-zinc-850">
              <h4 className="font-bold text-neutral-800 dark:text-white mb-1.5">Description</h4>
              <p>{product.description}</p>
            </div>

          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-neutral-100 dark:border-zinc-850">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 flex items-center justify-center gap-2 font-bold py-3.5 px-6 rounded-full text-sm transition-all cursor-pointer ${
                isOutOfStock
                  ? 'bg-neutral-100 dark:bg-zinc-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed border-none shadow-none'
                  : 'border border-primary text-primary hover:bg-primary-light dark:hover:bg-primary/10'
              }`}
            >
              <ShoppingCart className="w-4.5 h-4.5" /> Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className={`flex-1 flex items-center justify-center gap-2 font-bold py-3.5 px-6 rounded-full text-sm text-white transition-all cursor-pointer shadow-md ${
                isOutOfStock
                  ? 'bg-neutral-200 dark:bg-zinc-900 cursor-not-allowed shadow-none'
                  : 'bg-primary hover:bg-primary-hover shadow-primary/20 hover:scale-102'
              }`}
            >
              <Zap className="w-4.5 h-4.5 fill-current" /> Buy Now
            </button>
            <button
              onClick={handleWishlistToggle}
              className={`p-3.5 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                isFavorite
                  ? 'text-red-500 border-red-200 dark:border-red-950/20 bg-red-50/50 dark:bg-red-950/10'
                  : 'text-neutral-400 border-neutral-200 dark:border-zinc-850 hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>

        </div>

      </div>

      {/* Specifications Block */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <div className="bg-neutral-50 dark:bg-zinc-950 rounded-[28px] p-6 sm:p-8 border border-neutral-100 dark:border-zinc-900/60">
          <h3 className="font-extrabold text-neutral-800 dark:text-white text-lg mb-4">Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(product.specifications || {}).map(([key, val]) => (
              <div key={key} className="flex justify-between py-2.5 border-b border-neutral-200/50 dark:border-zinc-900 text-sm">
                <span className="font-semibold text-neutral-450 uppercase text-xs">{key}</span>
                <span className="font-bold text-neutral-800 dark:text-zinc-200 text-right">{String(val)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer Reviews Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-6">
        
        {/* Submit Review */}
        <div className="lg:col-span-5 bg-neutral-50 dark:bg-zinc-950 border border-neutral-100 dark:border-zinc-900/60 p-6 sm:p-8 rounded-[28px] h-max">
          <h3 className="font-extrabold text-neutral-850 dark:text-white text-lg mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" /> Write a Review
          </h3>
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-450 uppercase mb-1">Your Name</label>
              <input
                type="text"
                required
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 text-neutral-900 dark:text-neutral-100 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-zinc-800 focus:outline-none focus:border-primary text-sm shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-450 uppercase mb-1">Rating</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map(stars => (
                  <button
                    key={stars}
                    type="button"
                    onClick={() => setReviewRating(stars)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star className={`w-6 h-6 ${stars <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-neutral-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-450 uppercase mb-1">Comments</label>
              <textarea
                required
                rows={4}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 text-neutral-900 dark:text-neutral-100 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-zinc-800 focus:outline-none focus:border-primary text-sm shadow-xs resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={submittingReview}
              className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {submittingReview ? "Submitting..." : "Post Review"}
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="font-extrabold text-neutral-850 dark:text-white text-lg flex items-center gap-2">
            Reviews ({product.reviews?.length || 0})
          </h3>
          {product.reviews && product.reviews.length > 0 ? (
            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2 no-scrollbar">
              {product.reviews.map(rev => (
                <div key={rev.id} className="p-5 bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-850 rounded-[20px] shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-800 dark:text-zinc-200">{rev.user}</span>
                    <span className="text-[10px] text-neutral-400">{rev.date}</span>
                  </div>
                  <div className="flex text-amber-400 gap-0.5">
                    {[1, 2, 3, 4, 5].map(st => (
                      <Star key={st} className={`w-3.5 h-3.5 ${st <= rev.rating ? 'fill-current' : 'text-neutral-200 dark:text-zinc-850'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-zinc-400 leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-neutral-50 dark:bg-zinc-950 border border-dashed border-neutral-200 dark:border-zinc-900 rounded-[28px]">
              <MessageSquare className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-xs text-neutral-500">No reviews yet. Be the first to share your thoughts!</p>
            </div>
          )}
        </div>

      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <div className="pt-6 border-t border-neutral-100 dark:border-zinc-850">
          <h3 className="font-extrabold text-neutral-850 dark:text-white text-lg mb-6">Related Products</h3>
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
