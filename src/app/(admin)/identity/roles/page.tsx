'use client';

import { useState } from 'react';
import { Button, Card, CardHeader, Modal, Input, Checkbox } from '@/components/ui';
import { PlusIcon, EditIcon, TrashIcon, ShieldIcon, UsersIcon, CheckIcon } from '@/components/icons';
import { Role, Permission, PermissionAction } from '@/types/identity';

// Group permissions by resource
const groupPermissions = (permissions: Permission[]) => {
  return permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);
};

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');

  const permissions = mockPermissions;
  const groupedPermissions = groupPermissions(permissions);

  const handleCreateRole = () => {
    if (!newRoleName) return;

    const newRole: Role = {
      id: `role-${Date.now()}`,
      tenantId: 'demo-tenant',
      name: newRoleName,
      description: newRoleDescription,
      isSystem: false,
      permissions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRoles([...roles, newRole]);
    setShowCreateModal(false);
    setNewRoleName('');
    setNewRoleDescription('');
    setSelectedRole(newRole);
  };

  const handleDeleteRole = () => {
    if (!selectedRole) return;
    setRoles(roles.filter((r) => r.id !== selectedRole.id));
    setSelectedRole(null);
    setShowDeleteModal(false);
  };

  const togglePermission = (permission: Permission) => {
    if (!selectedRole) return;

    const hasPermission = selectedRole.permissions.some(
      (p) => p.id === permission.id
    );

    const updatedPermissions = hasPermission
      ? selectedRole.permissions.filter((p) => p.id !== permission.id)
      : [...selectedRole.permissions, permission];

    const updatedRole = { ...selectedRole, permissions: updatedPermissions };
    setSelectedRole(updatedRole);
    setRoles(roles.map((r) => (r.id === selectedRole.id ? updatedRole : r)));
  };

  const hasPermission = (permissionId: string) => {
    return selectedRole?.permissions.some((p) => p.id === permissionId) ?? false;
  };

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
                onClick={() => setSelectedRole(role)}
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
                {!selectedRole.isSystem && (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" leftIcon={<EditIcon size={16} />}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<TrashIcon size={16} />}
                      onClick={() => setShowDeleteModal(true)}
                      className="text-error hover:text-error"
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              {/* Users with this role */}
              <div className="mb-6 p-4 bg-background-alt rounded-lg">
                <div className="flex items-center gap-2 text-text-muted">
                  <UsersIcon size={16} />
                  <span className="text-sm">
                    {Math.floor(Math.random() * 20) + 1} users have this role
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
                          onClick={() => !selectedRole.isSystem && togglePermission(permission)}
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
            <Button variant="danger" onClick={handleDeleteRole}>
              Delete Role
            </Button>
          </>
        }
      >
        <p className="text-text-secondary">
          Are you sure you want to delete the{' '}
          <strong className="text-text-primary">{selectedRole?.name}</strong> role?
          Users with this role will lose their associated permissions.
        </p>
      </Modal>
    </div>
  );
}

// Mock data
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
