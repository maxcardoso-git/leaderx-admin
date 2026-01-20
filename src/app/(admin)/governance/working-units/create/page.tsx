'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button, Input, Select, Card, CardHeader } from '@/components/ui';
import { workingUnitsService } from '@/services/governance.service';
import { structuresService } from '@/services/network.service';
import { CreateWorkingUnitDto, WorkingUnitType } from '@/types/governance';
import { Structure } from '@/types/network';

export default function CreateWorkingUnitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type') as WorkingUnitType | null;

  const t = useTranslations('workingUnits');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('validation');

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStructures, setIsLoadingStructures] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [structures, setStructures] = useState<Structure[]>([]);

  const [formData, setFormData] = useState<CreateWorkingUnitDto>({
    code: '',
    name: '',
    description: '',
    type: typeParam || 'GROUP',
    structureId: '',
    maxMembers: 10,
  });

  const typeOptions = [
    { value: 'GROUP', label: t('typeGROUP') },
    { value: 'NUCLEUS', label: t('typeNUCLEUS') },
  ];

  useEffect(() => {
    loadStructures();
  }, []);

  const loadStructures = async () => {
    setIsLoadingStructures(true);
    try {
      const structuresData = await structuresService.list();
      setStructures(structuresData.items || []);
    } catch (err) {
      console.error('Failed to load structures:', err);
    } finally {
      setIsLoadingStructures(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.code || !formData.name || !formData.structureId) {
      setError(tValidation('fillRequiredFields'));
      return;
    }

    setIsLoading(true);
    try {
      const created = await workingUnitsService.create(formData);
      setSuccess(t('unitCreated'));
      setTimeout(() => {
        router.push(`/governance/working-units/${created.id}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create working unit');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-semibold text-text-primary">
          {formData.type === 'GROUP' ? t('createGroup') : t('createNucleus')}
        </h1>
        <p className="text-sm text-text-muted" style={{ marginTop: '8px' }}>
          {t('subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-success/10 border border-success/20 rounded-lg text-success text-sm">
            {success}
          </div>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader title={t('unitInfo')} subtitle={t('unitInfoSub')} />
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input
                label={t('code')}
                placeholder={t('codePlaceholder')}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
              />
            </div>
            <div className="col-span-2">
              <Input
                label={t('unitName')}
                placeholder={t('unitNamePlaceholder')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="col-span-2">
              <Input
                label={t('description')}
                placeholder={t('descriptionPlaceholder')}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Select
                label={t('structure')}
                options={[
                  { value: '', label: t('selectStructure') },
                  ...structures.map((s) => ({ value: s.id, label: s.name })),
                ]}
                value={formData.structureId}
                onChange={(e) => setFormData({ ...formData, structureId: e.target.value })}
                disabled={isLoadingStructures}
              />
            </div>
            <div>
              <Select
                label={t('typeGROUP').replace('Grupo', 'Tipo')}
                options={typeOptions}
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as WorkingUnitType })}
              />
            </div>
            <div>
              <Input
                label={t('maxMembers')}
                type="number"
                min={1}
                value={formData.maxMembers}
                onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) || 10 })}
              />
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href="/governance/working-units">
            <Button variant="ghost" type="button">
              {tCommon('cancel')}
            </Button>
          </Link>
          <Button type="submit" isLoading={isLoading} disabled={success !== null}>
            {tCommon('save')}
          </Button>
        </div>
      </form>
    </div>
  );
}
