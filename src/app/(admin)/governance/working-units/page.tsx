'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Button, Table, StatusPill, Input, Card, Pagination, Modal } from '@/components/ui';
import { PlusIcon, SearchIcon, EditIcon, TrashIcon, EyeIcon, GroupIcon } from '@/components/icons';
import { WorkingUnit, WorkingUnitType, WorkingUnitStatus, WorkingUnitStats } from '@/types/governance';
import { workingUnitsService, governanceStatsService } from '@/services/governance.service';

const mapStatus = (status: WorkingUnitStatus | string | undefined): 'active' | 'inactive' | 'suspended' => {
  const mapping: Record<string, 'active' | 'inactive' | 'suspended'> = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
    ARCHIVED: 'inactive',
  };
  return mapping[status || ''] || 'inactive';
};

type TabType = 'GROUP' | 'NUCLEUS';

export default function WorkingUnitsPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('workingUnits');
  const common = useTranslations('common');

  const [activeTab, setActiveTab] = useState<TabType>('GROUP');
  const [units, setUnits] = useState<WorkingUnit[]>([]);
  const [stats, setStats] = useState<WorkingUnitStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<WorkingUnit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [unitsData, statsData] = await Promise.all([
        workingUnitsService.list({ type: activeTab }),
        governanceStatsService.getStats(),
      ]);
      setUnits(unitsData.items);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load working units:', error);
      // Use mock data for demo
      setUnits(mockUnits.filter((u) => u.type === activeTab));
      setStats(mockStats);
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteModal = (unit: WorkingUnit, e: React.MouseEvent) => {
    e.stopPropagation();
    setUnitToDelete(unit);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!unitToDelete) return;

    setIsDeleting(true);
    try {
      await workingUnitsService.delete(unitToDelete.id);
      loadData();
      setShowDeleteModal(false);
      setUnitToDelete(null);
    } catch (error) {
      console.error('Failed to delete working unit:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUnits = units.filter((unit) => {
    const matchesSearch = unit.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const paginatedUnits = filteredUnits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredUnits.length / itemsPerPage);

  const columns = [
    {
      key: 'name',
      header: t('unitName'),
      render: (unit: WorkingUnit) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gold/10 rounded-lg">
            <GroupIcon size={18} className="text-gold" />
          </div>
          <div>
            <p className="font-medium text-text-primary">{unit.name}</p>
            {unit.description && (
              <p className="text-xs text-text-muted truncate max-w-[200px]">{unit.description}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'structure',
      header: t('structure'),
      width: '180px',
      render: (unit: WorkingUnit) => (
        <span className="text-text-muted">
          {unit.structure?.name || '-'}
        </span>
      ),
    },
    {
      key: 'members',
      header: t('members'),
      width: '120px',
      render: (unit: WorkingUnit) => (
        <span className="text-text-muted">
          {unit.membersCount || 0} / {unit.maxMembers}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('status'),
      width: '120px',
      render: (unit: WorkingUnit) => (
        <StatusPill status={mapStatus(unit.status)} />
      ),
    },
    {
      key: 'createdAt',
      header: common('created'),
      width: '150px',
      render: (unit: WorkingUnit) => (
        <span className="text-text-muted">
          {new Date(unit.createdAt).toLocaleDateString(locale)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '120px',
      render: (unit: WorkingUnit) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/governance/working-units/${unit.id}`);
            }}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-background-hover transition-colors"
            title={common('view')}
          >
            <EyeIcon size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/governance/working-units/${unit.id}/edit`);
            }}
            className="p-2 rounded-lg text-text-muted hover:text-gold hover:bg-background-hover transition-colors"
            title={common('edit')}
          >
            <EditIcon size={16} />
          </button>
          <button
            onClick={(e) => openDeleteModal(unit, e)}
            className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-background-hover transition-colors"
            title={common('delete')}
          >
            <TrashIcon size={16} />
          </button>
        </div>
      ),
    },
  ];

  const tabs: { key: TabType; label: string }[] = [
    { key: 'GROUP', label: t('groups') },
    { key: 'NUCLEUS', label: t('nuclei') },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-text-primary">{t('title')}</h1>
          <p className="text-sm text-text-muted" style={{ marginTop: '8px' }}>
            {t('subtitle')}
          </p>
        </div>
        <Link href={`/governance/working-units/create?type=${activeTab}`}>
          <Button leftIcon={<PlusIcon size={18} />}>
            {activeTab === 'GROUP' ? t('newGroup') : t('newNucleus')}
          </Button>
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <Card padding="lg">
            <p className="text-sm text-text-muted mb-1">{t('totalGroups')}</p>
            <p className="text-2xl font-heading font-semibold text-text-primary">{stats.totalGroups}</p>
          </Card>
          <Card padding="lg">
            <p className="text-sm text-text-muted mb-1">{t('totalNuclei')}</p>
            <p className="text-2xl font-heading font-semibold text-text-primary">{stats.totalNuclei}</p>
          </Card>
          <Card padding="lg">
            <p className="text-sm text-text-muted mb-1">{t('activeGroups')}</p>
            <p className="text-2xl font-heading font-semibold text-text-primary">{stats.activeGroups}</p>
          </Card>
          <Card padding="lg">
            <p className="text-sm text-text-muted mb-1">{t('totalMembers')}</p>
            <p className="text-2xl font-heading font-semibold text-text-primary">{stats.totalMembers}</p>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage(1);
                setSearchTerm('');
              }}
              className={`
                px-6 py-3 text-sm font-medium transition-all relative
                ${activeTab === tab.key
                  ? 'text-gold'
                  : 'text-text-muted hover:text-text-primary'
                }
              `}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <Card padding="md">
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder={t('searchPlaceholder')}
              leftIcon={<SearchIcon size={18} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Table
        columns={columns}
        data={paginatedUnits}
        keyExtractor={(unit) => unit.id}
        onRowClick={(unit) => router.push(`/governance/working-units/${unit.id}`)}
        isLoading={isLoading}
        emptyMessage={t('noUnitsFound')}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <Card padding="none">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredUnits.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setUnitToDelete(null);
        }}
        title={unitToDelete?.type === 'GROUP' ? t('deleteGroup') : t('deleteNucleus')}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setShowDeleteModal(false);
                setUnitToDelete(null);
              }}
            >
              {common('cancel')}
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
              {common('delete')}
            </Button>
          </>
        }
      >
        <p className="text-text-secondary">
          {t('deleteConfirm')}{' '}
          <strong className="text-text-primary">{unitToDelete?.name}</strong>?
        </p>
      </Modal>
    </div>
  );
}

