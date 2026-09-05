import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getCategories } from '../features/categories/categorySlice';
import { getProducts } from '../features/products/productSlice';
import { LayoutGrid, Package, ArrowRight, Sparkles, Star, ShoppingBag, Heart, Eye, Scale } from 'lucide-react';
import { useDispatch as useReduxDispatch } from 'react-redux';
import { toggleWishlist } from '../features/wishlist/wishlistSlice';
import { addToCompare } from '../features/compare/compareSlice';
import { toast } from 'react-toastify';
import QuickView from '../components/QuickView';
import Price from '../components/Price';

const categoryBanners = {
  Electronics: 'from-violet-600 to-indigo-600',
  Fashion: 'from-fuchsia-500 to-pink-600',
  'Home & Garden': 'from-emerald-500 to-teal-600',
};

const categoryIcons = {
  Electronics: '🎧',
  Fashion: '👗',
  'Home & Garden': '🏡',
};

const CategoriesShowcase = () => {
  const dispatch = useDispatch();
  const reduxDispatch = useReduxDispatch();
  const { categories, isLoading: catLoading } = useSelector((state) => state.category);
  const { products, isLoading: prodLoading } = useSelector((state) => state.product);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const [activeCategory, setActiveCategory] = useState('all');
  const [quickProduct, setQuickProduct] = useState(null);

  useEffect(() => {
    dispatch(getCategories());
    dispatch(getProducts());
  }, [dispatch]);

  const isLoading = catLoading || prodLoading;

  // Group products by category id
  const productsByCategory = (categories || []).reduce((acc, cat) => {
    acc[cat._id] = products.filter((p) => {
      // p.category can be string id or object { _id }
      const catId = typeof p.category === 'object' ? p.category._id || p.category : p.category;
      return String(catId) === String(cat._id);
    });
    return acc;
  }, {});

  const filteredCategories =
    activeCategory === 'all'
      ? categories
      : categories.filter((c) => String(c._id) === String(activeCategory));

  const totalProducts = products.length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <QuickView product={quickProduct} isOpen={!!quickProduct} onClose={() => setQuickProduct(null)} />
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-violet-700 rounded-2xl p-8 md:p-10 text-white overflow-hidden relative">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -right-20 bottom-0 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-medium mb-4">
            <Sparkles size={16} /> Shop by Category
          </div>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">Find your perfect product</h1>
          <p className="text-white/80 mt-3 max-w-2xl text-lg">
            Browse curated collections by category. Each category is hand-picked to give you the best shopping experience at ZN Mart.
          </p>
          <div className="flex flex-wrap gap-6 mt-6">
            <div className="flex items-center gap-2 bg-white text-primary px-4 py-2 rounded-full font-bold shadow">
              <LayoutGrid size={18} /> {categories.length} Categories
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full font-medium border border-white/20">
              <Package size={18} /> {totalProducts} Products
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-all ${
            activeCategory === 'all'
              ? 'bg-primary text-white border-primary shadow-md'
              : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:text-primary'
          }`}
        >
          All Categories
        </button>
        {(categories || []).map((cat) => (
          <button
            key={cat._id}
            onClick={() => setActiveCategory(cat._id)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-all flex items-center gap-2 ${
              activeCategory === cat._id
                ? 'bg-primary text-white border-primary shadow-md'
                : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:text-primary'
            }`}
          >
            <span>{categoryIcons[cat.name] || '📦'}</span>
            {cat.name}
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeCategory === cat._id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {productsByCategory[cat._id]?.length || 0}
            </span>
          </button>
        ))}
        <Link
          to="/products"
          className="ml-auto text-sm font-medium text-primary hover:underline flex items-center gap-1"
        >
          View All Products <ArrowRight size={16} />
        </Link>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredCategories.map((cat) => {
          const prodCount = productsByCategory[cat._id]?.length || 0;
          const gradient = categoryBanners[cat.name] || 'from-primary to-violet-600';
          return (
            <div
              key={cat._id}
              className="bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-xl transition-shadow duration-300 group flex flex-col"
            >
              <div className={`h-36 bg-gradient-to-r ${gradient} p-6 relative overflow-hidden`}>
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/15 rounded-full blur-xl group-hover:scale-110 transition-transform" />
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="text-4xl">{categoryIcons[cat.name] || '📦'}</div>
                  <div className="bg-white/20 backdrop-blur w-fit px-3 py-1 rounded-full text-white text-xs font-bold border border-white/20">
                    {prodCount} {prodCount === 1 ? 'Product' : 'Products'}
                  </div>
                </div>
                {cat.image?.url && (
                  <img
                    src={cat.image.url}
                    alt={cat.name}
                    className="absolute right-4 bottom-0 w-24 h-24 object-contain opacity-90 group-hover:scale-105 transition-transform drop-shadow-lg hidden lg:block"
                  />
                )}
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-gray-900">{cat.name}</h3>
                <p className="text-gray-500 text-sm mt-1 line-clamp-2 flex-grow">{cat.description}</p>
                <div className="flex gap-2 mt-5">
                  <Link
                    to={`/products?category=${cat._id}`}
                    onClick={() => window.scrollTo(0, 0)}
                    className="flex-1 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    Explore <ArrowRight size={16} />
                  </Link>
                  <button
                    onClick={() => setActiveCategory(cat._id)}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:border-primary hover:text-primary transition-colors"
                  >
                    Preview
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Per-Category Product Showcase */}
      {filteredCategories.map((cat) => {
        const catProducts = productsByCategory[cat._id] || [];
        return (
          <section key={`showcase-${cat._id}`} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 p-6 border-b bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${categoryBanners[cat.name] || 'from-primary to-violet-600'} flex items-center justify-center text-white text-xl`}>
                  {categoryIcons[cat.name] || '📦'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    {cat.name}
                    <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                      {catProducts.length} items
                    </span>
                  </h2>
                  <p className="text-sm text-gray-500 hidden sm:block">{cat.description}</p>
                </div>
              </div>
              <Link
                to={`/products?category=${cat._id}`}
                state={{ category: cat._id }}
                className="text-primary font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all border border-primary px-4 py-2 rounded-xl hover:bg-primary hover:text-white"
              >
                View All <ArrowRight size={16} />
              </Link>
            </div>

            {catProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                {catProducts.slice(0, 4).map((product) => {
                  const isWishlisted = wishlistItems.some((i) => i._id === product._id);
                  return (
                  <div key={product._id} className="group p-5 hover:bg-gray-50 transition-colors flex flex-col relative">
                    <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { reduxDispatch(toggleWishlist(product)); toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist'); }} className={`w-7 h-7 rounded-full flex items-center justify-center shadow border ${isWishlisted ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-600'}`}><Heart size={12} fill={isWishlisted ? 'white' : 'none'} /></button>
                      <button onClick={() => setQuickProduct(product)} className="w-7 h-7 rounded-full bg-white text-gray-600 flex items-center justify-center shadow border"><Eye size={12} /></button>
                      <button onClick={() => { reduxDispatch(addToCompare(product)); toast.success('Added to compare'); }} className="w-7 h-7 rounded-full bg-white text-gray-600 flex items-center justify-center shadow border"><Scale size={12} /></button>
                    </div>
                    <Link to={`/product/${product._id}`} className="block h-44 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center mb-4 relative">
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <ShoppingBag size={32} className="text-gray-300" />
                      )}
                      <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                        <Star size={12} className="text-yellow-500" fill="currentColor" />
                        {product.ratings || '0.0'}
                      </div>
                      {product.stock <= 5 && product.stock > 0 && <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">Low Stock</div>}
                      {product.stock === 0 && <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center font-bold text-red-600">Out of Stock</div>}
                    </Link>
                    <Link to={`/product/${product._id}`} className="font-semibold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">{product.name}</Link>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1 flex-grow">{product.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <Price amount={product.price} className="font-bold text-gray-900" />
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">View</span>
                    </div>
                  </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500">
                <Package size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="font-medium">No products in this category yet</p>
                <p className="text-sm">Check back soon or explore other categories</p>
              </div>
            )}
          </section>
        );
      })}

      {/* Empty state if no categories */}
      {filteredCategories.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border">
          <LayoutGrid size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-lg font-semibold text-gray-600">No categories found</p>
          <button onClick={() => setActiveCategory('all')} className="mt-3 text-primary hover:underline text-sm font-medium">
            Show all categories
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoriesShowcase;
