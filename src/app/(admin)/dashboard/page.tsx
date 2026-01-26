'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  UsersIcon,
  ShieldIcon,
  NetworkIcon,
  GroupIcon,
  RocketIcon,
  BarChartIcon,
  PlusIcon,
  ChevronRightIcon,
  CalendarIcon,
  SettingsIcon,
} from '@/components/icons';
import { networkStatsService } from '@/services/network.service';
import { governanceStatsService } from '@/services/governance.service';
import { NetworkStats } from '@/types/network';
import { WorkingUnitStats } from '@/types/governance';

// Stats Card Component
function StatsCard({
  label,
  value,
  subtitle,
  icon,
  loading,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.08] group hover:border-white/[0.15] transition-all duration-300"
      style={{ padding: '20px 24px' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p className="text-[11px] font-medium text-white/50 uppercase tracking-wider">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            {loading ? (
              <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
            ) : (
              <span className="text-2xl font-semibold text-white">{value}</span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-white/40">{subtitle}</p>
          )}
        </div>
        <div className="p-2.5 rounded-xl bg-white/[0.05] text-gold group-hover:bg-gold/20 transition-all duration-300 flex-shrink-0">
          {icon}
        </div>
      </div>
    </div>
  );
}

// Quick Action Card Component
function QuickActionCard({
  icon,
  label,
  description,
  href,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  href: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-300"
    >
      <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white group-hover:text-gold transition-colors">
          {label}
        </p>
        {description && (
          <p className="text-sm text-white/40 truncate">{description}</p>
        )}
      </div>
      <ChevronRightIcon size={16} className="text-white/30 group-hover:text-gold group-hover:translate-x-1 transition-all" />
    </Link>
  );
}

// Module Card Component
function ModuleCard({
  icon,
  title,
  description,
  stats,
  href,
  gradient,
  loading,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  stats: { label: string; value: string | number }[];
  href: string;
  gradient: string;
  loading?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.15] transition-all duration-300"
    >
      {/* Gradient Overlay */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient}`} />

      <div className="relative p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 rounded-xl bg-white/[0.05] text-gold">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white group-hover:text-gold transition-colors">
              {title}
            </h3>
            <p className="text-sm text-white/40 mt-1">{description}</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-6 pt-4 border-t border-white/[0.06]">
          {stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-2">
              {loading ? (
                <div className="h-6 w-8 bg-white/10 rounded animate-pulse" />
              ) : (
                <span className="text-lg font-semibold text-white">{stat.value}</span>
              )}
              <span className="text-xs text-white/40">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const nav = useTranslations('nav');

  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [governanceStats, setGovernanceStats] = useState<WorkingUnitStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [network, governance] = await Promise.all([
          networkStatsService.getStats().catch(() => null),
          governanceStatsService.getStats().catch(() => null),
        ]);
        setNetworkStats(network);
        setGovernanceStats(governance);
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const totalUnits = governanceStats
    ? governanceStats.totalGroups + governanceStats.totalNuclei
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f35] via-[#141824] to-[#0d1117]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />

        <div className="relative p-8 md:p-10">
          {/* Top Label */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="text-xs font-medium text-gold uppercase tracking-wider">
              {nav('dashboard')}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-light text-white mb-3">
            {t('welcome')} <span className="font-semibold text-gold">LeaderX</span>
          </h1>
          <p className="text-lg text-white/50 max-w-2xl">
            {t('subtitle')}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <StatsCard
              label={t('totalStructures')}
              value={networkStats?.totalStructures ?? '-'}
              subtitle={networkStats ? `${networkStats.activeStructures} ${t('active').toLowerCase()}` : undefined}
              icon={<NetworkIcon size={20} />}
              loading={loading}
            />
            <StatsCard
              label={t('structureTypes')}
              value={networkStats?.structureTypes ?? '-'}
              icon={<ShieldIcon size={20} />}
              loading={loading}
            />
            <StatsCard
              label={t('workingUnits')}
              value={totalUnits || '-'}
              subtitle={governanceStats ? `${governanceStats.totalGroups} ${t('groups').toLowerCase()}` : undefined}
              icon={<GroupIcon size={20} />}
              loading={loading}
            />
            <StatsCard
              label={t('totalMembers')}
              value={governanceStats?.totalMembers ?? '-'}
              icon={<UsersIcon size={20} />}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '32px' }} className="lg:!grid-cols-3">
        {/* Modules Section */}
        <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{t('quickActions')}</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '16px' }} className="md:!grid-cols-2">
            <ModuleCard
              icon={<UsersIcon size={24} />}
              title={nav('identity')}
              description={t('identityDescription')}
              stats={[
                { label: t('members'), value: governanceStats?.totalMembers ?? '-' },
              ]}
              href="/identity/users"
              gradient="bg-gradient-to-br from-blue-500/10 to-transparent"
              loading={loading}
            />
            <ModuleCard
              icon={<NetworkIcon size={24} />}
              title={nav('network')}
              description={t('networkDescription')}
              stats={[
                { label: t('structures'), value: networkStats?.totalStructures ?? '-' },
                { label: t('types'), value: networkStats?.structureTypes ?? '-' },
              ]}
              href="/network"
              gradient="bg-gradient-to-br from-emerald-500/10 to-transparent"
              loading={loading}
            />
            <ModuleCard
              icon={<GroupIcon size={24} />}
              title={nav('governance')}
              description={t('governanceDescription')}
              stats={[
                { label: t('units'), value: totalUnits || '-' },
                { label: t('members'), value: governanceStats?.totalMembers ?? '-' },
              ]}
              href="/governance/working-units"
              gradient="bg-gradient-to-br from-violet-500/10 to-transparent"
              loading={loading}
            />
            <ModuleCard
              icon={<RocketIcon size={24} />}
              title={nav('execution')}
              description={t('executionDescription')}
              stats={[
                { label: t('events'), value: '-' },
              ]}
              href="/execution/events"
              gradient="bg-gradient-to-br from-amber-500/10 to-transparent"
              loading={loading}
            />
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{t('quickActionsSub')}</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <QuickActionCard
              icon={<PlusIcon size={18} />}
              label={t('addUser')}
              description={t('newMember')}
              href="/identity/users/create"
              color="bg-blue-500/20 text-blue-400"
            />
            <QuickActionCard
              icon={<ShieldIcon size={18} />}
              label={nav('roles')}
              description={t('permissions')}
              href="/identity/roles"
              color="bg-emerald-500/20 text-emerald-400"
            />
            <QuickActionCard
              icon={<CalendarIcon size={18} />}
              label={nav('events')}
              description={t('newEvent')}
              href="/execution/events"
              color="bg-violet-500/20 text-violet-400"
            />
            <QuickActionCard
              icon={<BarChartIcon size={18} />}
              label={nav('reports')}
              description={t('metrics')}
              href="/reports/engagement"
              color="bg-amber-500/20 text-amber-400"
            />
            <QuickActionCard
              icon={<SettingsIcon size={18} />}
              label={nav('systemSettings')}
              description={t('configure')}
              href="/settings/categories"
              color="bg-rose-500/20 text-rose-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
