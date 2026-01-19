'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button, Card, Modal, Input, Select } from '@/components/ui';
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  ShieldIcon,
  ChevronLeftIcon,
  NetworkIcon,
} from '@/components/icons';
import { structureTypesService } from '@/services/network.service';
import { rolesService } from '@/services/identity.service';
import { StructureType, StructureScope, CreateStructureTypeDto } from '@/types/network';
import { Role } from '@/types/identity';

export default function StructureTypesPage() {
  const t = useTranslations('network');
  const tCommon = useTranslations('common');

  const [structureTypes, setStructureTypes] = useState<StructureType[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<StructureType | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateStructureTypeDto>({
    name: '',
    description: '',
    scope: 'SINGLE_CITY',
    leadershipRoleId: '',
    maxLeaders: 1,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const scopeOptions = [
    { value: 'GLOBAL_ALL_COUNTRIES', label: `${t('scopeGlobal')} (${t('level')} 1)`, level: 1 },
    { value: 'COUNTRY_GROUP', label: `${t('scopeCountryGroup')} (${t('level')} 2)`, level: 2 },
    { value: 'CITY_GROUP', label: `${t('scopeCityGroup')} (${t('level')} 3)`, level: 3 },
    { value: 'SINGLE_CITY', label: `${t('scopeSingleCity')} (${t('level')} 4)`, level: 4 },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [typesResponse, rolesResponse] = await Promise.all([
        structureTypesService.list(),
        rolesService.list(),
      ]);
      setStructureTypes(typesResponse.items.length > 0 ? typesResponse.items : mockStructureTypes);
      setRoles(rolesResponse.items || mockRoles);
    } catch (error) {
      console.error('Failed to load data:', error);
      setStructureTypes(mockStructureTypes);
      setRoles(mockRoles);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.leadershipRoleId) return;
    setSaving(true);
    try {
      const newType = await structureTypesService.create(formData);
      setStructureTypes([...structureTypes, newType]);
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create structure type:', error);
      // For demo, add mock data
      const mockNew: StructureType = {
        id: `type-${Date.now()}`,
        tenantId: 'demo-tenant',
        ...formData,
        hierarchyLevel: structureTypes.length + 1,
        activeStructures: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setStructureTypes([...structureTypes, mockNew]);
      setShowCreateModal(false);
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedType || !formData.name) return;
    setSaving(true);
    try {
      const updated = await structureTypesService.update(selectedType.id, {
        name: formData.name,
        description: formData.description,
        maxLeaders: formData.maxLeaders,
      });
      setStructureTypes(structureTypes.map((t) => (t.id === selectedType.id ? { ...t, ...updated } : t)));
      setShowEditModal(false);
      setSelectedType(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update structure type:', error);
      // For demo, update local state
      setStructureTypes(
        structureTypes.map((t) =>
          t.id === selectedType.id
            ? { ...t, name: formData.name, description: formData.description, maxLeaders: formData.maxLeaders }
            : t
        )
      );
      setShowEditModal(false);
      setSelectedType(null);
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedType) return;
    setDeleting(true);
    try {
      await structureTypesService.delete(selectedType.id);
      setStructureTypes(structureTypes.filter((t) => t.id !== selectedType.id));
      setShowDeleteModal(false);
      setSelectedType(null);
    } catch (error) {
      console.error('Failed to delete structure type:', error);
      // For demo, remove from local state
      setStructureTypes(structureTypes.filter((t) => t.id !== selectedType.id));
      setShowDeleteModal(false);
      setSelectedType(null);
    } finally {
      setDeleting(false);
    }
  };

  const openEditModal = (type: StructureType) => {
    setSelectedType(type);
    setFormData({
      name: type.name,
      description: type.description || '',
      scope: type.scope,
      leadershipRoleId: type.leadershipRoleId,
      maxLeaders: type.maxLeaders,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (type: StructureType) => {
    setSelectedType(type);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      scope: 'SINGLE_CITY',
      leadershipRoleId: '',
      maxLeaders: 1,
    });
  };

  const getScopeLabel = (scope: StructureScope) => {
    const option = scopeOptions.find((o) => o.value === scope);
    return option?.label || scope;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-text-muted">{tCommon('loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/network"
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        <ChevronLeftIcon size={16} />
        {t('backToNetwork')}
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-text-primary tracking-tight">
            {t('structureTypes')}
          </h1>
          <p className="text-text-muted mt-2">
            {t('structureTypesSubtitle')}
          </p>
        </div>
        <Button
          leftIcon={<PlusIcon size={18} />}
          onClick={() => setShowCreateModal(true)}
        >
          {t('newStructureType')}
        </Button>
      </div>

      {/* Table */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                  {t('typeName')}
                </th>
                <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                  {t('scope')}
                </th>
                <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                  {t('hierarchyLevel')}
                </th>
                <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                  {t('leadershipRole')}
                </th>
                <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                  {t('maxLeaders')}
                </th>
                <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                  {t('activeStructures')}
                </th>
                <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                  {tCommon('actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {structureTypes.map((type) => (
                <tr
                  key={type.id}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
                        <NetworkIcon size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{type.name}</p>
                        {type.description && (
                          <p className="text-xs text-text-muted truncate max-w-xs">{type.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-white/[0.05] text-text-muted">
                      {getScopeLabel(type.scope)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-primary">
                    {type.hierarchyLevel}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <ShieldIcon size={14} className="text-text-muted" />
                      <span className="text-sm text-text-primary">
                        {type.leadershipRole?.name || roles.find((r) => r.id === type.leadershipRoleId)?.name || '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-primary">
                    {type.maxLeaders}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-primary">
                    {type.activeStructures || 0}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(type)}
                        className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors text-text-muted hover:text-text-primary"
                      >
                        <EditIcon size={16} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(type)}
                        className="p-2 hover:bg-error/10 rounded-lg transition-colors text-text-muted hover:text-error"
                        disabled={(type.activeStructures || 0) > 0}
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={t('newStructureType')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={handleCreate} disabled={!formData.name || !formData.leadershipRoleId || saving}>
              {saving ? t('saving') : tCommon('create')}
            </Button>
          </>
        }
      >
        <StructureTypeForm
          formData={formData}
          setFormData={setFormData}
          roles={roles}
          scopeOptions={scopeOptions}
          t={t}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={t('editStructureType')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowEditModal(false)}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={handleEdit} disabled={!formData.name || saving}>
              {saving ? t('saving') : tCommon('save')}
            </Button>
          </>
        }
      >
        <StructureTypeForm
          formData={formData}
          setFormData={setFormData}
          roles={roles}
          scopeOptions={scopeOptions}
          t={t}
          isEdit
        />
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t('deleteStructureType')}
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
          {t('deleteStructureTypeConfirm')}{' '}
          <strong className="text-text-primary">{selectedType?.name}</strong>?
        </p>
      </Modal>
    </div>
  );
}

// Form Component
function StructureTypeForm({
  formData,
  setFormData,
  roles,
  scopeOptions,
  t,
  isEdit = false,
}: {
  formData: CreateStructureTypeDto;
  setFormData: (data: CreateStructureTypeDto) => void;
  roles: Role[];
  scopeOptions: { value: string; label: string; level: number }[];
  t: (key: string) => string;
  isEdit?: boolean;
}) {
  const hierarchyLevel = scopeOptions.find((o) => o.value === formData.scope)?.level || 4;

  return (
    <div className="space-y-5">
      <Input
        label={t('typeName')}
        placeholder={t('typeNamePlaceholder')}
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />

      <div>
        <Select
          label={t('scope')}
          options={scopeOptions}
          value={formData.scope}
          onChange={(e) => setFormData({ ...formData, scope: e.target.value as StructureScope })}
          disabled={isEdit}
        />
        <p className="text-xs text-text-muted mt-1.5">{t('scopeHint')}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          {t('description')}
        </label>
        <textarea
          placeholder={t('descriptionPlaceholder')}
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-gold/50 focus:ring-1 focus:ring-gold/20 focus:outline-none transition-all resize-none"
        />
      </div>

      <div>
        <Input
          label={t('hierarchyLevel')}
          value={hierarchyLevel}
          disabled
        />
        <p className="text-xs text-text-muted mt-1.5 flex items-start gap-1.5">
          <span className="inline-block w-4 h-4 bg-blue-500/20 text-blue-400 rounded text-[10px] flex-shrink-0 flex items-center justify-center font-medium">i</span>
          {t('hierarchyLevelHint')}
        </p>
      </div>

      <div>
        <Select
          label={t('leadershipRole')}
          options={roles.map((r) => ({ value: r.id, label: r.name }))}
          value={formData.leadershipRoleId}
          onChange={(e) => setFormData({ ...formData, leadershipRoleId: e.target.value })}
          disabled={isEdit}
        />
        <p className="text-xs text-text-muted mt-1.5">{t('leadershipRoleHint')}</p>
      </div>

      <div>
        <Input
          label={t('maxLeaders')}
          type="number"
          min={1}
          value={formData.maxLeaders}
          onChange={(e) => setFormData({ ...formData, maxLeaders: parseInt(e.target.value) || 1 })}
        />
        <p className="text-xs text-text-muted mt-1.5">{t('maxLeadersHint')}</p>
      </div>
    </div>
  );
}

// Mock data
const mockStructureTypes: StructureType[] = [
  {
    id: 'type-global',
    tenantId: 'demo-tenant',
    name: 'Matriz Global',
    description: 'Estrutura principal da organização',
    scope: 'GLOBAL_ALL_COUNTRIES',
    hierarchyLevel: 1,
    leadershipRoleId: 'role-admin',
    leadershipRole: { id: 'role-admin', name: 'Administrador' },
    maxLeaders: 3,
    activeStructures: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'type-regional',
    tenantId: 'demo-tenant',
    name: 'Regional',
    description: 'Estrutura regional que agrupa países',
    scope: 'COUNTRY_GROUP',
    hierarchyLevel: 2,
    leadershipRoleId: 'role-manager',
    leadershipRole: { id: 'role-manager', name: 'Gerente' },
    maxLeaders: 2,
    activeStructures: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'type-national',
    tenantId: 'demo-tenant',
    name: 'Nacional',
    description: 'Estrutura de país',
    scope: 'COUNTRY_GROUP',
    hierarchyLevel: 3,
    leadershipRoleId: 'role-manager',
    leadershipRole: { id: 'role-manager', name: 'Gerente' },
    maxLeaders: 2,
    activeStructures: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'type-state',
    tenantId: 'demo-tenant',
    name: 'Estadual',
    description: 'Estrutura estadual',
    scope: 'CITY_GROUP',
    hierarchyLevel: 4,
    leadershipRoleId: 'role-member',
    leadershipRole: { id: 'role-member', name: 'Membro' },
    maxLeaders: 1,
    activeStructures: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'type-city',
    tenantId: 'demo-tenant',
    name: 'Municipal',
    description: 'Estrutura de cidade',
    scope: 'SINGLE_CITY',
    hierarchyLevel: 5,
    leadershipRoleId: 'role-member',
    leadershipRole: { id: 'role-member', name: 'Membro' },
    maxLeaders: 1,
    activeStructures: 4,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const mockRoles: Role[] = [
  { id: 'role-admin', tenantId: 'demo', name: 'Administrador', isSystem: true, permissions: [], createdAt: '', updatedAt: '' },
  { id: 'role-manager', tenantId: 'demo', name: 'Gerente', isSystem: false, permissions: [], createdAt: '', updatedAt: '' },
  { id: 'role-member', tenantId: 'demo', name: 'Membro', isSystem: false, permissions: [], createdAt: '', updatedAt: '' },
];
