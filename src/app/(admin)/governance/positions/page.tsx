'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Card, Modal, Input } from '@/components/ui';
import { PlusIcon, EditIcon, TrashIcon, BriefcaseIcon, GripIcon } from '@/components/icons';
import { Position, CreatePositionDto, UpdatePositionDto } from '@/types/settings';
import { positionsService } from '@/services/settings.service';

// Hierarchy groups catalog matching backend seed
const HIERARCHY_GROUPS = [
  { id: 'C_LEVEL', name: 'C-Level Executivo', displayOrder: 1 },
  { id: 'C_SUITE', name: 'C-Suite Officers', displayOrder: 2 },
  { id: 'VICE_PRESIDENCIA', name: 'Vice-Presidência', displayOrder: 3 },
  { id: 'DIRETORIA', name: 'Diretoria', displayOrder: 4 },
  { id: 'GERENCIA', name: 'Gerência', displayOrder: 5 },
  { id: 'COORDENACAO', name: 'Coordenação', displayOrder: 6 },
  { id: 'SUPERVISAO', name: 'Supervisão', displayOrder: 7 },
  { id: 'OPERACIONAL', name: 'Operacional', displayOrder: 8 },
  { id: 'OUTROS', name: 'Outros', displayOrder: 9 },
];

export default function PositionsPage() {
  const t = useTranslations('systemSettings.positions');
  const common = useTranslations('common');

  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPosition, setDeletingPosition] = useState<Position | null>(null);
  const [filterGroup, setFilterGroup] = useState<string>('');

  const [formData, setFormData] = useState<CreatePositionDto>({
    code: '',
    name: '',
    hierarchyGroup: '',
    description: '',
  });

  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    setIsLoading(true);
    try {
      const data = await positionsService.list();
      setPositions(data.items);
    } catch (error) {
      console.error('Failed to load positions:', error);
      setPositions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPositions = useMemo(() => {
    if (!filterGroup) return positions;
    return positions.filter((p) => p.hierarchyGroup === filterGroup);
  }, [positions, filterGroup]);

  const groupedPositions = useMemo(() => {
    const groups: Record<string, Position[]> = {};
    filteredPositions.forEach((position) => {
      const group = position.hierarchyGroup || 'OUTROS';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(position);
    });
    return groups;
  }, [filteredPositions]);

  const getGroupCount = (groupId: string) => {
    return positions.filter((p) => p.hierarchyGroup === groupId).length;
  };

  const openCreateModal = () => {
    setEditingPosition(null);
    setFormData({ code: '', name: '', hierarchyGroup: '', description: '' });
    setShowModal(true);
  };

  const openEditModal = (position: Position) => {
    setEditingPosition(position);
    setFormData({
      code: position.code,
      name: position.name,
      hierarchyGroup: position.hierarchyGroup,
      description: position.description || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.code.trim() || !formData.name.trim() || !formData.hierarchyGroup) return;

    setIsSaving(true);
    try {
      if (editingPosition) {
        await positionsService.update(editingPosition.id, formData as UpdatePositionDto);
      } else {
        await positionsService.create(formData);
      }
      loadPositions();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save position:', error);
      // For demo, update locally
      if (editingPosition) {
        setPositions((prev) =>
          prev.map((p) =>
            p.id === editingPosition.id
              ? { ...p, ...formData, updatedAt: new Date().toISOString() }
              : p
          )
        );
      } else {
        const newPosition: Position = {
          id: `pos-${Date.now()}`,
          tenantId: 'demo',
          code: formData.code,
          name: formData.name,
          hierarchyGroup: formData.hierarchyGroup,
          description: formData.description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setPositions((prev) => [...prev, newPosition]);
      }
      setShowModal(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingPosition) return;

    try {
      await positionsService.delete(deletingPosition.id);
      loadPositions();
    } catch (error) {
      console.error('Failed to delete position:', error);
      // For demo, remove locally
      setPositions((prev) => prev.filter((p) => p.id !== deletingPosition.id));
    } finally {
      setShowDeleteModal(false);
      setDeletingPosition(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-text-primary">{t('title')}</h1>
          <p className="text-sm text-text-muted" style={{ marginTop: '8px' }}>{t('subtitle')}</p>
        </div>
        <Button leftIcon={<PlusIcon size={18} />} onClick={openCreateModal}>
          {t('newPosition')}
        </Button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-text-muted">{t('filterByGroup')}:</label>
          <select
            className="px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white focus:border-gold/50 focus:outline-none transition-all min-w-[200px]"
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
          >
            <option value="">{t('allGroups')}</option>
            {HIERARCHY_GROUPS.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name} ({getGroupCount(group.id)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Positions by Group */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-6 w-32 bg-white/[0.02] rounded animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-16 bg-white/[0.02] rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : Object.keys(groupedPositions).length === 0 ? (
        <Card padding="xl">
          <div className="text-center py-12">
            <BriefcaseIcon size={48} className="mx-auto text-white/20 mb-4" />
            <p className="text-text-muted">{t('noPositions')}</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {HIERARCHY_GROUPS.filter((g) => groupedPositions[g.id]).map((group) => (
            <div key={group.id}>
              {/* Group Header */}
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-gold/10 text-gold text-xs font-semibold rounded-full">
                  {group.name}
                </span>
                <span className="text-sm text-text-muted">
                  ({groupedPositions[group.id].length} cargos)
                </span>
              </div>

              {/* Positions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {groupedPositions[group.id].map((position) => (
                  <div
                    key={position.id}
                    className="flex items-center justify-between px-4 py-4 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:bg-white/[0.04] hover:border-white/[0.1] transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <GripIcon size={16} className="text-white/20 flex-shrink-0 cursor-grab" />
                      <span className="text-sm text-text-primary truncate">
                        {position.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(position)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-gold hover:bg-white/[0.06] transition-colors"
                        title={common('edit')}
                      >
                        <EditIcon size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingPosition(position);
                          setShowDeleteModal(true);
                        }}
                        className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-white/[0.06] transition-colors"
                        title={common('delete')}
                      >
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingPosition ? t('editPosition') : t('newPosition')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              {common('cancel')}
            </Button>
            <Button
              onClick={handleSave}
              isLoading={isSaving}
              disabled={!formData.code.trim() || !formData.name.trim() || !formData.hierarchyGroup}
            >
              {common('save')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label={t('code')}
            placeholder={t('codePlaceholder')}
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            required
            disabled={!!editingPosition}
          />
          <Input
            label={t('name')}
            placeholder={t('namePlaceholder')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm text-white/60 mb-2">{t('hierarchyGroup')} *</label>
            <select
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white focus:border-gold/50 focus:bg-white/[0.06] focus:outline-none transition-all"
              value={formData.hierarchyGroup}
              onChange={(e) => setFormData({ ...formData, hierarchyGroup: e.target.value })}
              required
            >
              <option value="">{t('selectGroup')}</option>
              {HIERARCHY_GROUPS.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-2">{t('description')}</label>
            <textarea
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/30 focus:border-gold/50 focus:bg-white/[0.06] focus:outline-none transition-all resize-none"
              rows={3}
              placeholder={t('descriptionPlaceholder')}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t('deletePosition')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              {common('cancel')}
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              {common('delete')}
            </Button>
          </>
        }
      >
        <p className="text-white/60">{t('deleteConfirm')}</p>
      </Modal>
    </div>
  );
}
