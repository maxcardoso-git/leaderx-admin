'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Card, Modal, Input } from '@/components/ui';
import { PlusIcon, EditIcon, TrashIcon, CubeIcon } from '@/components/icons';
import { Segment, CreateSegmentDto, UpdateSegmentDto } from '@/types/settings';
import { segmentsService } from '@/services/settings.service';

export default function SegmentsPage() {
  const t = useTranslations('systemSettings.segments');
  const common = useTranslations('common');

  const [segments, setSegments] = useState<Segment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingSegment, setDeletingSegment] = useState<Segment | null>(null);

  const [formData, setFormData] = useState<CreateSegmentDto>({
    name: '',
    description: '',
  });

  useEffect(() => {
    loadSegments();
  }, []);

  const loadSegments = async () => {
    setIsLoading(true);
    try {
      const data = await segmentsService.list();
      setSegments(data.items);
    } catch (error) {
      console.error('Failed to load segments:', error);
      setSegments(mockSegments);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingSegment(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  const openEditModal = (segment: Segment) => {
    setEditingSegment(segment);
    setFormData({ name: segment.name, description: segment.description || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    setIsSaving(true);
    try {
      if (editingSegment) {
        await segmentsService.update(editingSegment.id, formData as UpdateSegmentDto);
      } else {
        await segmentsService.create(formData);
      }
      loadSegments();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save segment:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSegment) return;

    try {
      await segmentsService.delete(deletingSegment.id);
      loadSegments();
      setShowDeleteModal(false);
      setDeletingSegment(null);
    } catch (error) {
      console.error('Failed to delete segment:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-text-primary">{t('title')}</h1>
          <p className="text-sm text-text-muted mt-1">{t('subtitle')}</p>
        </div>
        <Button leftIcon={<PlusIcon size={18} />} onClick={openCreateModal}>
          {t('newSegment')}
        </Button>
      </div>

      {/* Segments Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white/[0.02] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : segments.length === 0 ? (
        <Card padding="xl">
          <div className="text-center py-12">
            <CubeIcon size={48} className="mx-auto text-white/20 mb-4" />
            <p className="text-text-muted">{t('noSegments')}</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {segments.map((segment) => (
            <Card key={segment.id} padding="lg" hover>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gold/10 rounded-lg">
                    <CubeIcon size={20} className="text-gold" />
                  </div>
                  <div>
                    <h3 className="font-medium text-text-primary">{segment.name}</h3>
                    {segment.description && (
                      <p className="text-sm text-text-muted mt-1 line-clamp-2">
                        {segment.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(segment)}
                    className="p-2 rounded-lg text-text-muted hover:text-gold hover:bg-background-hover transition-colors"
                    title={common('edit')}
                  >
                    <EditIcon size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setDeletingSegment(segment);
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
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingSegment ? t('editSegment') : t('newSegment')}
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
        title={t('deleteSegment')}
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
const mockSegments: Segment[] = [
  {
    id: '1',
    tenantId: 'demo',
    name: 'Alimenticio',
    description: 'Producao, distribuicao e servicos de alimentacao',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    tenantId: 'demo',
    name: 'Tecnologia',
    description: 'Empresas de tecnologia e inovacao',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    tenantId: 'demo',
    name: 'Saude',
    description: 'Hospitais, clinicas e servicos de saude',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    tenantId: 'demo',
    name: 'Educacao',
    description: 'Instituicoes de ensino e educacao',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];
