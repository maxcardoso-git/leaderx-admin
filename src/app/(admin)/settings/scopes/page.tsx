'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Card, Modal, Input } from '@/components/ui';
import { PlusIcon, EditIcon, TrashIcon, NetworkIcon } from '@/components/icons';
import { Scope, CreateScopeDto, UpdateScopeDto } from '@/types/settings';
import { scopesService } from '@/services/settings.service';

export default function ScopesPage() {
  const t = useTranslations('systemSettings.scopes');
  const common = useTranslations('common');

  const [scopes, setScopes] = useState<Scope[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingScope, setEditingScope] = useState<Scope | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingScope, setDeletingScope] = useState<Scope | null>(null);

  const [formData, setFormData] = useState<CreateScopeDto>({
    code: '',
    name: '',
    description: '',
    level: 1,
  });

  useEffect(() => {
    loadScopes();
  }, []);

  const loadScopes = async () => {
    setIsLoading(true);
    try {
      const data = await scopesService.list();
      setScopes(data.items);
    } catch (error) {
      console.error('Failed to load scopes:', error);
      setScopes(mockScopes);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingScope(null);
    setFormData({ code: '', name: '', description: '', level: 1 });
    setShowModal(true);
  };

  const openEditModal = (scope: Scope) => {
    setEditingScope(scope);
    setFormData({
      code: scope.code,
      name: scope.name,
      description: scope.description || '',
      level: scope.level,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.code.trim() || !formData.name.trim()) return;

    setIsSaving(true);
    try {
      if (editingScope) {
        await scopesService.update(editingScope.id, {
          name: formData.name,
          description: formData.description,
          level: formData.level,
        } as UpdateScopeDto);
      } else {
        await scopesService.create(formData);
      }
      loadScopes();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save scope:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingScope) return;

    try {
      await scopesService.delete(deletingScope.id);
      loadScopes();
      setShowDeleteModal(false);
      setDeletingScope(null);
    } catch (error) {
      console.error('Failed to delete scope:', error);
    }
  };

  // Sort scopes by level
  const sortedScopes = [...scopes].sort((a, b) => a.level - b.level);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-text-primary">{t('title')}</h1>
          <p className="text-sm text-text-muted" style={{ marginTop: '8px' }}>{t('subtitle')}</p>
        </div>
        <Button leftIcon={<PlusIcon size={18} />} onClick={openCreateModal}>
          {t('newScope')}
        </Button>
      </div>

      {/* Scopes Table */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-white/[0.02] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : scopes.length === 0 ? (
        <Card padding="xl">
          <div className="text-center py-12">
            <NetworkIcon size={48} className="mx-auto text-white/20 mb-4" />
            <p className="text-text-muted">{t('noScopes')}</p>
          </div>
        </Card>
      ) : (
        <Card className="!p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                  {t('level')}
                </th>
                <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                  {t('code')}
                </th>
                <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                  {t('name')}
                </th>
                <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                  {t('description')}
                </th>
                <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                  {common('actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedScopes.map((scope) => (
                <tr
                  key={scope.id}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gold/10 text-gold font-medium text-sm">
                      {scope.level}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="px-2 py-1 bg-white/[0.05] rounded text-xs text-text-muted">
                      {scope.code}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-text-primary">{scope.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-text-muted line-clamp-1">
                      {scope.description || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(scope)}
                        className="p-2 rounded-lg text-text-muted hover:text-gold hover:bg-background-hover transition-colors"
                        title={common('edit')}
                      >
                        <EditIcon size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingScope(scope);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-background-hover transition-colors"
                        title={common('delete')}
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingScope ? t('editScope') : t('newScope')}
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
          <div>
            <Input
              label={t('code')}
              placeholder={t('codePlaceholder')}
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s/g, '_') })}
              disabled={!!editingScope}
              required
            />
            <p className="text-xs text-text-muted mt-1">{t('codeHint')}</p>
          </div>
          <Input
            label={t('name')}
            placeholder={t('namePlaceholder')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div>
            <Input
              label={t('level')}
              type="number"
              min={1}
              placeholder={t('levelPlaceholder')}
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
              required
            />
            <p className="text-xs text-text-muted mt-1">{t('levelHint')}</p>
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
        title={t('deleteScope')}
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
const mockScopes: Scope[] = [
  {
    id: '1',
    tenantId: 'demo',
    code: 'GLOBAL_ALL_COUNTRIES',
    name: 'Global (Todos os Países)',
    description: 'Estrutura que abrange todos os países da organização',
    level: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    tenantId: 'demo',
    code: 'COUNTRY_GROUP',
    name: 'Grupo de Países',
    description: 'Estrutura regional que agrupa países',
    level: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    tenantId: 'demo',
    code: 'CITY_GROUP',
    name: 'Grupo de Cidades',
    description: 'Estrutura estadual ou regional que agrupa cidades',
    level: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    tenantId: 'demo',
    code: 'SINGLE_CITY',
    name: 'Cidade Única',
    description: 'Estrutura municipal limitada a uma cidade',
    level: 4,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];
