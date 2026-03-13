import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { CreditCard, Truck, ShieldCheck, CheckCircle } from 'lucide-react';
import axios from 'axios';

const Checkout: React.FC = () => {
  const { user } = useAuth();
  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const [address, setAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      if (paymentMethod === 'razorpay') {
        const res = await loadRazorpay();
        if (!res) {
          alert('Razorpay SDK failed to load. Are you online?');
          setLoading(false);
          return;
        }

        // Create order on backend
        const { data: orderData } = await axios.post('/api/payment/order', {
          amount: totalPrice,
          currency: 'INR'
        });

        const options = {
          key: (import.meta as any).env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'RefurbLaptop Store',
          description: 'Payment for your order',
          order_id: orderData.id,
          handler: async (response: any) => {
            // Save order to Firestore
            await addDoc(collection(db, 'orders'), {
              userId: user.uid,
              items: cart,
              totalAmount: totalPrice,
              status: 'pending',
              paymentMethod: 'razorpay',
              paymentStatus: 'completed',
              razorpayOrderId: orderData.id,
              razorpayPaymentId: response.razorpay_payment_id,
              shippingAddress: address,
              createdAt: new Date().toISOString()
            });
            setOrderSuccess(true);
            clearCart();
          },
          prefill: {
            name: address.fullName,
            email: user.email,
            contact: address.phone
          },
          theme: { color: '#4f46e5' }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // COD Logic
        await addDoc(collection(db, 'orders'), {
          userId: user.uid,
          items: cart,
          totalAmount: totalPrice,
          status: 'pending',
          paymentMethod: 'cod',
          paymentStatus: 'pending',
          shippingAddress: address,
          createdAt: new Date().toISOString()
        });
        setOrderSuccess(true);
        clearCart();
      }
    } catch (error) {
      console.error("Order Error:", error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 inline-block max-w-md">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Order Placed!</h2>
          <p className="text-gray-500 mb-8">Thank you for your purchase. You can track your order in your dashboard.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Checkout</h1>
      
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Shipping Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Truck className="mr-2 h-5 w-5 text-indigo-600" /> Shipping Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <input required name="fullName" value={address.fullName} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Detailed Address</label>
                <textarea required name="address" value={address.address} onChange={handleInputChange} rows={3} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                <input required name="city" value={address.city} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">State</label>
                <input required name="state" value={address.state} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Zip Code</label>
                <input required name="zipCode" value={address.zipCode} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                <input required name="phone" value={address.phone} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <CreditCard className="mr-2 h-5 w-5 text-indigo-600" /> Payment Method
            </h2>
            <div className="space-y-4">
              <label className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-colors ${paymentMethod === 'razorpay' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100'}`}>
                <input type="radio" name="payment" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="h-4 w-4 text-indigo-600" />
                <div className="ml-4">
                  <span className="block font-bold text-gray-900">Online Payment (Razorpay)</span>
                  <span className="text-xs text-gray-500">Credit Card, Debit Card, UPI, Net Banking</span>
                </div>
              </label>
              <label className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100'}`}>
                <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="h-4 w-4 text-indigo-600" />
                <div className="ml-4">
                  <span className="block font-bold text-gray-900">Cash on Delivery</span>
                  <span className="text-xs text-gray-500">Pay when you receive your laptop</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            <div className="space-y-4 mb-8">
              {cart.map(item => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.name} x {item.quantity}</span>
                  <span className="font-bold">₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-4 flex justify-between text-xl font-bold text-gray-900">
                <span>Total</span>
                <span>₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center shadow-lg shadow-indigo-200 disabled:opacity-50"
            >
              {loading ? 'Processing...' : `Pay ₹${totalPrice.toLocaleString()}`}
            </button>
            <div className="mt-6 flex items-center justify-center text-xs text-gray-400">
              <ShieldCheck className="h-4 w-4 mr-1 text-green-500" /> 100% Secure Transaction
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
