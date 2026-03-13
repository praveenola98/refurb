import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { Filter, ChevronDown, Search as SearchIcon } from 'lucide-react';

const ProductList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter states
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || '');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, 'products'));
        
        const brandParam = searchParams.get('brand');
        const conditionParam = searchParams.get('condition');
        const searchParam = searchParams.get('search');

        // Note: Firestore has limitations on multiple where clauses with different operators
        // For simplicity, we'll fetch and filter in memory if multiple filters are applied
        // or use simple queries for single filters.
        
        let snapshot;
        try {
          snapshot = await getDocs(q);
        } catch (err) {
          handleFirestoreError(err, OperationType.LIST, 'products');
          return;
        }
        let allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

        // Client-side filtering
        if (brandParam) allProducts = allProducts.filter(p => p.brand === brandParam);
        if (conditionParam) allProducts = allProducts.filter(p => p.condition === conditionParam);
        if (searchParam) {
          const s = searchParam.toLowerCase();
          allProducts = allProducts.filter(p => 
            p.name.toLowerCase().includes(s) || 
            p.brand.toLowerCase().includes(s) ||
            p.description.toLowerCase().includes(s)
          );
        }

        // Sorting
        if (sortBy === 'price-low') allProducts.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        if (sortBy === 'price-high') allProducts.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));

        setProducts(allProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams, sortBy]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 flex items-center">
                <Filter className="h-4 w-4 mr-2" /> Filters
              </h3>
              <button 
                onClick={() => setSearchParams({})}
                className="text-xs text-indigo-600 font-bold hover:underline"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-6">
              {/* Brand Filter */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Brand</label>
                <select 
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={searchParams.get('brand') || ''}
                  onChange={(e) => updateFilter('brand', e.target.value)}
                >
                  <option value="">All Brands</option>
                  <option value="Apple">Apple</option>
                  <option value="Dell">Dell</option>
                  <option value="HP">HP</option>
                  <option value="Lenovo">Lenovo</option>
                  <option value="Asus">Asus</option>
                </select>
              </div>

              {/* Condition Filter */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Condition</label>
                <div className="space-y-2">
                  {['A', 'B', 'C'].map((c) => (
                    <label key={c} className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="condition"
                        checked={searchParams.get('condition') === c}
                        onChange={() => updateFilter('condition', c)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-600">Grade {c}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {products.length} Laptops Found
            </h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select 
                className="p-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-80"></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <SearchIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900">No laptops found</h3>
              <p className="text-gray-500">Try adjusting your filters or search query</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductList;
