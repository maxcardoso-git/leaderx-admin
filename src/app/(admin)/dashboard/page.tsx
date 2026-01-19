'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { UsersIcon, ShieldIcon, NetworkIcon, AuditIcon, PlusIcon, SettingsIcon } from '@/components/icons';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const nav = useTranslations('nav');

  const quickActions = [
    {
      icon: <UsersIcon size={24} />,
      label: nav('users'),
      href: '/identity/users',
      iconColor: 'text-blue-400',
      gradient: 'from-blue-500/10 to-transparent',
    },
    {
      icon: <ShieldIcon size={24} />,
      label: nav('roles'),
      href: '/identity/roles',
      iconColor: 'text-emerald-400',
      gradient: 'from-emerald-500/10 to-transparent',
    },
    {
      icon: <NetworkIcon size={24} />,
      label: nav('network'),
      href: '/network',
      iconColor: 'text-amber-400',
      gradient: 'from-amber-500/10 to-transparent',
    },
    {
      icon: <AuditIcon size={24} />,
      label: nav('audit'),
      href: '/audit/compliance',
      iconColor: 'text-violet-400',
      gradient: 'from-violet-500/10 to-transparent',
    },
    {
      icon: <PlusIcon size={24} />,
      label: t('addUser'),
      href: '/identity/users/create',
      iconColor: 'text-cyan-400',
      gradient: 'from-cyan-500/10 to-transparent',
    },
    {
      icon: <SettingsIcon size={24} />,
      label: nav('settings'),
      href: '/settings/appearance',
      iconColor: 'text-rose-400',
      gradient: 'from-rose-500/10 to-transparent',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-transparent rounded-3xl" />
        <div className="relative p-8">
          <p className="text-gold text-sm font-medium tracking-wide uppercase mb-2">{nav('dashboard')}</p>
          <h1 className="text-5xl font-extralight text-white mb-3">
            {t('welcome')} <span className="font-normal">LeaderX</span>
          </h1>
          <p className="text-xl text-white/60 font-light">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/[0.05]">
          <h2 className="text-lg font-medium text-white">{t('quickActions')}</h2>
          <p className="text-sm text-white/40 mt-1">{t('quickActionsSub')}</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="group relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`} />
                <div className="relative flex flex-col items-center gap-4 p-6 bg-white/[0.02] rounded-2xl border border-white/[0.05] group-hover:border-white/[0.1] transition-all duration-300">
                  <div className={`p-4 rounded-xl bg-white/[0.03] ${action.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                    {action.icon}
                  </div>
                  <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors text-center">
                    {action.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
