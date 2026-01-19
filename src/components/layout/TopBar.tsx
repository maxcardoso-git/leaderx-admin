'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { SearchIcon, BellIcon, ChevronDownIcon } from '../icons';
import { LanguageSelector } from '../ui/LanguageSelector';

export function TopBar() {
  const pathname = usePathname();
  const [searchFocused, setSearchFocused] = useState(false);
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');

  const breadcrumbLabels: Record<string, string> = {
    dashboard: t('dashboard'),
    identity: t('identity'),
    users: t('users'),
    roles: t('roles'),
    network: t('network'),
    nodes: t('nodes'),
    hierarchy: t('hierarchy'),
    governance: t('governance'),
    policies: t('policies'),
    rules: t('rules'),
    audit: t('audit'),
    compliance: t('compliance'),
    reports: t('reports'),
    settings: t('settings'),
    appearance: 'Aparência',
    create: 'Novo',
    edit: 'Editar',
  };

  // Check if a segment looks like a UUID
  const isUUID = (str: string) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
  };

  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    return segments
      .filter(segment => !isUUID(segment)) // Filter out UUIDs
      .map((segment, index, arr) => ({
        label: breadcrumbLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        isLast: index === arr.length - 1,
      }));
  };

  const breadcrumbs = getBreadcrumbs();
  const pageTitle = breadcrumbs[breadcrumbs.length - 1]?.label || t('dashboard');

  return (
    <header className="h-16 bg-[#0f0f0f] border-b border-white/[0.05] flex items-center justify-between px-6 min-w-0">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
        <nav className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center gap-2">
              {index > 0 && (
                <span className="text-white/20">/</span>
              )}
              <span
                className={
                  crumb.isLast
                    ? 'text-white font-medium'
                    : 'text-white/40 hover:text-white/60 transition-colors'
                }
              >
                {crumb.label}
              </span>
            </span>
          ))}
        </nav>
      </div>

      {/* Right: Search & Actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Search */}
        <div
          className={`relative hidden sm:flex items-center transition-all duration-200 ${
            searchFocused ? 'w-64' : 'w-48'
          }`}
        >
          <SearchIcon
            size={16}
            className="absolute left-3 text-white/30 pointer-events-none"
          />
          <input
            type="text"
            placeholder={tCommon('search')}
            className="w-full h-9 pl-9 pr-4 bg-white/[0.03] border border-white/[0.05] rounded-xl text-sm text-white placeholder:text-white/30 focus:border-white/[0.1] focus:bg-white/[0.05] focus:ring-0 transition-all"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        {/* Language Selector */}
        <LanguageSelector />

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl text-white/40 hover:bg-white/[0.05] hover:text-white/70 transition-all">
          <BellIcon size={18} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        {/* Tenant Selector */}
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all">
          <span className="text-sm text-white/80">Tenant Demo</span>
          <ChevronDownIcon size={14} className="text-white/40" />
        </button>
      </div>
    </header>
  );
}
