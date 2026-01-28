'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Modal } from '@/components/ui';
import {
  PlusIcon,
  TrashIcon,
  CheckIcon,
  XIcon,
  CopyIcon,
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
  const [selectedCycle, setSelectedCycle] = useState<Cycle | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

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
      // Select first cycle or default
      if (data.items.length > 0) {
        const defaultCycle = data.items.find(c => c.isDefault) || data.items[0];
        selectCycle(defaultCycle);
      }
    } catch (error) {
      console.error('Failed to load cycles:', error);
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

  const selectCycle = (cycle: Cycle) => {
    setSelectedCycle(cycle);
    setIsCreating(false);
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
  };

  const startCreating = () => {
    setSelectedCycle(null);
    setIsCreating(true);
    setFormData({
      name: '',
      description: '',
      isDefault: false,
      phaseBlocks: initializePhaseBlocks(),
    });
  };

  const cloneCycle = async (cycle: Cycle) => {
    try {
      const phaseBlocks = initializePhaseBlocks();
      // Copy existing phaseBlocks
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

      // Create the cloned cycle directly
      await cyclesService.create({
        name: `${cycle.name} (Cópia)`,
        description: cycle.description || '',
        isDefault: false,
        phaseBlocks,
      });

      // Reload and the new cycle will appear in the list
      await loadCycles();
    } catch (error) {
      console.error('Failed to clone cycle:', error);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    setIsSaving(true);
    try {
      if (isCreating) {
        await cyclesService.create(formData);
      } else if (selectedCycle) {
        await cyclesService.update(selectedCycle.id, formData as UpdateCycleDto);
      }
      await loadCycles();
    } catch (error) {
      console.error('Failed to save cycle:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCycle) return;

    try {
      await cyclesService.delete(selectedCycle.id);
      setShowDeleteModal(false);
      setSelectedCycle(null);
      await loadCycles();
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-text-primary">{t('title')}</h1>
          <p className="text-sm text-text-muted" style={{ marginTop: '4px' }}>{t('subtitle')}</p>
        </div>
        <Button leftIcon={<PlusIcon size={18} />} onClick={startCreating}>
          {t('newCycle')}
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex gap-6" style={{ minHeight: '600px' }}>
        {/* Left Sidebar - Cycles List */}
        <div className="w-64 flex-shrink-0">
          <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
            {t('registeredCycles')}
          </div>
          <div className="space-y-2">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              cycles.map((cycle) => (
                <div
                  key={cycle.id}
                  onClick={() => selectCycle(cycle)}
                  className={`relative w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedCycle?.id === cycle.id && !isCreating
                      ? 'bg-gold/10 border-gold/30'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{cycle.name}</span>
                    {cycle.isDefault && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-gold/20 text-gold rounded">
                        {t('default')}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">
                    {formatDate(cycle.updatedAt || cycle.createdAt)}
                  </div>
                  {/* Action buttons */}
                  <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        cloneCycle(cycle);
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-[11px] text-gray-500 hover:text-gold hover:bg-gold/10 rounded transition-colors"
                      title="Clonar ciclo"
                    >
                      <CopyIcon size={12} />
                      Clonar
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        selectCycle(cycle);
                        setShowDeleteModal(true);
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-[11px] text-gray-500 hover:text-error hover:bg-error/10 rounded transition-colors"
                      title="Excluir ciclo"
                    >
                      <TrashIcon size={12} />
                      Excluir
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Form + Matrix */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          {(selectedCycle || isCreating) ? (
            <div className="space-y-6">
              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    {t('name')} <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:border-gold focus:ring-2 focus:ring-gold/15 focus:outline-none transition-all"
                    placeholder={t('namePlaceholder')}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">{t('description')}</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:border-gold focus:ring-2 focus:ring-gold/15 focus:outline-none transition-all"
                    placeholder={t('descriptionPlaceholder')}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              {/* Default Toggle */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-900">{t('setAsDefault')}</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    formData.isDefault ? 'bg-gold' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                      formData.isDefault ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Phase Blocks Matrix */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm text-gray-600">{t('phaseBlocks')}</label>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-4 h-4 bg-emerald-500/20 border border-emerald-500/30 rounded flex items-center justify-center">
                        <CheckIcon size={10} className="text-emerald-500" />
                      </span>
                      {t('enabled')}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-4 h-4 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                        <XIcon size={10} className="text-gray-400" />
                      </span>
                      {t('disabled')}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider p-3 bg-gray-50 border border-gray-200 min-w-[180px]">
                          {t('block')}
                        </th>
                        {CYCLE_PHASES_CATALOG.map((phase) => (
                          <th
                            key={phase.key}
                            className="text-center text-xs font-medium text-gray-500 p-3 bg-gray-50 border border-gray-200 min-w-[80px]"
                          >
                            <div className="whitespace-nowrap">{phase.label}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {CYCLE_BLOCKS_CATALOG.map((block) => (
                        <tr key={block.key} className="hover:bg-gray-50">
                          <td className="p-3 border border-gray-200 bg-white">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-300 cursor-move">⋮⋮</span>
                              <div>
                                <div className="text-sm text-gray-900">{block.label}</div>
                                <div className="text-[10px] text-gray-500">{block.group}</div>
                              </div>
                            </div>
                          </td>
                          {CYCLE_PHASES_CATALOG.map((phase) => (
                            <td
                              key={phase.key}
                              className="p-3 border border-gray-200 text-center bg-white"
                            >
                              <button
                                type="button"
                                onClick={() => toggleBlock(phase.key, block.key)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-all ${
                                  formData.phaseBlocks?.[phase.key]?.[block.key]
                                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-500'
                                    : 'bg-gray-100 border border-gray-200 text-gray-400 hover:border-gray-300'
                                }`}
                              >
                                {formData.phaseBlocks?.[phase.key]?.[block.key] ? (
                                  <CheckIcon size={16} />
                                ) : (
                                  <XIcon size={16} />
                                )}
                              </button>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button onClick={handleSave} isLoading={isSaving} disabled={!formData.name.trim()}>
                  {t('saveChanges')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              {t('selectCycle')}
            </div>
          )}
        </div>
      </div>

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
        <p className="text-gray-600">{t('deleteConfirm')}</p>
      </Modal>
    </div>
  );
}
