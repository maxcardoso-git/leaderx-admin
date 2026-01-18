'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
    <aside className="fixed left-0 top-0 h-screen w-[280px] bg-background-alt border-r border-border flex flex-col">
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image
            src="/Logotipo-LeaderX.png"
            alt="LeaderX"
            width={180}
            height={48}
            className="object-contain"
            priority
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navigationConfig.map((item) => (
            <li key={item.key}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleExpanded(item.key)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                      isParentActive(item.children)
                        ? 'bg-background-hover text-gold'
                        : 'text-text-secondary hover:bg-background-hover hover:text-text-primary'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      {item.icon}
                      <span className="text-sm font-medium">{t(item.key)}</span>
                    </span>
                    <ChevronDownIcon
                      size={16}
                      className={`transition-transform ${
                        expandedItems.includes(item.key) ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedItems.includes(item.key) && (
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
                >
                  {item.icon}
                  <span className="text-sm font-medium">{t(item.key)}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-10 h-10 rounded-full bg-background-hover flex items-center justify-center">
            <span className="text-gold font-medium">MC</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              Max Cardoso
            </p>
            <p className="text-xs text-text-muted truncate">Admin</p>
          </div>
          <button
            className="p-2 rounded-lg text-text-secondary hover:bg-background-hover hover:text-error transition-colors"
            title="Logout"
          >
            <LogoutIcon size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
