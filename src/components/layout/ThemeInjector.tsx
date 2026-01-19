'use client';

import { useEffect, useState } from 'react';
import { themeService, ThemeConfig } from '@/services/theme.service';

export function ThemeInjector() {
  const [theme, setTheme] = useState<ThemeConfig | null>(null);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await themeService.getTheme();
      if (savedTheme?.css) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  if (!theme?.css) {
    return null;
  }

  return (
    <style
      id="custom-theme"
      dangerouslySetInnerHTML={{ __html: theme.css }}
    />
  );
}
