import React from 'react';
import { Link } from 'react-router-dom';
import { Laptop, Facebook, Twitter, Instagram, Mail, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 text-white mb-4">
              <Laptop className="h-8 w-8 text-indigo-500" />
              <span className="text-xl font-bold">RefurbLaptop</span>
            </Link>
            <p className="text-sm leading-relaxed">
              Premium quality refurbished laptops at unbeatable prices. Tested, certified, and ready for your next big project.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-indigo-400">Shop All</Link></li>
              <li><Link to="/products?brand=Dell" className="hover:text-indigo-400">Dell Laptops</Link></li>
              <li><Link to="/products?brand=HP" className="hover:text-indigo-400">HP Laptops</Link></li>
              <li><Link to="/products?brand=Apple" className="hover:text-indigo-400">MacBooks</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/dashboard" className="hover:text-indigo-400">My Account</Link></li>
              <li><Link to="/cart" className="hover:text-indigo-400">Cart</Link></li>
              <li><Link to="#" className="hover:text-indigo-400">Warranty Info</Link></li>
              <li><Link to="#" className="hover:text-indigo-400">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>support@refurblaptop.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex space-x-4 mt-4">
                <Facebook className="h-5 w-5 hover:text-indigo-400 cursor-pointer" />
                <Twitter className="h-5 w-5 hover:text-indigo-400 cursor-pointer" />
                <Instagram className="h-5 w-5 hover:text-indigo-400 cursor-pointer" />
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} RefurbLaptop Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
