'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Select, Card, CardHeader, Checkbox } from '@/components/ui';
import { usersService, rolesService } from '@/services/identity.service';
import { CreateUserDto, Role } from '@/types/identity';

export default function CreateUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  // Mock roles for demo
  const availableRoles: Role[] = [
    { id: 'role-admin', tenantId: 'demo', name: 'Administrator', isSystem: true, permissions: [], createdAt: '', updatedAt: '' },
    { id: 'role-manager', tenantId: 'demo', name: 'Manager', isSystem: false, permissions: [], createdAt: '', updatedAt: '' },
    { id: 'role-member', tenantId: 'demo', name: 'Member', isSystem: false, permissions: [], createdAt: '', updatedAt: '' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.email || !formData.name || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      await usersService.create(formData);
      router.push('/identity/users');
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
        <h1 className="font-heading text-2xl font-semibold text-text-primary">Create User</h1>
        <p className="text-sm text-text-muted mt-1">
          Add a new user to the system
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
            {error}
          </div>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader title="Basic Information" subtitle="User's personal details" />
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input
                label="Full Name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <Input
              label="Email"
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Phone"
              type="tel"
              placeholder="+55 11 99999-9999"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Select
              label="Document Type"
              options={documentTypeOptions}
              value={formData.documentType}
              onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
            />
            <Input
              label="Document Number"
              placeholder="Enter document number"
              value={formData.document}
              onChange={(e) => setFormData({ ...formData, document: e.target.value })}
            />
          </div>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader title="Security" subtitle="Set up the user's password" />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Password"
              type="password"
              placeholder="Min. 8 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </Card>

        {/* Roles */}
        <Card>
          <CardHeader title="Roles" subtitle="Assign roles to the user" />
          <div className="space-y-3">
            {availableRoles.map((role) => (
              <Checkbox
                key={role.id}
                label={role.name}
                description={role.isSystem ? 'System role' : 'Custom role'}
                checked={formData.roleIds?.includes(role.id)}
                onChange={() => toggleRole(role.id)}
              />
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href="/identity/users">
            <Button variant="ghost" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" isLoading={isLoading}>
            Create User
          </Button>
        </div>
      </form>
    </div>
  );
}
