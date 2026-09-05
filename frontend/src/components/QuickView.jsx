import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../features/cart/cartSlice';
import { toggleWishlist } from '../features/wishlist/wishlistSlice';
import { addToCompare } from '../features/compare/compareSlice';
import { X, ShoppingCart, Heart, Scale, Star } from 'lucide-react';
import { toast } from 'react-toastify';
import Price from './Price';
import { Link } from 'react-router-dom';

const QuickView = ({ product, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [qty, setQty] = useState(1);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    dispatch(addToCart({
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url || '',
      quantity: qty
    }));
    toast.success('Added to cart!');
    onClose();
  };

  const handleWishlist = () => {
    dispatch(toggleWishlist(product));
    toast.success('Wishlist updated!');
  };

  const handleCompare = () => {
    dispatch(addToCompare(product));
    toast.success('Added to compare (max 4)');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-in fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 bg-white border rounded-full p-2 hover:bg-gray-100 z-10 shadow">
          <X size={18} />
        </button>

        <div className="md:w-1/2 bg-gray-50 p-6 flex items-center justify-center min-h-[300px]">
          {product.images?.[0]?.url ? (
            <img src={product.images[0].url} alt={product.name} className="max-h-[350px] object-contain rounded-xl" />
          ) : (
            <div className="text-gray-400">No Image</div>
          )}
        </div>

        <div className="md:w-1/2 p-6 md:p-8 overflow-y-auto">
          <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase">
            {product.category?.name || 'Category'}
          </span>
          <h2 className="text-2xl font-bold mt-3">{product.name}</h2>
          <div className="flex items-center gap-1 text-yellow-500 text-sm mt-2">
            <Star size={16} fill="currentColor" /> {product.ratings || '0.0'} ({product.numOfReviews} reviews)
          </div>
          <p className="text-gray-600 mt-3 text-sm leading-relaxed line-clamp-3">{product.description}</p>
          <div className="mt-4">
            <Price amount={product.price} className="text-3xl font-bold" />
            {product.price > 100 && (
              <span className="ml-2 text-sm text-green-600 font-bold bg-green-50 px-2 py-1 rounded-full">
                {product.price > 200 ? '25% OFF' : '15% OFF'}
              </span>
            )}
          </div>
          <p className="text-sm mt-2 text-gray-500">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>

          {product.stock > 0 && (
            <div className="flex gap-3 mt-6">
              <div className="flex items-center border-2 rounded-xl bg-gray-50">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-2 hover:bg-gray-200 rounded-l-xl">-</button>
                <span className="px-4 font-semibold">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-4 py-2 hover:bg-gray-200 rounded-r-xl">+</button>
              </div>
              <button onClick={handleAddToCart} className="flex-1 btn-primary flex items-center justify-center gap-2 rounded-xl">
                <ShoppingCart size={18} /> Add to Cart
              </button>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button onClick={handleWishlist} className="flex-1 border py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1 hover:border-primary hover:text-primary">
              <Heart size={16} /> Wishlist
            </button>
            <button onClick={handleCompare} className="flex-1 border py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1 hover:border-primary hover:text-primary">
              <Scale size={16} /> Compare
            </button>
          </div>

          <Link to={`/product/${product._id}`} onClick={onClose} className="block text-center mt-4 text-sm text-primary hover:underline font-medium">
            View Full Details →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuickView;
