'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { SearchIcon, BellIcon, ChevronDownIcon } from '../icons';

const breadcrumbLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  identity: 'Identity',
  users: 'Users',
  roles: 'Roles & Permissions',
  network: 'Network',
  nodes: 'Nodes',
  hierarchy: 'Hierarchy',
  governance: 'Governance',
  policies: 'Policies',
  rules: 'Rules',
  audit: 'Audit',
  compliance: 'Compliance',
  reports: 'Reports',
  settings: 'Settings',
  create: 'Create',
  edit: 'Edit',
};

export function TopBar() {
  const pathname = usePathname();
  const [searchFocused, setSearchFocused] = useState(false);

  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    return segments.map((segment, index) => ({
      label: breadcrumbLabels[segment] || segment,
      isLast: index === segments.length - 1,
    }));
  };

  const breadcrumbs = getBreadcrumbs();
  const pageTitle = breadcrumbs[breadcrumbs.length - 1]?.label || 'Dashboard';

  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-4 lg:px-6 min-w-0">
      {/* Left: Breadcrumbs */}
      <div className="flex flex-col min-w-0 flex-shrink-0">
        <h1 className="font-heading text-lg font-semibold text-text-primary">
          {pageTitle}
        </h1>
        {breadcrumbs.length > 1 && (
          <nav className="flex items-center gap-1 text-xs">
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center gap-1">
                {index > 0 && (
                  <span className="text-text-muted">/</span>
                )}
                <span
                  className={
                    crumb.isLast
                      ? 'text-gold'
                      : 'text-text-muted hover:text-text-secondary'
                  }
                >
                  {crumb.label}
                </span>
              </span>
            ))}
          </nav>
        )}
      </div>

      {/* Right: Search & Actions */}
      <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
        {/* Search */}
        <div
          className={`relative hidden sm:flex items-center transition-all ${
            searchFocused ? 'w-64 lg:w-72' : 'w-48 lg:w-60'
          }`}
        >
          <SearchIcon
            size={18}
            className="absolute left-3 text-text-muted pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search..."
            className="w-full h-9 pl-10 pr-4 bg-background-alt border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:border-gold focus:ring-0 transition-colors"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-text-secondary hover:bg-background-hover hover:text-text-primary transition-colors">
          <BellIcon size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
        </button>

        {/* Tenant Selector */}
        <button className="flex items-center gap-2 px-2 lg:px-3 py-2 rounded-lg bg-background-alt border border-border hover:border-border-light transition-colors">
          <span className="text-sm text-text-primary hidden sm:inline">Tenant Demo</span>
          <span className="text-sm text-text-primary sm:hidden">Demo</span>
          <ChevronDownIcon size={16} className="text-text-muted" />
        </button>
      </div>
    </header>
  );
}
