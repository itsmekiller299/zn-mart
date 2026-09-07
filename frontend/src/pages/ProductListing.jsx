import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getProducts, reset } from '../features/products/productSlice';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Filter, Star, Search, X, Heart, Eye, Scale } from 'lucide-react';
import { toggleWishlist } from '../features/wishlist/wishlistSlice';
import { addToCompare } from '../features/compare/compareSlice';
import { toast } from 'react-toastify';
import Price from '../components/Price';
import QuickView from '../components/QuickView';

const ProductListing = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { products, isLoading, isError, message } = useSelector((state) => state.product);
  const { categories } = useSelector((state) => state.category);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const [quickProduct, setQuickProduct] = useState(null);

  const searchParams = new URLSearchParams(location.search);
  const keywordFromUrl = searchParams.get('keyword') || '';

  const [keyword, setKeyword] = useState(keywordFromUrl);
  const [sortBy, setSortBy] = useState('');
  const [maxPrice, setMaxPrice] = useState(1000);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');

  useEffect(() => {
    const params = {};
    if (keywordFromUrl) params.keyword = keywordFromUrl;
    if (selectedCategory) params.category = selectedCategory;
    dispatch(getProducts(params));
    setKeyword(keywordFromUrl);
    return () => { dispatch(reset()); };
  }, [dispatch, keywordFromUrl, selectedCategory]);

  const filteredProducts = [...products]
    .filter((p) => p.price <= maxPrice)
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating') return (b.ratings || 0) - (a.ratings || 0);
      return 0;
    });

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) navigate(`/products?keyword=${encodeURIComponent(keyword.trim())}`);
    else navigate('/products');
  };

  const clearSearch = () => {
    setKeyword('');
    navigate('/products');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) return <div className="text-red-500 text-center text-xl mt-10">Error: {message}</div>;

  return (
    <div className="flex flex-col gap-4 mt-6">
      <QuickView product={quickProduct} isOpen={!!quickProduct} onClose={() => setQuickProduct(null)} />

      <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white border rounded-xl px-4 py-3 shadow-sm">
        <Search size={20} className="text-gray-400 shrink-0" />
        <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Search products by name or description..." className="flex-1 outline-none text-gray-700 bg-transparent placeholder-gray-400" />
        {keyword && <button type="button" onClick={clearSearch} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>}
        <button type="submit" className="bg-primary text-white px-5 py-1.5 rounded-lg text-sm font-medium hover:bg-primary/90">Search</button>
      </form>

      {keywordFromUrl && <p className="text-gray-600 text-sm">Showing results for <span className="font-bold text-primary">"{keywordFromUrl}"</span><button onClick={clearSearch} className="ml-2 text-xs text-red-500 hover:underline">Clear</button></p>}

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/4 bg-white p-6 rounded-xl shadow-sm border h-fit sticky top-24">
          <div className="flex items-center gap-2 mb-6 border-b pb-4">
            <Filter size={20} className="text-primary" />
            <h2 className="text-xl font-bold">Filters</h2>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3 text-gray-800">Categories</h3>
              <div className="space-y-2 text-gray-600">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input type="radio" name="category" value="" checked={selectedCategory === ''} onChange={() => setSelectedCategory('')} className="text-primary" /> All
                </label>
                {(categories || []).filter(c => !c.parent).map((main) => {
                  const subs = (categories || []).filter(s => String(s.parent) === String(main._id));
                  return (
                    <div key={main._id} className="space-y-1">
                      <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-800">
                        <input type="radio" name="category" value={main._id} checked={selectedCategory === main._id} onChange={() => setSelectedCategory(main._id)} className="text-primary" /> {main.name}
                      </label>
                      {subs.length > 0 && (
                        <div className="ml-6 space-y-1 border-l-2 border-primary/10 pl-3">
                          {subs.map((sub) => (
                            <label key={sub._id} className="flex items-center gap-2 cursor-pointer text-sm">
                              <input type="radio" name="category" value={sub._id} checked={selectedCategory === sub._id} onChange={() => setSelectedCategory(sub._id)} className="text-primary w-3 h-3" /> {sub.name}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Price Range</h3>
              <input type="range" min={0} max={1000} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-primary" />
              <div className="flex justify-between text-sm text-gray-500 mt-1"><span>$0</span><span className="font-medium text-primary">${maxPrice}+</span></div>
            </div>
            <div className="bg-secondary p-3 rounded-xl border border-primary/10">
              <p className="text-xs font-bold text-primary uppercase">Coupons</p>
              <p className="text-xs text-gray-600 mt-1">SAVE10 • WELCOME20 • FESTIVE25</p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-3/4">
          <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border">
            <p className="text-gray-600 font-medium">Showing {filteredProducts.length} products</p>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border rounded-md px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary bg-gray-50">
              <option value="">Sort by: Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.length > 0 ? filteredProducts.map((product) => {
              const isWishlisted = wishlistItems.some((i) => i._id === product._id);
              const discount = product.price > 200 ? 25 : product.price > 100 ? 15 : 0;
              return (
                <div key={product._id} className="card overflow-hidden group border flex flex-col h-full relative">
                  {discount > 0 && <span className="absolute top-3 left-3 z-10 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">{discount}% OFF</span>}
                  <Link to={`/product/${product._id}`} className="relative h-56 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {product.images?.[0]?.url ? <img src={product.images[0].url} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" /> : <span className="text-gray-400">No Image</span>}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                  </Link>
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                    <button onClick={() => { dispatch(toggleWishlist(product)); toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist'); }} className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md border ${isWishlisted ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-600 hover:text-pink-500'}`}>
                      <Heart size={14} fill={isWishlisted ? 'white' : 'none'} />
                    </button>
                    <button onClick={() => setQuickProduct(product)} className="w-8 h-8 rounded-full bg-white text-gray-600 hover:text-primary flex items-center justify-center shadow-md border">
                      <Eye size={14} />
                    </button>
                    <button onClick={() => { dispatch(addToCompare(product)); toast.success('Added to compare'); }} className="w-8 h-8 rounded-full bg-white text-gray-600 hover:text-primary flex items-center justify-center shadow-md border">
                      <Scale size={14} />
                    </button>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <Link to={`/product/${product._id}`} className="font-semibold text-gray-800 hover:text-primary line-clamp-1 flex-1 mr-2">{product.name}</Link>
                      <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold bg-yellow-50 px-2 py-0.5 rounded-full shrink-0">
                        <Star size={12} fill="currentColor" /> {product.ratings || '0.0'}
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-3 flex-grow">{product.description}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <Price amount={product.price} className="text-xl font-bold" />
                      {discount > 0 && <span className="text-xs text-gray-400 line-through"><Price amount={product.price * 1.25} /></span>}
                      {product.stock <= 10 && product.stock > 0 && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold ml-auto">Low Stock</span>}
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <Link to={`/product/${product._id}`} className="flex-1 text-center text-primary border border-primary hover:bg-primary hover:text-white px-3 py-2 rounded-xl text-sm font-medium transition-colors">View Details</Link>
                      <button onClick={() => setQuickProduct(product)} className="px-3 py-2 border rounded-xl text-sm font-medium hover:border-primary hover:text-primary">Quick View</button>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full py-20 text-center text-gray-500 bg-white rounded-xl border">
                <Search size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="text-xl font-semibold">No products found</p>
                {keywordFromUrl && <p className="text-sm mt-1">Try a different search term or <button onClick={clearSearch} className="text-primary hover:underline">browse all products</button></p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
