'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Card, Modal, Input } from '@/components/ui';
import { PlusIcon, EditIcon, TrashIcon, BriefcaseIcon } from '@/components/icons';
import { Position, CreatePositionDto, UpdatePositionDto } from '@/types/settings';
import { positionsService } from '@/services/settings.service';

// Hierarchy groups catalog
const HIERARCHY_GROUPS = [
  { id: 'DIRETORIA', name: 'Diretoria', displayOrder: 1 },
  { id: 'COORDENACAO', name: 'Coordenação', displayOrder: 2 },
  { id: 'CONSELHO', name: 'Conselho', displayOrder: 3 },
  { id: 'COMITE', name: 'Comitê', displayOrder: 4 },
  { id: 'OUTROS', name: 'Outros', displayOrder: 5 },
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
      setPositions(mockPositions);
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

  const getGroupLabel = (groupId: string) => {
    const group = HIERARCHY_GROUPS.find((g) => g.id === groupId);
    return group?.name || groupId;
  };

  const openCreateModal = () => {
    setEditingPosition(null);
    setFormData({ name: '', hierarchyGroup: '', description: '' });
    setShowModal(true);
  };

  const openEditModal = (position: Position) => {
    setEditingPosition(position);
    setFormData({
      name: position.name,
      hierarchyGroup: position.hierarchyGroup,
      description: position.description || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.hierarchyGroup) return;

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
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingPosition) return;

    try {
      await positionsService.delete(deletingPosition.id);
      loadPositions();
      setShowDeleteModal(false);
      setDeletingPosition(null);
    } catch (error) {
      console.error('Failed to delete position:', error);
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
            className="px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white focus:border-gold/50 focus:outline-none transition-all"
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
          >
            <option value="">{t('allGroups')}</option>
            {HIERARCHY_GROUPS.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
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
                {[1, 2].map((j) => (
                  <div key={j} className="h-24 bg-white/[0.02] rounded-xl animate-pulse" />
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
              <h2 className="text-lg font-medium text-text-primary mb-4">{group.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedPositions[group.id].map((position) => (
                  <Card key={position.id} padding="lg" hover>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gold/10 rounded-lg">
                          <BriefcaseIcon size={20} className="text-gold" />
                        </div>
                        <div>
                          <h3 className="font-medium text-text-primary">{position.name}</h3>
                          {position.description && (
                            <p className="text-sm text-text-muted mt-1 line-clamp-2">
                              {position.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(position)}
                          className="p-2 rounded-lg text-text-muted hover:text-gold hover:bg-background-hover transition-colors"
                          title={common('edit')}
                        >
                          <EditIcon size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingPosition(position);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-background-hover transition-colors"
                          title={common('delete')}
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </div>
                  </Card>
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
            <Button onClick={handleSave} isLoading={isSaving}>
              {common('save')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label={t('name')}
            placeholder={t('namePlaceholder')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm text-white/60 mb-2">{t('hierarchyGroup')}</label>
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

// Mock data
const mockPositions: Position[] = [
  {
    id: '1',
    tenantId: 'demo',
    name: 'Presidente',
    hierarchyGroup: 'DIRETORIA',
    description: 'Responsável pela liderança geral do clube',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    tenantId: 'demo',
    name: 'Vice-Presidente',
    hierarchyGroup: 'DIRETORIA',
    description: 'Substituto do presidente em suas ausências',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    tenantId: 'demo',
    name: 'Diretor Financeiro',
    hierarchyGroup: 'DIRETORIA',
    description: 'Responsável pelas finanças do clube',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    tenantId: 'demo',
    name: 'Coordenador de Eventos',
    hierarchyGroup: 'COORDENACAO',
    description: 'Coordena a organização de eventos',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '5',
    tenantId: 'demo',
    name: 'Coordenador de Marketing',
    hierarchyGroup: 'COORDENACAO',
    description: 'Responsável pelo marketing e comunicação',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '6',
    tenantId: 'demo',
    name: 'Conselheiro',
    hierarchyGroup: 'CONSELHO',
    description: 'Membro do conselho consultivo',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];
