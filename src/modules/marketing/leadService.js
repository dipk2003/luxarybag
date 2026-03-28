import { supabase } from '@/lib/customSupabaseClient';

export const leadService = {
  async createLead(lead) {
    const { data, error } = await supabase.from('leads').insert(lead).select().single();

    if (error) {
      throw error;
    }

    return data;
  },

  async listLeads() {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  },

  async createContactMessage(message) {
    const { data, error } = await supabase
      .from('contact_messages')
      .insert(message)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },
};
