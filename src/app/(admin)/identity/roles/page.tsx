'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button, Card, Modal, Input, useToast } from '@/components/ui';
import { PlusIcon, EditIcon, TrashIcon, ShieldIcon, UsersIcon, CheckIcon, SaveIcon, ChevronRightIcon, SettingsIcon, GroupIcon } from '@/components/icons';
import { Role, Permission } from '@/types/identity';
import { rolesService, permissionsService } from '@/services/identity.service';

// Stats Card Component (same style as Dashboard)
function StatsCard({
  label,
  value,
  subtitle,
  icon,
  loading,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-xl bg-white/90 backdrop-blur-sm border border-white/50 shadow-sm group hover:shadow-md hover:bg-white transition-all duration-300"
      style={{ padding: '20px 24px' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            ) : (
              <span className="text-2xl font-semibold text-gray-900">{value}</span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
        <div className="p-2.5 rounded-xl bg-gold/10 text-gold group-hover:bg-gold/20 transition-all duration-300 flex-shrink-0">
          {icon}
        </div>
      </div>
    </div>
  );
}

// Quick Action Card Component
function QuickActionCard({
  icon,
  label,
  description,
  href,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  href?: string;
  color: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white group-hover:text-gold transition-colors">
          {label}
        </p>
        {description && (
          <p className="text-sm text-white/40 truncate">{description}</p>
        )}
      </div>
      <ChevronRightIcon size={16} className="text-white/30 group-hover:text-gold group-hover:translate-x-1 transition-all" />
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="group flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-300 w-full text-left"
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={href || '#'}
      className="group flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-300"
    >
      {content}
    </Link>
  );
}

// Group permissions by resource
const groupPermissions = (permissions: Permission[]) => {
  if (!Array.isArray(permissions)) return {};
  return permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);
};

// Format resource name for display (e.g., "roles" -> "Roles", "users" -> "Users")
const formatResourceName = (resource: string): string => {
  const resourceNames: Record<string, string> = {
    roles: 'Funções',
    users: 'Usuários',
    permissions: 'Permissões',
    events: 'Eventos',
    network: 'Rede',
    settings: 'Configurações',
  };
  return resourceNames[resource] || resource.charAt(0).toUpperCase() + resource.slice(1);
};

export default function RolesPage() {
  const t = useTranslations('roles');
  const tCommon = useTranslations('common');
  const tPermissions = useTranslations('permissions');
  const { showToast } = useToast();

  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [editedPermissions, setEditedPermissions] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [userCount, setUserCount] = useState<number>(0);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form state
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [editRoleName, setEditRoleName] = useState('');
  const [editRoleDescription, setEditRoleDescription] = useState('');

  const groupedPermissions = groupPermissions(permissions);

  // Fetch roles and permissions
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rolesResponse, permissionsResponse] = await Promise.all([
        rolesService.list(),
        permissionsService.list(),
      ]);
      setRoles(rolesResponse.items || []);
      setPermissions(permissionsResponse || []);
    } catch (error) {
      console.error('Failed to load roles and permissions:', error);
      setRoles([]);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset user count when selecting a role
  // Note: getUsersWithRole API endpoint is not yet available
  useEffect(() => {
    if (selectedRole) {
      setUserCount(0);
    }
  }, [selectedRole]);

  // Fetch role permissions when a role is selected
  useEffect(() => {
    const fetchRolePermissions = async () => {
      if (selectedRole) {
        try {
          // Fetch permissions for this role from the API
          const rolePermissions = await permissionsService.getByRole(selectedRole.id);
          setEditedPermissions(rolePermissions.map((p) => p.id));

          // Update the role in our local state with the fetched permissions
          const updatedRole = { ...selectedRole, permissions: rolePermissions };
          setRoles(prev => prev.map(r => r.id === selectedRole.id ? updatedRole : r));
        } catch (error) {
          console.error('Failed to fetch role permissions:', error);
          setEditedPermissions([]);
        }
        setHasChanges(false);
      }
    };
    fetchRolePermissions();
  }, [selectedRole?.id]);

  const handleSelectRole = (role: Role) => {
    if (hasChanges) {
      if (!confirm(t('unsavedChanges'))) {
        return;
      }
    }
    setSelectedRole(role);
  };

  const handleCreateRole = async () => {
    if (!newRoleName) return;
    try {
      // Generate a code from the name (lowercase, no spaces, alphanumeric)
      const code = newRoleName.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
      const newRole = await rolesService.create({
        name: newRoleName,
        code: code,
        description: newRoleDescription,
      });
      setRoles([...roles, newRole]);
      setShowCreateModal(false);
      setNewRoleName('');
      setNewRoleDescription('');
      setSelectedRole(newRole);
      showToast('success', t('roleCreated'));
    } catch (error) {
      console.error('Failed to create role:', error);
      showToast('error', t('failedToCreateRole'));
    }
  };

  const handleOpenEditModal = () => {
    if (selectedRole) {
      setEditRoleName(selectedRole.name);
      setEditRoleDescription(selectedRole.description || '');
      setShowEditModal(true);
    }
  };

  const handleSaveRoleDetails = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      await rolesService.update(selectedRole.id, {
        name: editRoleName,
        description: editRoleDescription,
      });
      const updatedRole = {
        ...selectedRole,
        name: editRoleName,
        description: editRoleDescription,
      };
      setRoles(roles.map((r) => (r.id === selectedRole.id ? updatedRole : r)));
      setSelectedRole(updatedRole);
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to update role:', error);
      showToast('error', t('failedToUpdateRole'));
    } finally {
      setSaving(false);
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      // Convert permission IDs to permission codes (format: RESOURCE.ACTION)
      const permsArray = Array.isArray(permissions) ? permissions : [];
      const permissionsToSave = editedPermissions
        .map((id) => {
          const perm = permsArray.find((p) => p.id === id);
          return perm ? { permissionCode: `${perm.resource.toUpperCase()}.${perm.action}`, effect: 'ALLOW' as const } : null;
        })
        .filter((p): p is { permissionCode: string; effect: 'ALLOW' } => p !== null);

      await rolesService.updatePermissions(selectedRole.id, permissionsToSave);
      const updatedPermissions = permsArray.filter((p) => editedPermissions.includes(p.id));
      const updatedRole = { ...selectedRole, permissions: updatedPermissions };
      const rolesArray = Array.isArray(roles) ? roles : [];
      setRoles(rolesArray.map((r) => (r.id === selectedRole.id ? updatedRole : r)));
      setSelectedRole(updatedRole);
      setHasChanges(false);
      showToast('success', t('permissionsSaved'));
    } catch (error) {
      console.error('Failed to save permissions:', error);
      showToast('error', t('failedToSavePermissions'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;
    setDeleting(true);
    try {
      await rolesService.delete(selectedRole.id);
      const rolesArray = Array.isArray(roles) ? roles : [];
      setRoles(rolesArray.filter((r) => r.id !== selectedRole.id));
      setSelectedRole(null);
      setShowDeleteModal(false);
      showToast('success', t('roleDeleted'));
    } catch (error) {
      console.error('Failed to delete role:', error);
      showToast('error', t('failedToDeleteRole'));
    } finally {
      setDeleting(false);
    }
  };

  const togglePermission = (permission: Permission) => {
    if (!selectedRole || selectedRole.isSystem) return;
    const hasPermission = editedPermissions.includes(permission.id);
    const newPermissions = hasPermission
      ? editedPermissions.filter((id) => id !== permission.id)
      : [...editedPermissions, permission.id];
    setEditedPermissions(newPermissions);
    setHasChanges(true);
  };

  const hasPermission = (permissionId: string) => {
    return editedPermissions.includes(permissionId);
  };

  const canDelete = !selectedRole?.isSystem && userCount === 0;

  // Calculate stats
  const systemRoles = roles.filter((r) => r.isSystem).length;
  const customRoles = roles.length - systemRoles;
  const totalPermissions = permissions.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-text-muted">{tCommon('loading')}</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f35] via-[#141824] to-[#0d1117]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />

        <div className="relative p-8 md:p-10">
          {/* Top Label & Actions */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              <span className="text-xs font-medium text-gold uppercase tracking-wider">
                {t('title')}
              </span>
            </div>
            <Button
              leftIcon={<PlusIcon size={18} />}
              onClick={() => setShowCreateModal(true)}
            >
              {t('newRole')}
            </Button>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-light text-white mb-3">
            {t('title')}
          </h1>
          <p className="text-lg text-white/50 max-w-2xl">
            {t('subtitle')}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <StatsCard
              label={t('totalRoles')}
              value={roles.length || '-'}
              subtitle={`${customRoles} ${t('custom').toLowerCase()}`}
              icon={<ShieldIcon size={20} />}
              loading={loading}
            />
            <StatsCard
              label={t('systemRoles')}
              value={systemRoles || '-'}
              icon={<SettingsIcon size={20} />}
              loading={loading}
            />
            <StatsCard
              label={t('customRoles')}
              value={customRoles || '-'}
              icon={<GroupIcon size={20} />}
              loading={loading}
            />
            <StatsCard
              label={t('totalPermissions')}
              value={totalPermissions || '-'}
              icon={<CheckIcon size={20} />}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '32px' }} className="lg:!grid-cols-4">
        {/* Sidebar - Roles List */}
        <div className="lg:col-span-1" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{t('rolesCount')} ({roles.length})</h2>
          </div>

          <Card className="!p-0 overflow-hidden">
            <div className="p-3 max-h-[600px] overflow-y-auto">
              <div className="space-y-2">
                {roles.map((role) => {
                  const isSelected = selectedRole?.id === role.id;
                  return (
                    <button
                      key={role.id}
                      onClick={() => handleSelectRole(role)}
                      className={`
                        w-full text-left p-4 rounded-xl transition-all duration-200
                        ${isSelected
                          ? 'bg-gold/10 border border-gold/30'
                          : 'bg-white/[0.02] border border-transparent hover:bg-white/[0.05] hover:border-white/[0.08]'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-10 h-10 rounded-lg flex items-center justify-center
                          ${isSelected ? 'bg-gold/20 text-gold' : 'bg-white/[0.05] text-text-muted'}
                        `}>
                          <ShieldIcon size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${isSelected ? 'text-gold' : 'text-text-primary'}`}>
                              {role.name}
                            </span>
                            {role.isSystem && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-text-muted uppercase tracking-wide">
                                {t('systemRole')}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-text-muted mt-0.5 truncate">
                            {(role.permissions?.length || 0)} {t('permissions')}
                          </p>
                        </div>
                        <ChevronRightIcon size={16} className={`text-text-muted transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content - Permissions */}
        <div className="lg:col-span-3" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {selectedRole ? (
            <div className="space-y-6">
              {/* Role Header Card */}
              <Card className="!p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                      <ShieldIcon size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-light text-text-primary">
                        {selectedRole.name}
                      </h2>
                      <p className="text-text-muted mt-1">
                        {selectedRole.description || t('noDescription')}
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-sm text-text-muted">
                          <UsersIcon size={14} />
                          <span>{userCount} {userCount !== 1 ? t('users') : t('user')}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-text-muted">
                          <ShieldIcon size={14} />
                          <span>{editedPermissions.length} {t('activePermissions')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasChanges && (
                      <Button
                        variant="primary"
                        leftIcon={<SaveIcon size={16} />}
                        onClick={handleSavePermissions}
                        disabled={saving}
                      >
                        {saving ? t('saving') : t('saveChanges')}
                      </Button>
                    )}
                    {!selectedRole.isSystem && (
                      <>
                        <Button
                          variant="secondary"
                          leftIcon={<EditIcon size={16} />}
                          onClick={handleOpenEditModal}
                        >
                          {tCommon('edit')}
                        </Button>
                        <Button
                          variant="ghost"
                          leftIcon={<TrashIcon size={16} />}
                          onClick={() => setShowDeleteModal(true)}
                          className="text-error hover:bg-error/10"
                          disabled={!canDelete}
                          title={!canDelete && userCount > 0 ? `${t('cannotDelete')}: ${userCount} ${t('usersAssigned')}` : undefined}
                        >
                          {tCommon('delete')}
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Warning for users */}
                {userCount > 0 && !selectedRole.isSystem && (
                  <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20 text-warning text-sm">
                    {t('removeUsersWarning')}
                  </div>
                )}

                {selectedRole.isSystem && (
                  <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
                    {t('systemRoleWarning')}
                  </div>
                )}
              </Card>

              {/* Permissions Grid */}
              <div className="space-y-8">
                {Object.entries(groupedPermissions).map(([resource, perms]) => (
                  <div key={resource}>
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-lg font-medium text-text-primary">
                        {formatResourceName(resource)}
                      </h3>
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-text-muted">
                        {perms.filter(p => hasPermission(p.id)).length} {t('of')} {perms.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {perms.map((permission) => {
                        const isActive = hasPermission(permission.id);
                        const isDisabled = selectedRole.isSystem;

                        return (
                          <button
                            key={permission.id}
                            onClick={() => togglePermission(permission)}
                            disabled={isDisabled}
                            className={`
                              group relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left
                              ${isActive
                                ? 'bg-gold/5 border-gold/50'
                                : 'bg-background-card/50 border-transparent hover:border-border hover:bg-background-card'
                              }
                              ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                            `}
                          >
                            {/* Checkbox */}
                            <div className={`
                              w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
                              ${isActive
                                ? 'bg-gold border-gold'
                                : 'border-border group-hover:border-text-muted'
                              }
                            `}>
                              {isActive && <CheckIcon size={14} className="text-background" />}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`font-medium ${isActive ? 'text-gold' : 'text-text-primary'}`}>
                                  {permission.description || permission.action}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Empty State */
            <Card className="!p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-background-alt flex items-center justify-center mb-6">
                  <ShieldIcon size={40} className="text-text-muted" />
                </div>
                <h3 className="text-xl font-light text-text-primary mb-2">
                  {t('selectRole')}
                </h3>
                <p className="text-text-muted max-w-sm">
                  {t('selectRoleDescription')}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Create Role Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={t('newRole')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={handleCreateRole} disabled={!newRoleName}>
              {t('createRole')}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Input
            label={t('roleName')}
            placeholder={t('roleNamePlaceholder')}
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
          />
          <Input
            label={t('roleDescription')}
            placeholder={t('roleDescriptionPlaceholder')}
            value={newRoleDescription}
            onChange={(e) => setNewRoleDescription(e.target.value)}
          />
        </div>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={t('editRole')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowEditModal(false)}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={handleSaveRoleDetails} disabled={!editRoleName}>
              {t('saveChanges')}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Input
            label={t('roleName')}
            placeholder={t('roleNamePlaceholder')}
            value={editRoleName}
            onChange={(e) => setEditRoleName(e.target.value)}
          />
          <Input
            label={t('roleDescription')}
            placeholder={t('roleDescriptionPlaceholder')}
            value={editRoleDescription}
            onChange={(e) => setEditRoleDescription(e.target.value)}
          />
        </div>
      </Modal>

      {/* Delete Role Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t('deleteRole')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              {tCommon('cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteRole}
              disabled={!canDelete || deleting}
            >
              {deleting ? t('deleting') : t('deleteRole')}
            </Button>
          </>
        }
      >
        {userCount > 0 ? (
          <div className="space-y-3">
            <p className="text-error font-medium">{t('cannotDelete')}</p>
            <p className="text-text-secondary">
              <strong className="text-text-primary">{userCount} {userCount !== 1 ? t('users') : t('user')}</strong>{' '}
              {t('usersAssigned')}{' '}
              <strong className="text-text-primary">{selectedRole?.name}</strong>.{' '}
              {t('removeUsersFirst')}
            </p>
          </div>
        ) : (
          <p className="text-text-secondary">
            {t('deleteRoleConfirm')}{' '}
            <strong className="text-text-primary">{selectedRole?.name}</strong>?
          </p>
        )}
      </Modal>
    </div>
  );
}
