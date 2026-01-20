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
      setPositions(data.items.length > 0 ? data.items : mockPositions);
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

  const getGroupCount = (groupId: string) => {
    return positions.filter((p) => p.hierarchyGroup === groupId).length;
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
                    className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:bg-white/[0.04] hover:border-white/[0.1] transition-all group"
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

// Mock data matching the user's requirements
const mockPositions: Position[] = [
  // C-Level Executivo (8 cargos)
  { id: 'pos-1', tenantId: 'demo', name: 'CEO (Chief Executive Officer)', hierarchyGroup: 'C_LEVEL', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-2', tenantId: 'demo', name: 'Country Director', hierarchyGroup: 'C_LEVEL', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-3', tenantId: 'demo', name: 'Country President', hierarchyGroup: 'C_LEVEL', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-4', tenantId: 'demo', name: 'Empresário', hierarchyGroup: 'C_LEVEL', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-5', tenantId: 'demo', name: 'General Director', hierarchyGroup: 'C_LEVEL', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-6', tenantId: 'demo', name: 'Managing Director', hierarchyGroup: 'C_LEVEL', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-7', tenantId: 'demo', name: 'Presidente', hierarchyGroup: 'C_LEVEL', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-8', tenantId: 'demo', name: 'Sócio Fundador', hierarchyGroup: 'C_LEVEL', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },

  // C-Suite Officers (14 cargos)
  { id: 'pos-9', tenantId: 'demo', name: 'CCO (Chief Commercial Officer)', hierarchyGroup: 'C_SUITE', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-10', tenantId: 'demo', name: 'CDO (Chief Data Officer)', hierarchyGroup: 'C_SUITE', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-11', tenantId: 'demo', name: 'CFO (Chief Financial Officer)', hierarchyGroup: 'C_SUITE', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-12', tenantId: 'demo', name: 'CHRO (Chief Human Resources Off...', hierarchyGroup: 'C_SUITE', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-13', tenantId: 'demo', name: 'CIO (Chief Information Officer)', hierarchyGroup: 'C_SUITE', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-14', tenantId: 'demo', name: 'CISO (Chief Information Security O...', hierarchyGroup: 'C_SUITE', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-15', tenantId: 'demo', name: 'CLO (Chief Legal Officer)', hierarchyGroup: 'C_SUITE', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-16', tenantId: 'demo', name: 'CMO (Chief Marketing Officer)', hierarchyGroup: 'C_SUITE', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-17', tenantId: 'demo', name: 'COO (Chief Operating Officer)', hierarchyGroup: 'C_SUITE', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-18', tenantId: 'demo', name: 'CPO (Chief Product Officer)', hierarchyGroup: 'C_SUITE', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-19', tenantId: 'demo', name: 'CRO (Chief Revenue Officer)', hierarchyGroup: 'C_SUITE', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-20', tenantId: 'demo', name: 'CSO (Chief Strategy Officer)', hierarchyGroup: 'C_SUITE', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-21', tenantId: 'demo', name: 'CTO (Chief Technology Officer)', hierarchyGroup: 'C_SUITE', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-22', tenantId: 'demo', name: 'CVO - Chief Visionary Officer', hierarchyGroup: 'C_SUITE', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },

  // Vice-Presidência (7 cargos)
  { id: 'pos-23', tenantId: 'demo', name: 'Vice-Presidente Comercial', hierarchyGroup: 'VICE_PRESIDENCIA', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-24', tenantId: 'demo', name: 'Vice-Presidente de Marketing', hierarchyGroup: 'VICE_PRESIDENCIA', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-25', tenantId: 'demo', name: 'Vice-Presidente de Operações', hierarchyGroup: 'VICE_PRESIDENCIA', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-26', tenantId: 'demo', name: 'Vice-Presidente de RH', hierarchyGroup: 'VICE_PRESIDENCIA', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-27', tenantId: 'demo', name: 'Vice-Presidente de Tecnologia', hierarchyGroup: 'VICE_PRESIDENCIA', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-28', tenantId: 'demo', name: 'Vice-Presidente Executivo', hierarchyGroup: 'VICE_PRESIDENCIA', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-29', tenantId: 'demo', name: 'Vice-Presidente Financeiro', hierarchyGroup: 'VICE_PRESIDENCIA', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },

  // Diretoria (13 cargos)
  { id: 'pos-30', tenantId: 'demo', name: 'Diretor Comercial', hierarchyGroup: 'DIRETORIA', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-31', tenantId: 'demo', name: 'Diretor de Inovação', hierarchyGroup: 'DIRETORIA', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-32', tenantId: 'demo', name: 'Diretor de Marketing', hierarchyGroup: 'DIRETORIA', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-33', tenantId: 'demo', name: 'Diretor de Operações', hierarchyGroup: 'DIRETORIA', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-34', tenantId: 'demo', name: 'Diretor de Produtos', hierarchyGroup: 'DIRETORIA', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-35', tenantId: 'demo', name: 'Diretor de RH', hierarchyGroup: 'DIRETORIA', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-36', tenantId: 'demo', name: 'Diretor de Supply Chain', hierarchyGroup: 'DIRETORIA', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-37', tenantId: 'demo', name: 'Diretor de Tecnologia', hierarchyGroup: 'DIRETORIA', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-38', tenantId: 'demo', name: 'Diretor de Vendas', hierarchyGroup: 'DIRETORIA', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-39', tenantId: 'demo', name: 'Diretor Executivo', hierarchyGroup: 'DIRETORIA', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-40', tenantId: 'demo', name: 'Diretor Financeiro', hierarchyGroup: 'DIRETORIA', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-41', tenantId: 'demo', name: 'Diretor Geral', hierarchyGroup: 'DIRETORIA', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-42', tenantId: 'demo', name: 'Diretor Jurídico', hierarchyGroup: 'DIRETORIA', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },

  // Gerência (12 cargos)
  { id: 'pos-43', tenantId: 'demo', name: 'Gerente', hierarchyGroup: 'GERENCIA', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-44', tenantId: 'demo', name: 'Gerente Comercial', hierarchyGroup: 'GERENCIA', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-45', tenantId: 'demo', name: 'Gerente de Marketing', hierarchyGroup: 'GERENCIA', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-46', tenantId: 'demo', name: 'Gerente de Operações', hierarchyGroup: 'GERENCIA', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-47', tenantId: 'demo', name: 'Gerente de Produto', hierarchyGroup: 'GERENCIA', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-48', tenantId: 'demo', name: 'Gerente de Projetos', hierarchyGroup: 'GERENCIA', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-49', tenantId: 'demo', name: 'Gerente de RH', hierarchyGroup: 'GERENCIA', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-50', tenantId: 'demo', name: 'Gerente de TI', hierarchyGroup: 'GERENCIA', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-51', tenantId: 'demo', name: 'Gerente de Vendas', hierarchyGroup: 'GERENCIA', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-52', tenantId: 'demo', name: 'Gerente Financeiro', hierarchyGroup: 'GERENCIA', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-53', tenantId: 'demo', name: 'Gerente Geral', hierarchyGroup: 'GERENCIA', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-54', tenantId: 'demo', name: 'Gerente Sênior', hierarchyGroup: 'GERENCIA', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },

  // Coordenação (8 cargos)
  { id: 'pos-55', tenantId: 'demo', name: 'Coordenador', hierarchyGroup: 'COORDENACAO', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-56', tenantId: 'demo', name: 'Coordenador Administrativo', hierarchyGroup: 'COORDENACAO', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-57', tenantId: 'demo', name: 'Coordenador de Marketing', hierarchyGroup: 'COORDENACAO', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-58', tenantId: 'demo', name: 'Coordenador de Projetos', hierarchyGroup: 'COORDENACAO', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-59', tenantId: 'demo', name: 'Coordenador de RH', hierarchyGroup: 'COORDENACAO', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-60', tenantId: 'demo', name: 'Coordenador de TI', hierarchyGroup: 'COORDENACAO', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-61', tenantId: 'demo', name: 'Coordenador de Vendas', hierarchyGroup: 'COORDENACAO', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-62', tenantId: 'demo', name: 'Coordenador Financeiro', hierarchyGroup: 'COORDENACAO', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },

  // Supervisão (6 cargos)
  { id: 'pos-63', tenantId: 'demo', name: 'Supervisor', hierarchyGroup: 'SUPERVISAO', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-64', tenantId: 'demo', name: 'Supervisor Administrativo', hierarchyGroup: 'SUPERVISAO', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-65', tenantId: 'demo', name: 'Supervisor de Operações', hierarchyGroup: 'SUPERVISAO', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-66', tenantId: 'demo', name: 'Supervisor de Produção', hierarchyGroup: 'SUPERVISAO', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-67', tenantId: 'demo', name: 'Supervisor de Qualidade', hierarchyGroup: 'SUPERVISAO', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-68', tenantId: 'demo', name: 'Supervisor de Vendas', hierarchyGroup: 'SUPERVISAO', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },

  // Operacional (10 cargos)
  { id: 'pos-69', tenantId: 'demo', name: 'Analista', hierarchyGroup: 'OPERACIONAL', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-70', tenantId: 'demo', name: 'Analista Júnior', hierarchyGroup: 'OPERACIONAL', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-71', tenantId: 'demo', name: 'Analista Pleno', hierarchyGroup: 'OPERACIONAL', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-72', tenantId: 'demo', name: 'Analista Sênior', hierarchyGroup: 'OPERACIONAL', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-73', tenantId: 'demo', name: 'Assistente', hierarchyGroup: 'OPERACIONAL', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-74', tenantId: 'demo', name: 'Auxiliar', hierarchyGroup: 'OPERACIONAL', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-75', tenantId: 'demo', name: 'Consultor', hierarchyGroup: 'OPERACIONAL', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-76', tenantId: 'demo', name: 'Especialista', hierarchyGroup: 'OPERACIONAL', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-77', tenantId: 'demo', name: 'Estagiário', hierarchyGroup: 'OPERACIONAL', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'pos-78', tenantId: 'demo', name: 'Trainee', hierarchyGroup: 'OPERACIONAL', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
];
