import { supabase, isSupabaseConfigured } from '../database/supabase-client';

const LOCAL_SETTINGS_KEY = 'healthwise_app_settings';

export interface SystemSettings {
  model: string;
  fallbackModel: string;
  mockAi: boolean;
  topKChunks: number;
  strictDisclaimers: boolean;
  updatedAt: string;
}

const DEFAULT_SETTINGS: SystemSettings = {
  model: 'gpt-4o-mini',
  fallbackModel: 'claude-3-5-sonnet',
  mockAi: false,
  topKChunks: 3,
  strictDisclaimers: true,
  updatedAt: new Date().toISOString(),
};

export const settingsService = {
  /**
   * Load system configuration
   */
  async getSettings(): Promise<SystemSettings> {
    const raw = localStorage.getItem(LOCAL_SETTINGS_KEY);
    let current = raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('*')
          .eq('key', 'system_config')
          .maybeSingle();

        if (data && data.value) {
          current = { ...current, ...(data.value as Partial<SystemSettings>) };
          localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(current));
        }
      } catch (err) {
        console.warn('[Settings] Supabase settings query notice:', err);
      }
    }

    return current;
  },

  /**
   * Update system configuration
   */
  async updateSettings(updates: Partial<SystemSettings>): Promise<SystemSettings> {
    const existing = await this.getSettings();
    const updated: SystemSettings = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(updated));

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('app_settings')
          .upsert({
            key: 'system_config',
            value: updated,
            description: 'Runtime AI and retrieval system configuration',
            updated_at: new Date().toISOString(),
          });
      } catch (err) {
        console.warn('[Settings] Supabase settings upsert notice:', err);
      }
    }

    return updated;
  },
};
