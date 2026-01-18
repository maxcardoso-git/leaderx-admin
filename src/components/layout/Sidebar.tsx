'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSidebar } from './SidebarContext';
import {
  DashboardIcon,
  UsersIcon,
  ShieldIcon,
  NetworkIcon,
  GovernanceIcon,
  AuditIcon,
  SettingsIcon,
  ChevronDownIcon,
  LogoutIcon,
  MenuIcon,
} from '../icons';

interface NavItem {
  key: string;
  href?: string;
  icon: React.ReactNode;
  children?: { key: string; href: string }[];
}

const navigationConfig: NavItem[] = [
  {
    key: 'dashboard',
    href: '/dashboard',
    icon: <DashboardIcon size={20} />,
  },
  {
    key: 'identity',
    icon: <UsersIcon size={20} />,
    children: [
      { key: 'users', href: '/identity/users' },
      { key: 'roles', href: '/identity/roles' },
    ],
  },
  {
    key: 'network',
    icon: <NetworkIcon size={20} />,
    children: [
      { key: 'nodes', href: '/network/nodes' },
      { key: 'hierarchy', href: '/network/hierarchy' },
    ],
  },
  {
    key: 'governance',
    icon: <GovernanceIcon size={20} />,
    children: [
      { key: 'policies', href: '/governance/policies' },
      { key: 'rules', href: '/governance/rules' },
    ],
  },
  {
    key: 'audit',
    icon: <AuditIcon size={20} />,
    children: [
      { key: 'compliance', href: '/audit/compliance' },
      { key: 'reports', href: '/audit/reports' },
    ],
  },
  {
    key: 'settings',
    href: '/settings',
    icon: <SettingsIcon size={20} />,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['identity']);
  const t = useTranslations('nav');
  const { isCollapsed, isHovered, setIsHovered } = useSidebar();

  const isExpanded = !isCollapsed || isHovered;

  const toggleExpanded = (key: string) => {
    setExpandedItems((prev) =>
      prev.includes(key)
        ? prev.filter((item) => item !== key)
        : [...prev, key]
    );
  };

  const isActive = (href: string) => pathname === href;
  const isParentActive = (children?: { href: string }[]) =>
    children?.some((child) => pathname === child.href);

  return (
    <>
      {/* Overlay when sidebar is expanded on hover */}
      {isCollapsed && isHovered && (
        <div
          className="fixed inset-0 bg-black/20 z-30 transition-opacity"
          onClick={() => setIsHovered(false)}
        />
      )}

      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed left-0 top-0 h-screen bg-background-alt border-r border-border flex flex-col z-40 transition-all duration-300 ease-in-out ${
          isExpanded ? 'w-[280px]' : 'w-[72px]'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            {isExpanded ? (
              <Image
                src="/Logotipo-LeaderX.png"
                alt="LeaderX"
                width={160}
                height={40}
                className="object-contain"
                priority
              />
            ) : (
              <div className="w-10 h-10 flex items-center justify-center">
                <Image
                  src="/Logotipo-LeaderX.png"
                  alt="LeaderX"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {navigationConfig.map((item) => (
              <li key={item.key}>
                {item.children ? (
                  <>
                    <button
                      onClick={() => isExpanded && toggleExpanded(item.key)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                        isParentActive(item.children)
                          ? 'bg-background-hover text-gold'
                          : 'text-text-secondary hover:bg-background-hover hover:text-text-primary'
                      }`}
                      title={!isExpanded ? t(item.key) : undefined}
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex-shrink-0">{item.icon}</span>
                        {isExpanded && (
                          <span className="text-sm font-medium whitespace-nowrap">
                            {t(item.key)}
                          </span>
                        )}
                      </span>
                      {isExpanded && (
                        <ChevronDownIcon
                          size={16}
                          className={`transition-transform flex-shrink-0 ${
                            expandedItems.includes(item.key) ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </button>
                    {isExpanded && expandedItems.includes(item.key) && (
                      <ul className="mt-1 ml-8 space-y-1">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                                isActive(child.href)
                                  ? 'bg-gold/10 text-gold border-l-2 border-gold -ml-0.5 pl-[10px]'
                                  : 'text-text-secondary hover:bg-background-hover hover:text-text-primary'
                              }`}
                            >
                              {t(child.key)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href!}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive(item.href!)
                        ? 'bg-gold/10 text-gold'
                        : 'text-text-secondary hover:bg-background-hover hover:text-text-primary'
                    }`}
                    title={!isExpanded ? t(item.key) : undefined}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {isExpanded && (
                      <span className="text-sm font-medium whitespace-nowrap">
                        {t(item.key)}
                      </span>
                    )}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-border">
          <div className={`flex items-center gap-3 px-2 py-2 ${isExpanded ? '' : 'justify-center'}`}>
            <div className="w-10 h-10 rounded-full bg-background-hover flex items-center justify-center flex-shrink-0">
              <span className="text-gold font-medium text-sm">MC</span>
            </div>
            {isExpanded && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    Max Cardoso
                  </p>
                  <p className="text-xs text-text-muted truncate">Admin</p>
                </div>
                <button
                  className="p-2 rounded-lg text-text-secondary hover:bg-background-hover hover:text-error transition-colors flex-shrink-0"
                  title="Logout"
                >
                  <LogoutIcon size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
