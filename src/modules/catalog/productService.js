import { supabase } from '@/lib/customSupabaseClient';
import {
  normalizeProduct,
  toProductPayload,
} from '@/modules/shared/utils/normalizers';

export const productService = {
  async list() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []).map(normalizeProduct);
  },

  async getBySlug(slug) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? normalizeProduct(data) : null;
  },

  async save(product) {
    const payload = toProductPayload(product);
    const query = product.id
      ? supabase.from('products').update(payload).eq('id', product.id).select().single()
      : supabase.from('products').insert(payload).select().single();
    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return normalizeProduct(data);
  },

  async remove(id) {
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      throw error;
    }
  },
};
