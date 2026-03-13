import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { Order } from '../../types';
import { Package, Truck, CheckCircle, XCircle, Clock, ChevronDown } from 'lucide-react';

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-amber-500" />;
      case 'packed': return <Package className="h-4 w-4 text-blue-500" />;
      case 'shipped': return <Truck className="h-4 w-4 text-indigo-500" />;
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Order ID</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-mono text-xs text-gray-500">#{order.id.slice(-8).toUpperCase()}</div>
                  <div className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{order.shippingAddress.fullName}</div>
                  <div className="text-xs text-gray-500">{order.shippingAddress.city}</div>
                </td>
                <td className="px-6 py-4 font-bold text-gray-900">₹{order.totalAmount.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.status)}
                    <span className="capitalize text-sm font-medium text-gray-700">{order.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <select
                      className="p-1 border border-gray-200 rounded text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="packed">Packed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="text-indigo-600 hover:text-indigo-800 text-xs font-bold"
                    >
                      Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative shadow-2xl">
            <button onClick={() => setSelectedOrder(null)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
              <ChevronDown className="h-6 w-6 transform rotate-180" />
            </button>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Details</h2>
            
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Shipping Address</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p className="font-bold">{selectedOrder.shippingAddress.fullName}</p>
                  <p>{selectedOrder.shippingAddress.address}</p>
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.zipCode}</p>
                  <p>Phone: {selectedOrder.shippingAddress.phone}</p>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Order Info</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><span className="font-bold">ID:</span> #{selectedOrder.id}</p>
                  <p><span className="font-bold">Date:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  <p><span className="font-bold">Status:</span> <span className="capitalize">{selectedOrder.status}</span></p>
                  <p><span className="font-bold">Payment:</span> {selectedOrder.paymentId ? 'Paid' : 'Pending'}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-4">Items</h3>
              <div className="space-y-4">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl">
                    <div className="flex items-center space-x-4">
                      <img src={item.image} alt="" className="h-12 w-12 object-contain bg-white rounded-lg p-1" />
                      <div>
                        <p className="font-bold text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                      </div>
                    </div>
                    <p className="font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
              <div className="text-gray-500">Total Amount</div>
              <div className="text-2xl font-bold text-indigo-600">₹{selectedOrder.totalAmount.toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
