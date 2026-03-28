import React from 'react';
import { Helmet } from 'react-helmet';
import { Star, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useSupabaseData } from '@/hooks/useSupabaseData';

const ReviewsPage = () => {
  const { reviews, loading } = useSupabaseData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Customer Reviews - LuxeBag</title>
        <meta
          name="description"
          content="Read what our customers say about our luxury bags. Verified reviews from real customers."
        />
      </Helmet>

      <div className="min-h-screen">
        <Header />

        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Customer Reviews</h1>
          <p className="text-gray-600 mb-12">Trusted by thousands of happy customers</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{review.comment}"</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold">
                      {review.name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <p className="font-semibold">{review.name}</p>
                      <p className="text-sm text-gray-500">{review.product}</p>
                    </div>
                  </div>
                  {review.verified && (
                    <span className="text-sm text-green-600 font-medium">✓ Verified</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default ReviewsPage;
