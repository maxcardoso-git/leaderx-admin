'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: { label: string; href: string }[];
}

const navigation: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <DashboardIcon size={20} />,
  },
  {
    label: 'Identity',
    icon: <UsersIcon size={20} />,
    children: [
      { label: 'Users', href: '/identity/users' },
      { label: 'Roles & Permissions', href: '/identity/roles' },
    ],
  },
  {
    label: 'Network',
    icon: <NetworkIcon size={20} />,
    children: [
      { label: 'Nodes', href: '/network/nodes' },
      { label: 'Hierarchy', href: '/network/hierarchy' },
    ],
  },
  {
    label: 'Governance',
    icon: <GovernanceIcon size={20} />,
    children: [
      { label: 'Policies', href: '/governance/policies' },
      { label: 'Rules', href: '/governance/rules' },
    ],
  },
  {
    label: 'Audit',
    icon: <AuditIcon size={20} />,
    children: [
      { label: 'Compliance', href: '/audit/compliance' },
      { label: 'Reports', href: '/audit/reports' },
    ],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: <SettingsIcon size={20} />,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Identity']);

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (href: string) => pathname === href;
  const isParentActive = (children?: { href: string }[]) =>
    children?.some((child) => pathname === child.href);

  return (
    <aside className="fixed left-0 top-0 h-screen w-[280px] bg-background-alt border-r border-border flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gold flex items-center justify-center">
            <span className="text-background font-heading font-bold text-xl">L</span>
          </div>
          <div>
            <span className="font-heading font-semibold text-lg text-text-primary">
              LeaderX
            </span>
            <span className="block text-xs text-text-muted">Admin Console</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.label}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleExpanded(item.label)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                      isParentActive(item.children)
                        ? 'bg-background-hover text-gold'
                        : 'text-text-secondary hover:bg-background-hover hover:text-text-primary'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      {item.icon}
                      <span className="text-sm font-medium">{item.label}</span>
                    </span>
                    <ChevronDownIcon
                      size={16}
                      className={`transition-transform ${
                        expandedItems.includes(item.label) ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedItems.includes(item.label) && (
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
                            {child.label}
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
                  <span className="text-sm font-medium">{item.label}</span>
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
