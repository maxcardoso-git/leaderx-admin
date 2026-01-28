'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button, Card } from '@/components/ui';
import {
  NetworkIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  PlusIcon,
  UsersIcon,
  ShieldIcon,
  CheckIcon,
  GroupIcon,
  SettingsIcon,
} from '@/components/icons';
import { structuresService, networkStatsService } from '@/services/network.service';
import { NetworkTreeNode, NetworkStats, StructureStatus } from '@/types/network';

// Stats Card Component (same style as Dashboard)
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
      className="relative overflow-hidden rounded-xl backdrop-blur-sm border border-white/30 shadow-sm group hover:shadow-md transition-all duration-300"
      style={{
        padding: '20px 24px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,249,250,0.90) 100%)'
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: '#6b7280' }}>
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            ) : (
              <span className="text-2xl font-semibold" style={{ color: '#111827' }}>{value}</span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs" style={{ color: '#6b7280' }}>{subtitle}</p>
          )}
        </div>
        <div className="p-2.5 rounded-xl bg-gold/10 text-gold group-hover:bg-gold/20 transition-all duration-300 flex-shrink-0">
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
      className="group flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 hover:border-gold/50 hover:shadow-md transition-all duration-300"
    >
      <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 group-hover:text-gold transition-colors">
          {label}
        </p>
        {description && (
          <p className="text-sm text-gray-500 truncate">{description}</p>
        )}
      </div>
      <ChevronRightIcon size={16} className="text-gray-400 group-hover:text-gold group-hover:translate-x-1 transition-all" />
    </Link>
  );
}

