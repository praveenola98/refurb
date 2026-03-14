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
    <nav className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <Laptop className="h-8 w-8 text-indigo-600 group-hover:scale-110 transition" />
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              RefurbLaptop
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search laptops..."
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
            </div>
          </form>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">

            <Link
              to="/products"
              className="text-gray-700 hover:text-indigo-600 font-medium transition"
            >
              Shop
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="text-indigo-600 font-semibold hover:text-indigo-700"
              >
                Admin
              </Link>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="relative text-gray-700 hover:text-indigo-600 transition"
            >
              <ShoppingCart className="h-6 w-6" />

              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow">
                  {totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">

                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-indigo-600 transition"
                >
                  <User className="h-6 w-6" />
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600 transition"
                >
                  <LogOut className="h-6 w-6" />
                </button>

              </div>
            ) : (
              <Link
                to="/login"
                className="bg-indigo-600 text-white px-6 py-2 rounded-full font-medium hover:bg-indigo-700 transition shadow-sm"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700"
            >
              {isMenuOpen ? (
                <X className="h-7 w-7" />
              ) : (
                <Menu className="h-7 w-7" />
              )}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-5 space-y-4 shadow-sm">

          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search laptops..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          </form>

          <Link
            to="/products"
            className="block text-gray-700 font-medium"
          >
            Shop
          </Link>

          <Link
            to="/cart"
            className="block text-gray-700 font-medium"
          >
            Cart ({totalItems})
          </Link>

          {user ? (
            <>
              <Link
                to="/dashboard"
                className="block text-gray-700 font-medium"
              >
                Dashboard
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="block text-indigo-600 font-semibold"
                >
                  Admin Panel
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="block text-red-600 font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="block bg-indigo-600 text-white text-center py-2.5 rounded-lg font-medium"
            >
              Login
            </Link>
          )}

        </div>
      )}
    </nav>
  );
};

export default Navbar;