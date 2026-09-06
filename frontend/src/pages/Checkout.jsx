import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearCart } from '../features/cart/cartSlice';
import { toast } from 'react-toastify';
import { CreditCard, Truck, CheckCircle, Banknote, Wallet } from 'lucide-react';
import axios from 'axios';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [shipping, setShipping] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'India',
  });

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  const handleShippingChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const handleContinueShipping = () => {
    if (!shipping.fullName || !shipping.phone || !shipping.address || !shipping.city || !shipping.zipCode) {
      toast.error('Please fill all shipping fields');
      return;
    }
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    if (!user?.token) {
      toast.error('Please login to place order');
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    setIsProcessing(true);
    try {
      const items = cartItems.map((item) => ({
        product: item.product,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image || item.images?.[0]?.url || '/images/product1.png',
      }));
      const shippingAddress = {
        street: shipping.address,
        city: shipping.city,
        state: shipping.city,
        zipCode: shipping.zipCode,
        country: shipping.country,
      };
      const totalPrice = Number(calculateTotal());
      const payload = {
        items,
        shippingAddress,
        paymentMethod,
        paymentInfo: paymentMethod === 'cod' ? { method: 'cod' } : { method: 'card' },
        itemsPrice: totalPrice,
        taxPrice: 0,
        shippingPrice: 0,
        totalPrice,
      };
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.post('/api/orders', payload, config);
      if (res.data.success) {
        dispatch(clearCart());
        toast.success(paymentMethod === 'cod' ? 'Order placed! Pay on delivery.' : 'Order placed successfully!');
        setStep(3);
      } else {
        toast.error(res.data.message || 'Failed to place order');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to place order';
      toast.error(msg);
      if (msg.includes('Not authorized') || msg.includes('no longer exists')) {
        navigate('/login');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0 && step !== 3) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
         <div className={`flex flex-col items-center ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
           <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>1</div>
           <span className="font-medium">Shipping</span>
         </div>
         <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
         <div className={`flex flex-col items-center ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
           <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>2</div>
           <span className="font-medium">Payment</span>
         </div>
         <div className={`flex-1 h-1 mx-4 ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
         <div className={`flex flex-col items-center ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>
           <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200'}`}>3</div>
           <span className="font-medium">Success</span>
         </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Truck className="text-primary" /> Shipping Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label><input name="fullName" value={shipping.fullName} onChange={handleShippingChange} type="text" className="w-full border rounded-lg px-4 py-2 bg-gray-50 outline-none focus:ring-2 focus:ring-primary" placeholder="John Doe" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label><input name="phone" value={shipping.phone} onChange={handleShippingChange} type="text" className="w-full border rounded-lg px-4 py-2 bg-gray-50 outline-none focus:ring-2 focus:ring-primary" placeholder="+91 98765 43210" /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Address *</label><input name="address" value={shipping.address} onChange={handleShippingChange} type="text" className="w-full border rounded-lg px-4 py-2 bg-gray-50 outline-none focus:ring-2 focus:ring-primary" placeholder="123 Main St, Apt 4B" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">City *</label><input name="city" value={shipping.city} onChange={handleShippingChange} type="text" className="w-full border rounded-lg px-4 py-2 bg-gray-50 outline-none focus:ring-2 focus:ring-primary" placeholder="Mumbai" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Zip Code *</label><input name="zipCode" value={shipping.zipCode} onChange={handleShippingChange} type="text" className="w-full border rounded-lg px-4 py-2 bg-gray-50 outline-none focus:ring-2 focus:ring-primary" placeholder="400001" /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Country</label><input name="country" value={shipping.country} onChange={handleShippingChange} type="text" className="w-full border rounded-lg px-4 py-2 bg-gray-50 outline-none focus:ring-2 focus:ring-primary" placeholder="India" /></div>
            </div>
            <button onClick={handleContinueShipping} className="w-full btn-primary py-3 text-lg mt-4">Continue to Payment</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Wallet className="text-primary" /> Payment Method</h2>
            
            {/* Card Option */}
            <div className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-gray-200 bg-gray-50'}`} onClick={() => setPaymentMethod('card')}>
               <label className="flex items-center gap-3 cursor-pointer">
                 <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="w-5 h-5 text-primary focus:ring-primary" />
                 <CreditCard size={20} className="text-primary" />
                 <span className="font-medium text-lg">Credit / Debit Card</span>
                 <span className="ml-auto text-xs bg-white border px-2 py-1 rounded-full">Stripe Sandbox</span>
               </label>
               {paymentMethod === 'card' && (
                 <div className="mt-4 pl-8 space-y-4">
                   <input type="text" className="w-full border rounded-lg px-4 py-2 bg-white" placeholder="Card Number (4242 4242 4242 4242)" />
                   <div className="grid grid-cols-2 gap-4">
                     <input type="text" className="w-full border rounded-lg px-4 py-2 bg-white" placeholder="MM/YY" />
                     <input type="text" className="w-full border rounded-lg px-4 py-2 bg-white" placeholder="CVC" />
                   </div>
                   <p className="text-xs text-gray-500">Sandbox – no real charge. Order will be marked as paid.</p>
                 </div>
               )}
            </div>

            {/* COD Option */}
            <div className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'}`} onClick={() => setPaymentMethod('cod')}>
               <label className="flex items-center gap-3 cursor-pointer">
                 <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-5 h-5 text-green-600 focus:ring-green-500" />
                 <Banknote size={20} className="text-green-600" />
                 <span className="font-medium text-lg">Cash on Delivery (COD)</span>
                 <span className="ml-auto text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-1 rounded-full">Pay at doorstep</span>
               </label>
               {paymentMethod === 'cod' && (
                 <div className="mt-4 pl-8">
                   <div className="bg-white border border-green-200 rounded-lg p-3 text-sm text-gray-700">
                     <p className="font-medium text-green-700 mb-1">✓ Pay with cash when your order arrives.</p>
                     <p className="text-xs text-gray-500">No advance payment needed. Our delivery partner will collect <span className="font-bold">₹{calculateTotal()}</span> on delivery. Please keep exact amount ready.</p>
                     <p className="text-xs text-gray-400 mt-2">• Delivery in 3-5 days • Free shipping • Easy returns</p>
                   </div>
                 </div>
               )}
            </div>

            <div className="border-t pt-4 mt-6">
              <div className="flex justify-between text-xl font-bold text-gray-800">
                <span>Total to Pay:</span>
                <span className="text-primary">${calculateTotal()}</span>
              </div>
              {paymentMethod === 'cod' && <p className="text-xs text-gray-500 mt-1 text-right">To be collected on delivery</p>}
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="px-6 py-3 border text-gray-600 rounded-lg hover:bg-gray-50 font-medium">Back</button>
              <button 
                onClick={handlePlaceOrder} 
                disabled={isProcessing}
                className={`flex-1 py-3 text-lg rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 ${paymentMethod === 'cod' ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-primary/90'} ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isProcessing ? 'Placing Order...' : paymentMethod === 'cod' ? <><Banknote size={20}/> Place Order – COD</> : <><CreditCard size={20}/> Pay Now</>}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-12 animate-in fade-in zoom-in">
             <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${paymentMethod === 'cod' ? 'bg-green-100' : 'bg-green-100'}`}>
               <CheckCircle size={48} className="text-green-500" />
             </div>
             <h2 className="text-3xl font-bold text-gray-800 mb-2">{paymentMethod === 'cod' ? 'Order Placed – COD!' : 'Payment Successful!'}</h2>
             <p className="text-gray-500 text-lg mb-2">Thank you for your purchase. Your order is being processed.</p>
             {paymentMethod === 'cod' && <p className="text-sm bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-3 max-w-md mx-auto mb-6">Please keep <span className="font-bold">₹{calculateTotal()}</span> ready. Pay to our delivery partner on arrival.</p>}
             <button onClick={() => navigate('/')} className="btn-primary">
               Return to Home
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
