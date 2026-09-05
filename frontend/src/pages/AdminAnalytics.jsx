import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getProducts } from '../features/products/productSlice';
import { getCategories } from '../features/categories/categorySlice';
import { Package, AlertTriangle, Layers, Star, TrendingUp, DollarSign, ShoppingBag } from 'lucide-react';
import Price from '../components/Price';

const AdminAnalytics = () => {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.product);
  const { categories } = useSelector((state) => state.category);

  useEffect(() => {
    dispatch(getProducts());
    dispatch(getCategories());
  }, [dispatch]);

  const totalProducts = products.length;
  const totalCategories = categories.length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
  const avgRating = totalProducts ? (products.reduce((sum, p) => sum + (p.ratings || 0), 0) / totalProducts).toFixed(1) : 0;
  const totalStockValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const avgPrice = totalProducts ? (products.reduce((sum, p) => sum + p.price, 0) / totalProducts).toFixed(2) : 0;

  // Category distribution
  const catDistribution = categories.map((cat) => {
    const count = products.filter((p) => {
      const cid = typeof p.category === 'object' ? p.category._id || p.category : p.category;
      return String(cid) === String(cat._id);
    }).length;
    return { name: cat.name, count };
  });

  const maxStock = Math.max(...products.map((p) => p.stock), 1);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="bg-primary text-white p-3 rounded-xl">
          <TrendingUp size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Admin Analytics</h1>
          <p className="text-gray-500 text-sm">Stock alerts & inventory overview</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-3xl font-bold mt-1">{totalProducts}</p>
            </div>
            <div className="bg-primary/10 p-3 rounded-xl text-primary"><Package size={20} /></div>
          </div>
          <p className="text-xs text-gray-400 mt-3 flex items-center gap-1"><Layers size={12} /> Across {totalCategories} categories</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Low Stock (≤10)</p>
              <p className="text-3xl font-bold mt-1 text-amber-600">{lowStock}</p>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl text-amber-600"><AlertTriangle size={20} /></div>
          </div>
          <p className="text-xs text-amber-600 mt-3">{lowStock ? 'Needs restock soon' : 'All good'}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Out of Stock</p>
              <p className="text-3xl font-bold mt-1 text-red-600">{outOfStock}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-xl text-red-600"><ShoppingBag size={20} /></div>
          </div>
          <p className="text-xs text-red-500 mt-3">{outOfStock ? 'Urgent: restock needed' : 'No stockouts'}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Avg Rating</p>
              <p className="text-3xl font-bold mt-1 flex items-center gap-1">{avgRating} <Star size={18} className="text-yellow-500" fill="currentColor" /></p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-xl text-yellow-600"><Star size={20} /></div>
          </div>
          <p className="text-xs text-gray-400 mt-3">Avg price <Price amount={Number(avgPrice)} className="font-bold text-gray-700" /></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock per product bar */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2"><Package size={18} className="text-primary" /> Stock per Product</h3>
          <div className="space-y-3">
            {products.slice(0, 8).map((p) => (
              <div key={p._id} className="flex items-center gap-3">
                <span className="text-xs font-medium w-36 truncate">{p.name}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${p.stock === 0 ? 'bg-red-500' : p.stock <= 10 ? 'bg-amber-500' : 'bg-primary'}`}
                    style={{ width: `${Math.max(4, (p.stock / maxStock) * 100)}%` }}
                  />
                </div>
                <span className={`text-xs font-bold w-12 text-right ${p.stock <= 10 ? 'text-amber-600' : 'text-gray-700'}`}>{p.stock}</span>
              </div>
            ))}
            {products.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No products</p>}
          </div>
        </div>

        {/* Category distribution */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2"><Layers size={18} className="text-primary" /> Category Distribution</h3>
          <div className="space-y-3">
            {catDistribution.map((c) => {
              const pct = totalProducts ? (c.count / totalProducts) * 100 : 0;
              return (
                <div key={c.name} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-32">{c.name}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-violet-600 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm font-bold w-16 text-right">{c.count} ({pct.toFixed(0)}%)</span>
                </div>
              );
            })}
          </div>
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border flex justify-between items-center">
            <span className="text-sm text-gray-600 flex items-center gap-2"><DollarSign size={16} className="text-green-600" /> Total stock value</span>
            <Price amount={totalStockValue} className="font-bold text-lg text-green-600" />
          </div>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2"><AlertTriangle size={18} className="text-amber-500" /> Stock Alerts</h3>
          <span className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full font-bold">{lowStock + outOfStock} alerts</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Product</th>
                <th className="px-6 py-3 text-left font-semibold">Category</th>
                <th className="px-6 py-3 text-center font-semibold">Stock</th>
                <th className="px-6 py-3 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.filter((p) => p.stock <= 10).map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium">{p.name}</td>
                  <td className="px-6 py-3 text-gray-500">{p.category?.name || '—'}</td>
                  <td className="px-6 py-3 text-center font-bold">{p.stock}</td>
                  <td className="px-6 py-3 text-right">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.stock === 0 ? 'bg-red-500 text-white' : 'bg-amber-100 text-amber-700'}`}>
                      {p.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                    </span>
                  </td>
                </tr>
              ))}
              {products.filter((p) => p.stock <= 10).length === 0 && (
                <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-400">No alerts – inventory healthy!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
