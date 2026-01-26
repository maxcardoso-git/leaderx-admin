'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Card, Modal, Input } from '@/components/ui';
import { PlusIcon, EditIcon, TrashIcon, LayersIcon } from '@/components/icons';
import { Line, CreateLineDto, UpdateLineDto, EVENT_BLOCKS_CATALOG } from '@/types/settings';
import { linesService } from '@/services/settings.service';

// Toggle Switch Component
function ToggleSwitch({
  checked,
  onChange,
  label
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center justify-between w-full px-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] rounded-xl transition-all group"
    >
      <span className={`text-sm transition-colors ${checked ? 'text-white' : 'text-white/50'}`}>
        {label}
      </span>
      <div
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? 'bg-gold' : 'bg-white/10'
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
            checked ? 'left-6' : 'left-1'
          }`}
        />
      </div>
    </button>
  );
}

export default function LinesPage() {
  const t = useTranslations('systemSettings.lines');
  const common = useTranslations('common');

  const [lines, setLines] = useState<Line[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLine, setEditingLine] = useState<Line | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingLine, setDeletingLine] = useState<Line | null>(null);

  const [formData, setFormData] = useState<CreateLineDto>({
    name: '',
    description: '',
    allowedBlocks: {},
  });

  useEffect(() => {
    loadLines();
  }, []);

  const loadLines = async () => {
    setIsLoading(true);
    try {
      const data = await linesService.list();
      setLines(data.items);
    } catch (error) {
      console.error('Failed to load lines:', error);
      setLines([]);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingLine(null);
    const initialBlocks: Record<string, boolean> = {};
    EVENT_BLOCKS_CATALOG.forEach((block) => {
      initialBlocks[block.key] = false;
    });
    setFormData({ name: '', description: '', allowedBlocks: initialBlocks });
    setShowModal(true);
  };

  const openEditModal = (line: Line) => {
    setEditingLine(line);
    const blocks: Record<string, boolean> = {};
    EVENT_BLOCKS_CATALOG.forEach((block) => {
      blocks[block.key] = line.allowedBlocks?.[block.key] ?? false;
    });
    setFormData({
      name: line.name,
      description: line.description || '',
      allowedBlocks: blocks,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    setIsSaving(true);
    try {
      if (editingLine) {
        await linesService.update(editingLine.id, formData as UpdateLineDto);
      } else {
        await linesService.create(formData);
      }
      loadLines();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save line:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingLine) return;

    try {
      await linesService.delete(deletingLine.id);
      loadLines();
      setShowDeleteModal(false);
      setDeletingLine(null);
    } catch (error) {
      console.error('Failed to delete line:', error);
    }
  };

  const toggleBlock = (blockKey: string) => {
    setFormData({
      ...formData,
      allowedBlocks: {
        ...formData.allowedBlocks,
        [blockKey]: !formData.allowedBlocks?.[blockKey],
      },
    });
  };

  const toggleAllBlocks = (enabled: boolean) => {
    const newBlocks: Record<string, boolean> = {};
    EVENT_BLOCKS_CATALOG.forEach((block) => {
      newBlocks[block.key] = enabled;
    });
    setFormData({
      ...formData,
      allowedBlocks: newBlocks,
    });
  };

  const allBlocksEnabled = EVENT_BLOCKS_CATALOG.every(
    (block) => formData.allowedBlocks?.[block.key]
  );

  const getEnabledBlocksCount = (line: Line) => {
    if (!line.allowedBlocks) return 0;
    return Object.values(line.allowedBlocks).filter(Boolean).length;
  };

  // Group blocks by subLabel
  const groupedBlocks = EVENT_BLOCKS_CATALOG.reduce(
    (acc, block) => {
      const group = block.subLabel || 'Outros';
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(block);
      return acc;
    },
    {} as Record<string, typeof EVENT_BLOCKS_CATALOG>
  );

  // Define group colors for visual distinction
  const groupColors: Record<string, string> = {
    'Essencial': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Configuração': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'Comercial': 'bg-green-500/10 text-green-400 border-green-500/20',
    'Operacional': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'Financeiro': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Marketing': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-text-primary">{t('title')}</h1>
          <p className="text-sm text-text-muted mt-2">{t('subtitle')}</p>
        </div>
        <Button leftIcon={<PlusIcon size={18} />} onClick={openCreateModal}>
          {t('newLine')}
        </Button>
      </div>

      {/* Lines Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-white/[0.02] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : lines.length === 0 ? (
        <Card padding="xl">
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.04] flex items-center justify-center">
              <LayersIcon size={32} className="text-white/20" />
            </div>
            <h3 className="text-lg font-medium text-white/80 mb-2">{t('noLines')}</h3>
            <p className="text-sm text-text-muted mb-6">Crie uma linha para configurar os blocos permitidos em eventos</p>
            <Button leftIcon={<PlusIcon size={18} />} onClick={openCreateModal}>
              {t('newLine')}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lines.map((line) => (
            <Card key={line.id} padding="none" hover className="overflow-hidden">
              {/* Card Header */}
              <div className="p-5 border-b border-white/[0.06]">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
                      <LayersIcon size={20} className="text-gold" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{line.name}</h3>
                      <p className="text-xs text-text-muted mt-0.5">
                        {getEnabledBlocksCount(line)} blocos ativos
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(line)}
                      className="p-2 rounded-lg text-white/40 hover:text-gold hover:bg-white/[0.04] transition-all"
                      title={common('edit')}
                    >
                      <EditIcon size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingLine(line);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/[0.04] transition-all"
                      title={common('delete')}
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </div>
                {line.description && (
                  <p className="text-sm text-text-muted mt-3 line-clamp-2">
                    {line.description}
                  </p>
                )}
              </div>

              {/* Card Body - Enabled Blocks */}
              <div className="p-4 bg-white/[0.01]">
                <div className="flex flex-wrap gap-1.5">
                  {EVENT_BLOCKS_CATALOG.filter((block) => line.allowedBlocks?.[block.key])
                    .slice(0, 6)
                    .map((block) => (
                      <span
                        key={block.key}
                        className={`px-2 py-1 text-xs rounded-md border ${
                          groupColors[block.subLabel || 'Outros'] || 'bg-white/5 text-white/60 border-white/10'
                        }`}
                      >
                        {block.label}
                      </span>
                    ))}
                  {getEnabledBlocksCount(line) > 6 && (
                    <span className="px-2 py-1 text-xs rounded-md bg-white/5 text-white/40 border border-white/10">
                      +{getEnabledBlocksCount(line) - 6}
                    </span>
                  )}
                  {getEnabledBlocksCount(line) === 0 && (
                    <span className="text-xs text-white/30 italic">Nenhum bloco ativo</span>
                  )}
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
        title={editingLine ? t('editLine') : t('newLine')}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              {common('cancel')}
            </Button>
            <Button onClick={handleSave} isLoading={isSaving} disabled={!formData.name.trim()}>
              {common('save')}
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <Input
              label={t('name')}
              placeholder={t('namePlaceholder')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
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
          </div>

          {/* Divider */}
          <div className="border-t border-white/[0.06]" />

          {/* Event Blocks Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-white">{t('eventBlocks')}</h3>
                <p className="text-xs text-white/40 mt-1">
                  {Object.values(formData.allowedBlocks || {}).filter(Boolean).length} de {EVENT_BLOCKS_CATALOG.length} blocos ativos
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleAllBlocks(!allBlocksEnabled)}
                className="text-xs font-medium text-gold hover:text-gold/80 transition-colors px-3 py-1.5 rounded-lg hover:bg-gold/10"
              >
                {allBlocksEnabled ? 'Desmarcar todas' : 'Marcar todas'}
              </button>
            </div>

            {/* Blocks Grid by Category */}
            <div className="space-y-5">
              {Object.entries(groupedBlocks).map(([group, blocks]) => (
                <div key={group} className="rounded-xl border border-white/[0.06] overflow-hidden">
                  {/* Group Header */}
                  <div className={`px-4 py-2.5 border-b border-white/[0.06] ${
                    groupColors[group]?.split(' ')[0] || 'bg-white/[0.02]'
                  }`}>
                    <h4 className={`text-xs font-semibold uppercase tracking-wider ${
                      groupColors[group]?.split(' ')[1] || 'text-white/60'
                    }`}>
                      {group}
                    </h4>
                  </div>

                  {/* Group Blocks */}
                  <div className="p-2 space-y-1 bg-white/[0.01]">
                    {blocks.map((block) => (
                      <ToggleSwitch
                        key={block.key}
                        checked={formData.allowedBlocks?.[block.key] || false}
                        onChange={() => toggleBlock(block.key)}
                        label={block.label}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t('deleteLine')}
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
