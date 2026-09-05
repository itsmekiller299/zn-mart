import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getProduct, reset } from '../features/products/productSlice';
import { getReviews, addReview, reset as resetReviews } from '../features/reviews/reviewSlice';
import { addToCart } from '../features/cart/cartSlice';
import { toggleWishlist } from '../features/wishlist/wishlistSlice';
import { addToCompare } from '../features/compare/compareSlice';
import { addToRecentlyViewed } from '../utils/recentlyViewed';
import { Star, ShoppingCart, ArrowLeft, Check, ShieldCheck, Truck, Heart, Scale, Tag, Send, User } from 'lucide-react';
import { toast } from 'react-toastify';
import Price from '../components/Price';
import RecentlyViewed from '../components/RecentlyViewed';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const { product, isLoading, isError, message } = useSelector((state) => state.product);
  const { reviews, isLoading: reviewsLoading } = useSelector((state) => state.review);
  const { user } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const isWishlisted = wishlistItems.some((i) => i._id === product?._id);

  useEffect(() => {
    if (isError) toast.error(message);
    dispatch(getProduct(id));
    dispatch(getReviews(id));
    return () => {
      dispatch(reset());
      dispatch(resetReviews());
    };
  }, [dispatch, id, isError, message]);

  useEffect(() => {
    if (product) addToRecentlyViewed(product);
  }, [product]);

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart({
        product: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.url || '',
        quantity: qty
      }));
      toast.success('Added to cart!');
    }
  };

  const handleWishlist = () => {
    dispatch(toggleWishlist(product));
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
  };

  const handleCompare = () => {
    dispatch(addToCompare(product));
    toast.success('Added to compare');
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to submit a review');
    if (!comment.trim()) return toast.error('Please add a comment');
    dispatch(addReview({ productId: id, rating, comment }))
      .unwrap()
      .then(() => {
        toast.success('Review submitted!');
        setComment('');
        dispatch(getReviews(id));
      })
      .catch((err) => toast.error(err));
  };

  const originalPrice = product ? (product.price * 1.25).toFixed(2) : 0;
  const discountPercent = product?.price > 200 ? 25 : product?.price > 100 ? 15 : 10;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) return <div className="text-center mt-20 text-xl text-gray-600">Product not found</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-primary transition-colors">
        <ArrowLeft size={20} className="mr-2" /> Back to Products
      </button>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 p-8 bg-gray-50 flex items-center justify-center min-h-[400px] relative">
              {product.images?.[0]?.url ? (
                 <img src={product.images[0].url} alt={product.name} className="max-w-full h-auto object-contain rounded-lg shadow-sm" />
              ) : (
                 <div className="text-gray-400 flex flex-col items-center">
                   <span className="text-xl">No Image Available</span>
                 </div>
              )}
              <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Tag size={12} /> {discountPercent}% OFF
              </div>
          </div>

          <div className="md:w-1/2 p-8 lg:p-12">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                {product.category?.name || 'Category'}
              </span>
              <div className="flex items-center gap-1 text-yellow-500 text-sm font-medium">
                <Star size={16} fill="currentColor" />
                <span>{product.ratings || '0.0'} ({product.numOfReviews} reviews)</span>
              </div>
              {product.stock <= 10 && product.stock > 0 && (
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full">Low Stock</span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              {product.description}
            </p>

            <div className="flex items-baseline gap-3 mb-8">
              <span className="text-4xl font-bold text-gray-900"><Price amount={product.price} /></span>
              <span className="text-lg text-gray-400 line-through"><Price amount={Number(originalPrice)} /></span>
              <span className="bg-green-50 text-green-600 text-sm font-bold px-2 py-1 rounded-full">Save {discountPercent}%</span>
            </div>

            <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-gray-600 text-sm">
                  <ShieldCheck size={18} className="text-green-500" />
                  <span>1 Year Warranty</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 text-sm">
                  <Truck size={18} className="text-blue-500" />
                  <span>Free Fast Delivery</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 text-sm">
                  {product.stock > 0 ? (
                     <><Check size={18} className="text-green-500" /> <span>In Stock ({product.stock} available)</span></>
                  ) : (
                     <span className="text-red-500 font-medium">Out of Stock</span>
                  )}
                </div>
            </div>

            {product.stock > 0 && (
              <div className="flex flex-col gap-4 border-t pt-6">
                <div className="flex gap-3">
                  <div className="flex items-center border-2 rounded-xl bg-gray-50">
                    <button onClick={() => setQty(qty > 1 ? qty - 1 : 1)} className="px-5 py-3 hover:bg-gray-200 transition-colors rounded-l-xl text-gray-600 font-medium">-</button>
                    <span className="px-6 py-3 font-semibold text-lg">{qty}</span>
                    <button onClick={() => setQty(qty < product.stock ? qty + 1 : qty)} className="px-5 py-3 hover:bg-gray-200 transition-colors rounded-r-xl text-gray-600 font-medium">+</button>
                  </div>
                  <button onClick={handleAddToCart} className="flex-1 btn-primary py-3 text-lg shadow-md hover:shadow-lg flex justify-center items-center gap-2 rounded-xl">
                    <ShoppingCart size={20} /> Add to Cart
                  </button>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleWishlist} className={`flex-1 border-2 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${isWishlisted ? 'bg-pink-500 text-white border-pink-500' : 'hover:border-pink-300 hover:text-pink-500 hover:bg-pink-50'}`}>
                    <Heart size={18} fill={isWishlisted ? 'white' : 'none'} /> {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                  </button>
                  <button onClick={handleCompare} className="flex-1 border-2 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:border-primary hover:text-primary hover:bg-primary/5">
                    <Scale size={18} /> Compare
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 bg-secondary rounded-xl p-4 border border-primary/10">
              <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Coupon Codes</p>
              <p className="text-sm text-gray-600">Use <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border">SAVE10</span> for 10% off or <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border">WELCOME20</span> for 20% off at checkout!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-6 md:p-8 border-b bg-gray-50/50">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Star className="text-yellow-500" fill="currentColor" size={22} /> Customer Reviews
            <span className="text-sm font-normal text-gray-500">({reviews.length})</span>
          </h2>
        </div>

        <div className="p-6 md:p-8">
          {/* Rating summary */}
          <div className="flex flex-wrap gap-8 mb-8 pb-8 border-b">
            <div className="text-center">
              <div className="text-5xl font-bold">{product.ratings || '0.0'}</div>
              <div className="flex justify-center text-yellow-500 mt-1">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} size={16} fill={i <= Math.round(product.ratings || 0) ? 'currentColor' : 'none'} className={i <= Math.round(product.ratings || 0) ? 'text-yellow-500' : 'text-gray-300'} />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">{product.numOfReviews} reviews</p>
            </div>
            <div className="flex-1 min-w-[200px]">
              {[5,4,3,2,1].map((star) => {
                const count = reviews.filter((r) => r.rating === star).length;
                const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-sm mb-1">
                    <span className="w-12">{star} stars</span>
                    <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-yellow-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-xs text-gray-500">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review form */}
          <div className="mb-8">
            <h3 className="font-semibold mb-3">Write a Review</h3>
            {user ? (
              <form onSubmit={handleReviewSubmit} className="space-y-3 bg-gray-50 p-4 rounded-xl border">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Rating:</span>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((n) => (
                      <button type="button" key={n} onClick={() => setRating(n)} className="p-1">
                        <Star size={22} className={n <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} fill={n <= rating ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({rating}/5)</span>
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  rows={3}
                  className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                />
                <button type="submit" className="btn-primary flex items-center gap-2 rounded-xl">
                  <Send size={16} /> Submit Review
                </button>
              </form>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                Please <a href="/login" className="font-bold underline">login</a> to write a review.
              </div>
            )}
          </div>

          {/* Reviews list */}
          <div className="space-y-4">
            {reviewsLoading ? (
              <div className="text-center py-8 text-gray-400">Loading reviews...</div>
            ) : reviews.length > 0 ? (
              reviews.map((rev) => (
                <div key={rev._id} className="border rounded-xl p-4 bg-white">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <User size={14} />
                      </div>
                      <span className="text-sm font-semibold">{rev.user?.name || 'Anonymous'}</span>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex text-yellow-500 mt-2">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} size={14} fill={i <= rev.rating ? 'currentColor' : 'none'} className={i <= rev.rating ? 'text-yellow-500' : 'text-gray-300'} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 mt-2">{rev.comment}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 border border-dashed rounded-xl">
                <Star size={32} className="mx-auto text-gray-300 mb-2" />
                <p>No reviews yet. Be the first to review!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <RecentlyViewed />
    </div>
  );
};

export default ProductDetail;
