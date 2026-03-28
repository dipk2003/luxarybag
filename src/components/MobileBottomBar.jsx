import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Search, Menu, Star } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useMode } from '@/contexts/ModeContext';

const MobileBottomBar = () => {
  const location = useLocation();
  const { cartCount } = useCart();
  const { isGrowthMode } = useMode();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
      <div className="grid grid-cols-4 h-16">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
            isActive('/') ? 'text-yellow-600' : 'text-gray-600'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        <Link
          to="/category/custom-bags"
          className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
            isActive('/category/custom-bags') ? 'text-yellow-600' : 'text-gray-600'
          }`}
        >
          <Star className="w-5 h-5" />
          <span className="text-[10px] font-medium">Custom</span>
        </Link>

        {isGrowthMode ? (
          <Link
            to="/checkout"
            className={`flex flex-col items-center justify-center space-y-1 transition-colors relative ${
              isActive('/checkout') ? 'text-yellow-600' : 'text-gray-600'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-2 right-1/4 bg-yellow-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {cartCount}
              </span>
            )}
            <span className="text-[10px] font-medium">Cart</span>
          </Link>
        ) : (
          <Link
            to="/shop"
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              isActive('/shop') ? 'text-yellow-600' : 'text-gray-600'
            }`}
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-medium">Shop</span>
          </Link>
        )}

        <Link
          to="/shop"
          className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
            isActive('/shop') && !isGrowthMode ? 'text-yellow-600' : 'text-gray-600'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-medium">All</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileBottomBar;
