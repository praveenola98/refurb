import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      quantity: 1,
      image: product.images[0]
    });
  };

  return (
    <Link to={`/product/${product.id}`} className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        <img
          src={product.images[0] || 'https://picsum.photos/seed/laptop/400/300'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded">
          Grade {product.condition}
        </div>
        {product.discountPrice && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">{product.brand}</div>
        <h3 className="text-gray-900 font-bold text-lg mb-2 line-clamp-1">{product.name}</h3>
        
        <div className="flex items-center space-x-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
          ))}
          <span className="text-xs text-gray-500 ml-1">(4.0)</span>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div>
            <div className="text-xl font-bold text-indigo-600">
              ₹{(product.discountPrice || product.price).toLocaleString()}
            </div>
            
          </div>
          <button
            onClick={handleAddToCart}
            className="p-2 bg-gray-100 hover:bg-indigo-600 hover:text-white rounded-full transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
