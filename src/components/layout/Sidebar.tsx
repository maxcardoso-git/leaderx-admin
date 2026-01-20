'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  DashboardIcon,
  UsersIcon,
  NetworkIcon,
  GovernanceIcon,
  AuditIcon,
  SettingsIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  SearchIcon,
  LogoutIcon,
  ShieldIcon,
  GroupIcon,
  TagIcon,
  CubeIcon,
  BriefcaseIcon,
  LayersIcon,
  RefreshIcon,
  TruckIcon,
  CalendarIcon,
  RocketIcon,
  BarChartIcon,
  MailIcon,
  TrophyIcon,
  CheckSquareIcon,
  BellIcon,
  ChartLineIcon,
  PaletteIcon,
} from '../icons';
import { useSidebar } from './SidebarContext';

interface NavItem {
  key: string;
  href?: string;
  icon: React.ReactNode;
  badge?: number;
  children?: { key: string; href: string; icon?: React.ReactNode }[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

// Navigation sections with groupings
const navigationSections: NavSection[] = [
  {
    title: '', // No title for main section
    items: [
      {
        key: 'dashboard',
        href: '/dashboard',
        icon: <DashboardIcon size={18} />,
      },
    ],
  },
  {
    title: 'Gestão',
    items: [
      {
        key: 'identity',
        icon: <UsersIcon size={18} />,
        children: [
          { key: 'users', href: '/identity/users', icon: <UsersIcon size={16} /> },
          { key: 'roles', href: '/identity/roles', icon: <ShieldIcon size={16} /> },
          { key: 'sessions', href: '/identity/sessions', icon: <AuditIcon size={16} /> },
        ],
      },
      {
        key: 'governance',
        icon: <GovernanceIcon size={18} />,
        children: [
          { key: 'workingUnits', href: '/governance/working-units', icon: <GroupIcon size={16} /> },
          { key: 'positions', href: '/governance/positions', icon: <BriefcaseIcon size={16} /> },
          { key: 'hierarchyGroups', href: '/governance/hierarchy-groups', icon: <LayersIcon size={16} /> },
        ],
      },
    ],
  },
  {
    title: 'Operação',
    items: [
      {
        key: 'network',
        icon: <NetworkIcon size={18} />,
        children: [
          { key: 'overview', href: '/network', icon: <NetworkIcon size={16} /> },
          { key: 'structures', href: '/network/structures', icon: <LayersIcon size={16} /> },
          { key: 'structureTypes', href: '/network/structure-types', icon: <CubeIcon size={16} /> },
          { key: 'approvalChains', href: '/network/approval-chains', icon: <CheckSquareIcon size={16} /> },
        ],
      },
      {
        key: 'execution',
        icon: <RocketIcon size={18} />,
        children: [
          { key: 'events', href: '/execution/events', icon: <CalendarIcon size={16} /> },
          { key: 'agenda', href: '/execution/agenda', icon: <CalendarIcon size={16} /> },
          { key: 'invitations', href: '/execution/invitations', icon: <MailIcon size={16} /> },
          { key: 'gamification', href: '/execution/gamification', icon: <TrophyIcon size={16} /> },
          { key: 'approvals', href: '/execution/approvals', icon: <CheckSquareIcon size={16} /> },
        ],
      },
    ],
  },
  {
    title: 'Sistema',
    items: [
      {
        key: 'systemSettings',
        icon: <SettingsIcon size={18} />,
        children: [
          { key: 'appearance', href: '/settings/appearance', icon: <PaletteIcon size={16} /> },
          { key: 'categories', href: '/settings/categories', icon: <TagIcon size={16} /> },
          { key: 'segments', href: '/settings/segments', icon: <CubeIcon size={16} /> },
          { key: 'lines', href: '/settings/lines', icon: <LayersIcon size={16} /> },
          { key: 'cycles', href: '/settings/cycles', icon: <RefreshIcon size={16} /> },
          { key: 'suppliers', href: '/settings/suppliers', icon: <TruckIcon size={16} /> },
          { key: 'scopes', href: '/settings/scopes', icon: <NetworkIcon size={16} /> },
        ],
      },
      {
        key: 'reports',
        icon: <BarChartIcon size={18} />,
        children: [
          { key: 'engagement', href: '/reports/engagement', icon: <ChartLineIcon size={16} /> },
          { key: 'networkGrowth', href: '/reports/network-growth', icon: <BarChartIcon size={16} /> },
          { key: 'eventPerformance', href: '/reports/event-performance', icon: <CalendarIcon size={16} /> },
        ],
      },
      {
        key: 'notifications',
        href: '/notifications',
        icon: <BellIcon size={18} />,
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['identity']);
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const t = useTranslations('nav');

  const toggleExpanded = (key: string) => {
    setExpandedItems((prev) =>
      prev.includes(key)
        ? prev.filter((item) => item !== key)
        : [...prev, key]
    );
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const isParentActive = (children?: { href: string }[]) =>
    children?.some((child) => pathname === child.href || pathname.startsWith(child.href));

  const renderNavItem = (item: NavItem) => {
    if (item.children) {
      const isExpanded = expandedItems.includes(item.key);
      const hasActiveChild = isParentActive(item.children);

      return (
        <div key={item.key}>
          <button
            onClick={() => toggleExpanded(item.key)}
            className={`
              w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200
              ${hasActiveChild
                ? 'bg-white/[0.06] text-white'
                : 'text-white/50 hover:bg-white/[0.04] hover:text-white/70'
              }
            `}
          >
            <span className="flex items-center gap-3">
              <span className={hasActiveChild ? 'text-gold' : ''}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="text-[13px] font-medium">
                  {t(item.key)}
                </span>
              )}
            </span>
            {!isCollapsed && (
              <ChevronDownIcon
                size={14}
                className={`transition-transform duration-300 text-white/30 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            )}
          </button>
          {!isCollapsed && (
            <div className={`
              overflow-hidden transition-all duration-300 ease-out
              ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
            `}>
              <div className="py-1 pl-4 space-y-0.5">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] transition-all duration-200
                      ${isActive(child.href)
                        ? 'bg-gold/10 text-gold'
                        : 'text-white/40 hover:bg-white/[0.04] hover:text-white/60'
                      }
                    `}
                  >
                    <span className={isActive(child.href) ? 'text-gold' : ''}>
                      {child.icon}
                    </span>
                    <span>{t(child.key)}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.key}
        href={item.href!}
        className={`
          flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200
          ${isActive(item.href!)
            ? 'bg-gold/10 text-gold'
            : 'text-white/50 hover:bg-white/[0.04] hover:text-white/70'
          }
        `}
      >
        <span className="flex items-center gap-3">
          <span className={isActive(item.href!) ? 'text-gold' : ''}>
            {item.icon}
          </span>
          {!isCollapsed && (
            <span className="text-[13px] font-medium">
              {t(item.key)}
            </span>
          )}
        </span>
      </Link>
    );
  };

  return (
    <aside
      className={`
        ${isCollapsed ? 'w-[72px] min-w-[72px]' : 'w-[260px] min-w-[260px]'}
        h-screen sticky top-0 flex flex-col transition-all duration-300
        bg-[#0a0d14] border-r border-white/[0.06]
      `}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.06]">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center">
              <span className="text-gold font-bold text-sm">LX</span>
            </div>
            <div>
              <span className="text-base font-semibold text-white">LeaderX</span>
              <span className="text-[10px] text-white/40 block -mt-0.5">Admin Console</span>
            </div>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`
            p-2 rounded-lg text-white/40 hover:bg-white/[0.06] hover:text-white/70 transition-all
            ${isCollapsed ? 'mx-auto' : ''}
          `}
        >
          <ChevronLeftIcon
            size={18}
            className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="px-3 py-3">
          <div className="relative">
            <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full h-9 pl-9 pr-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:border-gold/30 focus:bg-white/[0.06] focus:outline-none transition-all"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {navigationSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className={section.title ? 'mt-4' : ''}>
            {/* Section Title */}
            {section.title && !isCollapsed && (
              <div className="flex items-center gap-2 px-3 mb-2">
                <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                  {section.title}
                </span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>
            )}
            {/* Section Items */}
            <div className="space-y-0.5">
              {section.items.map(renderNavItem)}
            </div>
          </div>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-white/[0.06]">
        <div className={`
          flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]
          hover:bg-white/[0.05] transition-all cursor-pointer
          ${isCollapsed ? 'justify-center' : ''}
        `}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center flex-shrink-0">
            <span className="font-semibold text-xs text-gold">MC</span>
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  Max Cardoso
                </p>
                <p className="text-[11px] text-white/40 truncate">Administrador</p>
              </div>
              <button
                className="p-1.5 rounded-lg text-white/30 hover:bg-white/[0.05] hover:text-red-400 transition-all duration-200 flex-shrink-0"
                title="Sair"
              >
                <LogoutIcon size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
