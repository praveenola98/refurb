import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { ArrowRight, Truck, ShieldCheck, RefreshCw, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, 'products'), where('featured', '==', true), limit(4));
        let snapshot;
        try {
          snapshot = await getDocs(q);
        } catch (err) {
          handleFirestoreError(err, OperationType.LIST, 'products');
          return;
        }
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setFeaturedProducts(products);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center overflow-hidden bg-gray-900">
        <div className="absolute inset-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1920&q=80"
            alt="Laptops"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
              Premium Refurbished <span className="text-indigo-400">Laptops</span> at 50% Off
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Tested by experts. Certified quality. 1-year warranty. Get the power you need without the price tag.
            </p>
            <div className="flex space-x-4">
              <Link to="/products" className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-indigo-700 transition flex items-center">
                Shop Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/products?featured=true" className="bg-white text-gray-900 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition">
                View Deals
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: Truck, title: "Free Shipping", desc: "On all orders above ₹10,000" },
            { icon: ShieldCheck, title: "1 Year Warranty", desc: "Peace of mind guaranteed" },
            { icon: RefreshCw, title: "7 Days Return", desc: "No questions asked returns" },
            { icon: CreditCard, title: "Secure Payment", desc: "100% secure checkout" }
          ].map((f, i) => (
            <div key={i} className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="bg-indigo-50 p-3 rounded-full mb-4">
                <f.icon className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Deals</h2>
            <p className="text-gray-500 mt-2">Handpicked best sellers for you</p>
          </div>
          <Link to="/products" className="text-indigo-600 font-bold hover:underline flex items-center">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-80"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Categories / Brands */}
      <section className="bg-indigo-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-12">Shop by Brand</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Apple', 'Dell', 'HP', 'Lenovo'].map((brand) => (
              <Link
                key={brand}
                to={`/products?brand=${brand}`}
                className="bg-white/10 hover:bg-white/20 text-white p-8 rounded-2xl transition-colors backdrop-blur-sm border border-white/10"
              >
                <span className="text-2xl font-bold">{brand}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
