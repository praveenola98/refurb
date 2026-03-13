import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';
import { Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'packed': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-indigo-100 text-indigo-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Welcome, {user?.displayName}</h1>
          <p className="text-gray-500">Manage your orders and account settings</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-xs text-gray-400 uppercase font-bold mb-1">Account Email</div>
          <div className="font-bold text-gray-900">{user?.email}</div>
        </div>
      </div>

      <div className="space-y-8">
        <h2 className="text-xl font-bold text-gray-900">Order History</h2>
        
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 rounded-2xl h-32"></div>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <div className="text-xs text-gray-400 uppercase font-bold">Order ID</div>
                    <div className="font-mono text-sm font-bold text-gray-900">#{order.id.slice(-8).toUpperCase()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase font-bold">Placed On</div>
                    <div className="font-bold text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase font-bold">Total Amount</div>
                    <div className="font-bold text-indigo-600">₹{order.totalAmount.toLocaleString()}</div>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                    {order.status}
                  </div>
                </div>
                <div className="p-6 bg-gray-50/50">
                  <div className="flex flex-wrap gap-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center space-x-3 bg-white p-2 rounded-xl border border-gray-100">
                        <img src={item.image} alt="" className="h-12 w-12 object-contain" />
                        <div>
                          <div className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</div>
                          <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">No orders yet</h3>
            <p className="text-gray-500">When you buy something, it will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
