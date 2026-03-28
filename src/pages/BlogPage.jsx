import React from 'react';
import { Helmet } from 'react-helmet';
import { Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Link } from 'react-router-dom';

const BlogPage = () => {
  const { blogPosts, loading } = useSupabaseData();

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
        <title>Blog - Style Guide & Fashion Tips | LuxeBag</title>
        <meta
          name="description"
          content="Explore luxury bag styling tips, fashion trends, and care guides from LuxeBag experts."
        />
      </Helmet>

      <div className="min-h-screen">
        <Header />

        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Style Guide & Blog</h1>
          <p className="text-gray-600 mb-12">Discover fashion tips, trends, and bag care guides</p>

          {blogPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg mb-4">No blog posts yet</p>
              <p className="text-gray-400">Check back soon for exciting content!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <Link to={`/blog/${post.slug}`} key={post.id} className="block group">
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-48 bg-gray-200 overflow-hidden">
                      {post.featured_image ? (
                        <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : post.featuredImage ? (
                        <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
                      )}
                    </div>
                    <div className="p-6">
                      <h2 className="text-xl font-bold mb-2 group-hover:text-yellow-600 transition-colors">{post.title}</h2>
                      <p className="text-gray-600 line-clamp-3">{post.meta_description || post.metaDescription || 'Read more about this topic...'}</p>
                      <span className="text-yellow-600 font-semibold mt-4 inline-block">Read More</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
};

export default BlogPage;
