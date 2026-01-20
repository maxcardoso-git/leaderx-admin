'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Card, Modal, Input } from '@/components/ui';
import { PlusIcon, EditIcon, TrashIcon, LayersIcon, CheckIcon } from '@/components/icons';
import { Line, CreateLineDto, UpdateLineDto, EVENT_BLOCKS_CATALOG } from '@/types/settings';
import { linesService } from '@/services/settings.service';

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
    eventBlocks: {},
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
      setLines(mockLines);
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
    setFormData({ name: '', description: '', eventBlocks: initialBlocks });
    setShowModal(true);
  };

  const openEditModal = (line: Line) => {
    setEditingLine(line);
    const blocks: Record<string, boolean> = {};
    EVENT_BLOCKS_CATALOG.forEach((block) => {
      blocks[block.key] = line.eventBlocks?.[block.key] ?? false;
    });
    setFormData({
      name: line.name,
      description: line.description || '',
      eventBlocks: blocks,
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

  const toggleEventBlock = (blockKey: string) => {
    setFormData({
      ...formData,
      eventBlocks: {
        ...formData.eventBlocks,
        [blockKey]: !formData.eventBlocks?.[blockKey],
      },
    });
  };

  const getEnabledBlocksCount = (line: Line) => {
    if (!line.eventBlocks) return 0;
    return Object.values(line.eventBlocks).filter(Boolean).length;
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-text-primary">{t('title')}</h1>
          <p className="text-sm text-text-muted" style={{ marginTop: '8px' }}>{t('subtitle')}</p>
        </div>
        <Button leftIcon={<PlusIcon size={18} />} onClick={openCreateModal}>
          {t('newLine')}
        </Button>
      </div>

      {/* Lines Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-white/[0.02] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : lines.length === 0 ? (
        <Card padding="xl">
          <div className="text-center py-12">
            <LayersIcon size={48} className="mx-auto text-white/20 mb-4" />
            <p className="text-text-muted">{t('noLines')}</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lines.map((line) => (
            <Card key={line.id} padding="lg" hover>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gold/10 rounded-lg">
                    <LayersIcon size={20} className="text-gold" />
                  </div>
                  <div>
                    <h3 className="font-medium text-text-primary">{line.name}</h3>
                    {line.description && (
                      <p className="text-sm text-text-muted mt-1 line-clamp-2">
                        {line.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(line)}
                    className="p-2 rounded-lg text-text-muted hover:text-gold hover:bg-background-hover transition-colors"
                    title={common('edit')}
                  >
                    <EditIcon size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setDeletingLine(line);
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
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>{t('enabledBlocks')}</span>
                  <span className="text-gold font-medium">
                    {getEnabledBlocksCount(line)} / {EVENT_BLOCKS_CATALOG.length}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {EVENT_BLOCKS_CATALOG.filter((block) => line.eventBlocks?.[block.key]).map(
                    (block) => (
                      <span
                        key={block.key}
                        className="px-2 py-0.5 text-xs bg-gold/10 text-gold rounded"
                      >
                        {block.label}
                      </span>
                    )
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
            <Button onClick={handleSave} isLoading={isSaving}>
              {common('save')}
            </Button>
          </>
        }
      >
        <div className="space-y-6">
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

          {/* Event Blocks Toggle Matrix */}
          <div>
            <label className="block text-sm text-white/60 mb-4">{t('eventBlocks')}</label>
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
                        onClick={() => toggleEventBlock(block.key)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all text-left ${
                          formData.eventBlocks?.[block.key]
                            ? 'bg-gold/10 border-gold/30 text-white'
                            : 'bg-white/[0.02] border-white/[0.08] text-text-muted hover:border-white/20'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                            formData.eventBlocks?.[block.key]
                              ? 'bg-gold text-black'
                              : 'bg-white/10'
                          }`}
                        >
                          {formData.eventBlocks?.[block.key] && <CheckIcon size={14} />}
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

// Mock data
const mockLines: Line[] = [
  {
    id: '1',
    tenantId: 'demo',
    name: 'Linha Premium',
    description: 'Eventos de alto padrão com todos os recursos disponíveis',
    eventBlocks: {
      INFORMACOES_BASICAS: true,
      DATAS_E_HORARIOS: true,
      LOCAL_E_ESTACIONAMENTO: true,
      PARTICIPANTES: true,
      ANFITRIAO: true,
      MESAS_ENGAJAMENTO: true,
      PROGRAMACAO: true,
      INGRESSOS: true,
      HOSPITALIDADE: true,
      FORNECEDORES: true,
      VIABILIDADE: true,
      CAMPANHAS: true,
      RESUMO_FINANCEIRO: true,
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    tenantId: 'demo',
    name: 'Linha Básica',
    description: 'Eventos simples com recursos essenciais',
    eventBlocks: {
      INFORMACOES_BASICAS: true,
      DATAS_E_HORARIOS: true,
      LOCAL_E_ESTACIONAMENTO: true,
      PARTICIPANTES: true,
      INGRESSOS: true,
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    tenantId: 'demo',
    name: 'Linha Corporativa',
    description: 'Eventos corporativos com foco em networking',
    eventBlocks: {
      INFORMACOES_BASICAS: true,
      DATAS_E_HORARIOS: true,
      LOCAL_E_ESTACIONAMENTO: true,
      PARTICIPANTES: true,
      ANFITRIAO: true,
      MESAS_ENGAJAMENTO: true,
      PROGRAMACAO: true,
      HOSPITALIDADE: true,
      FORNECEDORES: true,
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];
