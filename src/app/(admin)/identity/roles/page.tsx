'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Card, CardHeader, Modal, Input } from '@/components/ui';
import { PlusIcon, EditIcon, TrashIcon, ShieldIcon, UsersIcon, CheckIcon, SaveIcon } from '@/components/icons';
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
      const rolesData = Array.isArray(rolesResponse?.items) ? rolesResponse.items : [];
      const permsData = Array.isArray(permissionsResponse) ? permissionsResponse : [];

      // Ensure each role has permissions as array
      const normalizedRoles = rolesData.map(role => ({
        ...role,
        permissions: Array.isArray(role.permissions) ? role.permissions : []
      }));

      setRoles(normalizedRoles.length > 0 ? normalizedRoles : mockRoles);
      setPermissions(permsData.length > 0 ? permsData : mockPermissions);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      // Use mock data as fallback
      setRoles(mockRoles);
      setPermissions(mockPermissions);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Check user count when selecting a role
  useEffect(() => {
    if (selectedRole) {
      rolesService.getUsersWithRole(selectedRole.id).then((result) => {
        setUserCount(result.count);
      });
    }
  }, [selectedRole]);

  // Update edited permissions when role changes
  useEffect(() => {
    if (selectedRole) {
      const perms = Array.isArray(selectedRole.permissions) ? selectedRole.permissions : [];
      setEditedPermissions(perms.map((p) => p.id));
      setHasChanges(false);
    }
  }, [selectedRole]);

  const handleSelectRole = (role: Role) => {
    if (hasChanges) {
      if (!confirm('You have unsaved changes. Discard them?')) {
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
      alert('Failed to create role. Please try again.');
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
    // Note: API may not support updating role name/description directly
    // This updates locally and closes modal
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

      // Update local state
      const permsArray = Array.isArray(permissions) ? permissions : [];
      const updatedPermissions = permsArray.filter((p) => editedPermissions.includes(p.id));
      const updatedRole = { ...selectedRole, permissions: updatedPermissions };
      const rolesArray = Array.isArray(roles) ? roles : [];
      setRoles(rolesArray.map((r) => (r.id === selectedRole.id ? updatedRole : r)));
      setSelectedRole(updatedRole);
      setHasChanges(false);
      alert('Permissions saved successfully!');
    } catch (error) {
      console.error('Failed to save permissions:', error);
      alert('Failed to save permissions. Please try again.');
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
      alert('Failed to delete role. Please try again.');
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
      <div className="flex items-center justify-center h-64">
        <div className="text-text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-text-primary">
            Roles & Permissions
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Manage roles and their associated permissions
          </p>
        </div>
        <Button
          leftIcon={<PlusIcon size={18} />}
          onClick={() => setShowCreateModal(true)}
        >
          Create Role
        </Button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Roles List */}
        <Card className="col-span-1">
          <CardHeader title="Roles" subtitle={`${roles.length} roles defined`} />
          <div className="space-y-2">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => handleSelectRole(role)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                  selectedRole?.id === role.id
                    ? 'bg-gold/10 border border-gold'
                    : 'bg-background-alt hover:bg-background-hover border border-transparent'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    selectedRole?.id === role.id
                      ? 'bg-gold/20 text-gold'
                      : 'bg-background-hover text-text-muted'
                  }`}
                >
                  <ShieldIcon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      selectedRole?.id === role.id
                        ? 'text-gold'
                        : 'text-text-primary'
                    }`}
                  >
                    {role.name}
                  </p>
                  <p className="text-xs text-text-muted truncate">
                    {role.permissions.length} permissions
                  </p>
                </div>
                {role.isSystem && (
                  <span className="text-xs text-text-muted bg-background-hover px-2 py-1 rounded">
                    System
                  </span>
                )}
              </button>
            ))}
          </div>
        </Card>

        {/* Permissions Panel */}
        <Card className="col-span-2">
          {selectedRole ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-heading text-lg font-semibold text-text-primary">
                    {selectedRole.name}
                  </h3>
                  <p className="text-sm text-text-muted mt-0.5">
                    {selectedRole.description || 'No description'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {hasChanges && (
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<SaveIcon size={16} />}
                      onClick={handleSavePermissions}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                  )}
                  {!selectedRole.isSystem && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<EditIcon size={16} />}
                        onClick={handleOpenEditModal}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<TrashIcon size={16} />}
                        onClick={() => setShowDeleteModal(true)}
                        className="text-error hover:text-error"
                        disabled={!canDelete}
                        title={!canDelete && userCount > 0 ? `Cannot delete: ${userCount} users have this role` : undefined}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Users with this role */}
              <div className="mb-6 p-4 bg-background-alt rounded-lg">
                <div className="flex items-center gap-2 text-text-muted">
                  <UsersIcon size={16} />
                  <span className="text-sm">
                    {userCount} user{userCount !== 1 ? 's' : ''} have this role
                    {userCount > 0 && !selectedRole.isSystem && (
                      <span className="text-warning ml-2">
                        (remove users before deleting)
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Permissions by Resource */}
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([resource, perms]) => (
                  <div key={resource}>
                    <h4 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">
                      {resource}
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {perms.map((permission) => (
                        <button
                          key={permission.id}
                          onClick={() => togglePermission(permission)}
                          disabled={selectedRole.isSystem}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                            hasPermission(permission.id)
                              ? 'bg-gold/10 border-gold text-gold'
                              : 'bg-background-alt border-border text-text-secondary hover:border-border-light'
                          } ${selectedRole.isSystem ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                        >
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              hasPermission(permission.id)
                                ? 'bg-gold border-gold'
                                : 'border-border'
                            }`}
                          >
                            {hasPermission(permission.id) && (
                              <CheckIcon size={12} className="text-background" />
                            )}
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium">{permission.action}</p>
                            {permission.description && (
                              <p className="text-xs text-text-muted">
                                {permission.description}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-text-muted">
              <ShieldIcon size={48} className="mb-4 opacity-50" />
              <p className="text-sm">Select a role to view and manage permissions</p>
            </div>
          )}
        </Card>
      </div>

      {/* Create Role Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Role"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRole} disabled={!newRoleName}>
              Create Role
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Role Name"
            placeholder="e.g., Content Manager"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
          />
          <Input
            label="Description"
            placeholder="Brief description of the role"
            value={newRoleDescription}
            onChange={(e) => setNewRoleDescription(e.target.value)}
          />
        </div>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Role"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRoleDetails} disabled={!editRoleName}>
              Save Changes
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Role Name"
            placeholder="e.g., Content Manager"
            value={editRoleName}
            onChange={(e) => setEditRoleName(e.target.value)}
          />
          <Input
            label="Description"
            placeholder="Brief description of the role"
            value={editRoleDescription}
            onChange={(e) => setEditRoleDescription(e.target.value)}
          />
        </div>
      </Modal>

      {/* Delete Role Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Role"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteRole}
              disabled={!canDelete || deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Role'}
            </Button>
          </>
        }
      >
        {userCount > 0 ? (
          <div className="text-error">
            <p className="mb-2">Cannot delete this role.</p>
            <p className="text-text-secondary">
              There {userCount === 1 ? 'is' : 'are'}{' '}
              <strong className="text-text-primary">{userCount} user{userCount !== 1 ? 's' : ''}</strong>{' '}
              assigned to the <strong className="text-text-primary">{selectedRole?.name}</strong> role.
              Please remove all users from this role before deleting.
            </p>
          </div>
        ) : (
          <p className="text-text-secondary">
            Are you sure you want to delete the{' '}
            <strong className="text-text-primary">{selectedRole?.name}</strong> role?
            This action cannot be undone.
          </p>
        )}
      </Modal>
    </div>
  );
}

// Mock data as fallback
const mockRoles: Role[] = [
  {
    id: 'role-admin',
    tenantId: 'demo-tenant',
    name: 'Administrator',
    description: 'Full system access with all permissions',
    isSystem: true,
    permissions: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'role-manager',
    tenantId: 'demo-tenant',
    name: 'Manager',
    description: 'Can manage users and content',
    isSystem: false,
    permissions: [],
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z',
  },
  {
    id: 'role-member',
    tenantId: 'demo-tenant',
    name: 'Member',
    description: 'Basic access to the platform',
    isSystem: false,
    permissions: [],
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'role-viewer',
    tenantId: 'demo-tenant',
    name: 'Viewer',
    description: 'Read-only access',
    isSystem: false,
    permissions: [],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
];

// Initialize admin with all permissions
mockRoles[0].permissions = [
  { id: 'users-create', resource: 'Users', action: 'CREATE' },
  { id: 'users-read', resource: 'Users', action: 'READ' },
  { id: 'users-update', resource: 'Users', action: 'UPDATE' },
  { id: 'users-delete', resource: 'Users', action: 'DELETE' },
  { id: 'roles-create', resource: 'Roles', action: 'CREATE' },
  { id: 'roles-read', resource: 'Roles', action: 'READ' },
  { id: 'roles-update', resource: 'Roles', action: 'UPDATE' },
  { id: 'roles-delete', resource: 'Roles', action: 'DELETE' },
  { id: 'network-create', resource: 'Network', action: 'CREATE' },
  { id: 'network-read', resource: 'Network', action: 'READ' },
  { id: 'network-update', resource: 'Network', action: 'UPDATE' },
  { id: 'network-delete', resource: 'Network', action: 'DELETE' },
  { id: 'audit-read', resource: 'Audit', action: 'READ' },
  { id: 'audit-manage', resource: 'Audit', action: 'MANAGE' },
];

// Initialize manager with partial permissions
mockRoles[1].permissions = [
  { id: 'users-create', resource: 'Users', action: 'CREATE' },
  { id: 'users-read', resource: 'Users', action: 'READ' },
  { id: 'users-update', resource: 'Users', action: 'UPDATE' },
  { id: 'roles-read', resource: 'Roles', action: 'READ' },
  { id: 'network-read', resource: 'Network', action: 'READ' },
  { id: 'audit-read', resource: 'Audit', action: 'READ' },
];

// Initialize member with basic permissions
mockRoles[2].permissions = [
  { id: 'users-read', resource: 'Users', action: 'READ' },
  { id: 'network-read', resource: 'Network', action: 'READ' },
];

// Initialize viewer with read-only
mockRoles[3].permissions = [
  { id: 'users-read', resource: 'Users', action: 'READ' },
];

const mockPermissions: Permission[] = [
  { id: 'users-create', resource: 'Users', action: 'CREATE', description: 'Create new users' },
  { id: 'users-read', resource: 'Users', action: 'READ', description: 'View user details' },
  { id: 'users-update', resource: 'Users', action: 'UPDATE', description: 'Edit user information' },
  { id: 'users-delete', resource: 'Users', action: 'DELETE', description: 'Remove users' },
  { id: 'roles-create', resource: 'Roles', action: 'CREATE', description: 'Create new roles' },
  { id: 'roles-read', resource: 'Roles', action: 'READ', description: 'View roles' },
  { id: 'roles-update', resource: 'Roles', action: 'UPDATE', description: 'Modify role permissions' },
  { id: 'roles-delete', resource: 'Roles', action: 'DELETE', description: 'Remove roles' },
  { id: 'network-create', resource: 'Network', action: 'CREATE', description: 'Create network nodes' },
  { id: 'network-read', resource: 'Network', action: 'READ', description: 'View network structure' },
  { id: 'network-update', resource: 'Network', action: 'UPDATE', description: 'Modify network nodes' },
  { id: 'network-delete', resource: 'Network', action: 'DELETE', description: 'Remove network nodes' },
  { id: 'audit-read', resource: 'Audit', action: 'READ', description: 'View audit logs' },
  { id: 'audit-manage', resource: 'Audit', action: 'MANAGE', description: 'Run compliance checks' },
];
