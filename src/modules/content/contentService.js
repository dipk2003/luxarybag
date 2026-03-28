import { supabase } from '@/lib/customSupabaseClient';
import {
  normalizeBlogPost,
  normalizeInstagramSettings,
  normalizeReview,
  toBlogPostPayload,
  toInstagramSettingsPayload,
  toReviewPayload,
} from '@/modules/shared/utils/normalizers';

export const contentService = {
  async listReviews() {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, products(name, slug)')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []).map(normalizeReview);
  },

  async saveReview(review) {
    const payload = toReviewPayload(review);
    const query = review.id
      ? supabase.from('reviews').update(payload).eq('id', review.id).select('*, products(name, slug)').single()
      : supabase.from('reviews').insert(payload).select('*, products(name, slug)').single();
    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return normalizeReview(data);
  },

  async deleteReview(id) {
    const { error } = await supabase.from('reviews').delete().eq('id', id);

    if (error) {
      throw error;
    }
  },

  async listBlogPosts() {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []).map(normalizeBlogPost);
  },

  async getBlogPostBySlug(slug) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? normalizeBlogPost(data) : null;
  },

  async saveBlogPost(post) {
    const payload = toBlogPostPayload(post);
    const query = post.id
      ? supabase.from('blog_posts').update(payload).eq('id', post.id).select().single()
      : supabase.from('blog_posts').insert(payload).select().single();
    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return normalizeBlogPost(data);
  },

  async deleteBlogPost(id) {
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);

    if (error) {
      throw error;
    }
  },

  async getInstagramSettings() {
    const { data, error } = await supabase
      .from('instagram_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return normalizeInstagramSettings(data || {});
  },

  async saveInstagramSettings(settings) {
    const payload = toInstagramSettingsPayload(settings);
    const { data, error } = await supabase
      .from('instagram_settings')
      .upsert(payload)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return normalizeInstagramSettings(data);
  },
};
