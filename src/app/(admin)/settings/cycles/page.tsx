'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Card, Modal, Input } from '@/components/ui';
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  RefreshIcon,
  CheckIcon,
  StarIcon,
} from '@/components/icons';
import {
  Cycle,
  CreateCycleDto,
  UpdateCycleDto,
  CYCLE_PHASES_CATALOG,
  CYCLE_BLOCKS_CATALOG,
} from '@/types/settings';
import { cyclesService } from '@/services/settings.service';

export default function CyclesPage() {
  const t = useTranslations('systemSettings.cycles');
  const common = useTranslations('common');

  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCycle, setEditingCycle] = useState<Cycle | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCycle, setDeletingCycle] = useState<Cycle | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<string>(CYCLE_PHASES_CATALOG[0]?.key || '');

  const [formData, setFormData] = useState<CreateCycleDto>({
    name: '',
    description: '',
    isDefault: false,
    phaseBlocks: {},
  });

  useEffect(() => {
    loadCycles();
  }, []);

  const loadCycles = async () => {
    setIsLoading(true);
    try {
      const data = await cyclesService.list();
      setCycles(data.items);
    } catch (error) {
      console.error('Failed to load cycles:', error);
      setCycles(mockCycles);
    } finally {
      setIsLoading(false);
    }
  };

  const initializePhaseBlocks = (): Record<string, Record<string, boolean>> => {
    const phaseBlocks: Record<string, Record<string, boolean>> = {};
    CYCLE_PHASES_CATALOG.forEach((phase) => {
      phaseBlocks[phase.key] = {};
      CYCLE_BLOCKS_CATALOG.forEach((block) => {
        phaseBlocks[phase.key][block.key] = false;
      });
    });
    return phaseBlocks;
  };

  const openCreateModal = () => {
    setEditingCycle(null);
    setFormData({
      name: '',
      description: '',
      isDefault: false,
      phaseBlocks: initializePhaseBlocks(),
    });
    setSelectedPhase(CYCLE_PHASES_CATALOG[0]?.key || '');
    setShowModal(true);
  };

  const openEditModal = (cycle: Cycle) => {
    setEditingCycle(cycle);
    const phaseBlocks = initializePhaseBlocks();
    // Merge existing data
    if (cycle.phaseBlocks) {
      Object.keys(cycle.phaseBlocks).forEach((phaseKey) => {
        if (phaseBlocks[phaseKey]) {
          Object.keys(cycle.phaseBlocks![phaseKey]).forEach((blockKey) => {
            if (phaseBlocks[phaseKey][blockKey] !== undefined) {
              phaseBlocks[phaseKey][blockKey] = cycle.phaseBlocks![phaseKey][blockKey];
            }
          });
        }
      });
    }
    setFormData({
      name: cycle.name,
      description: cycle.description || '',
      isDefault: cycle.isDefault,
      phaseBlocks,
    });
    setSelectedPhase(CYCLE_PHASES_CATALOG[0]?.key || '');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    setIsSaving(true);
    try {
      if (editingCycle) {
        await cyclesService.update(editingCycle.id, formData as UpdateCycleDto);
      } else {
        await cyclesService.create(formData);
      }
      loadCycles();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save cycle:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCycle) return;

    try {
      await cyclesService.delete(deletingCycle.id);
      loadCycles();
      setShowDeleteModal(false);
      setDeletingCycle(null);
    } catch (error) {
      console.error('Failed to delete cycle:', error);
    }
  };

  const toggleBlock = (phaseKey: string, blockKey: string) => {
    setFormData({
      ...formData,
      phaseBlocks: {
        ...formData.phaseBlocks,
        [phaseKey]: {
          ...formData.phaseBlocks?.[phaseKey],
          [blockKey]: !formData.phaseBlocks?.[phaseKey]?.[blockKey],
        },
      },
    });
  };

  const getEnabledBlocksCount = (cycle: Cycle, phaseKey: string) => {
    if (!cycle.phaseBlocks?.[phaseKey]) return 0;
    return Object.values(cycle.phaseBlocks[phaseKey]).filter(Boolean).length;
  };

  const getTotalEnabledBlocks = (cycle: Cycle) => {
    if (!cycle.phaseBlocks) return 0;
    let total = 0;
    Object.keys(cycle.phaseBlocks).forEach((phaseKey) => {
      total += Object.values(cycle.phaseBlocks![phaseKey]).filter(Boolean).length;
    });
    return total;
  };

  // Group blocks by group
  const groupedBlocks = useMemo(() => {
    return CYCLE_BLOCKS_CATALOG.reduce(
      (acc, block) => {
        const group = block.group || 'Outros';
        if (!acc[group]) {
          acc[group] = [];
        }
        acc[group].push(block);
        return acc;
      },
      {} as Record<string, typeof CYCLE_BLOCKS_CATALOG>
    );
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-text-primary">{t('title')}</h1>
          <p className="text-sm text-text-muted" style={{ marginTop: '8px' }}>{t('subtitle')}</p>
        </div>
        <Button leftIcon={<PlusIcon size={18} />} onClick={openCreateModal}>
          {t('newCycle')}
        </Button>
      </div>

      {/* Cycles Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-white/[0.02] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : cycles.length === 0 ? (
        <Card padding="xl">
          <div className="text-center py-12">
            <RefreshIcon size={48} className="mx-auto text-white/20 mb-4" />
            <p className="text-text-muted">{t('noCycles')}</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {cycles.map((cycle) => (
            <Card key={cycle.id} padding="lg" hover>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gold/10 rounded-lg">
                    <RefreshIcon size={20} className="text-gold" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-text-primary">{cycle.name}</h3>
                      {cycle.isDefault && (
                        <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-gold/20 text-gold rounded">
                          <StarIcon size={12} />
                          {t('default')}
                        </span>
                      )}
                    </div>
                    {cycle.description && (
                      <p className="text-sm text-text-muted mt-1 line-clamp-2">
                        {cycle.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(cycle)}
                    className="p-2 rounded-lg text-text-muted hover:text-gold hover:bg-background-hover transition-colors"
                    title={common('edit')}
                  >
                    <EditIcon size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setDeletingCycle(cycle);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-background-hover transition-colors"
                    title={common('delete')}
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-xs text-text-muted mb-3">
                  <span>{t('phasesConfiguration')}</span>
                  <span className="text-gold font-medium">
                    {getTotalEnabledBlocks(cycle)} {t('blocksEnabled')}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {CYCLE_PHASES_CATALOG.slice(0, 4).map((phase) => (
                    <div
                      key={phase.key}
                      className="text-center p-2 bg-white/[0.02] rounded-lg"
                      title={phase.label}
                    >
                      <p className="text-xs text-text-muted truncate">{phase.label}</p>
                      <p className="text-sm font-medium text-gold mt-1">
                        {getEnabledBlocksCount(cycle, phase.key)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCycle ? t('editCycle') : t('newCycle')}
        size="xl"
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
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('name')}
              placeholder={t('namePlaceholder')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                    formData.isDefault ? 'bg-gold text-black' : 'bg-white/10 border border-white/20'
                  }`}
                  onClick={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
                >
                  {formData.isDefault && <CheckIcon size={14} />}
                </div>
                <span className="text-sm text-white/60">{t('setAsDefault')}</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">{t('description')}</label>
            <textarea
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/30 focus:border-gold/50 focus:bg-white/[0.06] focus:outline-none transition-all resize-none"
              rows={2}
              placeholder={t('descriptionPlaceholder')}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Phase/Block Matrix */}
          <div>
            <label className="block text-sm text-white/60 mb-4">{t('phaseBlocks')}</label>
            <div className="flex gap-4">
              {/* Phases List */}
              <div className="w-48 flex-shrink-0 space-y-1">
                {CYCLE_PHASES_CATALOG.map((phase) => (
                  <button
                    key={phase.key}
                    type="button"
                    onClick={() => setSelectedPhase(phase.key)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                      selectedPhase === phase.key
                        ? 'bg-gold/10 border border-gold/30 text-white'
                        : 'bg-white/[0.02] border border-transparent text-text-muted hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{phase.label}</span>
                      <span
                        className={`text-xs ${selectedPhase === phase.key ? 'text-gold' : 'text-text-muted'}`}
                      >
                        {
                          Object.values(formData.phaseBlocks?.[phase.key] || {}).filter(Boolean)
                            .length
                        }
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Blocks Grid */}
              <div className="flex-1 bg-white/[0.02] rounded-xl p-4 max-h-[400px] overflow-y-auto">
                <div className="space-y-6">
                  {Object.entries(groupedBlocks).map(([group, blocks]) => (
                    <div key={group}>
                      <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
                        {group}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {blocks.map((block) => (
                          <button
                            key={block.key}
                            type="button"
                            onClick={() => toggleBlock(selectedPhase, block.key)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all text-left ${
                              formData.phaseBlocks?.[selectedPhase]?.[block.key]
                                ? 'bg-gold/10 border-gold/30 text-white'
                                : 'bg-white/[0.02] border-white/[0.08] text-text-muted hover:border-white/20'
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                                formData.phaseBlocks?.[selectedPhase]?.[block.key]
                                  ? 'bg-gold text-black'
                                  : 'bg-white/10'
                              }`}
                            >
                              {formData.phaseBlocks?.[selectedPhase]?.[block.key] && (
                                <CheckIcon size={14} />
                              )}
                            </div>
                            <span className="text-sm">{block.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t('deleteCycle')}
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
const mockCycles: Cycle[] = [
  {
    id: '1',
    tenantId: 'demo',
    name: 'Ciclo Padrão',
    description: 'Ciclo de vida padrão para eventos',
    isDefault: true,
    phaseBlocks: {
      RASCUNHO: { INFORMACOES_BASICAS: true, DATAS_E_HORARIOS: true },
      ESCOPO: {
        INFORMACOES_BASICAS: true,
        DATAS_E_HORARIOS: true,
        LOCAL_E_ESTACIONAMENTO: true,
        PARTICIPANTES: true,
      },
      VISTORIA_PREVISAO: {
        LOCAL_E_ESTACIONAMENTO: true,
        HOSPITALIDADE: true,
        FORNECEDORES: true,
      },
      VIABILIDADE: { VIABILIDADE_FINANCEIRA: true, INGRESSOS: true },
      PLANEJAMENTO: {
        PROGRAMACAO: true,
        ANFITRIAO: true,
        MESAS_ENGAJAMENTO: true,
        CAMPANHAS_MARKETING: true,
      },
      EXECUCAO: { HOSPITALIDADE: true, FORNECEDORES: true },
      CONCLUSAO: { RESUMO_FINANCEIRO: true },
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    tenantId: 'demo',
    name: 'Ciclo Simplificado',
    description: 'Ciclo reduzido para eventos menores',
    isDefault: false,
    phaseBlocks: {
      RASCUNHO: { INFORMACOES_BASICAS: true },
      ESCOPO: { INFORMACOES_BASICAS: true, DATAS_E_HORARIOS: true, LOCAL_E_ESTACIONAMENTO: true },
      PLANEJAMENTO: { PROGRAMACAO: true, PARTICIPANTES: true },
      EXECUCAO: { HOSPITALIDADE: true },
      CONCLUSAO: { RESUMO_FINANCEIRO: true },
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];
