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
  BoxIcon,
  CalendarIcon,
  RocketIcon,
  BarChartIcon,
  MailIcon,
  TrophyIcon,
  CheckSquareIcon,
  BellIcon,
  ChartLineIcon,
} from '../icons';
import { useSidebar } from './SidebarContext';

// CSS variable for gold color with fallback
const goldColor = 'var(--gold, #c4a45a)';
const goldColorRgb = 'var(--gold-rgb, 196, 164, 90)';

interface NavItem {
  key: string;
  href?: string;
  icon: React.ReactNode;
  badge?: number;
  children?: { key: string; href: string; icon?: React.ReactNode }[];
}

const navigationConfig: NavItem[] = [
  {
    key: 'dashboard',
    href: '/dashboard',
    icon: <DashboardIcon size={18} />,
  },
  {
    key: 'identity',
    icon: <UsersIcon size={18} />,
    badge: 4,
    children: [
      { key: 'users', href: '/identity/users', icon: <UsersIcon size={16} /> },
      { key: 'roles', href: '/identity/roles', icon: <ShieldIcon size={16} /> },
      { key: 'sessions', href: '/identity/sessions', icon: <AuditIcon size={16} /> },
    ],
  },
  {
    key: 'network',
    icon: <NetworkIcon size={18} />,
    badge: 4,
    children: [
      { key: 'overview', href: '/network', icon: <NetworkIcon size={16} /> },
      { key: 'structures', href: '/network/structures', icon: <LayersIcon size={16} /> },
      { key: 'structureTypes', href: '/network/structure-types', icon: <CubeIcon size={16} /> },
      { key: 'approvalChains', href: '/network/approval-chains', icon: <CheckSquareIcon size={16} /> },
    ],
  },
  {
    key: 'governance',
    icon: <GovernanceIcon size={18} />,
    badge: 3,
    children: [
      { key: 'workingUnits', href: '/governance/working-units', icon: <GroupIcon size={16} /> },
      { key: 'positions', href: '/governance/positions', icon: <BriefcaseIcon size={16} /> },
      { key: 'hierarchyGroups', href: '/governance/hierarchy-groups', icon: <LayersIcon size={16} /> },
    ],
  },
  {
    key: 'execution',
    icon: <RocketIcon size={18} />,
    badge: 5,
    children: [
      { key: 'events', href: '/execution/events', icon: <CalendarIcon size={16} /> },
      { key: 'agenda', href: '/execution/agenda', icon: <CalendarIcon size={16} /> },
      { key: 'invitations', href: '/execution/invitations', icon: <MailIcon size={16} /> },
      { key: 'gamification', href: '/execution/gamification', icon: <TrophyIcon size={16} /> },
      { key: 'approvals', href: '/execution/approvals', icon: <CheckSquareIcon size={16} /> },
    ],
  },
  {
    key: 'systemSettings',
    icon: <SettingsIcon size={18} />,
    badge: 5,
    children: [
      { key: 'categories', href: '/settings/categories', icon: <TagIcon size={16} /> },
      { key: 'segments', href: '/settings/segments', icon: <CubeIcon size={16} /> },
      { key: 'lines', href: '/settings/lines', icon: <LayersIcon size={16} /> },
      { key: 'cycles', href: '/settings/cycles', icon: <RefreshIcon size={16} /> },
      { key: 'suppliers', href: '/settings/suppliers', icon: <TruckIcon size={16} /> },
    ],
  },
  {
    key: 'reports',
    icon: <BarChartIcon size={18} />,
    badge: 3,
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
];

// Recent items - highlighted in gold
const recentItems = [
  { key: 'roles', href: '/identity/roles', icon: <ShieldIcon size={16} /> },
  { key: 'users', href: '/identity/users', icon: <UsersIcon size={16} /> },
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

  // Style helpers using CSS variables
  const activeItemStyle = {
    backgroundColor: `rgba(${goldColorRgb}, 0.1)`,
    color: goldColor,
  };

  const activeIconStyle = {
    color: goldColor,
  };

  const avatarGradientStyle = {
    background: `linear-gradient(to bottom right, rgba(${goldColorRgb}, 0.3), rgba(${goldColorRgb}, 0.1))`,
  };

  return (
    <aside
      className={`
        ${isCollapsed ? 'w-[72px] min-w-[72px]' : 'w-[280px] min-w-[280px]'}
        h-screen sticky top-0 flex flex-col transition-all duration-300 border-r border-white/[0.06]
      `}
      style={{ backgroundColor: 'var(--bg-color, #0d1117)' }}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-white/[0.06]">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center">
            <span className="text-xl font-semibold" style={{ color: goldColor }}>Admin</span>
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
        <div className="px-4 py-4">
          <div className="relative">
            <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Buscar módulo..."
              className="w-full h-10 pl-10 pr-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/30 focus:border-white/[0.15] focus:bg-white/[0.06] focus:outline-none transition-all"
            />
          </div>
        </div>
      )}

      {/* Recents Section */}
      {!isCollapsed && (
        <div className="px-4 pb-2">
          <p className="text-[11px] font-medium text-white/30 uppercase tracking-wider px-3 mb-2">
            Recentes
          </p>
          <div className="space-y-1">
            {recentItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:opacity-80"
                style={activeItemStyle}
              >
                {item.icon}
                <span className="text-[13px] font-medium">{t(item.key)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      {!isCollapsed && <div className="mx-4 my-2 border-t border-white/[0.06]" />}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <div className="space-y-1">
          {navigationConfig.map((item) => (
            <div key={item.key}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleExpanded(item.key)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200
                      ${isParentActive(item.children)
                        ? 'bg-white/[0.06] text-white'
                        : 'text-white/50 hover:bg-white/[0.04] hover:text-white/70'
                      }
                    `}
                  >
                    <span className="flex items-center gap-3">
                      <span style={isParentActive(item.children) ? activeIconStyle : undefined}>
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <span className="text-[13px] font-medium">
                          {t(item.key)}
                        </span>
                      )}
                    </span>
                    {!isCollapsed && (
                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <span className="text-[11px] font-medium text-white/40 bg-white/[0.08] px-2 py-0.5 rounded-md">
                            {item.badge}
                          </span>
                        )}
                        <ChevronDownIcon
                          size={14}
                          className={`transition-transform duration-300 text-white/30 ${
                            expandedItems.includes(item.key) ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    )}
                  </button>
                  {!isCollapsed && (
                    <div className={`
                      overflow-hidden transition-all duration-300 ease-out
                      ${expandedItems.includes(item.key) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                    `}>
                      <div className="py-1 pl-4 space-y-0.5">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`
                              flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-200
                              ${!isActive(child.href) ? 'text-white/40 hover:bg-white/[0.04] hover:text-white/60' : ''}
                            `}
                            style={isActive(child.href) ? activeItemStyle : undefined}
                          >
                            {child.icon}
                            <span>{t(child.key)}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href!}
                  className={`
                    flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200
                    ${isActive(item.href!)
                      ? 'bg-white/[0.06] text-white'
                      : 'text-white/50 hover:bg-white/[0.04] hover:text-white/70'
                    }
                  `}
                >
                  <span className="flex items-center gap-3">
                    <span style={isActive(item.href!) ? activeIconStyle : undefined}>
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="text-[13px] font-medium">
                        {t(item.key)}
                      </span>
                    )}
                  </span>
                  {!isCollapsed && item.badge && (
                    <span className="text-[11px] font-medium text-white/40 bg-white/[0.08] px-2 py-0.5 rounded-md">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-white/[0.06]">
        <div className={`
          flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]
          ${isCollapsed ? 'justify-center' : ''}
        `}>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={avatarGradientStyle}
          >
            <span className="font-semibold text-xs" style={{ color: goldColor }}>MC</span>
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  Max Cardoso
                </p>
                <p className="text-xs text-white/40 truncate">Administrador</p>
              </div>
              <button
                className="p-2 rounded-lg text-white/30 hover:bg-white/[0.05] hover:text-red-400 transition-all duration-200 flex-shrink-0"
                title="Sair"
              >
                <LogoutIcon size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
