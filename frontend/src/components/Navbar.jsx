import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';
import { setCurrency } from '../features/currency/currencySlice';
import { ShoppingCart, User, LogOut, Search, LayoutGrid, Heart, Scale, BarChart3 } from 'lucide-react';

const Navbar = () => {
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { items: compareItems } = useSelector((state) => state.compare);
  const { currency } = useSelector((state) => state.currency);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) navigate(`/products?keyword=${keyword}`);
    else navigate('/products');
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center gap-2">
        <Link to="/" className="flex items-center space-x-2 group shrink-0">
          <div className="bg-white p-1 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
            <img src="/images/logo.png" alt="ZN Mart Logo" className="h-8 w-auto object-contain" />
          </div>
          <span className="text-2xl font-bold text-primary tracking-tight hidden lg:block">ZN Mart</span>
        </Link>
        
        <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8">
          <form onSubmit={handleSearch} className="relative w-full">
            <input type="text" placeholder="Search products..." value={keyword} onChange={(e) => setKeyword(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 text-sm" />
            <button type="submit" className="absolute left-3 top-2.5 text-gray-400"><Search size={18} /></button>
          </form>
        </div>

        <div className="flex items-center gap-3 lg:gap-5">
          <Link to="/categories" className="hidden xl:flex items-center gap-1.5 text-gray-600 hover:text-primary font-medium text-sm border border-gray-200 hover:border-primary px-3 py-1.5 rounded-full">
            <LayoutGrid size={16} /> Categories
          </Link>
          <Link to="/products" className="hidden lg:block text-gray-600 hover:text-primary font-medium text-sm">Products</Link>

          <Link to="/wishlist" className="relative text-gray-600 hover:text-pink-500 transition-colors">
            <Heart size={22} />
            {wishlistItems.length > 0 && <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">{wishlistItems.length}</span>}
          </Link>

          <Link to="/compare" className="relative text-gray-600 hover:text-primary transition-colors hidden sm:block">
            <Scale size={22} />
            {compareItems.length > 0 && <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">{compareItems.length}</span>}
          </Link>

          <Link to="/cart" className="relative text-gray-600 hover:text-primary transition-colors">
            <ShoppingCart size={22} />
            {cartItems.length > 0 && <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">{cartItems.length}</span>}
          </Link>

          {user?.role === 'admin' && (
            <>
              <Link to="/admin/dashboard" className="hidden md:flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-primary/90">
                <LayoutGrid size={14} /> Dashboard
              </Link>
              <Link to="/admin/analytics" className="hidden sm:flex items-center gap-1 text-gray-600 hover:text-primary border border-gray-200 hover:border-primary px-2.5 py-1 rounded-full text-xs font-bold">
                <BarChart3 size={14} /> Analytics
              </Link>
            </>
          )}
          
          <div className="flex items-center border-l pl-3">
            <select value={currency} onChange={(e) => dispatch(setCurrency(e.target.value))} className="text-xs font-bold text-gray-700 bg-transparent outline-none cursor-pointer">
              <option value="USD">USD</option>
              <option value="INR">INR</option>
            </select>
          </div>
          
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-700 hidden xl:block">Hi, {user.name.split(' ')[0]}</span>
              <button onClick={onLogout} className="text-gray-600 hover:text-primary"><LogOut size={20} /></button>
            </div>
          ) : (
            <Link to="/login" className="text-gray-600 hover:text-primary font-medium flex items-center gap-1 text-sm"><User size={18} /><span className="hidden sm:inline">Login</span></Link>
          )}
        </div>
      </div>
      {/* Mobile search */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearch} className="relative">
          <input type="text" placeholder="Search products..." value={keyword} onChange={(e) => setKeyword(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-full bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-primary" />
          <button type="submit" className="absolute left-3 top-2.5 text-gray-400"><Search size={16} /></button>
        </form>
      </div>
    </nav>
  );
};

export default Navbar;
