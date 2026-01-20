'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Card, Modal, Input } from '@/components/ui';
import { PlusIcon, EditIcon, TrashIcon, TagIcon } from '@/components/icons';
import { Category, CreateCategoryDto, UpdateCategoryDto, Classification } from '@/types/settings';
import { categoriesService, classificationsService } from '@/services/settings.service';

export default function CategoriesPage() {
  const t = useTranslations('systemSettings.categories');
  const common = useTranslations('common');

  const [categories, setCategories] = useState<Category[]>([]);
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateCategoryDto>({
    code: '',
    name: '',
    description: '',
    previousCategoryId: undefined,
    displayOrder: undefined,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [categoriesData, classificationsData] = await Promise.all([
        categoriesService.list(),
        classificationsService.list(),
      ]);
      setCategories(categoriesData.items);
      setClassifications(classificationsData.items);
    } catch (error) {
      console.error('Failed to load data:', error);
      setCategories([]);
      setClassifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Group classifications by category
  const classificationsByCategory = useMemo(() => {
    const grouped: Record<string, Classification[]> = {};
    classifications.forEach((classification) => {
      const categoryId = classification.categoryId;
      if (!grouped[categoryId]) {
        grouped[categoryId] = [];
      }
      grouped[categoryId].push(classification);
    });
    // Sort each group by displayOrder
    Object.values(grouped).forEach((group) => {
      group.sort((a, b) => a.displayOrder - b.displayOrder);
    });
    return grouped;
  }, [classifications]);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || categoryId;
  };

  const loadCategories = async () => {
    loadData();
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      previousCategoryId: undefined,
      displayOrder: undefined,
    });
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      code: category.code,
      name: category.name,
      description: category.description || '',
      previousCategoryId: category.previousCategoryId,
      displayOrder: category.displayOrder,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.code.trim() || !formData.name.trim()) return;

    setIsSaving(true);
    try {
      if (editingCategory) {
        await categoriesService.update(editingCategory.id, formData as UpdateCategoryDto);
      } else {
        await categoriesService.create(formData);
      }
      loadCategories();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save category:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;

    try {
      await categoriesService.delete(deletingCategory.id);
      loadCategories();
      setShowDeleteModal(false);
      setDeletingCategory(null);
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const getPreviousClassificationName = (previousCategoryId?: string) => {
    if (!previousCategoryId) return t('none');
    const classification = classifications.find((c) => c.id === previousCategoryId);
    if (!classification) return '-';
    const categoryName = getCategoryName(classification.categoryId);
    return `${classification.name} (${categoryName})`;
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
          {t('newCategory')}
        </Button>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-white/[0.02] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <Card padding="xl">
          <div className="text-center py-12">
            <TagIcon size={48} className="mx-auto text-white/20 mb-4" />
            <p className="text-text-muted">{t('noCategories')}</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.id} padding="lg" hover>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gold/10 rounded-lg">
                    <TagIcon size={20} className="text-gold" />
                  </div>
                  <div>
                    <span className="text-xs text-gold/80 font-mono">{category.code}</span>
                    <h3 className="font-medium text-text-primary">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-text-muted mt-1 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(category)}
                    className="p-2 rounded-lg text-text-muted hover:text-gold hover:bg-background-hover transition-colors"
                    title={common('edit')}
                  >
                    <EditIcon size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setDeletingCategory(category);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-background-hover transition-colors"
                    title={common('delete')}
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
                <span>
                  {t('progression')}: {getPreviousClassificationName(category.previousCategoryId)}
                </span>
                <span>
                  {t('order')}: {category.displayOrder || '-'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCategory ? t('editCategory') : t('newCategory')}
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
            label={t('code')}
            placeholder={t('codePlaceholder')}
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            required
            disabled={!!editingCategory}
          />
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
            <label className="block text-sm text-white/60 mb-2">{t('previousCategory')}</label>
            <select
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white focus:border-gold/50 focus:bg-white/[0.06] focus:outline-none transition-all"
              value={formData.previousCategoryId || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  previousCategoryId: e.target.value || undefined,
                })
              }
            >
              <option value="">{t('none')}</option>
              {categories.map((category) => {
                const categoryClassifications = classificationsByCategory[category.id] || [];
                if (categoryClassifications.length === 0) return null;
                return (
                  <optgroup key={category.id} label={category.name}>
                    {categoryClassifications.map((classification) => (
                      <option key={classification.id} value={classification.id}>
                        {classification.name}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
            <p className="text-xs text-text-muted mt-1">{t('previousCategoryHint')}</p>
          </div>
          <Input
            label={t('displayOrder')}
            type="number"
            placeholder={t('displayOrderPlaceholder')}
            value={formData.displayOrder?.toString() || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                displayOrder: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
          />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t('deleteCategory')}
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
