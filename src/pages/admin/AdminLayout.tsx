import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, ArrowLeft, Menu, X } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Package, label: 'Products', path: '/admin/products' },
    { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: Tag, label: 'Coupons', path: '/admin/coupons' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-gray-100 px-4 py-4 flex justify-between items-center sticky top-0 z-[70]">
        <Link to="/" className="flex items-center space-x-2 text-indigo-600">
          <ArrowLeft className="h-5 w-5" />
          <span className="font-bold">Store</span>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="p-6 border-b border-gray-50">
          <Link to="/" className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-bold">Back to Store</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
                location.pathname === item.path
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-indigo-600'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-bold">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[65] bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-64 h-full bg-white p-4 space-y-2" onClick={e => e.stopPropagation()}>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
                  location.pathname === item.path
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-indigo-600'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-bold">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
