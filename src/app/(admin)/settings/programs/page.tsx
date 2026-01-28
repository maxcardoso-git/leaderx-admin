'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Card, Modal, Input, Select } from '@/components/ui';
import { PlusIcon, EditIcon, TrashIcon, RocketIcon, CheckIcon, XIcon } from '@/components/icons';
import { Program, CreateProgramDto, UpdateProgramDto, Category } from '@/types/settings';
import { programsService, categoriesService } from '@/services/settings.service';

export default function ProgramsPage() {
  const t = useTranslations('systemSettings.programs');
  const common = useTranslations('common');

  const [programs, setPrograms] = useState<Program[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProgram, setDeletingProgram] = useState<Program | null>(null);

  const [formData, setFormData] = useState<CreateProgramDto>({
    code: '',
    name: '',
    description: '',
    categoryId: '',
    isActive: true,
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [programsData, categoriesData] = await Promise.all([
        programsService.list(),
        categoriesService.list(),
      ]);
      setPrograms(programsData.items);
      setCategories(categoriesData.items);
    } catch (error) {
      console.error('Failed to load data:', error);
      setPrograms([]);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateModal = () => {
    setEditingProgram(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      categoryId: '',
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (program: Program) => {
    setEditingProgram(program);
    setFormData({
      code: program.code,
      name: program.name,
      description: program.description || '',
      categoryId: program.categoryId || '',
      isActive: program.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.code.trim()) return;

    setIsSaving(true);
    try {
      if (editingProgram) {
        const updateData: UpdateProgramDto = {
          name: formData.name,
          description: formData.description,
          categoryId: formData.categoryId || undefined,
          isActive: formData.isActive,
        };
        await programsService.update(editingProgram.id, updateData);
      } else {
        await programsService.create(formData);
      }
      loadData();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save program:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProgram) return;

    try {
      await programsService.delete(deletingProgram.id);
      loadData();
      setShowDeleteModal(false);
      setDeletingProgram(null);
    } catch (error) {
      console.error('Failed to delete program:', error);
    }
  };

  const handleToggleActive = async (program: Program) => {
    try {
      await programsService.update(program.id, { isActive: !program.isActive });
      loadData();
    } catch (error) {
      console.error('Failed to toggle program status:', error);
    }
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return null;
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || null;
  };

  const categoryOptions = [
    { value: '', label: t('allCategories') },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-text-primary">{t('title')}</h1>
          <p className="text-sm text-text-muted" style={{ marginTop: '8px' }}>{t('subtitle')}</p>
        </div>
        <Button leftIcon={<PlusIcon size={18} />} onClick={openCreateModal}>
          {t('newProgram')}
        </Button>
      </div>

      {/* Programs Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : programs.length === 0 ? (
        <Card padding="xl">
          <div className="text-center py-12">
            <RocketIcon size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-text-muted">{t('noPrograms')}</p>
            <Button className="mt-4" onClick={openCreateModal}>
              {t('createFirstProgram')}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map((program) => (
            <Card key={program.id} padding="lg" hover>
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${program.isActive ? 'bg-gold/10' : 'bg-gray-100'}`}>
                      <RocketIcon size={20} className={program.isActive ? 'text-gold' : 'text-gray-400'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-text-primary truncate">{program.name}</h3>
                      </div>
                      <span className="text-xs text-text-muted">{program.code}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(program)}
                      className="p-2 rounded-lg text-text-muted hover:text-gold hover:bg-background-hover transition-colors"
                      title={common('edit')}
                    >
                      <EditIcon size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingProgram(program);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-background-hover transition-colors"
                      title={common('delete')}
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </div>

                {program.description && (
                  <p className="text-sm text-text-muted mb-3 line-clamp-2 flex-1">
                    {program.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                  {getCategoryName(program.categoryId) ? (
                    <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-600 rounded-full">
                      {getCategoryName(program.categoryId)}
                    </span>
                  ) : (
                    <span className="text-xs text-text-muted">{t('noCategory')}</span>
                  )}
                  <button
                    onClick={() => handleToggleActive(program)}
                    className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full transition-colors ${
                      program.isActive
                        ? 'bg-success/10 text-success hover:bg-success/20'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                    title={program.isActive ? t('deactivate') : t('activate')}
                  >
                    {program.isActive ? (
                      <>
                        <CheckIcon size={12} />
                        {common('active')}
                      </>
                    ) : (
                      <>
                        <XIcon size={12} />
                        {common('inactive')}
                      </>
                    )}
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
        title={editingProgram ? t('editProgram') : t('newProgram')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              {common('cancel')}
            </Button>
            <Button
              onClick={handleSave}
              isLoading={isSaving}
              disabled={!formData.name.trim() || !formData.code.trim()}
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
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
            required
            disabled={!!editingProgram}
            hint={editingProgram ? t('codeCannotChange') : undefined}
          />
          <Input
            label={t('name')}
            placeholder={t('namePlaceholder')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">{t('description')}</label>
            <textarea
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:border-gold focus:ring-2 focus:ring-gold/15 focus:outline-none transition-all resize-none"
              rows={3}
              placeholder={t('descriptionPlaceholder')}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <Select
            label={t('category')}
            options={categoryOptions}
            value={formData.categoryId || ''}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value || undefined })}
            hint={t('categoryHint')}
          />
          <div className="flex items-center justify-between py-3 border-t border-gray-100">
            <span className="text-sm text-gray-900">{t('activeStatus')}</span>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                formData.isActive ? 'bg-gold' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                  formData.isActive ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t('deleteProgram')}
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
        <p className="text-gray-600">
          {t('deleteConfirm')} <strong className="text-gray-900">{deletingProgram?.name}</strong>?
        </p>
      </Modal>
    </div>
  );
}
