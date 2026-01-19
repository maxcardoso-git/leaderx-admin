'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button, Input, Select, Card, CardHeader, Checkbox } from '@/components/ui';
import { usersService, rolesService } from '@/services/identity.service';
import { User, UpdateUserDto, Role, UserStatus } from '@/types/identity';

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const t = useTranslations('users');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('validation');
  const tRoles = useTranslations('roles');

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [originalUser, setOriginalUser] = useState<User | null>(null);

  const [formData, setFormData] = useState<UpdateUserDto>({
    name: '',
    phone: '',
    document: '',
    documentType: 'CPF',
  });

  const documentTypeOptions = [
    { value: 'CPF', label: 'CPF' },
    { value: 'CNPJ', label: 'CNPJ' },
    { value: 'RG', label: 'RG' },
    { value: 'PASSPORT', label: 'Passport' },
  ];

  const statusOptions = [
    { value: 'ACTIVE', label: tCommon('active') },
    { value: 'INACTIVE', label: tCommon('inactive') },
    { value: 'SUSPENDED', label: tCommon('suspended') },
    { value: 'PENDING_VERIFICATION', label: tCommon('pending') },
  ];

  // Load user data
  useEffect(() => {
    loadUser();
    loadRoles();
  }, [userId]);

  const loadUser = async () => {
    setIsLoadingUser(true);
    try {
      const [userData, roles] = await Promise.all([
        usersService.getById(userId),
        usersService.getUserRoles(userId),
      ]);
      setOriginalUser(userData);
      setFormData({
        name: userData.name,
        phone: userData.phone || '',
        document: userData.document || '',
        documentType: userData.documentType || 'CPF',
        status: userData.status,
      });
      setUserRoles(roles.map((r) => r.id));
    } catch (error) {
      console.error('Failed to load user:', error);
      // Use mock data for demo
      const mockUser: User = {
        id: userId,
        tenantId: 'demo-tenant',
        email: 'user@example.com',
        name: 'Example User',
        phone: '+55 11 99999-9999',
        document: '123.456.789-00',
        documentType: 'CPF',
        status: 'ACTIVE',
        emailVerified: true,
        phoneVerified: false,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };
      setOriginalUser(mockUser);
      setFormData({
        name: mockUser.name,
        phone: mockUser.phone || '',
        document: mockUser.document || '',
        documentType: mockUser.documentType || 'CPF',
        status: mockUser.status,
      });
      setUserRoles(['role-member']);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const loadRoles = async () => {
    setIsLoadingRoles(true);
    try {
      const response = await rolesService.list();
      setAvailableRoles(response.items || []);
    } catch (error) {
      console.error('Failed to load roles:', error);
      // Fallback to mock roles
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
    if (!formData.name) {
      setError(tValidation('fillRequiredFields'));
      return;
    }

    setIsLoading(true);
    try {
      await usersService.update(userId, formData);
      setSuccess(t('userUpdated'));
      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/identity/users/${userId}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRole = async (roleId: string) => {
    try {
      if (userRoles.includes(roleId)) {
        await usersService.removeRole(userId, roleId);
        setUserRoles((prev) => prev.filter((id) => id !== roleId));
      } else {
        await usersService.assignRole(userId, roleId);
        setUserRoles((prev) => [...prev, roleId]);
      }
    } catch (error) {
      console.error('Failed to toggle role:', error);
      // For demo, just update local state
      setUserRoles((prev) =>
        prev.includes(roleId)
          ? prev.filter((id) => id !== roleId)
          : [...prev, roleId]
      );
    }
  };

  if (isLoadingUser) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-background-hover rounded animate-pulse" />
        <Card>
          <div className="h-60 animate-pulse bg-background-hover rounded" />
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-semibold text-text-primary">
          {t('edit')} {originalUser?.name}
        </h1>
        <p className="text-sm text-text-muted mt-1">
          {originalUser?.email}
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
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="col-span-2">
              <Input
                label={t('email')}
                type="email"
                value={originalUser?.email || ''}
                disabled
                className="opacity-60"
              />
              <p className="text-xs text-text-muted mt-1">
                {t('emailCannotBeChanged')}
              </p>
            </div>
            <Input
              label={t('phone')}
              type="tel"
              placeholder={t('phonePlaceholder')}
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Select
              label={t('status')}
              options={statusOptions}
              value={formData.status || 'ACTIVE'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
            />
            <Select
              label={t('documentType')}
              options={documentTypeOptions}
              value={formData.documentType || 'CPF'}
              onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
            />
            <Input
              label={t('documentNumber')}
              placeholder={t('documentPlaceholder')}
              value={formData.document || ''}
              onChange={(e) => setFormData({ ...formData, document: e.target.value })}
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
                  description={role.isSystem ? tRoles('systemRole') : tRoles('customRole')}
                  checked={userRoles.includes(role.id)}
                  onChange={() => toggleRole(role.id)}
                />
              ))
            )}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href={`/identity/users/${userId}`}>
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