// Mock data for demo
const mockStats: WorkingUnitStats = {
  totalGroups: 8,
  totalNuclei: 24,
  activeGroups: 6,
  activeNuclei: 20,
  totalMembers: 156,
};

const mockUnits: WorkingUnit[] = [
  {
    id: '1',
    tenantId: 'demo-tenant',
    name: 'Grupo de Comunicacao',
    description: 'Responsavel pela comunicacao interna e externa',
    type: 'GROUP',
    structureId: 'struct-1',
    structure: { id: 'struct-1', name: 'Sede Nacional' },
    status: 'ACTIVE',
    maxMembers: 15,
    membersCount: 12,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    tenantId: 'demo-tenant',
    name: 'Grupo de Formacao',
    description: 'Formacao e capacitacao de membros',
    type: 'GROUP',
    structureId: 'struct-1',
    structure: { id: 'struct-1', name: 'Sede Nacional' },
    status: 'ACTIVE',
    maxMembers: 10,
    membersCount: 8,
    createdAt: '2024-01-16T09:00:00Z',
    updatedAt: '2024-01-16T09:00:00Z',
  },
  {
    id: '3',
    tenantId: 'demo-tenant',
    name: 'Grupo de Eventos',
    description: 'Organizacao de eventos e atividades',
    type: 'GROUP',
    structureId: 'struct-2',
    structure: { id: 'struct-2', name: 'Regional Sul' },
    status: 'INACTIVE',
    maxMembers: 8,
    membersCount: 3,
    createdAt: '2024-01-17T11:00:00Z',
    updatedAt: '2024-01-17T11:00:00Z',
  },
  {
    id: '4',
    tenantId: 'demo-tenant',
    name: 'Nucleo de Jovens',
    description: 'Nucleo dedicado aos membros jovens',
    type: 'NUCLEUS',
    structureId: 'struct-1',
    structure: { id: 'struct-1', name: 'Sede Nacional' },
    parentId: '1',
    status: 'ACTIVE',
    maxMembers: 20,
    membersCount: 15,
    createdAt: '2024-01-18T14:00:00Z',
    updatedAt: '2024-01-18T14:00:00Z',
  },
  {
    id: '5',
    tenantId: 'demo-tenant',
    name: 'Nucleo de Mulheres',
    description: 'Nucleo dedicado as mulheres',
    type: 'NUCLEUS',
    structureId: 'struct-1',
    structure: { id: 'struct-1', name: 'Sede Nacional' },
    parentId: '1',
    status: 'ACTIVE',
    maxMembers: 25,
    membersCount: 18,
    createdAt: '2024-01-19T10:00:00Z',
    updatedAt: '2024-01-19T10:00:00Z',
  },
  {
    id: '6',
    tenantId: 'demo-tenant',
    name: 'Nucleo Universitario',
    description: 'Nucleo para estudantes universitarios',
    type: 'NUCLEUS',
    structureId: 'struct-2',
    structure: { id: 'struct-2', name: 'Regional Sul' },
    parentId: '2',
    status: 'SUSPENDED',
    maxMembers: 30,
    membersCount: 5,
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-20T09:00:00Z',
  },
];
