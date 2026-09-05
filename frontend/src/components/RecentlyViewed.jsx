import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, X, Clock } from 'lucide-react';
import { getRecentlyViewed, clearRecentlyViewed } from '../utils/recentlyViewed';
import Price from './Price';

const RecentlyViewed = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getRecentlyViewed());
    const onStorage = () => setItems(getRecentlyViewed());
    window.addEventListener('storage', onStorage);
    // poll for same-tab updates
    const interval = setInterval(() => setItems(getRecentlyViewed()), 1000);
    return () => { window.removeEventListener('storage', onStorage); clearInterval(interval); };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6 mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Clock size={18} className="text-primary" /> Recently Viewed
        </h3>
        <button onClick={() => { clearRecentlyViewed(); setItems([]); }} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1">
          <X size={14} /> Clear
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
        {items.map((p) => (
          <Link key={p._id} to={`/product/${p._id}`} className="min-w-[160px] snap-start bg-gray-50 rounded-xl p-3 hover:bg-white hover:shadow-md border border-transparent hover:border-gray-200 transition-all group">
            <div className="h-28 bg-white rounded-lg overflow-hidden flex items-center justify-center mb-2">
              {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <Eye className="text-gray-300" />}
            </div>
            <p className="text-sm font-medium line-clamp-1">{p.name}</p>
            <Price amount={p.price} className="text-sm font-bold text-primary" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewed;
