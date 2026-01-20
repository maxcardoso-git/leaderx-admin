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
    } catch {
      // Theme loading is optional - silently ignore errors
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
