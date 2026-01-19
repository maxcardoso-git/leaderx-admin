'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, CardHeader, StatusPill, Avatar, Modal } from '@/components/ui';
import { EditIcon, TrashIcon, ShieldIcon } from '@/components/icons';
import { User, UserStatus, Role } from '@/types/identity';
import { usersService } from '@/services/identity.service';

const mapStatus = (status: UserStatus): 'active' | 'inactive' | 'pending' | 'suspended' => {
  const mapping: Record<UserStatus, 'active' | 'inactive' | 'pending' | 'suspended'> = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
    PENDING_VERIFICATION: 'pending',
  };
  return mapping[status];
};

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    setIsLoading(true);
    try {
      const [userData, userRoles] = await Promise.all([
        usersService.getById(userId),
        usersService.getUserRoles(userId),
      ]);
      setUser(userData);
      setRoles(userRoles);
    } catch (error) {
      console.error('Failed to load user:', error);
      // Use mock data for demo
      setUser(mockUser);
      setRoles(mockRoles);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await usersService.delete(userId);
      router.push('/identity/users');
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleStatusChange = async (action: 'suspend' | 'activate') => {
    try {
      if (action === 'suspend') {
        await usersService.suspend(userId);
      } else {
        await usersService.activate(userId);
      }
      loadUser();
    } catch (error) {
      console.error('Failed to change user status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-background-hover rounded animate-pulse" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <Card>
              <div className="h-40 animate-pulse bg-background-hover rounded" />
            </Card>
          </div>
          <div>
            <Card>
              <div className="h-60 animate-pulse bg-background-hover rounded" />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted">User not found</p>
        <Link href="/identity/users">
          <Button variant="ghost" className="mt-4">
            Back to Users
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={user.fullName} size="lg" />
          <div>
            <h1 className="font-heading text-2xl font-semibold text-text-primary">
              {user.fullName}
            </h1>
            <p className="text-sm text-text-muted">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/identity/users/${userId}/edit`}>
            <Button variant="secondary" leftIcon={<EditIcon size={18} />}>
              Edit
            </Button>
          </Link>
          <Button
            variant="danger"
            leftIcon={<TrashIcon size={18} />}
            onClick={() => setShowDeleteModal(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="col-span-2 space-y-6">
          {/* Details Card */}
          <Card>
            <CardHeader title="User Details" />
            <div className="grid grid-cols-2 gap-6">
              <InfoItem label="Full Name" value={user.fullName} />
              <InfoItem label="Email" value={user.email} />
              {user.externalId && (
                <InfoItem label="External ID" value={user.externalId} />
              )}
            </div>
          </Card>

          {/* Roles Card */}
          <Card>
            <CardHeader
              title="Assigned Roles"
              action={
                <Link href={`/identity/users/${userId}/edit`}>
                  <Button variant="ghost" size="sm">
                    Manage Roles
                  </Button>
                </Link>
              }
            />
            <div className="space-y-3">
              {roles.length > 0 ? (
                roles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center justify-between p-3 bg-background-alt rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gold/10 rounded-lg text-gold">
                        <ShieldIcon size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {role.name}
                        </p>
                        {role.description && (
                          <p className="text-xs text-text-muted">{role.description}</p>
                        )}
                      </div>
                    </div>
                    {role.isSystem && (
                      <span className="text-xs text-text-muted bg-background-hover px-2 py-1 rounded">
                        System
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-text-muted py-4 text-center">
                  No roles assigned
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader title="Status" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Current Status</span>
                <StatusPill status={mapStatus(user.status)} />
              </div>
              <div className="border-t border-border pt-4">
                {user.status === 'ACTIVE' ? (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => handleStatusChange('suspend')}
                  >
                    Suspend User
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => handleStatusChange('activate')}
                  >
                    Activate User
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Activity Card */}
          <Card>
            <CardHeader title="Activity" />
            <div className="space-y-3">
              <InfoItem
                label="Created"
                value={new Date(user.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              />
              <InfoItem
                label="Last Updated"
                value={new Date(user.updatedAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              />
              {user.lastLoginAt && (
                <InfoItem
                  label="Last Login"
                  value={new Date(user.lastLoginAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                />
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
              Delete User
            </Button>
          </>
        }
      >
        <p className="text-text-secondary">
          Are you sure you want to delete <strong className="text-text-primary">{user.fullName}</strong>?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <p className="text-sm text-text-primary">{value}</p>
    </div>
  );
}

// Mock data
const mockUser: User = {
  id: '1',
  tenantId: 'demo-tenant',
  email: 'max.cardoso@leaderx.com',
  fullName: 'Max Cardoso',
  status: 'ACTIVE',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
  lastLoginAt: '2024-01-20T14:30:00Z',
};

const mockRoles: Role[] = [
  { id: 'role-admin', tenantId: 'demo', name: 'Administrator', description: 'Full system access', isSystem: true, permissions: [], createdAt: '', updatedAt: '' },
  { id: 'role-manager', tenantId: 'demo', name: 'Manager', description: 'Manage users and content', isSystem: false, permissions: [], createdAt: '', updatedAt: '' },
];
