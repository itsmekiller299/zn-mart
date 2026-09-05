import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getProducts, createProduct, deleteProduct } from '../features/products/productSlice';
import { getCategories } from '../features/categories/categorySlice';
import { toast } from 'react-toastify';
import {
  LayoutDashboard, Headset, PackagePlus, Package, Users, ShoppingCart, Ticket, TrendingUp,
  AlertTriangle, CheckCircle, Clock, Mail, Phone, Edit, Trash2, Plus, Save, Upload, Search, Filter
} from 'lucide-react';
import Price from '../components/Price';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { products } = useSelector((state) => state.product);
  const { categories } = useSelector((state) => state.category);

  const [activeTab, setActiveTab] = useState('customer'); // customer | product
  const [customerSubTab, setCustomerSubTab] = useState('orders'); // orders | customers | tickets
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchCustomer, setSearchCustomer] = useState('');
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', category: '', stock: '', imageUrl: '' });
  const [tickets, setTickets] = useState([
    { id: 'TK-1001', customer: 'Rahul Sharma', email: 'rahul@example.com', subject: 'Order not delivered', priority: 'High', status: 'Open', date: '2026-09-04' },
    { id: 'TK-1002', customer: 'Priya Mehta', email: 'priya@example.com', subject: 'Wrong item received', priority: 'Medium', status: 'Open', date: '2026-09-03' },
    { id: 'TK-1003', customer: 'Aman Gupta', email: 'aman@example.com', subject: 'Refund request', priority: 'High', status: 'In Progress', date: '2026-09-02' },
    { id: 'TK-1004', customer: 'Neha Singh', email: 'neha@example.com', subject: 'Product inquiry', priority: 'Low', status: 'Resolved', date: '2026-09-01' },
  ]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      toast.error('Admin access required');
      navigate('/');
      return;
    }
    dispatch(getProducts());
    dispatch(getCategories());
    fetchAdminData();
  }, [user, dispatch, navigate]);

  const fetchAdminData = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [ordersRes, usersRes, statsRes] = await Promise.all([
        axios.get('/api/admin/orders', config).catch(() => ({ data: { data: [] } })),
        axios.get('/api/admin/users', config).catch(() => ({ data: { data: [] } })),
        axios.get('/api/admin/stats', config).catch(() => ({ data: { data: null } })),
      ]);
      setOrders(ordersRes.data.data || []);
      setCustomers(usersRes.data.data || []);
      setStats(statsRes.data.data || null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      await axios.put(`/api/admin/orders/${orderId}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`Order marked as ${newStatus}`);
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleTicketResolve = (id) => {
    setTickets((prev) => prev.map((t) => t.id === id ? { ...t, status: 'Resolved' } : t));
    toast.success('Ticket resolved');
  };

  const handleProductChange = (e) => setProductForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleProductSubmit = (e) => {
    e.preventDefault();
    const data = {
      name: productForm.name,
      description: productForm.description,
      price: Number(productForm.price),
      category: productForm.category,
      stock: Number(productForm.stock),
      images: [{ url: productForm.imageUrl, public_id: `admin_${Date.now()}` }]
    };
    dispatch(createProduct(data))
      .unwrap()
      .then(() => {
        toast.success('Product added successfully');
        setProductForm({ name: '', description: '', price: '', category: '', stock: '', imageUrl: '' });
        dispatch(getProducts());
      })
      .catch((err) => toast.error(err));
  };

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchCustomer.toLowerCase()) || c.email.toLowerCase().includes(searchCustomer.toLowerCase())
  );

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-violet-700 rounded-2xl p-6 md:p-8 text-white mb-6">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3"><LayoutDashboard /> Admin Control Center</h1>
            <p className="text-white/80 mt-1">Dedicated dashboard for <span className="font-bold text-white">Customer Services</span> & <span className="font-bold text-white">Product Management</span></p>
          </div>
          <div className="bg-white/20 backdrop-blur px-4 py-3 rounded-xl border border-white/20">
            <p className="text-xs uppercase tracking-wide text-white/70">Logged as</p>
            <p className="font-bold">{user.name} • {user.email}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => setActiveTab('customer')} className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'customer' ? 'bg-white text-primary shadow-lg' : 'bg-white/20 text-white border border-white/20 hover:bg-white/30'}`}>
            <Headset size={18} /> Customer Services
          </button>
          <button onClick={() => setActiveTab('product')} className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'product' ? 'bg-white text-primary shadow-lg' : 'bg-white/20 text-white border border-white/20 hover:bg-white/30'}`}>
            <PackagePlus size={18} /> Product Center
          </button>
        </div>
      </div>

      {activeTab === 'customer' ? (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border shadow-sm">
              <div className="flex justify-between"><div><p className="text-xs text-gray-500 uppercase font-bold">Total Customers</p><p className="text-2xl font-bold mt-1">{stats?.totalCustomers ?? customers.filter(c => c.role === 'user').length}</p></div><div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Users size={20} /></div></div>
              <p className="text-xs text-gray-400 mt-2">{customers.length} total users</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border shadow-sm">
              <div className="flex justify-between"><div><p className="text-xs text-gray-500 uppercase font-bold">Pending Orders</p><p className="text-2xl font-bold mt-1 text-amber-600">{stats?.pendingOrders ?? orders.filter(o => o.status === 'Processing').length}</p></div><div className="bg-amber-50 p-3 rounded-xl text-amber-600"><Clock size={20} /></div></div>
              <p className="text-xs text-amber-600 mt-2">Needs attention</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border shadow-sm">
              <div className="flex justify-between"><div><p className="text-xs text-gray-500 uppercase font-bold">Open Tickets</p><p className="text-2xl font-bold mt-1 text-red-600">{stats?.openTickets ?? tickets.filter(t => t.status === 'Open').length}</p></div><div className="bg-red-50 p-3 rounded-xl text-red-600"><Ticket size={20} /></div></div>
              <p className="text-xs text-gray-400 mt-2">{tickets.filter(t => t.status !== 'Resolved').length} awaiting reply</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border shadow-sm">
              <div className="flex justify-between"><div><p className="text-xs text-gray-500 uppercase font-bold">Total Orders</p><p className="text-2xl font-bold mt-1">{stats?.totalOrders ?? orders.length}</p></div><div className="bg-green-50 p-3 rounded-xl text-green-600"><ShoppingCart size={20} /></div></div>
              <p className="text-xs text-green-600 mt-2">{stats?.deliveredOrders ?? orders.filter(o => o.status === 'Delivered').length} delivered</p>
            </div>
          </div>

          {/* Sub tabs */}
          <div className="bg-white rounded-2xl border shadow-sm">
            <div className="flex flex-wrap gap-2 p-4 border-b bg-gray-50/50 rounded-t-2xl">
              {[
                { id: 'orders', label: 'Orders Management', icon: ShoppingCart, count: orders.length },
                { id: 'customers', label: 'Customers', icon: Users, count: customers.length },
                { id: 'tickets', label: 'Support Tickets', icon: Ticket, count: tickets.filter(t => t.status === 'Open').length },
              ].map((tab) => (
                <button key={tab.id} onClick={() => setCustomerSubTab(tab.id)} className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 border ${customerSubTab === tab.id ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:text-primary'}`}>
                  <tab.icon size={16} /> {tab.label} <span className={`px-2 py-0.5 rounded-full text-xs ${customerSubTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100'}`}>{tab.count}</span>
                </button>
              ))}
              <Link to="/admin/analytics" className="ml-auto text-sm font-bold text-primary border border-primary px-4 py-2.5 rounded-xl hover:bg-primary hover:text-white flex items-center gap-1">
                <TrendingUp size={16} /> Full Analytics
              </Link>
            </div>

            <div className="p-6">
              {customerSubTab === 'orders' && (
                <div>
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><ShoppingCart size={18} className="text-primary" /> Order Queue – Update Status for Customer Service</h3>
                  {orders.length === 0 ? (
                    <div className="text-center py-12 border border-dashed rounded-xl bg-gray-50">
                      <ShoppingCart size={40} className="mx-auto text-gray-300 mb-3" />
                      <p className="font-medium text-gray-600">No orders yet</p>
                      <p className="text-sm text-gray-400">Orders will appear here when customers checkout</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                          <tr><th className="px-4 py-3 text-left font-bold">Order ID</th><th className="px-4 py-3 text-left font-bold">Customer</th><th className="px-4 py-3 text-left font-bold">Items</th><th className="px-4 py-3 text-right font-bold">Total</th><th className="px-4 py-3 text-center font-bold">Status</th><th className="px-4 py-3 text-center font-bold">Action</th></tr>
                        </thead>
                        <tbody className="divide-y">
                          {orders.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-mono text-xs">{order._id.slice(-8).toUpperCase()}</td>
                              <td className="px-4 py-3"><div className="font-medium">{order.user?.name || 'Guest'}</div><div className="text-xs text-gray-500">{order.user?.email}</div></td>
                              <td className="px-4 py-3 text-xs">{order.items?.length} items</td>
                              <td className="px-4 py-3 text-right font-bold"><Price amount={order.totalPrice} /></td>
                              <td className="px-4 py-3 text-center"><span className={`text-xs font-bold px-2 py-1 rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' : order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{order.status}</span></td>
                              <td className="px-4 py-3 text-center">
                                <select value={order.status} onChange={(e) => handleStatusChange(order._id, e.target.value)} className="border rounded-lg px-2 py-1 text-xs font-bold bg-white">
                                  <option>Processing</option><option>Shipped</option><option>Delivered</option><option>Cancelled</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {customerSubTab === 'customers' && (
                <div>
                  <div className="flex flex-wrap gap-3 justify-between mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2"><Users size={18} className="text-primary" /> Customer Directory</h3>
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                      <input value={searchCustomer} onChange={(e) => setSearchCustomer(e.target.value)} placeholder="Search name or email..." className="pl-9 pr-4 py-2 border rounded-xl text-sm w-64 focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b"><tr><th className="px-4 py-3 text-left font-bold">Customer</th><th className="px-4 py-3 text-left font-bold">Email</th><th className="px-4 py-3 text-center font-bold">Role</th><th className="px-4 py-3 text-center font-bold">Joined</th><th className="px-4 py-3 text-right font-bold">Actions</th></tr></thead>
                      <tbody className="divide-y">
                        {filteredCustomers.map((c) => (
                          <tr key={c._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 flex items-center gap-3"><div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary text-xs">{c.name.charAt(0)}</div><span className="font-medium">{c.name}</span></td>
                            <td className="px-4 py-3 text-gray-600">{c.email}</td>
                            <td className="px-4 py-3 text-center"><span className={`text-xs font-bold px-2 py-1 rounded-full ${c.role === 'admin' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}>{c.role}</span></td>
                            <td className="px-4 py-3 text-center text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-right"><div className="flex justify-end gap-1"><a href={`mailto:${c.email}`} className="p-1.5 hover:bg-gray-100 rounded-lg"><Mail size={16} /></a><a href={`tel:${c.phone || ''}`} className="p-1.5 hover:bg-gray-100 rounded-lg"><Phone size={16} /></a></div></td>
                          </tr>
                        ))}
                        {filteredCustomers.length === 0 && <tr><td colSpan="5" className="text-center py-10 text-gray-400">No customers found</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {customerSubTab === 'tickets' && (
                <div>
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Headset size={18} className="text-primary" /> Customer Support Tickets</h3>
                  <div className="space-y-3">
                    {tickets.map((t) => (
                      <div key={t.id} className="border rounded-xl p-4 flex flex-wrap justify-between gap-3 bg-white hover:shadow-sm transition-shadow">
                        <div>
                          <div className="flex items-center gap-2"><span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded font-bold">{t.id}</span><span className={`text-xs font-bold px-2 py-1 rounded-full ${t.priority === 'High' ? 'bg-red-100 text-red-700' : t.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{t.priority}</span><span className={`text-xs font-bold px-2 py-1 rounded-full ${t.status === 'Resolved' ? 'bg-green-500 text-white' : t.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{t.status}</span></div>
                          <p className="font-semibold mt-2">{t.subject}</p>
                          <p className="text-sm text-gray-500">{t.customer} • {t.email} • {t.date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {t.status !== 'Resolved' && <button onClick={() => handleTicketResolve(t.id)} className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1 hover:bg-primary/90"><CheckCircle size={14} /> Resolve</button>}
                          <a href={`mailto:${t.email}`} className="border px-4 py-2 rounded-xl text-sm font-bold hover:border-primary hover:text-primary">Reply</a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Product Center */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white rounded-2xl border shadow-sm p-6">
              <h3 className="font-bold text-lg flex items-center gap-2 mb-1"><PackagePlus className="text-primary" /> Quick Add Product</h3>
              <p className="text-xs text-gray-500 mb-4">Add new items instantly – live inventory update</p>
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div><label className="text-xs font-bold text-gray-700">Product Name</label><input name="name" value={productForm.name} onChange={handleProductChange} placeholder="e.g. Wireless Earbuds Pro" required className="w-full border rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-primary outline-none" /></div>
                <div><label className="text-xs font-bold text-gray-700">Category</label><select name="category" value={productForm.category} onChange={handleProductChange} required className="w-full border rounded-xl px-3 py-2.5 text-sm bg-gray-50"><option value="">Select</option>{categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-bold text-gray-700">Price ($)</label><input name="price" type="number" step="0.01" value={productForm.price} onChange={handleProductChange} required className="w-full border rounded-xl px-3 py-2.5 text-sm bg-gray-50" /></div>
                  <div><label className="text-xs font-bold text-gray-700">Stock</label><input name="stock" type="number" value={productForm.stock} onChange={handleProductChange} required className="w-full border rounded-xl px-3 py-2.5 text-sm bg-gray-50" /></div>
                </div>
                <div><label className="text-xs font-bold text-gray-700">Image URL</label><div className="relative"><Upload size={16} className="absolute left-3 top-3 text-gray-400" /><input name="imageUrl" value={productForm.imageUrl} onChange={handleProductChange} placeholder="https://..." required className="w-full border rounded-xl pl-9 pr-3 py-2.5 text-sm bg-gray-50" /></div></div>
                {productForm.imageUrl && <div className="h-32 border rounded-xl bg-gray-50 overflow-hidden flex items-center justify-center"><img src={productForm.imageUrl} alt="preview" className="h-full object-contain" /></div>}
                <div><label className="text-xs font-bold text-gray-700">Description</label><textarea name="description" value={productForm.description} onChange={handleProductChange} rows={3} required placeholder="Product details..." className="w-full border rounded-xl px-3 py-2.5 text-sm bg-gray-50 resize-none" /></div>
                <button type="submit" className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2"><Save size={16} /> Add Product</button>
              </form>
              <Link to="/admin/product/new" className="block text-center mt-3 text-xs text-primary hover:underline">Open full add page →</Link>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold flex items-center gap-2"><Package size={18} className="text-primary" /> Inventory – {products.length} products</h3>
                <Link to="/admin/products" className="text-xs font-bold text-primary border border-primary px-3 py-1.5 rounded-full hover:bg-primary hover:text-white">Manage All</Link>
              </div>
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b sticky top-0"><tr><th className="px-4 py-3 text-left font-bold">Product</th><th className="px-4 py-3 text-center font-bold">Price</th><th className="px-4 py-3 text-center font-bold">Stock</th><th className="px-4 py-3 text-right font-bold">Actions</th></tr></thead>
                  <tbody className="divide-y">
                    {products.map((p) => (
                      <tr key={p._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 flex items-center gap-3"><div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden border shrink-0">{p.images?.[0]?.url ? <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" /> : <span className="text-xs text-gray-400 flex items-center justify-center h-full">No</span>}</div><div><div className="font-medium line-clamp-1 max-w-[180px]">{p.name}</div><div className="text-xs text-gray-500">{p.category?.name}</div></div></td>
                        <td className="px-4 py-3 text-center font-bold"><Price amount={p.price} /></td>
                        <td className="px-4 py-3 text-center"><span className={`text-xs font-bold px-2 py-1 rounded-full ${p.stock === 0 ? 'bg-red-500 text-white' : p.stock <= 10 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{p.stock}</span></td>
                        <td className="px-4 py-3 text-right"><div className="flex justify-end gap-1"><Link to={`/admin/product/${p._id}`} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg"><Edit size={16} /></Link><button onClick={() => { if (confirm('Delete?')) dispatch(deleteProduct(p._id)); }} className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg"><Trash2 size={16} /></button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Low stock alert inside product center */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-wrap justify-between gap-4">
            <div className="flex items-center gap-3"><div className="bg-amber-500 text-white p-2 rounded-xl"><AlertTriangle size={20} /></div><div><p className="font-bold text-amber-900">Stock Alerts</p><p className="text-sm text-amber-700">{products.filter((p) => p.stock <= 10).length} products need restock • {products.filter((p) => p.stock === 0).length} out of stock</p></div></div>
            <Link to="/admin/analytics" className="bg-amber-500 text-white px-5 py-2 rounded-xl font-bold hover:bg-amber-600 flex items-center gap-1"><TrendingUp size={16} /> View Analytics</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
