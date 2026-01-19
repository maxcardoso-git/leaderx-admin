'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button, Input, Select, Card, CardHeader, Checkbox } from '@/components/ui';
import { usersService, rolesService } from '@/services/identity.service';
import { CreateUserDto, Role } from '@/types/identity';

export default function CreateUserPage() {
  const router = useRouter();
  const t = useTranslations('users');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('validation');

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);

  const [formData, setFormData] = useState<CreateUserDto>({
    email: '',
    name: '',
    phone: '',
    document: '',
    documentType: 'CPF',
    password: '',
    roleIds: [],
  });

  const [confirmPassword, setConfirmPassword] = useState('');

  const documentTypeOptions = [
    { value: 'CPF', label: 'CPF' },
    { value: 'CNPJ', label: 'CNPJ' },
    { value: 'RG', label: 'RG' },
    { value: 'PASSPORT', label: 'Passport' },
  ];

  // Load roles from API
  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setIsLoadingRoles(true);
    try {
      const response = await rolesService.list();
      setAvailableRoles(response.items || []);
    } catch (error) {
      console.error('Failed to load roles:', error);
      // Fallback to mock roles for demo
      setAvailableRoles([
        { id: 'role-admin', tenantId: 'demo', name: 'Administrator', isSystem: true, permissions: [], createdAt: '', updatedAt: '' },
        { id: 'role-manager', tenantId: 'demo', name: 'Manager', isSystem: false, permissions: [], createdAt: '', updatedAt: '' },
        { id: 'role-member', tenantId: 'demo', name: 'Member', isSystem: false, permissions: [], createdAt: '', updatedAt: '' },
      ]);
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.email || !formData.name || !formData.password) {
      setError(tValidation('fillRequiredFields'));
      return;
    }

    if (formData.password !== confirmPassword) {
      setError(tValidation('passwordsDoNotMatch'));
      return;
    }

    if (formData.password.length < 8) {
      setError(tValidation('passwordMinLength'));
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

  const toggleRole = (roleId: string) => {
    setFormData((prev) => ({
      ...prev,
      roleIds: prev.roleIds?.includes(roleId)
        ? prev.roleIds.filter((id) => id !== roleId)
        : [...(prev.roleIds || []), roleId],
    }));
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
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            <Input
              label={t('phone')}
              type="tel"
              placeholder={t('phonePlaceholder')}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Select
              label={t('documentType')}
              options={documentTypeOptions}
              value={formData.documentType}
              onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
            />
            <Input
              label={t('documentNumber')}
              placeholder={t('documentPlaceholder')}
              value={formData.document}
              onChange={(e) => setFormData({ ...formData, document: e.target.value })}
            />
          </div>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader title={t('security')} subtitle={t('securitySub')} />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('password')}
              type="password"
              placeholder={t('passwordPlaceholder')}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <Input
              label={t('confirmPassword')}
              type="password"
              placeholder={t('confirmPasswordPlaceholder')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </Card>

        {/* Roles */}
        <Card>
          <CardHeader title={t('rolesSection')} subtitle={t('rolesSectionSub')} />
          <div className="space-y-3">
            {isLoadingRoles ? (
              <p className="text-text-muted text-sm">{t('loadingRoles')}</p>
            ) : availableRoles.length === 0 ? (
              <p className="text-text-muted text-sm">{t('noRolesAvailable')}</p>
            ) : (
              availableRoles.map((role) => (
                <Checkbox
                  key={role.id}
                  label={role.name}
                  description={role.isSystem ? 'Sistema' : 'Personalizado'}
                  checked={formData.roleIds?.includes(role.id)}
                  onChange={() => toggleRole(role.id)}
                />
              ))
            )}
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
