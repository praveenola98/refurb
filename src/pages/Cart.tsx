import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 inline-block">
          <ShoppingBag className="h-16 w-16 text-gray-200 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
          <Link to="/products" className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => (
            <div key={item.productId} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
              <div className="h-24 w-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 line-clamp-1">{item.name}</h3>
                <p className="text-indigo-600 font-bold">₹{item.price.toLocaleString()}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1 hover:bg-gray-50 text-gray-500"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 font-bold text-gray-900">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1 hover:bg-gray-50 text-gray-500"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.productId)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Remove
                  </button>
                </div>
              </div>
              <div className="text-right font-bold text-gray-900">
                ₹{(item.price * item.quantity).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({totalItems} items)</span>
                <span>₹{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600 font-bold">FREE</span>
              </div>
              <div className="border-t border-gray-100 pt-4 flex justify-between text-xl font-bold text-gray-900">
                <span>Total</span>
                <span>₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>
            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center shadow-lg shadow-indigo-200"
            >
              Checkout <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <p className="text-center text-xs text-gray-400 mt-4">
              Secure checkout powered by Razorpay
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
