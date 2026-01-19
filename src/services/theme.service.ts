import { api } from '@/lib/api';

const THEME_STORAGE_KEY = 'leaderx-theme-config';

export interface ThemeConfig {
  id?: string;
  tenantId?: string;
  css: string;
  createdAt?: string;
  updatedAt?: string;
}

// Helper functions for localStorage
const getFromStorage = (): ThemeConfig | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const saveToStorage = (config: ThemeConfig): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save theme to localStorage:', error);
  }
};

export const themeService = {
  async getTheme(): Promise<ThemeConfig | null> {
    // First try API
    try {
      const response = await api.get<ThemeConfig>('/settings/theme');
      if (response?.css) {
        // Also save to localStorage as backup
        saveToStorage(response);
        return response;
      }
    } catch (error) {
      console.warn('API theme load failed, trying localStorage:', error);
    }

    // Fallback to localStorage
    return getFromStorage();
  },

  async saveTheme(data: { css: string }): Promise<ThemeConfig> {
    const themeConfig: ThemeConfig = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    // Always save to localStorage first (immediate)
    saveToStorage(themeConfig);

    // Try to save to API (may fail if backend not ready)
    try {
      const response = await api.post<ThemeConfig>('/settings/theme', data);
      return response;
    } catch (error) {
      console.warn('API theme save failed, saved to localStorage only:', error);
      // Return the localStorage version
      return themeConfig;
    }
  },
};
