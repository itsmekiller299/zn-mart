import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { removeFromCart, clearCart } from '../features/cart/cartSlice';
import { applyCoupon, removeCoupon } from '../features/coupon/couponSlice';
import { Trash2, ShoppingBag, Tag, X } from 'lucide-react';
import { toast } from 'react-toastify';
import Price from '../components/Price';

const Cart = () => {
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);
  const { appliedCoupon, discountPercent, error } = useSelector((state) => state.coupon);
  const [couponInput, setCouponInput] = useState('');

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const discountAmount = appliedCoupon ? (subtotal * discountPercent) / 100 : 0;
  const total = subtotal - discountAmount;

  const handleApply = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    dispatch(applyCoupon(couponInput));
    const upper = couponInput.toUpperCase().trim();
    if (['SAVE10','WELCOME20','FESTIVE25','ZNMART15'].includes(upper)) {
      toast.success(`Coupon ${upper} applied! ${upper === 'SAVE10' ? '10' : upper === 'WELCOME20' ? '20' : upper === 'FESTIVE25' ? '25' : '15'}% off`);
    } else {
      toast.error('Invalid coupon');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-40 h-40 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={64} className="text-gray-400" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/products" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
            <div className="hidden sm:grid grid-cols-6 gap-4 p-4 border-b bg-gray-50 text-gray-600 font-medium text-sm">
              <div className="col-span-3">Product</div>
              <div className="col-span-1 text-center">Price</div>
              <div className="col-span-1 text-center">Quantity</div>
              <div className="col-span-1 text-center">Total</div>
            </div>
            
            {cartItems.map((item) => (
              <div key={item.product} className="grid grid-cols-1 sm:grid-cols-6 gap-4 p-4 border-b items-center relative">
                <div className="col-span-3 flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border">
                    {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200" />}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 line-clamp-2">{item.name}</h3>
                    <button onClick={() => dispatch(removeFromCart(item))} className="text-red-500 text-sm hover:text-red-700 mt-2 flex items-center gap-1 sm:hidden">
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
                <div className="col-span-1 text-center font-medium text-gray-600 hidden sm:block"><Price amount={item.price} /></div>
                <div className="col-span-1 flex justify-center">
                   <span className="px-4 py-1.5 bg-gray-50 border rounded-full text-sm font-semibold">{item.quantity}</span>
                </div>
                <div className="col-span-1 text-center font-semibold text-primary hidden sm:block">
                  <Price amount={item.price * item.quantity} />
                </div>
                <button onClick={() => dispatch(removeFromCart(item))} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 hidden sm:block">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-between">
            <Link to="/products" className="text-primary font-medium hover:underline flex items-center">&larr; Continue Shopping</Link>
            <button onClick={() => dispatch(clearCart())} className="text-gray-500 hover:text-red-500 font-medium text-sm border px-4 py-2 rounded-xl hover:border-red-200">Clear Cart</button>
          </div>
        </div>
        
        <div className="lg:w-1/3 space-y-4">
          {/* Coupon */}
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <h3 className="font-bold flex items-center gap-2 mb-3"><Tag size={16} className="text-primary" /> Apply Coupon</h3>
            {appliedCoupon ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-green-700">{appliedCoupon} – {discountPercent}% OFF</p>
                  <p className="text-xs text-green-600">You save <Price amount={discountAmount} /></p>
                </div>
                <button onClick={() => { dispatch(removeCoupon()); setCouponInput(''); }} className="p-1 hover:bg-green-100 rounded-full"><X size={16} /></button>
              </div>
            ) : (
              <form onSubmit={handleApply} className="flex gap-2">
                <input value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="SAVE10, WELCOME20..." className="flex-1 border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary uppercase" />
                <button type="submit" className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/90">Apply</button>
              </form>
            )}
            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {['SAVE10','WELCOME20','FESTIVE25','ZNMART15'].map((c) => (
                <button key={c} onClick={() => setCouponInput(c)} className="text-xs font-mono bg-gray-50 border px-2 py-1 rounded-full hover:border-primary hover:text-primary">{c}</button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <h2 className="text-xl font-bold mb-4 border-b pb-4">Order Summary</h2>
            <div className="space-y-3 mb-6 text-gray-600 text-sm">
              <div className="flex justify-between"><span>Subtotal ({cartItems.length} items)</span><span className="font-medium text-gray-800"><Price amount={subtotal} /></span></div>
              {appliedCoupon && <div className="flex justify-between text-green-600 font-medium"><span>Discount ({discountPercent}%)</span><span>- <Price amount={discountAmount} /></span></div>}
              <div className="flex justify-between"><span>Shipping</span><span className="text-green-500 font-medium">Free</span></div>
              <div className="flex justify-between border-t pt-3 mt-3 text-lg font-bold text-gray-800"><span>Total</span><span className="text-primary"><Price amount={total} /></span></div>
              {appliedCoupon && <p className="text-xs text-green-600 bg-green-50 p-2 rounded-lg text-center">You saved <Price amount={discountAmount} /> with {appliedCoupon}!</p>}
            </div>
            <Link to="/checkout" className="block text-center w-full btn-primary py-3 text-lg rounded-xl shadow-md hover:shadow-lg">Proceed to Checkout</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
