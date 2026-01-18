'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage, locales, localeNames, localeFlags, Locale } from '@/i18n';
import { ChevronDownIcon } from '../icons';

export function LanguageSelector() {
  const { locale, setLocale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 lg:px-3 py-2 rounded-lg bg-background-alt border border-border hover:border-border-light transition-colors"
      >
        <span className="text-base">{localeFlags[locale]}</span>
        <span className="text-sm text-text-primary hidden sm:inline">
          {locale.toUpperCase()}
        </span>
        <ChevronDownIcon
          size={16}
          className={`text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-background-card border border-border rounded-lg shadow-lg overflow-hidden z-50 animate-fade-in">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => {
                setLocale(loc);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                locale === loc
                  ? 'bg-gold/10 text-gold'
                  : 'text-text-secondary hover:bg-background-hover hover:text-text-primary'
              }`}
            >
              <span className="text-base">{localeFlags[loc]}</span>
              <span>{localeNames[loc]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
