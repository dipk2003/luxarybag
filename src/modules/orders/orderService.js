import { supabase } from '@/lib/customSupabaseClient';
import {
  normalizeOrder,
  toOrderPayload,
} from '@/modules/shared/utils/normalizers';

export const orderService = {
  async create(order) {
    const { data, error } = await supabase
      .from('orders')
      .insert(toOrderPayload(order))
      .select()
      .single();

    if (error) {
      throw error;
    }

    return normalizeOrder(data);
  },

  async list() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []).map(normalizeOrder);
  },

  async updateStatus(id, status) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return normalizeOrder(data);
  },

  async track(orderId, phone) {
    const { data, error } = await supabase.rpc('track_order', {
      p_order_id: orderId,
      p_phone: phone,
    });

    if (error) {
      throw error;
    }

    return data?.[0] || null;
  },
};
