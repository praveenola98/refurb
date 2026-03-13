import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { Link } from 'react-router-dom';
import { Users, ShoppingBag, IndianRupee, Package, AlertTriangle, ArrowRight } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    lowStock: 0
  });
  const [loading, setLoading] = useState(true);

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        let usersSnap, ordersSnap, productsSnap;
        try {
          usersSnap = await getDocs(collection(db, 'users'));
          setRecentUsers(usersSnap.docs.slice(0, 5).map(d => ({ id: d.id, ...d.data() })));
        } catch (err) {
          handleFirestoreError(err, OperationType.LIST, 'users');
          return;
        }
        
        try {
          ordersSnap = await getDocs(collection(db, 'orders'));
          setRecentOrders(ordersSnap.docs.slice(0, 5).map(d => ({ id: d.id, ...d.data() })));
        } catch (err) {
          handleFirestoreError(err, OperationType.LIST, 'orders');
          return;
        }

        try {
          productsSnap = await getDocs(collection(db, 'products'));
        } catch (err) {
          handleFirestoreError(err, OperationType.LIST, 'products');
          return;
        }

        const revenue = ordersSnap.docs.reduce((sum, doc) => sum + (doc.data().totalAmount || 0), 0);
        const lowStockCount = productsSnap.docs.filter(doc => doc.data().stock < 5).length;

        setStats({
          totalUsers: usersSnap.size,
          totalOrders: ordersSnap.size,
          totalRevenue: revenue,
          totalProducts: productsSnap.size,
          lowStock: lowStockCount
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-orange-600', bg: 'bg-orange-50' }
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.bg} p-3 rounded-xl`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            <div className="text-sm text-gray-500">{card.title}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/admin/products" className="bg-indigo-600 p-6 rounded-3xl text-white hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 flex items-center justify-between group">
          <div>
            <h3 className="font-bold text-lg">Manage Products</h3>
            <p className="text-indigo-100 text-sm">Add, edit or delete items</p>
          </div>
          <Package className="h-8 w-8 opacity-50 group-hover:opacity-100 transition-opacity" />
        </Link>
        <Link to="/admin/orders" className="bg-emerald-600 p-6 rounded-3xl text-white hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 flex items-center justify-between group">
          <div>
            <h3 className="font-bold text-lg">Manage Orders</h3>
            <p className="text-emerald-100 text-sm">Update status & tracking</p>
          </div>
          <ShoppingBag className="h-8 w-8 opacity-50 group-hover:opacity-100 transition-opacity" />
        </Link>
        <Link to="/admin/users" className="bg-amber-600 p-6 rounded-3xl text-white hover:bg-amber-700 transition shadow-lg shadow-amber-100 flex items-center justify-between group">
          <div>
            <h3 className="font-bold text-lg">Manage Users</h3>
            <p className="text-amber-100 text-sm">View & block customers</p>
          </div>
          <Users className="h-8 w-8 opacity-50 group-hover:opacity-100 transition-opacity" />
        </Link>
      </div>

      {stats.lowStock > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center text-amber-800">
          <AlertTriangle className="h-5 w-5 mr-3" />
          <span className="font-medium">{stats.lowStock} products are low on stock!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">Recent Orders</h3>
            <Link to="/admin/orders" className="text-indigo-600 text-xs font-bold flex items-center hover:underline">
              View All <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentOrders.length > 0 ? recentOrders.map(order => (
              <div key={order.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div>
                  <div className="font-bold text-sm text-gray-900">#{order.id.slice(-6).toUpperCase()}</div>
                  <div className="text-xs text-gray-500">{order.shippingAddress?.fullName}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-indigo-600">₹{order.totalAmount.toLocaleString()}</div>
                  <div className="text-[10px] uppercase font-bold text-gray-400">{order.status}</div>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-gray-400 text-sm">No orders yet</div>
            )}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">New Users</h3>
            <Link to="/admin/users" className="text-indigo-600 text-xs font-bold flex items-center hover:underline">
              View All <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentUsers.length > 0 ? recentUsers.map(user => (
              <div key={user.id} className="flex items-center p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs mr-3">
                  {user.displayName?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="font-bold text-sm text-gray-900">{user.displayName || 'Anonymous'}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-gray-400 text-sm">No users yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
