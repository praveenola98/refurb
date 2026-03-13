import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, LogOut, Menu, X, Laptop } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const Navbar: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Laptop className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">RefurbLaptop</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search laptops..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </form>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/products" className="text-gray-600 hover:text-indigo-600 font-medium">Shop</Link>
            {isAdmin && (
              <Link to="/admin" className="text-indigo-600 hover:text-indigo-700 font-bold">Admin</Link>
            )}
            <Link to="/cart" className="relative text-gray-600 hover:text-indigo-600">
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600">
                  <User className="h-6 w-6" />
                </Link>
                <button onClick={handleLogout} className="text-gray-600 hover:text-red-600">
                  <LogOut className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </form>
          <Link to="/products" className="block text-gray-600 font-medium">Shop</Link>
          <Link to="/cart" className="block text-gray-600 font-medium">Cart ({totalItems})</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="block text-gray-600 font-medium">Dashboard</Link>
              {isAdmin && <Link to="/admin" className="block text-indigo-600 font-bold">Admin Panel</Link>}
              <button onClick={handleLogout} className="block text-red-600 font-medium">Logout</button>
            </>
          ) : (
            <Link to="/login" className="block bg-indigo-600 text-white text-center py-2 rounded-lg">Login</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
