'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  ClockIcon,
  GroupIcon,
} from '@/components/icons';
import { structuresService, networkStatsService, structureTypesService } from '@/services/network.service';
import { NetworkTreeNode, NetworkStats, StructureStatus } from '@/types/network';

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
          flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all
          ${isSelected
            ? 'bg-gold/10 border border-gold/30'
            : 'hover:bg-white/[0.03] border border-transparent'
          }
        `}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
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
        <div>
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

// Stats Card Component
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-light text-text-primary">{value}</p>
          <p className="text-xs text-text-muted">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default function NetworkOverviewPage() {
  const router = useRouter();
  const t = useTranslations('network');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-text-muted">{tCommon('loading')}</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-text-primary tracking-tight">
            {t('title')}
          </h1>
          <p className="text-text-muted" style={{ marginTop: '8px' }}>
            {t('subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => router.push('/network/structure-types')}
          >
            {t('structureTypes')}
          </Button>
          <Button
            leftIcon={<PlusIcon size={18} />}
            onClick={() => router.push('/network/structures/create')}
          >
            {t('newStructure')}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard
            icon={<NetworkIcon size={20} className="text-blue-400" />}
            label={t('totalStructures')}
            value={stats.totalStructures}
            color="bg-blue-500/10"
          />
          <StatCard
            icon={<CheckIcon size={20} className="text-emerald-400" />}
            label={t('activeStructures')}
            value={stats.activeStructures}
            color="bg-emerald-500/10"
          />
          <StatCard
            icon={<ShieldIcon size={20} className="text-violet-400" />}
            label={t('structureTypesCount')}
            value={stats.structureTypes}
            color="bg-violet-500/10"
          />
          <StatCard
            icon={<GroupIcon size={20} className="text-gold" />}
            label={t('workingUnits')}
            value={stats.totalWorkingUnits || 0}
            color="bg-gold/10"
          />
          <StatCard
            icon={<UsersIcon size={20} className="text-cyan-400" />}
            label={t('leaders')}
            value={stats.approvalChains}
            color="bg-cyan-500/10"
          />
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tree View */}
        <div className="lg:col-span-2">
          <Card className="!p-0 overflow-hidden">
            <div className="p-4 border-b border-white/[0.05]">
              <h2 className="text-lg font-medium text-text-primary">{t('networkHierarchy')}</h2>
              <p className="text-sm text-text-muted mt-1">{t('networkHierarchyHint')}</p>
            </div>
            <div className="p-4 max-h-[500px] overflow-y-auto">
              {treeData.length > 0 ? (
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
                <div className="text-center py-12 text-text-muted">
                  {t('noStructures')}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Selected Structure Panel */}
        <div>
          <Card className="!p-0 overflow-hidden">
            <div className="p-4 border-b border-white/[0.05]">
              <h2 className="text-lg font-medium text-text-primary">{t('structureDetails')}</h2>
            </div>
            <div className="p-4">
              {selectedStructureId ? (
                <SelectedStructureInfo
                  structureId={selectedStructureId}
                  onViewDetails={handleViewDetails}
                  treeData={treeData}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.03] flex items-center justify-center">
                    <NetworkIcon size={32} className="text-text-muted" />
                  </div>
                  <p className="text-text-muted text-sm">{t('selectStructureHint')}</p>
                </div>
              )}
            </div>
          </Card>
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
          <h3 className="text-lg font-medium text-text-primary">{node.name}</h3>
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
