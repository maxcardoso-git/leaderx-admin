'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Button, Modal, Card, Table, StatusPill, Avatar, Input, Select } from '@/components/ui';
import { EditIcon, TrashIcon, ChevronLeftIcon, PlusIcon, GroupIcon, UsersIcon } from '@/components/icons';
import {
  WorkingUnit,
  WorkingUnitMembership,
  WorkingUnitStatus,
  MembershipRole,
} from '@/types/governance';
import { workingUnitsService } from '@/services/governance.service';
import { usersService } from '@/services/identity.service';
import { User } from '@/types/identity';

export default function WorkingUnitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('workingUnits');
  const common = useTranslations('common');
  const unitId = params.id as string;

  const [unit, setUnit] = useState<WorkingUnit | null>(null);
  const [members, setMembers] = useState<WorkingUnitMembership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Add member form state
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<MembershipRole>('MEMBER');

  const mapStatus = (status: WorkingUnitStatus | string | undefined): { label: string; color: string } => {
    const mapping: Record<string, { label: string; color: string }> = {
      ACTIVE: { label: t('statusACTIVE'), color: 'text-emerald-400 bg-emerald-400/10' },
      INACTIVE: { label: t('statusINACTIVE'), color: 'text-white/40 bg-white/[0.05]' },
      SUSPENDED: { label: t('statusSUSPENDED'), color: 'text-red-400 bg-red-400/10' },
      ARCHIVED: { label: t('statusINACTIVE'), color: 'text-white/40 bg-white/[0.05]' },
    };
    return mapping[status || ''] || { label: status || 'Unknown', color: 'text-white/40 bg-white/[0.05]' };
  };

  const mapMemberStatus = (status: string): 'active' | 'inactive' | 'pending' => {
    const mapping: Record<string, 'active' | 'inactive' | 'pending'> = {
      ACTIVE: 'active',
      INACTIVE: 'inactive',
      PENDING: 'pending',
    };
    return mapping[status] || 'pending';
  };

  useEffect(() => {
    loadUnit();
  }, [unitId]);

  const loadUnit = async () => {
    setIsLoading(true);
    try {
      const [unitData, membersData] = await Promise.all([
        workingUnitsService.getById(unitId),
        workingUnitsService.getMembers(unitId),
      ]);
      setUnit(unitData);
      setMembers(membersData.items);
    } catch (error) {
      console.error('Failed to load working unit:', error);
      setUnit(mockUnit);
      setMembers(mockMembers);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const usersData = await usersService.list();
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers(mockUsers);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await workingUnitsService.delete(unitId);
      router.push('/governance/working-units');
    } catch (error) {
      console.error('Failed to delete working unit:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId) return;

    setIsAddingMember(true);
    try {
      await workingUnitsService.addMember(unitId, {
        userId: selectedUserId,
        role: selectedRole,
      });
      loadUnit();
      setShowAddMemberModal(false);
      setSelectedUserId('');
      setSelectedRole('MEMBER');
    } catch (error) {
      console.error('Failed to add member:', error);
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm(t('deleteConfirm'))) return;

    try {
      await workingUnitsService.removeMember(unitId, memberId);
      loadUnit();
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const openAddMemberModal = () => {
    loadUsers();
    setShowAddMemberModal(true);
  };

  const memberColumns = [
    {
      key: 'user',
      header: t('selectUser'),
      render: (member: WorkingUnitMembership) => (
        <div className="flex items-center gap-3">
          <Avatar name={member.user?.fullName || ''} size="md" />
          <div>
            <p className="font-medium text-text-primary">{member.user?.fullName}</p>
            <p className="text-xs text-text-muted">{member.user?.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: t('memberRole'),
      width: '150px',
      render: (member: WorkingUnitMembership) => (
        <span className="text-sm text-text-muted">
          {t(`role${member.role}`)}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('memberStatus'),
      width: '120px',
      render: (member: WorkingUnitMembership) => (
        <StatusPill status={mapMemberStatus(member.status)} />
      ),
    },
    {
      key: 'joinedAt',
      header: t('joinedAt'),
      width: '150px',
      render: (member: WorkingUnitMembership) => (
        <span className="text-text-muted">
          {new Date(member.joinedAt).toLocaleDateString(locale)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '80px',
      render: (member: WorkingUnitMembership) => (
        <button
          onClick={() => handleRemoveMember(member.id)}
          className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-background-hover transition-colors"
          title={t('removeMember')}
        >
          <TrashIcon size={16} />
        </button>
      ),
    },
  ];

  const roleOptions = [
    { value: 'COORDINATOR', label: t('roleCOORDINATOR') },
    { value: 'SECRETARY', label: t('roleSECRETARY') },
    { value: 'MEMBER', label: t('roleMEMBER') },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-48 bg-white/[0.05] rounded-lg animate-pulse" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 h-96 bg-white/[0.02] rounded-2xl animate-pulse" />
          <div className="h-96 bg-white/[0.02] rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-white/40 mb-4">{t('noUnitsFound')}</p>
        <Link href="/governance/working-units">
          <Button variant="ghost">{common('back')}</Button>
        </Link>
      </div>
    );
  }

  const statusInfo = mapStatus(unit.status);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Back Link */}
      <Link
        href="/governance/working-units"
        className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
      >
        <ChevronLeftIcon size={16} />
        {t('backToList')}
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center">
            <GroupIcon size={28} className="text-gold" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-light text-white">{unit.name}</h1>
              <span className="text-xs px-3 py-1 rounded-full bg-gold/10 text-gold">
                {t(`type${unit.type}`)}
              </span>
            </div>
            {unit.description && (
              <p className="text-white/40" style={{ marginTop: '8px' }}>{unit.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/governance/working-units/${unitId}/edit`}>
            <Button variant="secondary" leftIcon={<EditIcon size={16} />}>
              {common('edit')}
            </Button>
          </Link>
          <Button
            variant="danger"
            leftIcon={<TrashIcon size={16} />}
            onClick={() => setShowDeleteModal(true)}
          >
            {common('delete')}
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="xl:col-span-2 space-y-6">
          {/* Details Card */}
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/[0.05]">
              <h2 className="text-lg font-medium text-white">{t('unitInfo')}</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <InfoItem label={t('unitName')} value={unit.name} />
                <InfoItem label={t('structure')} value={unit.structure?.name || '-'} />
                <InfoItem label={t('maxMembers')} value={unit.maxMembers} />
                <InfoItem
                  label={t('members')}
                  value={`${unit.membersCount || members.length} ${t('membersCount')}`}
                />
                {unit.parent && (
                  <InfoItem label={t('parentUnit')} value={unit.parent.name} />
                )}
              </div>
            </div>
          </div>

          {/* Members Card */}
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/[0.05] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UsersIcon size={20} className="text-gold" />
                <h2 className="text-lg font-medium text-white">{t('members')}</h2>
                <span className="text-sm text-white/40">
                  ({members.length} / {unit.maxMembers})
                </span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<PlusIcon size={16} />}
                onClick={openAddMemberModal}
                disabled={members.length >= unit.maxMembers}
              >
                {t('addMember')}
              </Button>
            </div>
            <div className="p-6">
              {members.length > 0 ? (
                <Table
                  columns={memberColumns}
                  data={members}
                  keyExtractor={(member) => member.id}
                  emptyMessage={t('noMembers')}
                />
              ) : (
                <p className="text-sm text-white/40 text-center py-8">
                  {t('noMembers')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/[0.05]">
              <h2 className="text-lg font-medium text-white">{t('status')}</h2>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/40">{t('status')}</span>
                <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/40">{common('created')}</span>
                <span className="text-sm text-white/70">
                  {new Date(unit.createdAt).toLocaleDateString(locale)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={unit.type === 'GROUP' ? t('deleteGroup') : t('deleteNucleus')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              {common('cancel')}
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
              {common('delete')}
            </Button>
          </>
        }
      >
        <p className="text-white/60">
          {t('deleteConfirm')} <strong className="text-white">{unit.name}</strong>?
        </p>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        title={t('addMember')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowAddMemberModal(false)}>
              {common('cancel')}
            </Button>
            <Button onClick={handleAddMember} isLoading={isAddingMember} disabled={!selectedUserId}>
              {common('add')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-2">{t('selectUser')}</label>
            <Select
              options={[
                { value: '', label: t('selectUser') },
                ...users.map((user) => ({
                  value: user.id,
                  label: user.fullName,
                })),
              ]}
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-2">{t('memberRole')}</label>
            <Select
              options={roleOptions}
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as MembershipRole)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-white/30 mb-1">{label}</p>
      <p className="text-sm text-white/80">{value}</p>
    </div>
  );
}

// Mock data
const mockUnit: WorkingUnit = {
  id: '1',
  tenantId: 'demo-tenant',
  name: 'Grupo de Comunicacao',
  description: 'Responsavel pela comunicacao interna e externa',
  type: 'GROUP',
  structureId: 'struct-1',
  structure: { id: 'struct-1', name: 'Sede Nacional' },
  status: 'ACTIVE',
  maxMembers: 15,
  membersCount: 3,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
};

const mockMembers: WorkingUnitMembership[] = [
  {
    id: 'm1',
    workingUnitId: '1',
    userId: 'u1',
    user: { id: 'u1', fullName: 'Maria Silva', email: 'maria.silva@leaderx.com' },
    role: 'COORDINATOR',
    status: 'ACTIVE',
    joinedAt: '2024-01-16T10:00:00Z',
  },
  {
    id: 'm2',
    workingUnitId: '1',
    userId: 'u2',
    user: { id: 'u2', fullName: 'Joao Santos', email: 'joao.santos@leaderx.com' },
    role: 'SECRETARY',
    status: 'ACTIVE',
    joinedAt: '2024-01-17T10:00:00Z',
  },
  {
    id: 'm3',
    workingUnitId: '1',
    userId: 'u3',
    user: { id: 'u3', fullName: 'Ana Costa', email: 'ana.costa@leaderx.com' },
    role: 'MEMBER',
    status: 'PENDING',
    joinedAt: '2024-01-18T10:00:00Z',
  },
];

const mockUsers: User[] = [
  { id: 'u4', tenantId: 'demo', email: 'pedro.lima@leaderx.com', fullName: 'Pedro Lima', status: 'ACTIVE', createdAt: '', updatedAt: '' },
  { id: 'u5', tenantId: 'demo', email: 'julia.costa@leaderx.com', fullName: 'Julia Costa', status: 'ACTIVE', createdAt: '', updatedAt: '' },
  { id: 'u6', tenantId: 'demo', email: 'carlos.santos@leaderx.com', fullName: 'Carlos Santos', status: 'ACTIVE', createdAt: '', updatedAt: '' },
];
