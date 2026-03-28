import { supabase } from '@/lib/customSupabaseClient';
import {
  normalizeStoreSettings,
  toStoreSettingsPayload,
} from '@/modules/shared/utils/normalizers';

export const storeService = {
  async getSettings() {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return normalizeStoreSettings(data || {});
  },

  async saveSettings(settings) {
    const payload = toStoreSettingsPayload(settings);
    const { data, error } = await supabase
      .from('store_settings')
      .upsert(payload)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return normalizeStoreSettings(data);
  },
};