// Tree Node Component
function TreeNode({
  node,
  level = 0,
  onSelect,
  selectedId,
}: {
  node: NetworkTreeNode;
  level?: number;
  onSelect: (id: string) => void;
  selectedId?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;
  const t = useTranslations('network');

  const statusColors: Record<StructureStatus, string> = {
    ACTIVE: 'bg-emerald-400',
    INACTIVE: 'bg-white/30',
    PENDING: 'bg-amber-400',
  };

  return (
    <div className="select-none">
      <div
        className={`
          flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200
          ${isSelected
            ? 'bg-gold/10 border border-gold/30'
            : 'hover:bg-gold/5 hover:border-gold/20 border border-transparent'
          }
        `}
        style={{ paddingLeft: `${level * 24 + 16}px` }}
        onClick={() => onSelect(node.id)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0.5 hover:bg-white/[0.05] rounded"
          >
            {isExpanded ? (
              <ChevronDownIcon size={16} className="text-text-muted" />
            ) : (
              <ChevronRightIcon size={16} className="text-text-muted" />
            )}
          </button>
        ) : (
          <div className="w-5" />
        )}

        <div className={`w-2 h-2 rounded-full ${statusColors[node.status]}`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium truncate ${isSelected ? 'text-gold' : 'text-text-primary'}`}>
              {node.name}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-text-muted">
              {node.type}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-text-muted">
          <div className="flex items-center gap-1" title={t('leaders')}>
            <UsersIcon size={12} />
            <span className="text-xs">{node.leadersCount}</span>
          </div>
          {(node.workingUnitsCount > 0) && (
            <div className="flex items-center gap-1" title={t('workingUnits')}>
              <GroupIcon size={12} />
              <span className="text-xs">{node.workingUnitsCount}</span>
            </div>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-1 space-y-1">
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function NetworkOverviewPage() {
  const router = useRouter();
  const t = useTranslations('network');
  const nav = useTranslations('nav');
  const tCommon = useTranslations('common');

  const [treeData, setTreeData] = useState<NetworkTreeNode[]>([]);
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [selectedStructureId, setSelectedStructureId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  // Transform backend response to frontend format
  const transformTreeNode = (node: any): NetworkTreeNode => ({
    id: node.id,
    code: node.code,
    name: node.name,
    description: node.description,
    type: node.typeName || node.type || '',
    typeId: node.typeId,
    typeName: node.typeName,
    scope: node.scope,
    status: node.status || 'ACTIVE',
    hierarchyLevel: node.level ?? node.hierarchyLevel ?? 0,
    level: node.level,
    countries: node.countries,
    leadersCount: node.leadersCount || 0,
    childrenCount: node.childrenCount || 0,
    workingUnitsCount: node.workingUnitsCount || 0,
    children: node.children?.map(transformTreeNode),
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [tree, statsData] = await Promise.all([
        structuresService.getTree(),
        networkStatsService.getStats(),
      ]);
      const transformedTree = tree.map(transformTreeNode);
      setTreeData(transformedTree.length > 0 ? transformedTree : mockTreeData);
      setStats(statsData.totalStructures > 0 ? statsData : mockStats);
    } catch (error) {
      console.error('Failed to load network data:', error);
      setTreeData(mockTreeData);
      setStats(mockStats);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectNode = (id: string) => {
    setSelectedStructureId(id);
  };

  const handleViewDetails = () => {
    if (selectedStructureId) {
      router.push(`/network/structures/${selectedStructureId}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f35] via-[#141824] to-[#0d1117]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />

        <div className="relative p-8 md:p-10">
          {/* Top Label */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              <span className="text-xs font-medium text-gold uppercase tracking-wider">
                {nav('network')}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push('/network/structure-types')}
              >
                {t('structureTypes')}
              </Button>
              <Button
                size="sm"
                leftIcon={<PlusIcon size={16} />}
                onClick={() => router.push('/network/structures/create')}
              >
                {t('newStructure')}
              </Button>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-light mb-3" style={{ color: '#ffffff' }}>
            {t('title')}
          </h1>
          <p className="text-lg max-w-2xl" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {t('subtitle')}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
            <StatsCard
              label={t('totalStructures')}
              value={stats?.totalStructures ?? '-'}
              subtitle={stats ? `${stats.activeStructures} ${tCommon('active').toLowerCase()}` : undefined}
              icon={<NetworkIcon size={20} />}
              loading={loading}
            />
            <StatsCard
              label={t('activeStructures')}
              value={stats?.activeStructures ?? '-'}
              icon={<CheckIcon size={20} />}
              loading={loading}
            />
            <StatsCard
              label={t('structureTypesCount')}
              value={stats?.structureTypes ?? '-'}
              icon={<ShieldIcon size={20} />}
              loading={loading}
            />
            <StatsCard
              label={t('workingUnits')}
              value={stats?.totalWorkingUnits ?? '-'}
              icon={<GroupIcon size={20} />}
              loading={loading}
            />
            <StatsCard
              label={t('leaders')}
              value={stats?.approvalChains ?? '-'}
              icon={<UsersIcon size={20} />}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '32px' }} className="lg:!grid-cols-3">
        {/* Tree View - Takes 2 columns */}
        <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{t('networkHierarchy')}</h2>
          </div>

          <Card className="!p-0 overflow-hidden">
            <div className="p-4 border-b border-white/[0.05]">
              <p className="text-sm text-text-muted">{t('networkHierarchyHint')}</p>
            </div>
            <div className="p-4 max-h-[500px] overflow-y-auto">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 bg-white/[0.02] rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : treeData.length > 0 ? (
                <div className="space-y-1">
                  {treeData.map((node) => (
                    <TreeNode
                      key={node.id}
                      node={node}
                      onSelect={handleSelectNode}
                      selectedId={selectedStructureId}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.03] flex items-center justify-center">
                    <NetworkIcon size={32} className="text-text-muted" />
                  </div>
                  <p className="text-text-muted text-sm">{t('noStructures')}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Structure Details Card */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{t('structureDetails')}</h2>
          </div>

          <Card className="!p-0 overflow-hidden">
            <div className="p-4">
              {selectedStructureId ? (
                <SelectedStructureInfo
                  structureId={selectedStructureId}
                  onViewDetails={handleViewDetails}
                  treeData={treeData}
                />
              ) : (
                <div className="text-center py-8">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/[0.03] flex items-center justify-center">
                    <NetworkIcon size={28} className="text-text-muted" />
                  </div>
                  <p className="text-text-muted text-sm">{t('selectStructureHint')}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{t('quickActions')}</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <QuickActionCard
              icon={<PlusIcon size={18} />}
              label={t('newStructure')}
              description={t('createStructureHint')}
              href="/network/structures/create"
              color="bg-emerald-500/20 text-emerald-400"
            />
            <QuickActionCard
              icon={<ShieldIcon size={18} />}
              label={t('structureTypes')}
              description={t('manageTypes')}
              href="/network/structure-types"
              color="bg-violet-500/20 text-violet-400"
            />
            <QuickActionCard
              icon={<SettingsIcon size={18} />}
              label={t('scopes')}
              description={t('configureScopesHint')}
              href="/settings/scopes"
              color="bg-amber-500/20 text-amber-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Selected Structure Info Component
function SelectedStructureInfo({
  structureId,
  onViewDetails,
  treeData,
}: {
  structureId: string;
  onViewDetails: () => void;
  treeData: NetworkTreeNode[];
}) {
  const t = useTranslations('network');
  const tCommon = useTranslations('common');

  // Find node in tree
  const findNode = (nodes: NetworkTreeNode[], id: string): NetworkTreeNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNode(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const node = findNode(treeData, structureId);

  if (!node) {
    return <div className="text-text-muted">{t('structureNotFound')}</div>;
  }

  const statusLabels: Record<string, { label: string; color: string }> = {
    ACTIVE: { label: tCommon('active'), color: 'text-emerald-400 bg-emerald-400/10' },
    INACTIVE: { label: tCommon('inactive'), color: 'text-white/40 bg-white/[0.05]' },
    PENDING: { label: tCommon('pending'), color: 'text-amber-400 bg-amber-400/10' },
  };

  const status = statusLabels[node.status] || { label: node.status || '-', color: 'text-white/40 bg-white/[0.05]' };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
          <NetworkIcon size={24} />
        </div>
        <div>
          <h3 className="text-base font-medium text-text-primary">{node.name}</h3>
          <p className="text-sm text-text-muted">{node.type}</p>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-muted">{t('status')}</span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.color}`}>
            {status.label}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-muted">{t('hierarchyLevel')}</span>
          <span className="text-sm text-text-primary">{node.hierarchyLevel || node.level || 0}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-muted">{t('leaders')}</span>
          <span className="text-sm text-text-primary">{node.leadersCount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-muted">{t('workingUnits')}</span>
          <span className="text-sm text-text-primary">{node.workingUnitsCount || 0}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-muted">{t('childStructures')}</span>
          <span className="text-sm text-text-primary">{node.children?.length || 0}</span>
        </div>
      </div>

      <div className="pt-4 space-y-2">
        <Button className="w-full" onClick={onViewDetails}>
          {t('viewDetails')}
        </Button>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => window.location.href = `/network/structures/${structureId}/approval-chain`}
        >
          {t('viewApprovalChain')}
        </Button>
      </div>
    </div>
  );
}

// Mock data
const mockTreeData: NetworkTreeNode[] = [
  {
    id: 'global-1',
    name: 'LeaderX Global',
    type: 'Matriz Global',
    scope: 'GLOBAL_ALL_COUNTRIES',
    status: 'ACTIVE',
    hierarchyLevel: 1,
    leadersCount: 3,
    childrenCount: 2,
    workingUnitsCount: 2,
    children: [
      {
        id: 'latam-1',
        name: 'LeaderX LATAM',
        type: 'Regional',
        scope: 'COUNTRY_GROUP',
        status: 'ACTIVE',
        hierarchyLevel: 2,
        leadersCount: 2,
        childrenCount: 2,
        workingUnitsCount: 1,
        children: [
          {
            id: 'brazil-1',
            name: 'LeaderX Brasil',
            type: 'Nacional',
            scope: 'COUNTRY_GROUP',
            status: 'ACTIVE',
            hierarchyLevel: 3,
            leadersCount: 2,
            childrenCount: 2,
            workingUnitsCount: 3,
            children: [
              {
                id: 'sp-1',
                name: 'LeaderX São Paulo',
                type: 'Estadual',
                scope: 'CITY_GROUP',
                status: 'ACTIVE',
                hierarchyLevel: 4,
                leadersCount: 1,
                childrenCount: 2,
                workingUnitsCount: 0,
                children: [
                  {
                    id: 'sp-capital',
                    name: 'São Paulo Capital',
                    type: 'Municipal',
                    scope: 'SINGLE_CITY',
                    status: 'ACTIVE',
                    hierarchyLevel: 5,
                    leadersCount: 1,
                    childrenCount: 0,
                    workingUnitsCount: 0,
                  },
                  {
                    id: 'campinas',
                    name: 'Campinas',
                    type: 'Municipal',
                    scope: 'SINGLE_CITY',
                    status: 'ACTIVE',
                    hierarchyLevel: 5,
                    leadersCount: 1,
                    childrenCount: 0,
                    workingUnitsCount: 0,
                  },
                ],
              },
              {
                id: 'rj-1',
                name: 'LeaderX Rio de Janeiro',
                type: 'Estadual',
                scope: 'CITY_GROUP',
                status: 'ACTIVE',
                hierarchyLevel: 4,
                leadersCount: 1,
                childrenCount: 0,
                workingUnitsCount: 0,
              },
            ],
          },
          {
            id: 'argentina-1',
            name: 'LeaderX Argentina',
            type: 'Nacional',
            scope: 'COUNTRY_GROUP',
            status: 'PENDING',
            hierarchyLevel: 3,
            leadersCount: 0,
            childrenCount: 0,
            workingUnitsCount: 0,
          },
        ],
      },
      {
        id: 'europe-1',
        name: 'LeaderX Europe',
        type: 'Regional',
        scope: 'COUNTRY_GROUP',
        status: 'ACTIVE',
        hierarchyLevel: 2,
        leadersCount: 2,
        childrenCount: 1,
        workingUnitsCount: 0,
        children: [
          {
            id: 'portugal-1',
            name: 'LeaderX Portugal',
            type: 'Nacional',
            scope: 'COUNTRY_GROUP',
            status: 'ACTIVE',
            hierarchyLevel: 3,
            leadersCount: 1,
            childrenCount: 0,
            workingUnitsCount: 0,
          },
        ],
      },
    ],
  },
];

const mockStats: NetworkStats = {
  totalStructures: 12,
  activeStructures: 10,
  structureTypes: 5,
  approvalChains: 8,
  pendingApprovals: 3,
  totalWorkingUnits: 6,
};
