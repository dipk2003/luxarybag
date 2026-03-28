import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Search, ShoppingBag, Heart, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { useStore } from '@/contexts/ModeContext';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const { isGrowthMode, settings } = useStore();
  const navigate = useNavigate();

  const brandShortName = settings.brandShortName || settings.brandName || 'LuxeBag';
  const suffix = settings.brandName?.startsWith(brandShortName)
    ? settings.brandName.slice(brandShortName.length).trim()
    : '';

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Shop All', href: '/shop' },
    { name: 'Custom Bags', href: '/category/custom-bags', special: true },
    { name: 'Bridal Collection', href: '/category/bridal' },
    { name: 'Party Wear', href: '/category/party' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-50 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link to="/" className="flex items-center flex-col md:flex-row md:gap-2 group">
            <span className="text-xl md:text-2xl font-bold tracking-tight uppercase relative">
              {brandShortName}
              {suffix ? <span className="text-yellow-600"> {suffix}</span> : null}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-600 transition-all duration-300 group-hover:w-full" />
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors relative group py-2 ${
                  item.special ? 'text-yellow-700 font-bold' : 'text-gray-700 hover:text-black'
                }`}
              >
                {item.name}
                <span
                  className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                    item.special ? 'bg-yellow-700' : 'bg-yellow-600'
                  }`}
                />
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/shop')}
              className="p-2 hover:bg-gray-50 rounded-full transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-gray-700" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="hidden md:block p-2 hover:bg-gray-50 rounded-full transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 text-gray-700" />
            </motion.button>

            {isGrowthMode && (
              <Link to="/checkout">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-2 hover:bg-gray-50 rounded-full transition-colors"
                >
                  <ShoppingBag className="w-5 h-5 text-gray-700" />
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-yellow-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </motion.div>
              </Link>
            )}

            <Link to="/contact" className="hidden md:block">
              <Button size="sm" variant="outline" className="border-yellow-600 text-yellow-700 hover:bg-yellow-50">
                Contact
              </Button>
            </Link>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-100 overflow-hidden bg-white shadow-lg rounded-b-xl"
            >
              <div className="py-4 space-y-2 px-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                      item.special ? 'bg-yellow-50 text-yellow-800' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {item.name}
                      <ChevronDown className="-rotate-90 w-4 h-4 text-gray-400" />
                    </div>
                  </Link>
                ))}
                <Link
                  to="/contact"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Header;
