import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {

    if (!firebaseUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    // 🔥 immediately login
    setUser({
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || '',
      role: 'customer',
      createdAt: new Date().toISOString()
    });

    setLoading(false);

    // Firestore background fetch
    try {

      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {

        await setDoc(userRef, {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          role: firebaseUser.email === 'olapraveen34@gmail.com' ? 'admin' : 'customer',
          createdAt: new Date().toISOString()
        });

      } else {

        setUser(userDoc.data() as User);

      }

    } catch (error) {
      console.error(error);
    }

  });

  return () => unsubscribe();

}, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAdmin: user?.role === 'admin' || user?.email === 'olapraveen34@gmail.com'
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;

};