import { api } from '@/lib/api';

export interface ThemeConfig {
  id?: string;
  tenantId?: string;
  css: string;
  createdAt?: string;
  updatedAt?: string;
}

export const themeService = {
  async getTheme(): Promise<ThemeConfig | null> {
    try {
      return await api.get<ThemeConfig>('/settings/theme');
    } catch (error) {
      console.error('Failed to load theme:', error);
      return null;
    }
  },

  async saveTheme(data: { css: string }): Promise<ThemeConfig> {
    return api.post<ThemeConfig>('/settings/theme', data);
  },
};
