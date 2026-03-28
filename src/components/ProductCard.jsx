import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

const ProductCard = ({ product }) => (
  <Link to={`/product/${product.slug}`} className="group block">
    <div className="aspect-square overflow-hidden rounded-lg mb-4 bg-gray-100 relative">
      <img
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        alt={product.name}
        src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1635865165118-917ed9e20936'}
      />
      {product.discount > 0 && (
        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
          -{product.discount}%
        </div>
      )}
      {!product.in_stock && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <span className="bg-white px-4 py-2 rounded-lg font-semibold">Out of Stock</span>
        </div>
      )}
    </div>
    <h3 className="font-semibold mb-2 group-hover:text-yellow-600 transition-colors line-clamp-2">
      {product.name}
    </h3>
    <div className="flex items-center justify-between mb-2">
      <div>
        <span className="text-lg font-bold">₹{product.price.toLocaleString()}</span>
        {product.original_price && (
          <span className="text-sm text-gray-500 line-through ml-2">
            ₹{product.original_price.toLocaleString()}
          </span>
        )}
      </div>
    </div>
    <div className="flex items-center text-sm">
      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
      <span className="font-medium">{product.rating || 0}</span>
      <span className="text-gray-500 ml-1">({product.reviews_count || 0})</span>
    </div>
  </Link>
);

export default ProductCard;
