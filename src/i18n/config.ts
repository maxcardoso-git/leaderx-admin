export const locales = ['pt', 'en', 'es', 'it'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'pt';

export const localeNames: Record<Locale, string> = {
  pt: 'Portugues',
  en: 'English',
  es: 'Espanol',
  it: 'Italiano',
};

export const localeFlags: Record<Locale, string> = {
  pt: '🇧🇷',
  en: '🇺🇸',
  es: '🇪🇸',
  it: '🇮🇹',
};
