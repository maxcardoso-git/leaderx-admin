'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button, Card, Modal, Select } from '@/components/ui';
import {
  ChevronLeftIcon,
  NetworkIcon,
  UsersIcon,
  EditIcon,
  TrashIcon,
  PlusIcon,
  ShieldIcon,
  ChevronRightIcon,
} from '@/components/icons';
import { structuresService } from '@/services/network.service';
import { usersService } from '@/services/identity.service';
import { Structure, StructureRelation, StructureLeader, StructureStatus, AssignLeaderDto } from '@/types/network';
import { User } from '@/types/identity';

export default function StructureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const structureId = params.id as string;

  const t = useTranslations('network');
  const tCommon = useTranslations('common');

  const [structure, setStructure] = useState<Structure | null>(null);
  const [relations, setRelations] = useState<StructureRelation[]>([]);
  const [leaders, setLeaders] = useState<StructureLeader[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddLeaderModal, setShowAddLeaderModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Add leader form
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isPrimaryLeader, setIsPrimaryLeader] = useState(false);
  const [addingLeader, setAddingLeader] = useState(false);

  useEffect(() => {
    loadData();
  }, [structureId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [structureData, relationsData, leadersData, usersData] = await Promise.all([
        structuresService.getById(structureId),
        structuresService.getRelations(structureId),
        structuresService.getLeaders(structureId),
        usersService.list(),
      ]);
      setStructure(structureData);
      setRelations(relationsData);
      setLeaders(leadersData);
      setAvailableUsers(usersData);
    } catch (error) {
      console.error('Failed to load structure:', error);
      setStructure(mockStructure);
      setRelations(mockRelations);
      setLeaders(mockLeaders);
      setAvailableUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await structuresService.delete(structureId);
      router.push('/network');
    } catch (error) {
      console.error('Failed to delete structure:', error);
      router.push('/network');
    } finally {
      setDeleting(false);
    }
  };

  const handleAddLeader = async () => {
    if (!selectedUserId) return;
    setAddingLeader(true);
    try {
      const data: AssignLeaderDto = {
        userId: selectedUserId,
        roleId: structure?.type?.leadershipRoleId || 'role-member',
        isPrimary: isPrimaryLeader,
      };
      const newLeader = await structuresService.assignLeader(structureId, data);
      setLeaders([...leaders, newLeader]);
      setShowAddLeaderModal(false);
      setSelectedUserId('');
      setIsPrimaryLeader(false);
    } catch (error) {
      console.error('Failed to add leader:', error);
      // For demo, add mock leader
      const user = availableUsers.find((u) => u.id === selectedUserId);
      if (user) {
        const mockLeader: StructureLeader = {
          id: `leader-${Date.now()}`,
          structureId,
          userId: selectedUserId,
          user: { id: user.id, fullName: user.fullName, email: user.email },
          roleId: structure?.type?.leadershipRoleId || 'role-member',
          isPrimary: isPrimaryLeader,
          assignedAt: new Date().toISOString(),
        };
        setLeaders([...leaders, mockLeader]);
      }
      setShowAddLeaderModal(false);
      setSelectedUserId('');
      setIsPrimaryLeader(false);
    } finally {
      setAddingLeader(false);
    }
  };

  const handleRemoveLeader = async (leaderId: string) => {
    try {
      await structuresService.removeLeader(structureId, leaderId);
      setLeaders(leaders.filter((l) => l.id !== leaderId));
    } catch (error) {
      console.error('Failed to remove leader:', error);
      setLeaders(leaders.filter((l) => l.id !== leaderId));
    }
  };

  const statusLabels: Record<StructureStatus, { label: string; color: string }> = {
    ACTIVE: { label: tCommon('active'), color: 'text-emerald-400 bg-emerald-400/10' },
    INACTIVE: { label: tCommon('inactive'), color: 'text-white/40 bg-white/[0.05]' },
    PENDING: { label: tCommon('pending'), color: 'text-amber-400 bg-amber-400/10' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-text-muted">{tCommon('loading')}</div>
      </div>
    );
  }

  if (!structure) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-text-muted mb-4">{t('structureNotFound')}</p>
        <Link href="/network">
          <Button variant="ghost">{t('backToNetwork')}</Button>
        </Link>
      </div>
    );
  }

  const status = statusLabels[structure.status] || { label: structure.status || '-', color: 'text-white/40 bg-white/[0.05]' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Back Link */}
      <Link
        href="/network"
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        <ChevronLeftIcon size={16} />
        {t('backToNetwork')}
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
            <NetworkIcon size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-light text-text-primary">{structure.name}</h1>
            <p className="text-text-muted" style={{ marginTop: '8px' }}>{structure.type?.name || t('unknownType')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/network/structures/${structureId}/approval-chain`}>
            <Button variant="secondary">
              {t('viewApprovalChain')}
            </Button>
          </Link>
          <Button
            variant="danger"
            leftIcon={<TrashIcon size={16} />}
            onClick={() => setShowDeleteModal(true)}
          >
            {tCommon('delete')}
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="xl:col-span-2 space-y-6">
          {/* Details Card */}
          <Card className="!p-0 overflow-hidden">
            <div className="p-6 border-b border-white/[0.05]">
              <h2 className="text-lg font-medium text-text-primary">{t('structureInfo')}</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <InfoItem label={t('structureName')} value={structure.name} />
                <InfoItem label={t('structureType')} value={structure.type?.name || '-'} />
                <InfoItem label={t('scope')} value={structure.scope ? t(`scope${structure.scope.replace(/_/g, '')}`) : '-'} />
                <InfoItem label={t('hierarchyLevel')} value={structure.hierarchyLevel} />
                <InfoItem
                  label={t('status')}
                  value={
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  }
                />
                {structure.parent && (
                  <InfoItem
                    label={t('parentStructure')}
                    value={
                      <Link
                        href={`/network/structures/${structure.parent.id}`}
                        className="text-gold hover:text-gold/80 transition-colors"
                      >
                        {structure.parent.name}
                      </Link>
                    }
                  />
                )}
              </div>
            </div>
          </Card>

          {/* Relations Card */}
          <Card className="!p-0 overflow-hidden">
            <div className="p-6 border-b border-white/[0.05]">
              <h2 className="text-lg font-medium text-text-primary">{t('hierarchy')}</h2>
            </div>
            <div className="p-6">
              {relations.length > 0 ? (
                <div className="space-y-3">
                  {relations.map((relation) => (
                    <div
                      key={relation.id}
                      className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/[0.03]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-violet-500/10 rounded-xl text-violet-400">
                          <NetworkIcon size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {relation.relationType === 'PARENT_CHILD'
                              ? relation.childStructure?.name
                              : relation.parentStructure?.name}
                          </p>
                          <p className="text-xs text-text-muted mt-0.5">
                            {t(`relationType${relation.relationType}`)}
                          </p>
                        </div>
                      </div>
                      <Link href={`/network/structures/${relation.childStructureId || relation.parentStructureId}`}>
                        <ChevronRightIcon size={16} className="text-text-muted" />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted text-center py-8">
                  {t('noRelations')}
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Leaders Card */}
          <Card className="!p-0 overflow-hidden">
            <div className="p-6 border-b border-white/[0.05] flex items-center justify-between">
              <h2 className="text-lg font-medium text-text-primary">{t('leaders')}</h2>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<PlusIcon size={14} />}
                onClick={() => setShowAddLeaderModal(true)}
                disabled={leaders.length >= (structure.type?.maxLeaders || 1)}
              >
                {t('addLeader')}
              </Button>
            </div>
            <div className="p-6">
              {leaders.length > 0 ? (
                <div className="space-y-3">
                  {leaders.map((leader) => (
                    <div
                      key={leader.id}
                      className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/[0.03]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                          <span className="text-sm font-medium">
                            {leader.user?.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {leader.user?.fullName}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <ShieldIcon size={10} className="text-text-muted" />
                            <span className="text-xs text-text-muted">
                              {leader.role?.name}
                            </span>
                            {leader.isPrimary && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold/10 text-gold">
                                {t('primaryLeader')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveLeader(leader.id)}
                        className="p-1.5 hover:bg-error/10 rounded-lg transition-colors text-text-muted hover:text-error"
                      >
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted text-center py-8">
                  {t('noLeaders')}
                </p>
              )}
              <p className="text-xs text-text-muted mt-4 text-center">
                {leaders.length} / {structure.type?.maxLeaders || 1} {t('leadersMax')}
              </p>
            </div>
          </Card>

          {/* Child Structures */}
          {structure.children && structure.children.length > 0 && (
            <Card className="!p-0 overflow-hidden">
              <div className="p-6 border-b border-white/[0.05]">
                <h2 className="text-lg font-medium text-text-primary">{t('childStructures')}</h2>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  {structure.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/network/structures/${child.id}`}
                      className="flex items-center justify-between p-3 hover:bg-white/[0.02] rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <NetworkIcon size={16} className="text-text-muted" />
                        <span className="text-sm text-text-primary">{child.name}</span>
                      </div>
                      <ChevronRightIcon size={16} className="text-text-muted" />
                    </Link>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t('deleteStructure')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              {tCommon('cancel')}
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? t('deleting') : tCommon('delete')}
            </Button>
          </>
        }
      >
        <p className="text-text-secondary">
          {t('deleteStructureConfirm')}{' '}
          <strong className="text-text-primary">{structure.name}</strong>?
        </p>
      </Modal>

      {/* Add Leader Modal */}
      <Modal
        isOpen={showAddLeaderModal}
        onClose={() => setShowAddLeaderModal(false)}
        title={t('addLeader')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowAddLeaderModal(false)}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={handleAddLeader} disabled={!selectedUserId || addingLeader}>
              {addingLeader ? t('adding') : tCommon('add')}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Select
            label={t('selectUser')}
            options={availableUsers
              .filter((u) => !leaders.some((l) => l.userId === u.id))
              .map((u) => ({ value: u.id, label: u.fullName }))}
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPrimary"
              checked={isPrimaryLeader}
              onChange={(e) => setIsPrimaryLeader(e.target.checked)}
              className="w-4 h-4 rounded border-border bg-transparent text-gold focus:ring-gold"
            />
            <label htmlFor="isPrimary" className="text-sm text-text-primary">
              {t('setPrimaryLeader')}
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <p className="text-sm text-text-primary">{value}</p>
    </div>
  );
}

