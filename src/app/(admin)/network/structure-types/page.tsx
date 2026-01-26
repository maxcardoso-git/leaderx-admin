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
import { positionsService, scopesService } from '@/services/settings.service';
import { StructureType, StructureScope, CreateStructureTypeDto } from '@/types/network';
import { Position, Scope } from '@/types/settings';

export default function StructureTypesPage() {
  const t = useTranslations('network');
  const tCommon = useTranslations('common');

  const [structureTypes, setStructureTypes] = useState<StructureType[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [scopes, setScopes] = useState<Scope[]>([]);
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
    scope: undefined,
    leadershipRoleId: '',
    maxLeaders: 1,
    color: '#c4a45a',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Generate scope options from loaded scopes (database only - no hardcode)
  const scopeOptions = scopes.map((s) => ({
    value: s.code,
    label: `${s.name} (${t('level')} ${s.level})`,
    level: s.level
  }));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [typesResponse, positionsResponse, scopesResponse] = await Promise.all([
        structureTypesService.list(),
        positionsService.list(),
        scopesService.list(),
      ]);
      setStructureTypes(typesResponse.items || []);
      setPositions(positionsResponse.items || []);
      setScopes(scopesResponse.items || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      setStructureTypes([]);
      setPositions([]);
      setScopes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.scope || !formData.leadershipRoleId) return;
    setSaving(true);
    try {
      const newType = await structureTypesService.create(formData);
      setStructureTypes([...structureTypes, newType]);
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create structure type:', error);
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
        scope: formData.scope,
        leadershipRoleId: formData.leadershipRoleId,
        maxLeaders: formData.maxLeaders,
        color: formData.color,
      });
      setStructureTypes(structureTypes.map((t) => (t.id === selectedType.id ? { ...t, ...updated } : t)));
      setShowEditModal(false);
      setSelectedType(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update structure type:', error);
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
      color: type.color || '#c4a45a',
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
      scope: undefined,
      leadershipRoleId: '',
      maxLeaders: 1,
      color: '#c4a45a',
    });
  };

  const getScopeLabel = (scope?: StructureScope) => {
    if (!scope) return null;
    const option = scopeOptions.find((o) => o.value === scope);
    return option?.label || scope;
  };

  const getLeadershipRoleName = (type: StructureType) => {
    if (type.leadershipRole?.name) return type.leadershipRole.name;
    if (type.leadershipRoleId) {
      const position = positions.find((p) => p.id === type.leadershipRoleId);
      return position?.name || null;
    }
    return null;
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
          <p className="text-text-muted" style={{ marginTop: '8px' }}>
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
              {[...structureTypes].sort((a, b) => (a.hierarchyLevel || 0) - (b.hierarchyLevel || 0)).map((type) => (
                <tr
                  key={type.id}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: type.color ? `${type.color}15` : 'rgba(196, 164, 90, 0.1)',
                          color: type.color || '#c4a45a',
                        }}
                      >
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
                    {getScopeLabel(type.scope) ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-gold/10 text-gold">
                        {getScopeLabel(type.scope)}
                      </span>
                    ) : (
                      <span className="text-xs text-text-muted italic">{t('notDefined')}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {type.hierarchyLevel || scopeOptions.find((o) => o.value === type.scope)?.level ? (
                      <span className="text-text-primary font-medium">
                        {type.hierarchyLevel || scopeOptions.find((o) => o.value === type.scope)?.level}
                      </span>
                    ) : (
                      <span className="text-text-muted italic">{t('notDefined')}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {getLeadershipRoleName(type) ? (
                      <div className="flex items-center gap-2">
                        <ShieldIcon size={14} className="text-gold" />
                        <span className="text-sm text-text-primary">{getLeadershipRoleName(type)}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-text-muted italic">{t('notDefined')}</span>
                    )}
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
                        className={`p-2 rounded-lg transition-colors ${
                          (type.activeStructures || 0) > 0
                            ? 'text-text-muted/30 cursor-not-allowed'
                            : 'text-text-muted hover:text-error hover:bg-error/10'
                        }`}
                        disabled={(type.activeStructures || 0) > 0}
                        title={
                          (type.activeStructures || 0) > 0
                            ? t('cannotDeleteWithActiveStructures')
                            : tCommon('delete')
                        }
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
            <Button onClick={handleCreate} disabled={!formData.name || !formData.scope || !formData.leadershipRoleId || saving}>
              {saving ? t('saving') : tCommon('create')}
            </Button>
          </>
        }
      >
        <StructureTypeForm
          formData={formData}
          setFormData={setFormData}
          positions={positions}
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
          positions={positions}
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
  positions,
  scopeOptions,
  t,
  isEdit = false,
}: {
  formData: CreateStructureTypeDto;
  setFormData: (data: CreateStructureTypeDto) => void;
  positions: Position[];
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
          options={[
            { value: '', label: t('selectScope') },
            ...scopeOptions
          ]}
          value={formData.scope || ''}
          onChange={(e) => setFormData({ ...formData, scope: e.target.value ? e.target.value as StructureScope : undefined })}
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
          label={t('leadershipPosition')}
          options={positions.map((p) => ({ value: p.id, label: p.name }))}
          value={formData.leadershipRoleId}
          onChange={(e) => setFormData({ ...formData, leadershipRoleId: e.target.value })}
        />
        <p className="text-xs text-text-muted mt-1.5">{t('leadershipPositionHint')}</p>
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

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          {t('iconColor')}
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            className="w-12 h-12 rounded-lg border border-white/[0.08] cursor-pointer bg-transparent"
            value={formData.color || '#c4a45a'}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          />
          <Input
            value={(formData.color || '#c4a45a').toUpperCase()}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="flex-1"
          />
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: formData.color ? `${formData.color}15` : 'rgba(196, 164, 90, 0.1)',
              color: formData.color || '#c4a45a',
            }}
          >
            <NetworkIcon size={20} />
          </div>
        </div>
        <p className="text-xs text-text-muted mt-1.5">{t('iconColorHint')}</p>
      </div>
    </div>
  );
}
