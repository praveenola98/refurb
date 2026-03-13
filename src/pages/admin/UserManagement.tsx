import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { User } from '../../types';
import { Shield, ShieldAlert, Mail, Calendar, User as UserIcon } from 'lucide-react';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(d => ({ uid: d.id, ...d.data() } as User)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleBlockStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), { 
        blocked: !currentStatus 
      }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`));
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">User Management</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">User</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Joined</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(user => (
              <tr key={user.uid} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold mr-3">
                      {user.displayName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{user.displayName || 'Anonymous'}</div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Mail className="h-3 w-3 mr-1" /> {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.blocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {user.blocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {user.role !== 'admin' && (
                    <button
                      onClick={() => toggleBlockStatus(user.uid, !!user.blocked)}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-bold transition ${
                        user.blocked 
                          ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      {user.blocked ? (
                        <>
                          <Shield className="h-3 w-3" />
                          <span>Unblock</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="h-3 w-3" />
                          <span>Block</span>
                        </>
                      )}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
