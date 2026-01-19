'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Card, Modal, Input } from '@/components/ui';
import { PlusIcon, EditIcon, TrashIcon, ShieldIcon, UsersIcon, CheckIcon, SaveIcon, ChevronRightIcon } from '@/components/icons';
import { Role, Permission } from '@/types/identity';
import { rolesService, permissionsService } from '@/services/identity.service';

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

export default function RolesPage() {
  const t = useTranslations('roles');
  const tCommon = useTranslations('common');
  const tPermissions = useTranslations('permissions');

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

  useEffect(() => {
    if (selectedRole) {
      const perms = Array.isArray(selectedRole.permissions) ? selectedRole.permissions : [];
      setEditedPermissions(perms.map((p) => p.id));
      setHasChanges(false);
    }
  }, [selectedRole]);

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
      const newRole = await rolesService.create({
        name: newRoleName,
        description: newRoleDescription,
        permissionIds: [],
      });
      setRoles([...roles, newRole]);
      setShowCreateModal(false);
      setNewRoleName('');
      setNewRoleDescription('');
      setSelectedRole(newRole);
    } catch (error) {
      console.error('Failed to create role:', error);
      alert(t('failedToCreateRole'));
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
    if (selectedRole) {
      const updatedRole = {
        ...selectedRole,
        name: editRoleName,
        description: editRoleDescription,
      };
      setRoles(roles.map((r) => (r.id === selectedRole.id ? updatedRole : r)));
      setSelectedRole(updatedRole);
      setShowEditModal(false);
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      await rolesService.updatePermissions(selectedRole.id, editedPermissions);
      const permsArray = Array.isArray(permissions) ? permissions : [];
      const updatedPermissions = permsArray.filter((p) => editedPermissions.includes(p.id));
      const updatedRole = { ...selectedRole, permissions: updatedPermissions };
      const rolesArray = Array.isArray(roles) ? roles : [];
      setRoles(rolesArray.map((r) => (r.id === selectedRole.id ? updatedRole : r)));
      setSelectedRole(updatedRole);
      setHasChanges(false);
      alert(t('permissionsSaved'));
    } catch (error) {
      console.error('Failed to save permissions:', error);
      alert(t('failedToSavePermissions'));
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
    } catch (error) {
      console.error('Failed to delete role:', error);
      alert(t('failedToDeleteRole'));
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-text-muted">{tCommon('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-text-primary tracking-tight">
              {t('title')}
            </h1>
            <p className="text-text-muted mt-2">
              {t('subtitle')}
            </p>
          </div>
          <Button
            leftIcon={<PlusIcon size={18} />}
            onClick={() => setShowCreateModal(true)}
          >
            {t('newRole')}
          </Button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex gap-8">
        {/* Sidebar - Roles List */}
        <div className="w-80 flex-shrink-0">
          <div className="sticky top-6">
            <div className="mb-4">
              <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">
                {t('rolesCount')} ({roles.length})
              </h2>
            </div>

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
                        ? 'bg-background-card border-2 border-gold shadow-lg shadow-gold/5'
                        : 'bg-background-card/50 border-2 border-transparent hover:bg-background-card hover:border-border'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center
                        ${isSelected ? 'bg-gold/20 text-gold' : 'bg-background-alt text-text-muted'}
                      `}>
                        <ShieldIcon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${isSelected ? 'text-gold' : 'text-text-primary'}`}>
                            {role.name}
                          </span>
                          {role.isSystem && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-background-alt text-text-muted uppercase tracking-wide">
                              {t('systemRole')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted mt-0.5 truncate">
                          {role.permissions.length} {t('permissions')}
                        </p>
                      </div>
                      <ChevronRightIcon size={16} className={`text-text-muted transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content - Permissions */}
        <div className="flex-1 min-w-0">
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
                        {tPermissions(resource)}
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
                                  {tPermissions(permission.action)}
                                </span>
                              </div>
                              {permission.description && (
                                <p className="text-sm text-text-muted mt-0.5">
                                  {tPermissions(permission.description)}
                                </p>
                              )}
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
