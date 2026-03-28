import { useCallback, useEffect, useState } from 'react';
import { productService } from '@/modules/catalog/productService';
import { contentService } from '@/modules/content/contentService';
import { storeService } from '@/modules/settings/storeService';
import { categoryCatalog, storeSettingsFallback } from '@/modules/shared/constants/storeDefaults';
import { getCategoryMedia } from '@/modules/shared/constants/premiumMedia';

const buildCategories = (products) =>
  categoryCatalog.map((category) => ({
    ...category,
    count:
      category.slug === 'all'
        ? products.length
        : products.filter((product) => product.category === category.slug).length,
    image: getCategoryMedia(category.slug),
  }));

export const useSupabaseData = () => {
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [instagramSettings, setInstagramSettings] = useState(null);
  const [storeSettings, setStoreSettings] = useState(storeSettingsFallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);

    const [settingsResult, productsResult, reviewsResult, blogPostsResult, instagramResult] =
      await Promise.allSettled([
        storeService.getSettings(),
        productService.list(),
        contentService.listReviews(),
        contentService.listBlogPosts(),
        contentService.getInstagramSettings(),
      ]);

    const nextSettings =
      settingsResult.status === 'fulfilled'
        ? settingsResult.value
        : storeSettingsFallback;
    const nextProducts =
      productsResult.status === 'fulfilled' ? productsResult.value : [];
    const nextReviews = reviewsResult.status === 'fulfilled' ? reviewsResult.value : [];
    const nextBlogPosts =
      blogPostsResult.status === 'fulfilled' ? blogPostsResult.value : [];
    const nextInstagram =
      instagramResult.status === 'fulfilled' ? instagramResult.value : null;

    const failures = [
      settingsResult,
      productsResult,
      reviewsResult,
      blogPostsResult,
      instagramResult,
    ]
      .filter((result) => result.status === 'rejected')
      .map((result) => result.reason?.message)
      .filter(Boolean);

    setStoreSettings(nextSettings);
    setProducts(nextProducts);
    setReviews(nextReviews);
    setBlogPosts(nextBlogPosts);
    setInstagramSettings(nextInstagram);
    setError(failures.length > 0 ? failures.join(' | ') : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const faqs = storeSettings.faqItems || storeSettingsFallback.faqItems;
  const categories = buildCategories(products);

  return {
    products,
    reviews,
    blogPosts,
    faqs,
    categories,
    instagramSettings,
    storeSettings,
    loading,
    error,
    refresh,
  };
};
