import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getProducts } from '../features/products/productSlice';
import { addToCart } from '../features/cart/cartSlice';
import { toggleWishlist } from '../features/wishlist/wishlistSlice';
import { toast } from 'react-toastify';
import Price from '../components/Price';
import QuickView from '../components/QuickView';
import RecentlyViewed from '../components/RecentlyViewed';
import { Heart, Eye, Star, ArrowRight, Sparkles, Truck, ShieldCheck } from 'lucide-react';

const Home = () => {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.product);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const [quickProduct, setQuickProduct] = useState(null);

  useEffect(() => { dispatch(getProducts()); }, [dispatch]);

  const featured = products.length ? products.slice(0, 4) : [
    { _id: '1', name: 'Premium Wireless Headphones', price: 199.99, images: [{ url: '/images/product1.png' }], ratings: 4.8, description: 'Immersive sound' },
    { _id: '2', name: 'Luxury Classic Watch', price: 299.99, images: [{ url: '/images/product2.png' }], ratings: 4.9, description: 'Stainless steel' },
    { _id: '3', name: 'Premium Leather Backpack', price: 149.99, images: [{ url: '/images/product3.png' }], ratings: 4.7, description: 'Genuine leather' },
    { _id: '4', name: 'Smart Home Speaker', price: 129.99, images: [{ url: '/images/product1.png' }], ratings: 4.5, description: 'Voice-controlled' },
  ];

  return (
    <div className="space-y-12">
      <QuickView product={quickProduct} isOpen={!!quickProduct} onClose={() => setQuickProduct(null)} />

      <section className="bg-gradient-to-br from-secondary via-white to-primary/5 rounded-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between border">
        <div className="md:w-1/2 p-8 md:p-12 space-y-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase"><Sparkles size={14} /> New Arrivals 2026</div>
          <h1 className="text-4xl md:text-5xl font-bold text-dark leading-tight">Discover Premium <br /> Products Today.</h1>
          <p className="text-lg text-gray-600">Shop the latest trends with ZN Mart. Quality guaranteed, fast shipping. Up to 25% off with <span className="font-mono font-bold text-primary">WELCOME20</span></p>
          <div className="flex flex-wrap gap-3">
            <Link to="/products" className="btn-primary text-lg px-8 py-3 rounded-xl">Shop Now</Link>
            <Link to="/categories" className="border-2 border-primary text-primary px-8 py-3 rounded-xl font-bold hover:bg-primary hover:text-white transition-colors">Browse Categories</Link>
          </div>
          <div className="flex gap-6 pt-2 text-sm text-gray-600">
            <span className="flex items-center gap-1.5"><Truck size={16} className="text-green-500" /> Free Shipping</span>
            <span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-primary" /> 1 Year Warranty</span>
          </div>
        </div>
        <div className="md:w-1/2 relative h-64 md:h-[420px]">
          <img src="/images/hero.png" alt="Premium Shopping" className="absolute inset-0 w-full h-full object-cover" />
        </div>
      </section>

      {/* Coupon banner */}
      <div className="bg-gradient-to-r from-primary to-violet-600 rounded-2xl p-5 text-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-bold text-lg">Festive Sale Live!</p>
          <p className="text-white/80 text-sm">Use code <span className="bg-white text-primary px-2 py-0.5 rounded font-mono font-bold">FESTIVE25</span> for 25% OFF – Limited time</p>
        </div>
        <Link to="/products" className="bg-white text-primary px-6 py-2 rounded-xl font-bold hover:bg-gray-100 flex items-center gap-1">Shop Sale <ArrowRight size={16} /></Link>
      </div>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Featured Products</h2>
          <Link to="/products" className="text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all">View All <ArrowRight size={16} /></Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product) => {
            const isWishlisted = wishlistItems.some((i) => i._id === product._id);
            const discount = product.price > 200 ? 25 : product.price > 100 ? 15 : 0;
            return (
              <div key={product._id} className="card group p-4 space-y-3 hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
                {discount > 0 && <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">{discount}% OFF</span>}
                <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { dispatch(toggleWishlist(product)); toast.success(isWishlisted ? 'Removed' : 'Wishlisted'); }} className={`w-8 h-8 rounded-full flex items-center justify-center shadow border ${isWishlisted ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-600'}`}><Heart size={14} fill={isWishlisted ? 'white' : 'none'} /></button>
                  <button onClick={() => setQuickProduct(product)} className="w-8 h-8 rounded-full bg-white text-gray-600 flex items-center justify-center shadow border"><Eye size={14} /></button>
                </div>
                <Link to={`/product/${product._id}`} className="block w-full h-56 bg-gray-100 rounded-xl overflow-hidden">
                  <img src={product.images?.[0]?.url || product.img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </Link>
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold line-clamp-1 flex-1 mr-2">{product.name}</h3>
                  <span className="flex items-center gap-1 text-xs font-bold bg-yellow-50 text-yellow-600 px-2 py-1 rounded-full shrink-0"><Star size={12} fill="currentColor" />{product.ratings || '4.8'}</span>
                </div>
                <div className="flex items-center gap-2"><Price amount={Number(product.price)} className="text-primary font-bold text-lg" />{discount > 0 && <span className="text-xs text-gray-400 line-through"><Price amount={Number(product.price) * 1.25} /></span>}</div>
                <div className="flex gap-2">
                  <button onClick={() => { dispatch(addToCart({ product: product._id, name: product.name, price: Number(product.price), image: product.images?.[0]?.url || product.img, quantity: 1 })); toast.success('Added to cart!'); }} className="flex-1 btn-primary py-2 rounded-xl text-sm">Add to Cart</button>
                  <button onClick={() => setQuickProduct(product)} className="px-3 py-2 border rounded-xl text-sm hover:border-primary hover:text-primary">Quick View</button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <RecentlyViewed />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Wishlist', desc: 'Save your favorites', icon: Heart, link: '/wishlist', color: 'bg-pink-50 text-pink-500' },
          { title: 'Compare', desc: 'Compare up to 4 products', icon: Star, link: '/compare', color: 'bg-indigo-50 text-indigo-500' },
          { title: 'Shop by Category', desc: 'Browse curated collections', icon: Sparkles, link: '/categories', color: 'bg-violet-50 text-violet-500' },
        ].map((card) => (
          <Link key={card.title} to={card.link} className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}><card.icon size={20} /></div>
            <div><h3 className="font-bold">{card.title}</h3><p className="text-sm text-gray-500">{card.desc}</p></div>
            <ArrowRight size={16} className="ml-auto text-gray-400" />
          </Link>
        ))}
      </section>
    </div>
  );
};

export default Home;
