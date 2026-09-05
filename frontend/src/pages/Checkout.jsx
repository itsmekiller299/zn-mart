import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearCart } from '../features/cart/cartSlice';
import { toast } from 'react-toastify';
import { CreditCard, Truck, CheckCircle } from 'lucide-react';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.cart);
  
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  const handlePlaceOrder = () => {
    setIsProcessing(true);
    // Simulate API call for payment processing
    setTimeout(() => {
      setIsProcessing(false);
      dispatch(clearCart());
      toast.success('Order placed successfully!');
      setStep(3); // Success step
    }, 2000);
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
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input type="text" className="w-full border rounded-lg px-4 py-2 bg-gray-50 outline-none focus:ring-2 focus:ring-primary" placeholder="John Doe" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label><input type="text" className="w-full border rounded-lg px-4 py-2 bg-gray-50 outline-none focus:ring-2 focus:ring-primary" placeholder="+1 234 567 890" /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Address</label><input type="text" className="w-full border rounded-lg px-4 py-2 bg-gray-50 outline-none focus:ring-2 focus:ring-primary" placeholder="123 Main St, Apt 4B" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">City</label><input type="text" className="w-full border rounded-lg px-4 py-2 bg-gray-50 outline-none focus:ring-2 focus:ring-primary" placeholder="New York" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label><input type="text" className="w-full border rounded-lg px-4 py-2 bg-gray-50 outline-none focus:ring-2 focus:ring-primary" placeholder="10001" /></div>
            </div>
            <button onClick={() => setStep(2)} className="w-full btn-primary py-3 text-lg mt-4">Continue to Payment</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold flex items-center gap-2"><CreditCard className="text-primary" /> Payment Method</h2>
            
            <div className="border rounded-xl p-4 bg-gray-50">
               <label className="flex items-center gap-3 cursor-pointer">
                 <input type="radio" name="payment" defaultChecked className="w-5 h-5 text-primary focus:ring-primary" />
                 <span className="font-medium text-lg">Credit / Debit Card (Stripe Sandbox)</span>
               </label>
               <div className="mt-4 pl-8 space-y-4">
                 <input type="text" className="w-full border rounded-lg px-4 py-2" placeholder="Card Number (4242 4242 4242 4242)" />
                 <div className="grid grid-cols-2 gap-4">
                   <input type="text" className="w-full border rounded-lg px-4 py-2" placeholder="MM/YY" />
                   <input type="text" className="w-full border rounded-lg px-4 py-2" placeholder="CVC" />
                 </div>
               </div>
            </div>

            <div className="border-t pt-4 mt-6">
              <div className="flex justify-between text-xl font-bold text-gray-800">
                <span>Total to Pay:</span>
                <span className="text-primary">${calculateTotal()}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="px-6 py-3 border text-gray-600 rounded-lg hover:bg-gray-50 font-medium">Back</button>
              <button 
                onClick={handlePlaceOrder} 
                disabled={isProcessing}
                className={`flex-1 btn-primary py-3 text-lg ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isProcessing ? 'Processing Payment...' : 'Pay Now'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-12 animate-in fade-in zoom-in">
             <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
               <CheckCircle size={48} className="text-green-500" />
             </div>
             <h2 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
             <p className="text-gray-500 text-lg mb-8">Thank you for your purchase. Your order is being processed.</p>
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
