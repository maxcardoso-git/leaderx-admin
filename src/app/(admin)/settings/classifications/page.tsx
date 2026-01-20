'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Card, Modal, Input } from '@/components/ui';
import { PlusIcon, EditIcon, TrashIcon, TagIcon } from '@/components/icons';
import { Classification, CreateClassificationDto, UpdateClassificationDto, Category } from '@/types/settings';
import { classificationsService, categoriesService } from '@/services/settings.service';

export default function ClassificationsPage() {
  const t = useTranslations('systemSettings.classifications');
  const common = useTranslations('common');

  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClassification, setEditingClassification] = useState<Classification | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingClassification, setDeletingClassification] = useState<Classification | null>(null);

  const [formData, setFormData] = useState<CreateClassificationDto>({
    name: '',
    description: '',
    categoryId: '',
    badgeColor: '#F59E0B',
    displayOrder: 1,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [classificationsData, categoriesData] = await Promise.all([
        classificationsService.list(),
        categoriesService.list(),
      ]);
      setClassifications(classificationsData.items);
      setCategories(categoriesData.items);
    } catch (error) {
      console.error('Failed to load data:', error);
      setClassifications([]);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || categoryId;
  };

  const openCreateModal = () => {
    setEditingClassification(null);
    setFormData({
      name: '',
      description: '',
      categoryId: categories[0]?.id || '',
      badgeColor: '#F59E0B',
      displayOrder: classifications.length + 1,
    });
    setShowModal(true);
  };

  const openEditModal = (classification: Classification) => {
    setEditingClassification(classification);
    setFormData({
      name: classification.name,
      description: classification.description || '',
      categoryId: classification.categoryId,
      badgeColor: classification.badgeColor,
      displayOrder: classification.displayOrder,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.categoryId) return;

    setIsSaving(true);
    try {
      if (editingClassification) {
        await classificationsService.update(editingClassification.id, formData as UpdateClassificationDto);
      } else {
        await classificationsService.create(formData);
      }
      loadData();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save classification:', error);
      // For demo, update locally
      if (editingClassification) {
        setClassifications((prev) =>
          prev.map((c) =>
            c.id === editingClassification.id
              ? { ...c, ...formData, updatedAt: new Date().toISOString() }
              : c
          )
        );
      } else {
        const newClassification: Classification = {
          id: `class-${Date.now()}`,
          tenantId: 'demo',
          name: formData.name,
          description: formData.description,
          categoryId: formData.categoryId,
          badgeColor: formData.badgeColor,
          displayOrder: formData.displayOrder || classifications.length + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setClassifications((prev) => [...prev, newClassification]);
      }
      setShowModal(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingClassification) return;

    try {
      await classificationsService.delete(deletingClassification.id);
      loadData();
    } catch (error) {
      console.error('Failed to delete classification:', error);
      // For demo, remove locally
      setClassifications((prev) => prev.filter((c) => c.id !== deletingClassification.id));
    } finally {
      setShowDeleteModal(false);
      setDeletingClassification(null);
    }
  };

  // Sort classifications by display order
  const sortedClassifications = [...classifications].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-text-primary">{t('title')}</h1>
          <p className="text-sm text-text-muted" style={{ marginTop: '8px' }}>{t('subtitle')}</p>
        </div>
        <Button leftIcon={<PlusIcon size={18} />} onClick={openCreateModal}>
          {t('newClassification')}
        </Button>
      </div>

      {/* Classifications Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white/[0.02] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : classifications.length === 0 ? (
        <Card padding="xl">
          <div className="text-center py-12">
            <TagIcon size={48} className="mx-auto text-white/20 mb-4" />
            <p className="text-text-muted">{t('noClassifications')}</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedClassifications.map((classification) => (
            <Card key={classification.id} padding="lg" hover>
              <div className="flex flex-col h-full">
                {/* Header with badge and actions */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: classification.badgeColor }}
                    />
                    <h3 className="font-medium text-text-primary">{classification.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(classification)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-gold hover:bg-background-hover transition-colors"
                      title={common('edit')}
                    >
                      <EditIcon size={14} />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingClassification(classification);
                        setShowDeleteModal(true);
                      }}
                      className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-background-hover transition-colors"
                      title={common('delete')}
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {classification.description && (
                  <p className="text-sm text-text-muted mb-3 line-clamp-2">
                    {classification.description}
                  </p>
                )}

                {/* Category Tag */}
                <div className="mt-auto">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.04] border border-white/[0.08] rounded-full text-xs text-text-muted">
                    <TagIcon size={12} />
                    {getCategoryName(classification.categoryId)}
                  </span>
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
        title={editingClassification ? t('editClassification') : t('newClassification')}
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

          <div>
            <label className="block text-sm text-white/60 mb-2">{t('linkedCategory')} *</label>
            <select
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white focus:border-gold/50 focus:bg-white/[0.06] focus:outline-none transition-all"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              required
            >
              <option value="">{t('selectCategory')}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">{t('badgeColor')}</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                className="w-12 h-12 rounded-lg border border-white/[0.08] cursor-pointer bg-transparent"
                value={formData.badgeColor}
                onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
              />
              <Input
                value={formData.badgeColor.toUpperCase()}
                onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>

          <Input
            label={t('displayOrder')}
            type="number"
            min={1}
            value={formData.displayOrder?.toString() || '1'}
            onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
          />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t('deleteClassification')}
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
