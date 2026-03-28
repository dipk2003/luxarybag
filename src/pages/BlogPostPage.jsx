import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { contentService } from '@/modules/content/contentService';
import { formatDate } from '@/modules/shared/utils/formatters';

const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadPost = async () => {
      try {
        const data = await contentService.getBlogPostBySlug(slug);
        if (active) {
          setPost(data);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadPost();
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
      </div>
    );
  }

  if (!post) {
    return (
      <>
        <Helmet>
          <title>Blog Post - LuxeBag</title>
        </Helmet>

        <div className="min-h-screen">
          <Header />

          <div className="container mx-auto px-4 py-12">
            <div className="text-center py-16">
              <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
              <Link to="/blog" className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Back to Blog
              </Link>
            </div>
          </div>

          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.title} - LuxeBag</title>
        <meta name="description" content={post.metaDescription || post.excerpt} />
      </Helmet>

      <div className="min-h-screen">
        <Header />

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <Link to="/blog" className="text-yellow-600 font-semibold hover:text-yellow-700 transition-colors">
              ← Back to Blog
            </Link>
            <h1 className="text-3xl md:text-5xl font-bold mt-6 mb-4">{post.title}</h1>
            <p className="text-sm text-gray-500 mb-8">
              {post.category} • {post.readTime} • {formatDate(post.publishedAt)}
            </p>
            {(post.featuredImage || post.featured_image) && (
              <div className="rounded-2xl overflow-hidden mb-8 bg-gray-100">
                <img
                  src={post.featuredImage || post.featured_image}
                  alt={post.title}
                  className="w-full h-[260px] md:h-[420px] object-cover"
                />
              </div>
            )}
            <p className="text-lg text-gray-700 leading-relaxed mb-8">{post.excerpt}</p>
            <div className="space-y-5 text-gray-700 leading-relaxed">
              {post.content.split('\n').map((paragraph, index) =>
                paragraph.trim() ? <p key={index}>{paragraph}</p> : null,
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default BlogPostPage;
