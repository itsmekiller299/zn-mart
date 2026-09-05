import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { User, Package, Settings, LogOut } from 'lucide-react';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <div className="text-center mt-20 text-xl">Please login to view dashboard.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-1/4">
           <div className="bg-white rounded-xl shadow-sm border p-4 space-y-2">
             <button className="w-full flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-lg font-medium">
               <User size={20} /> Profile
             </button>
              {user.role === 'admin' && (
                <>
                  <Link to="/admin/dashboard" className="w-full flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary rounded-lg font-bold border border-primary/20">
                    <Package size={20} /> Admin Dashboard
                  </Link>
                  <Link to="/admin/products" className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors">
                    <Package size={20} /> Manage Products
                  </Link>
                  <Link to="/admin/analytics" className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors">
                    <Package size={20} /> Analytics
                  </Link>
                </>
              )}
             <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors">
               <Package size={20} /> My Orders
             </button>
             <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors">
               <Settings size={20} /> Settings
             </button>
             <button className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg font-medium transition-colors mt-4 border-t">
               <LogOut size={20} /> Logout
             </button>
           </div>
        </div>

        {/* Content */}
        <div className="w-full md:w-3/4">
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <h2 className="text-2xl font-bold mb-6 border-b pb-4">Profile Information</h2>
            
            <div className="space-y-6 max-w-lg">
              <div className="flex items-center gap-6">
                 <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary text-3xl font-bold">
                   {user.name.charAt(0)}
                 </div>
                 <div>
                   <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
                   <p className="text-gray-500">{user.role === 'admin' ? 'Administrator' : 'Customer'}</p>
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" className="w-full border rounded-lg px-4 py-2 bg-gray-50 outline-none focus:ring-2 focus:ring-primary" defaultValue={user.name} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" className="w-full border rounded-lg px-4 py-2 bg-gray-50 outline-none focus:ring-2 focus:ring-primary" defaultValue={user.email} disabled />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
              </div>

              <button className="btn-primary py-2.5">Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
