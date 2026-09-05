import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { removeFromCompare, clearCompare } from '../features/compare/compareSlice';
import { addToCart } from '../features/cart/cartSlice';
import { Scale, ShoppingCart, X, Star, Package, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import Price from '../components/Price';

const Compare = () => {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.compare);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
          <Scale size={48} className="text-indigo-300" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No products to compare</h2>
        <p className="text-gray-500 mb-6">Add up to 4 products to compare side-by-side</p>
        <Link to="/products" className="btn-primary flex items-center gap-2">
          <ArrowLeft size={18} /> Browse Products
        </Link>
      </div>
    );
  }

  const features = ['Price', 'Category', 'Rating', 'Stock', 'Description'];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Scale className="text-primary" /> Compare Products
          <span className="text-lg font-normal text-gray-500">({items.length}/4)</span>
        </h1>
        <button onClick={() => dispatch(clearCompare())} className="text-sm border px-4 py-2 rounded-xl hover:bg-gray-50">
          Clear All
        </button>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Product headers */}
          <div className="grid" style={{ gridTemplateColumns: `180px repeat(${items.length}, 1fr)` }}>
            <div className="p-6 bg-gray-50 border-r border-b font-semibold text-gray-600 flex items-center">
              <Package size={16} className="mr-2" /> Feature
            </div>
            {items.map((p) => (
              <div key={p._id} className="p-4 border-b border-r last:border-r-0 text-center relative bg-white">
                <button onClick={() => dispatch(removeFromCompare(p._id))} className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full">
                  <X size={16} />
                </button>
                <Link to={`/product/${p._id}`} className="block">
                  <div className="h-36 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center mb-3 mx-auto max-w-[150px]">
                    {p.images?.[0]?.url ? <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" /> : <span className="text-gray-400 text-xs">No image</span>}
                  </div>
                  <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary">{p.name}</h3>
                </Link>
                <button
                  onClick={() => { dispatch(addToCart({ product: p._id, name: p.name, price: p.price, image: p.images?.[0]?.url || '', quantity: 1 })); toast.success('Added to cart!'); }}
                  className="mt-3 w-full bg-primary text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-primary/90"
                >
                  <ShoppingCart size={14} /> Add to Cart
                </button>
              </div>
            ))}
          </div>

          {/* Rows */}
          {[
            { label: 'Price', render: (p) => <Price amount={p.price} className="font-bold text-primary" /> },
            { label: 'Category', render: (p) => <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-bold">{p.category?.name || '—'}</span> },
            { label: 'Rating', render: (p) => <span className="flex items-center justify-center gap-1 text-yellow-500 font-medium text-sm"><Star size={14} fill="currentColor" /> {p.ratings || '0.0'} ({p.numOfReviews})</span> },
            { label: 'Stock', render: (p) => <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.stock > 10 ? 'bg-green-50 text-green-600' : p.stock > 0 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>{p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</span> },
            { label: 'Description', render: (p) => <span className="text-xs text-gray-600 line-clamp-3">{p.description}</span> },
          ].map((row) => (
            <div key={row.label} className="grid border-b last:border-b-0" style={{ gridTemplateColumns: `180px repeat(${items.length}, 1fr)` }}>
              <div className="p-4 bg-gray-50 border-r font-medium text-sm text-gray-700 flex items-center">{row.label}</div>
              {items.map((p) => (
                <div key={p._id + row.label} className="p-4 border-r last:border-r-0 flex items-center justify-center text-center">
                  {row.render(p)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-3">Tip: Add products from listing via the scale icon. Maximum 4 products.</p>
    </div>
  );
};

export default Compare;
