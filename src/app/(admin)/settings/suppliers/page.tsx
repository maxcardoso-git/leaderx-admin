'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Card, Modal, Input } from '@/components/ui';
import { PlusIcon, EditIcon, TrashIcon, TruckIcon } from '@/components/icons';
import {
  Supplier,
  CreateSupplierDto,
  UpdateSupplierDto,
  SupplierAddress,
  SupplierContact,
  SupplierPix,
  SupplierBank,
  PIX_KEY_TYPES,
  BANK_ACCOUNT_TYPES,
} from '@/types/settings';
import { suppliersService } from '@/services/settings.service';

type TabKey = 'basic' | 'address' | 'contact' | 'payment';

const TABS: { key: TabKey; labelKey: string }[] = [
  { key: 'basic', labelKey: 'basicData' },
  { key: 'address', labelKey: 'address' },
  { key: 'contact', labelKey: 'contact' },
  { key: 'payment', labelKey: 'payment' },
];

export default function SuppliersPage() {
  const t = useTranslations('systemSettings.suppliers');
  const common = useTranslations('common');

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('basic');

  const [formData, setFormData] = useState<CreateSupplierDto>({
    name: '',
    legalName: '',
    cnpj: '',
    stateRegistration: '',
    municipalRegistration: '',
    address: {},
    contact: {},
    pix: {},
    bank: {},
    profileDescription: '',
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setIsLoading(true);
    try {
      const data = await suppliersService.list();
      setSuppliers(data.items);
    } catch (error) {
      console.error('Failed to load suppliers:', error);
      setSuppliers(mockSuppliers);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      legalName: '',
      cnpj: '',
      stateRegistration: '',
      municipalRegistration: '',
      address: {},
      contact: {},
      pix: {},
      bank: {},
      profileDescription: '',
    });
    setActiveTab('basic');
    setShowModal(true);
  };

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      legalName: supplier.legalName || '',
      cnpj: supplier.cnpj || '',
      stateRegistration: supplier.stateRegistration || '',
      municipalRegistration: supplier.municipalRegistration || '',
      address: supplier.address || {},
      contact: supplier.contact || {},
      pix: supplier.pix || {},
      bank: supplier.bank || {},
      profileDescription: supplier.profileDescription || '',
    });
    setActiveTab('basic');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    setIsSaving(true);
    try {
      if (editingSupplier) {
        await suppliersService.update(editingSupplier.id, formData as UpdateSupplierDto);
      } else {
        await suppliersService.create(formData);
      }
      loadSuppliers();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save supplier:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSupplier) return;

    try {
      await suppliersService.delete(deletingSupplier.id);
      loadSuppliers();
      setShowDeleteModal(false);
      setDeletingSupplier(null);
    } catch (error) {
      console.error('Failed to delete supplier:', error);
    }
  };

  const updateAddress = (updates: Partial<SupplierAddress>) => {
    setFormData({
      ...formData,
      address: { ...formData.address, ...updates },
    });
  };

  const updateContact = (updates: Partial<SupplierContact>) => {
    setFormData({
      ...formData,
      contact: { ...formData.contact, ...updates },
    });
  };

  const updatePix = (updates: Partial<SupplierPix>) => {
    setFormData({
      ...formData,
      pix: { ...formData.pix, ...updates },
    });
  };

  const updateBank = (updates: Partial<SupplierBank>) => {
    setFormData({
      ...formData,
      bank: { ...formData.bank, ...updates },
    });
  };

  const formatCnpj = (cnpj: string) => {
    if (!cnpj) return '-';
    const cleaned = cnpj.replace(/\D/g, '');
    if (cleaned.length !== 14) return cnpj;
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
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
          {t('newSupplier')}
        </Button>
      </div>

      {/* Suppliers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-white/[0.02] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : suppliers.length === 0 ? (
        <Card padding="xl">
          <div className="text-center py-12">
            <TruckIcon size={48} className="mx-auto text-white/20 mb-4" />
            <p className="text-text-muted">{t('noSuppliers')}</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((supplier) => (
            <Card key={supplier.id} padding="lg" hover>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gold/10 rounded-lg">
                    <TruckIcon size={20} className="text-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-text-primary truncate">{supplier.name}</h3>
                    {supplier.legalName && (
                      <p className="text-xs text-text-muted truncate">{supplier.legalName}</p>
                    )}
                    {supplier.cnpj && (
                      <p className="text-xs text-gold mt-1">{formatCnpj(supplier.cnpj)}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(supplier)}
                    className="p-2 rounded-lg text-text-muted hover:text-gold hover:bg-background-hover transition-colors"
                    title={common('edit')}
                  >
                    <EditIcon size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setDeletingSupplier(supplier);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-background-hover transition-colors"
                    title={common('delete')}
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              </div>
              {supplier.address?.city && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-text-muted">
                    {supplier.address.city}
                    {supplier.address.state && `, ${supplier.address.state}`}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingSupplier ? t('editSupplier') : t('newSupplier')}
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
          {/* Tabs */}
          <div className="flex border-b border-border">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                  activeTab === tab.key
                    ? 'text-gold'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {t(tab.labelKey)}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[300px]">
            {/* Basic Data Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={t('name')}
                    placeholder={t('namePlaceholder')}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <Input
                    label={t('legalName')}
                    placeholder={t('legalNamePlaceholder')}
                    value={formData.legalName || ''}
                    onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label={t('cnpj')}
                    placeholder="00.000.000/0000-00"
                    value={formData.cnpj || ''}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  />
                  <Input
                    label={t('stateRegistration')}
                    placeholder={t('stateRegistrationPlaceholder')}
                    value={formData.stateRegistration || ''}
                    onChange={(e) => setFormData({ ...formData, stateRegistration: e.target.value })}
                  />
                  <Input
                    label={t('municipalRegistration')}
                    placeholder={t('municipalRegistrationPlaceholder')}
                    value={formData.municipalRegistration || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, municipalRegistration: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">{t('profileDescription')}</label>
                  <textarea
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/30 focus:border-gold/50 focus:bg-white/[0.06] focus:outline-none transition-all resize-none"
                    rows={3}
                    placeholder={t('profileDescriptionPlaceholder')}
                    value={formData.profileDescription || ''}
                    onChange={(e) => setFormData({ ...formData, profileDescription: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Address Tab */}
            {activeTab === 'address' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label={t('zip')}
                    placeholder="00000-000"
                    value={formData.address?.zip || ''}
                    onChange={(e) => updateAddress({ zip: e.target.value })}
                  />
                  <div className="col-span-2">
                    <Input
                      label={t('street')}
                      placeholder={t('streetPlaceholder')}
                      value={formData.address?.street || ''}
                      onChange={(e) => updateAddress({ street: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <Input
                    label={t('number')}
                    placeholder={t('numberPlaceholder')}
                    value={formData.address?.number || ''}
                    onChange={(e) => updateAddress({ number: e.target.value })}
                  />
                  <Input
                    label={t('complement')}
                    placeholder={t('complementPlaceholder')}
                    value={formData.address?.complement || ''}
                    onChange={(e) => updateAddress({ complement: e.target.value })}
                  />
                  <div className="col-span-2">
                    <Input
                      label={t('neighborhood')}
                      placeholder={t('neighborhoodPlaceholder')}
                      value={formData.address?.neighborhood || ''}
                      onChange={(e) => updateAddress({ neighborhood: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label={t('city')}
                    placeholder={t('cityPlaceholder')}
                    value={formData.address?.city || ''}
                    onChange={(e) => updateAddress({ city: e.target.value })}
                  />
                  <Input
                    label={t('state')}
                    placeholder={t('statePlaceholder')}
                    value={formData.address?.state || ''}
                    onChange={(e) => updateAddress({ state: e.target.value })}
                  />
                  <Input
                    label={t('country')}
                    placeholder={t('countryPlaceholder')}
                    value={formData.address?.country || ''}
                    onChange={(e) => updateAddress({ country: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div className="space-y-4">
                <p className="text-sm text-text-muted mb-4">{t('contactHint')}</p>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label={t('contactName')}
                    placeholder={t('contactNamePlaceholder')}
                    value={formData.contact?.manual?.name || ''}
                    onChange={(e) =>
                      updateContact({
                        manual: { ...formData.contact?.manual, name: e.target.value },
                      })
                    }
                  />
                  <Input
                    label={t('contactEmail')}
                    placeholder={t('contactEmailPlaceholder')}
                    type="email"
                    value={formData.contact?.manual?.email || ''}
                    onChange={(e) =>
                      updateContact({
                        manual: { ...formData.contact?.manual, email: e.target.value },
                      })
                    }
                  />
                  <Input
                    label={t('contactPhone')}
                    placeholder={t('contactPhonePlaceholder')}
                    value={formData.contact?.manual?.phone || ''}
                    onChange={(e) =>
                      updateContact({
                        manual: { ...formData.contact?.manual, phone: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            )}

            {/* Payment Tab */}
            {activeTab === 'payment' && (
              <div className="space-y-6">
                {/* PIX Section */}
                <div>
                  <h4 className="text-sm font-medium text-text-primary mb-3">{t('pixData')}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white/60 mb-2">{t('pixKeyType')}</label>
                      <select
                        className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white focus:border-gold/50 focus:bg-white/[0.06] focus:outline-none transition-all"
                        value={formData.pix?.type || ''}
                        onChange={(e) =>
                          updatePix({ type: (e.target.value as SupplierPix['type']) || undefined })
                        }
                      >
                        <option value="">{t('selectPixKeyType')}</option>
                        {PIX_KEY_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Input
                      label={t('pixKey')}
                      placeholder={t('pixKeyPlaceholder')}
                      value={formData.pix?.key || ''}
                      onChange={(e) => updatePix({ key: e.target.value })}
                    />
                  </div>
                </div>

                {/* Bank Section */}
                <div>
                  <h4 className="text-sm font-medium text-text-primary mb-3">{t('bankData')}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label={t('bankName')}
                      placeholder={t('bankNamePlaceholder')}
                      value={formData.bank?.name || ''}
                      onChange={(e) => updateBank({ name: e.target.value })}
                    />
                    <Input
                      label={t('bankCode')}
                      placeholder={t('bankCodePlaceholder')}
                      value={formData.bank?.code || ''}
                      onChange={(e) => updateBank({ code: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <Input
                      label={t('branch')}
                      placeholder={t('branchPlaceholder')}
                      value={formData.bank?.branch || ''}
                      onChange={(e) => updateBank({ branch: e.target.value })}
                    />
                    <Input
                      label={t('account')}
                      placeholder={t('accountPlaceholder')}
                      value={formData.bank?.account || ''}
                      onChange={(e) => updateBank({ account: e.target.value })}
                    />
                    <div>
                      <label className="block text-sm text-white/60 mb-2">{t('accountType')}</label>
                      <select
                        className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white focus:border-gold/50 focus:bg-white/[0.06] focus:outline-none transition-all"
                        value={formData.bank?.accountType || ''}
                        onChange={(e) =>
                          updateBank({
                            accountType: (e.target.value as SupplierBank['accountType']) || undefined,
                          })
                        }
                      >
                        <option value="">{t('selectAccountType')}</option>
                        {BANK_ACCOUNT_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t('deleteSupplier')}
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
const mockSuppliers: Supplier[] = [
  {
    id: '1',
    tenantId: 'demo',
    name: 'Buffet Gourmet',
    legalName: 'Buffet Gourmet Ltda',
    cnpj: '12345678000190',
    address: {
      street: 'Av. Paulista',
      number: '1000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zip: '01310-100',
    },
    contact: {
      manual: {
        name: 'Maria Silva',
        email: 'contato@buffetgourmet.com.br',
        phone: '(11) 98765-4321',
      },
    },
    pix: {
      type: 'CNPJ',
      key: '12345678000190',
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    tenantId: 'demo',
    name: 'Som & Luz Eventos',
    legalName: 'Som e Luz Produções ME',
    cnpj: '98765432000188',
    address: {
      city: 'Rio de Janeiro',
      state: 'RJ',
    },
    contact: {
      manual: {
        name: 'João Santos',
        phone: '(21) 99876-5432',
      },
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    tenantId: 'demo',
    name: 'Decorações Elite',
    legalName: 'Elite Decorações Eireli',
    cnpj: '11223344000155',
    address: {
      city: 'Belo Horizonte',
      state: 'MG',
    },
    bank: {
      name: 'Banco do Brasil',
      code: '001',
      branch: '1234',
      account: '56789-0',
      accountType: 'CHECKING',
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];
