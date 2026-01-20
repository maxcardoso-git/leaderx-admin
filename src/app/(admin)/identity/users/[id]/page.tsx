'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button, Modal } from '@/components/ui';
import { EditIcon, TrashIcon, ShieldIcon, ChevronLeftIcon } from '@/components/icons';
import { User, UserStatus, Role } from '@/types/identity';
import { usersService } from '@/services/identity.service';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('users');
  const common = useTranslations('common');
  const roles_t = useTranslations('roles');
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const mapStatus = (status: UserStatus): { label: string; color: string } => {
    const mapping: Record<UserStatus, { label: string; color: string }> = {
      ACTIVE: { label: common('active'), color: 'text-emerald-400 bg-emerald-400/10' },
      INACTIVE: { label: common('inactive'), color: 'text-white/40 bg-white/[0.05]' },
      SUSPENDED: { label: common('suspended'), color: 'text-red-400 bg-red-400/10' },
      PENDING_VERIFICATION: { label: common('pending'), color: 'text-amber-400 bg-amber-400/10' },
    };
    return mapping[status];
  };

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
      setUser(null);
      setRoles([]);
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
      <div className="space-y-8">
        <div className="h-8 w-48 bg-[var(--color-background-hover)] rounded-lg animate-pulse" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 h-96 bg-[var(--color-background-card)] rounded-2xl animate-pulse border border-[var(--color-border)]" />
          <div className="h-96 bg-[var(--color-background-card)] rounded-2xl animate-pulse border border-[var(--color-border)]" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-[var(--color-text-muted)] mb-4">{t('noUsersFound')}</p>
        <Link href="/identity/users">
          <Button variant="ghost">{common('back')}</Button>
        </Link>
      </div>
    );
  }

  const statusInfo = mapStatus(user.status);

  return (
    <div className="space-y-8">
      {/* Back Link */}
      <Link
        href="/identity/users"
        className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
      >
        <ChevronLeftIcon size={16} />
        {common('back')}
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center">
            <span className="text-gold font-semibold text-xl">
              {user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-light text-white">{user.fullName}</h1>
            <p className="text-white/40 mt-1">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/identity/users/${userId}/edit`}>
            <Button variant="secondary" leftIcon={<EditIcon size={16} />}>
              {t('edit')}
            </Button>
          </Link>
          <Button
            variant="danger"
            leftIcon={<TrashIcon size={16} />}
            onClick={() => setShowDeleteModal(true)}
          >
            {common('delete')}
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="xl:col-span-2 space-y-6">
          {/* Details Card */}
          <div className="bg-card overflow-hidden">
            <div className="p-6 border-b border-[var(--color-border)]">
              <h2 className="text-lg font-medium text-white">{t('basicInfo')}</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <InfoItem label={t('fullName')} value={user.fullName} />
                <InfoItem label={t('email')} value={user.email} />
                {user.externalId && (
                  <InfoItem label="ID" value={user.externalId} />
                )}
              </div>
            </div>
          </div>

          {/* Roles Card */}
          <div className="bg-card overflow-hidden">
            <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
              <h2 className="text-lg font-medium text-white">{t('assignedRoles')}</h2>
              <Link href={`/identity/users/${userId}/edit`}>
                <button className="text-sm text-gold hover:text-gold/80 transition-colors">
                  {t('manageRoles')}
                </button>
              </Link>
            </div>
            <div className="p-6">
              {roles.length > 0 ? (
                <div className="space-y-3">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className="flex items-center justify-between p-4 bg-[var(--color-background-hover)] rounded-xl border border-[var(--color-border)]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-gold/10 rounded-xl text-gold">
                          <ShieldIcon size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{role.name}</p>
                          {role.description && (
                            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{role.description}</p>
                          )}
                        </div>
                      </div>
                      {role.isSystem && (
                        <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-background-alt)] px-2.5 py-1 rounded-lg border border-[var(--color-border)]">
                          {roles_t('systemRole')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--color-text-muted)] text-center py-8">
                  {t('noRolesAssigned')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-card overflow-hidden">
            <div className="p-6 border-b border-[var(--color-border)]">
              <h2 className="text-lg font-medium text-white">{t('status')}</h2>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-secondary)]">{t('currentStatus')}</span>
                <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
              <div className="pt-2">
                {user.status === 'ACTIVE' ? (
                  <button
                    onClick={() => handleStatusChange('suspend')}
                    className="w-full py-3 rounded-xl bg-[var(--color-background-alt)] border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-background-hover)] hover:text-white transition-all"
                  >
                    {t('suspendUser')}
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange('activate')}
                    className="w-full py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 hover:bg-emerald-500/20 transition-all"
                  >
                    {t('activateUser')}
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t('deleteUser')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              {common('cancel')}
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
              {common('delete')}
            </Button>
          </>
        }
      >
        <p className="text-white/60">
          {t('deleteUserConfirm')} <strong className="text-white">{user.fullName}</strong>?
          {' '}{t('actionCannotBeUndone')}
        </p>
      </Modal>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-[var(--color-text-muted)] mb-1">{label}</p>
      <p className="text-sm text-[var(--color-text-secondary)]">{value}</p>
    </div>
  );
}
