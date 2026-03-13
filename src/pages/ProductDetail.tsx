import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Product, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Star, Shield, Truck, RotateCcw, ShoppingCart, Zap } from 'lucide-react';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        let docSnap;
        try {
          docSnap = await getDoc(docRef);
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `products/${id}`);
          return;
        }
        
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        }

        const reviewsQuery = query(collection(db, `products/${id}/reviews`));
        let reviewsSnap;
        try {
          reviewsSnap = await getDocs(reviewsQuery);
        } catch (err) {
          handleFirestoreError(err, OperationType.LIST, `products/${id}/reviews`);
          return;
        }
        setReviews(reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Review)));
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-20 text-center">Loading...</div>;
  if (!product) return <div className="max-w-7xl mx-auto px-4 py-20 text-center">Product not found</div>;

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      quantity: 1,
      image: product.images[0]
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <img
              src={product.images[activeImage] || 'https://picsum.photos/seed/laptop/800/800'}
              alt={product.name}
              className="w-full h-full object-contain p-8"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${activeImage === i ? 'border-indigo-600' : 'border-transparent bg-gray-50'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="text-indigo-600 font-bold uppercase tracking-wider text-sm mb-2">{product.brand}</div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-yellow-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}
              </div>
              <span className="text-gray-500 text-sm">({reviews.length} Reviews)</span>
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">Grade {product.condition}</span>
            </div>
          </div>

          <div className="flex items-baseline space-x-4">
            <span className="text-4xl font-bold text-indigo-600">₹{(product.discountPrice || product.price).toLocaleString()}</span>
            {product.discountPrice && (
              <>
                <span className="text-xl text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
                <span className="text-green-600 font-bold">{Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF</span>
              </>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          <div className="grid grid-cols-2 gap-4 py-6 border-y border-gray-100">
            <div className="space-y-1">
              <span className="text-xs text-gray-400 uppercase font-bold">Processor</span>
              <p className="font-medium text-gray-900">{product.processor}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-gray-400 uppercase font-bold">RAM</span>
              <p className="font-medium text-gray-900">{product.ram}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-gray-400 uppercase font-bold">Storage</span>
              <p className="font-medium text-gray-900">{product.ssd}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-gray-400 uppercase font-bold">Warranty</span>
              <p className="font-medium text-gray-900">{product.warranty}</p>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-gray-100 text-gray-900 py-4 rounded-xl font-bold hover:bg-gray-200 transition flex items-center justify-center"
            >
              <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center shadow-lg shadow-indigo-200"
            >
              <Zap className="mr-2 h-5 w-5" /> Buy Now
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-8">
            <div className="flex flex-col items-center text-center">
              <Shield className="h-6 w-6 text-gray-400 mb-2" />
              <span className="text-xs text-gray-500">Certified Quality</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <Truck className="h-6 w-6 text-gray-400 mb-2" />
              <span className="text-xs text-gray-500">Fast Delivery</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <RotateCcw className="h-6 w-6 text-gray-400 mb-2" />
              <span className="text-xs text-gray-500">Easy Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h2>
        {reviews.length > 0 ? (
          <div className="space-y-8">
            {reviews.map(review => (
              <div key={review.id} className="bg-white p-6 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-bold text-gray-900">{review.userName}</div>
                    <div className="flex text-yellow-400 mt-1">
                      {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />)}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
