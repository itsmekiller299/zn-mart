import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { removeFromWishlist, clearWishlist } from '../features/wishlist/wishlistSlice';
import { addToCart } from '../features/cart/cartSlice';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import Price from '../components/Price';

const Wishlist = () => {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.wishlist);

  const handleMoveToCart = (product) => {
    dispatch(addToCart({
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url || product.image || '',
      quantity: 1
    }));
    toast.success('Moved to cart!');
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-32 h-32 bg-pink-50 rounded-full flex items-center justify-center mb-6">
          <Heart size={48} className="text-pink-300" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-6">Save products you love to view them later</p>
        <Link to="/products" className="btn-primary flex items-center gap-2">
          <ArrowLeft size={18} /> Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Heart className="text-pink-500" fill="currentColor" /> Wishlist
          <span className="text-lg font-normal text-gray-500">({items.length} items)</span>
        </h1>
        <button onClick={() => dispatch(clearWishlist())} className="text-sm text-red-500 hover:underline flex items-center gap-1">
          <Trash2 size={16} /> Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((product) => (
          <div key={product._id} className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
            <Link to={`/product/${product._id}`} className="h-56 bg-gray-50 flex items-center justify-center overflow-hidden relative">
              {product.images?.[0]?.url || product.image ? (
                <img src={product.images?.[0]?.url || product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              ) : (
                <span className="text-gray-400">No Image</span>
              )}
              {product.stock === 0 && (
                <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">Out of Stock</span>
              )}
              {product.price > 200 && (
                <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">SALE</span>
              )}
            </Link>
            <div className="p-5 flex flex-col flex-grow">
              <span className="text-xs font-bold text-primary bg-primary/10 w-fit px-2 py-0.5 rounded-full uppercase mb-2">
                {product.category?.name || 'Product'}
              </span>
              <Link to={`/product/${product._id}`} className="font-semibold line-clamp-1 hover:text-primary">{product.name}</Link>
              <p className="text-sm text-gray-500 line-clamp-2 mt-1 flex-grow">{product.description || 'Premium quality product at ZN Mart'}</p>
              <Price amount={product.price} className="font-bold text-lg mt-3" />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleMoveToCart(product)}
                  disabled={product.stock === 0}
                  className="flex-1 btn-primary py-2 text-sm flex items-center justify-center gap-1.5 rounded-xl disabled:opacity-50"
                >
                  <ShoppingCart size={16} /> Move to Cart
                </button>
                <button
                  onClick={() => dispatch(removeFromWishlist(product._id))}
                  className="p-2.5 border rounded-xl hover:border-red-300 hover:text-red-500 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