// Mock data
const mockStructure: Structure = {
  id: 'brazil-1',
  tenantId: 'demo-tenant',
  name: 'LeaderX Brasil',
  typeId: 'type-national',
  type: {
    id: 'type-national',
    tenantId: 'demo-tenant',
    code: 'NACIONAL',
    name: 'Nacional',
    maxLevels: 10,
    allowNested: true,
    status: 'ACTIVE',
    scope: 'COUNTRY_GROUP',
    hierarchyLevel: 3,
    leadershipRoleId: 'role-manager',
    leadershipRole: { id: 'role-manager', name: 'Gerente' },
    maxLeaders: 2,
    createdAt: '',
    updatedAt: '',
  },
  parentId: 'latam-1',
  parent: {
    id: 'latam-1',
    tenantId: 'demo-tenant',
    name: 'LeaderX LATAM',
    typeId: 'type-regional',
    status: 'ACTIVE',
    scope: 'COUNTRY_GROUP',
    hierarchyLevel: 2,
    createdAt: '',
    updatedAt: '',
  },
  status: 'ACTIVE',
  scope: 'COUNTRY_GROUP',
  hierarchyLevel: 3,
  children: [
    {
      id: 'sp-1',
      tenantId: 'demo-tenant',
      name: 'LeaderX São Paulo',
      typeId: 'type-state',
      status: 'ACTIVE',
      scope: 'CITY_GROUP',
      hierarchyLevel: 4,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'rj-1',
      tenantId: 'demo-tenant',
      name: 'LeaderX Rio de Janeiro',
      typeId: 'type-state',
      status: 'ACTIVE',
      scope: 'CITY_GROUP',
      hierarchyLevel: 4,
      createdAt: '',
      updatedAt: '',
    },
  ],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockRelations: StructureRelation[] = [
  {
    id: 'rel-1',
    relationType: 'PARENT_CHILD',
    parentStructureId: 'brazil-1',
    childStructureId: 'sp-1',
    childStructure: {
      id: 'sp-1',
      tenantId: 'demo-tenant',
      name: 'LeaderX São Paulo',
      typeId: 'type-state',
      status: 'ACTIVE',
      scope: 'CITY_GROUP',
      hierarchyLevel: 4,
      createdAt: '',
      updatedAt: '',
    },
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'rel-2',
    relationType: 'PARENT_CHILD',
    parentStructureId: 'brazil-1',
    childStructureId: 'rj-1',
    childStructure: {
      id: 'rj-1',
      tenantId: 'demo-tenant',
      name: 'LeaderX Rio de Janeiro',
      typeId: 'type-state',
      status: 'ACTIVE',
      scope: 'CITY_GROUP',
      hierarchyLevel: 4,
      createdAt: '',
      updatedAt: '',
    },
    createdAt: '2024-01-01T00:00:00Z',
  },
];

const mockLeaders: StructureLeader[] = [
  {
    id: 'leader-1',
    structureId: 'brazil-1',
    userId: 'user-1',
    user: { id: 'user-1', fullName: 'João Silva', email: 'joao@leaderx.com' },
    roleId: 'role-manager',
    role: { id: 'role-manager', name: 'Gerente' },
    isPrimary: true,
    assignedAt: '2024-01-01T00:00:00Z',
  },
];

const mockUsers: User[] = [
  { id: 'user-1', tenantId: 'demo', email: 'joao@leaderx.com', fullName: 'João Silva', status: 'ACTIVE', createdAt: '', updatedAt: '' },
  { id: 'user-2', tenantId: 'demo', email: 'maria@leaderx.com', fullName: 'Maria Santos', status: 'ACTIVE', createdAt: '', updatedAt: '' },
  { id: 'user-3', tenantId: 'demo', email: 'pedro@leaderx.com', fullName: 'Pedro Costa', status: 'ACTIVE', createdAt: '', updatedAt: '' },
];
