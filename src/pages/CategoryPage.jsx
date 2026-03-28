import React from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { Star, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TrustBar from '@/components/TrustBar';
import { useSupabaseData } from '@/hooks/useSupabaseData';

const CategoryPage = () => {
  const { slug } = useParams();
  const { products, categories, faqs, loading } = useSupabaseData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
      </div>
    );
  }

  const category = categories.find((entry) => entry.slug === slug);
  const categoryProducts = slug === 'all' ? products : products.filter((product) => product.category === slug);

  return (
    <>
      <Helmet>
        <title>{category?.name || 'All Bags'} - Premium Luxury Collection | LuxeBag</title>
        <meta
          name="description"
          content={`Browse our ${category?.name || 'complete'} collection of luxury bags. Free delivery, COD available, easy returns.`}
        />
      </Helmet>

      <div className="min-h-screen pb-20 md:pb-0">
        <TrustBar />
        <Header />

        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{category?.name || 'All Bags'}</h1>
          <p className="text-gray-600 mb-8">Discover {categoryProducts.length} premium products</p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {categoryProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
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
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-yellow-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">₹{product.price.toLocaleString()}</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm ml-1">{product.rating}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.slice(0, 4).map((faq, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default CategoryPage;
