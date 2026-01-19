'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button, Input, Select, Card, CardHeader } from '@/components/ui';
import { usersService } from '@/services/identity.service';
import { CreateUserDto, UserStatus } from '@/types/identity';

export default function CreateUserPage() {
  const router = useRouter();
  const t = useTranslations('users');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('validation');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateUserDto>({
    email: '',
    fullName: '',
    status: 'ACTIVE',
  });

  const statusOptions = [
    { value: 'ACTIVE', label: 'Ativo' },
    { value: 'INACTIVE', label: 'Inativo' },
    { value: 'SUSPENDED', label: 'Suspenso' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.email || !formData.fullName) {
      setError(tValidation('fillRequiredFields'));
      return;
    }

    setIsLoading(true);
    try {
      await usersService.create(formData);
      setSuccess(t('userCreated'));
      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push('/identity/users');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-semibold text-text-primary">
          {t('createUser')}
        </h1>
        <p className="text-sm text-text-muted mt-1">
          {t('createUserSub')}
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
          <CardHeader title={t('basicInfo')} subtitle={t('basicInfoSub')} />
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input
                label={t('fullName')}
                placeholder={t('fullNamePlaceholder')}
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
            <Input
              label={t('email')}
              type="email"
              placeholder={t('emailPlaceholder')}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Select
              label="Status"
              options={statusOptions}
              value={formData.status || 'ACTIVE'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
            />
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href="/identity/users">
            <Button variant="ghost" type="button">
              {tCommon('cancel')}
            </Button>
          </Link>
          <Button type="submit" isLoading={isLoading} disabled={success !== null}>
            {t('createUser')}
          </Button>
        </div>
      </form>
    </div>
  );
}
