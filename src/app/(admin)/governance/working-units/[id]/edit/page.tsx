'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button, Input, Select, Card, CardHeader, useToast } from '@/components/ui';
import { workingUnitsService } from '@/services/governance.service';
import { structuresService } from '@/services/network.service';
import { WorkingUnit, UpdateWorkingUnitDto, WorkingUnitStatus, WorkingUnitType } from '@/types/governance';
import { Structure } from '@/types/network';

export default function EditWorkingUnitPage() {
  const params = useParams();
  const router = useRouter();
  const unitId = params.id as string;

  const t = useTranslations('workingUnits');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('validation');
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUnit, setIsLoadingUnit] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [originalUnit, setOriginalUnit] = useState<WorkingUnit | null>(null);
  const [structures, setStructures] = useState<Structure[]>([]);

  const [formData, setFormData] = useState<UpdateWorkingUnitDto & { structureId?: string; type?: WorkingUnitType }>({
    name: '',
    description: '',
    type: 'GROUP',
    status: 'ACTIVE',
    maxMembers: 10,
    structureId: '',
  });

  const typeOptions = [
    { value: 'GROUP', label: t('typeGROUP') },
    { value: 'NUCLEUS', label: t('typeNUCLEUS') },
  ];

  const statusOptions = [
    { value: 'ACTIVE', label: t('statusACTIVE') },
    { value: 'INACTIVE', label: t('statusINACTIVE') },
    { value: 'SUSPENDED', label: t('statusSUSPENDED') },
  ];

  useEffect(() => {
    loadData();
  }, [unitId]);

  const loadData = async () => {
    setIsLoadingUnit(true);
    setError(null);
    try {
      const [unitData, structuresData] = await Promise.all([
        workingUnitsService.getById(unitId),
        structuresService.list(),
      ]);
      setOriginalUnit(unitData);
      setStructures(structuresData.items || []);
      setFormData({
        name: unitData.name,
        description: unitData.description || '',
        type: unitData.type,
        status: unitData.status,
        maxMembers: unitData.maxMembers,
        structureId: unitData.structureId || '',
      });
    } catch (err) {
      console.error('Failed to load working unit:', err);
      setError(t('failedToLoadUnit'));
      setOriginalUnit(null);
    } finally {
      setIsLoadingUnit(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.name) {
      setError(tValidation('fillRequiredFields'));
      return;
    }

    setIsLoading(true);
    try {
      await workingUnitsService.update(unitId, formData);
      setSuccess(t('unitUpdated'));
      setTimeout(() => {
        router.push(`/governance/working-units/${unitId}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update working unit');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingUnit) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-background-hover rounded animate-pulse" />
        <Card>
          <div className="h-60 animate-pulse bg-background-hover rounded" />
        </Card>
      </div>
    );
  }

  if (error && !originalUnit) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="p-6 bg-error/10 border border-error/20 rounded-xl text-center">
          <p className="text-error font-medium mb-4">{error}</p>
          <Link href="/governance/working-units">
            <Button variant="secondary">
              {t('backToList')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-semibold text-text-primary">
          {t('editUnit')} {originalUnit?.name}
        </h1>
        <p className="text-sm text-text-muted" style={{ marginTop: '8px' }}>
          {t(`type${originalUnit?.type}`)}
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
                label={t('unitName')}
                placeholder={t('unitNamePlaceholder')}
                value={formData.name || ''}
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
            <div>
              <Select
                label={t('structure')}
                options={[
                  { value: '', label: t('selectStructure') },
                  ...structures.map((s) => ({ value: s.id, label: s.name })),
                ]}
                value={formData.structureId || ''}
                onChange={(e) => setFormData({ ...formData, structureId: e.target.value })}
              />
            </div>
            <div>
              <Select
                label={tCommon('type')}
                options={typeOptions}
                value={formData.type || 'GROUP'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as WorkingUnitType })}
              />
            </div>
            <div>
              <Input
                label={t('maxMembers')}
                type="number"
                min={1}
                value={formData.maxMembers || 10}
                onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) || 10 })}
              />
            </div>
            <div>
              <Select
                label={t('status')}
                options={statusOptions}
                value={formData.status || 'ACTIVE'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as WorkingUnitStatus })}
              />
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href={`/governance/working-units/${unitId}`}>
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
