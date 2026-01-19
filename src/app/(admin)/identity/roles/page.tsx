'use client';

import { useState, useEffect, useCallback } from 'react';
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
    setRoles(mockRoles);
    setPermissions(mockPermissions);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedRole) {
      rolesService.getUsersWithRole(selectedRole.id).then((result) => {
        setUserCount(result.count);
      });
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
      if (!confirm('Você tem alterações não salvas. Descartar?')) {
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
      alert('Falha ao criar função. Tente novamente.');
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
      alert('Permissões salvas com sucesso!');
    } catch (error) {
      console.error('Failed to save permissions:', error);
      alert('Falha ao salvar permissões.');
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
      alert('Falha ao excluir função.');
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
        <div className="text-text-muted">Carregando...</div>
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
              Funções & Permissões
            </h1>
            <p className="text-text-muted mt-2">
              Gerencie funções e suas permissões associadas
            </p>
          </div>
          <Button
            leftIcon={<PlusIcon size={18} />}
            onClick={() => setShowCreateModal(true)}
          >
            Nova Função
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
                Funções ({roles.length})
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
                              Sistema
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted mt-0.5 truncate">
                          {role.permissions.length} permissões
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
                        {selectedRole.description || 'Sem descrição'}
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-sm text-text-muted">
                          <UsersIcon size={14} />
                          <span>{userCount} usuário{userCount !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-text-muted">
                          <ShieldIcon size={14} />
                          <span>{editedPermissions.length} permissões ativas</span>
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
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                      </Button>
                    )}
                    {!selectedRole.isSystem && (
                      <>
                        <Button
                          variant="secondary"
                          leftIcon={<EditIcon size={16} />}
                          onClick={handleOpenEditModal}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          leftIcon={<TrashIcon size={16} />}
                          onClick={() => setShowDeleteModal(true)}
                          className="text-error hover:bg-error/10"
                          disabled={!canDelete}
                          title={!canDelete && userCount > 0 ? `Não é possível excluir: ${userCount} usuários têm esta função` : undefined}
                        >
                          Excluir
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Warning for users */}
                {userCount > 0 && !selectedRole.isSystem && (
                  <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20 text-warning text-sm">
                    Remova todos os usuários desta função antes de excluí-la.
                  </div>
                )}

                {selectedRole.isSystem && (
                  <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
                    Esta é uma função do sistema e não pode ser editada ou excluída.
                  </div>
                )}
              </Card>

              {/* Permissions Grid */}
              <div className="space-y-8">
                {Object.entries(groupedPermissions).map(([resource, perms]) => (
                  <div key={resource}>
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-lg font-medium text-text-primary">
                        {resource}
                      </h3>
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-text-muted">
                        {perms.filter(p => hasPermission(p.id)).length} de {perms.length}
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
                                  {permission.action}
                                </span>
                              </div>
                              {permission.description && (
                                <p className="text-sm text-text-muted mt-0.5">
                                  {permission.description}
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
                  Selecione uma Função
                </h3>
                <p className="text-text-muted max-w-sm">
                  Escolha uma função na lista ao lado para visualizar e gerenciar suas permissões
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
        title="Criar Nova Função"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateRole} disabled={!newRoleName}>
              Criar Função
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Input
            label="Nome da Função"
            placeholder="Ex: Gerente de Conteúdo"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
          />
          <Input
            label="Descrição"
            placeholder="Breve descrição da função"
            value={newRoleDescription}
            onChange={(e) => setNewRoleDescription(e.target.value)}
          />
        </div>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Função"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowEditModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveRoleDetails} disabled={!editRoleName}>
              Salvar Alterações
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Input
            label="Nome da Função"
            placeholder="Ex: Gerente de Conteúdo"
            value={editRoleName}
            onChange={(e) => setEditRoleName(e.target.value)}
          />
          <Input
            label="Descrição"
            placeholder="Breve descrição da função"
            value={editRoleDescription}
            onChange={(e) => setEditRoleDescription(e.target.value)}
          />
        </div>
      </Modal>

      {/* Delete Role Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Excluir Função"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteRole}
              disabled={!canDelete || deleting}
            >
              {deleting ? 'Excluindo...' : 'Excluir Função'}
            </Button>
          </>
        }
      >
        {userCount > 0 ? (
          <div className="space-y-3">
            <p className="text-error font-medium">Não é possível excluir esta função.</p>
            <p className="text-text-secondary">
              Existem <strong className="text-text-primary">{userCount} usuário{userCount !== 1 ? 's' : ''}</strong> atribuídos
              à função <strong className="text-text-primary">{selectedRole?.name}</strong>.
              Remova todos os usuários antes de excluir.
            </p>
          </div>
        ) : (
          <p className="text-text-secondary">
            Tem certeza que deseja excluir a função{' '}
            <strong className="text-text-primary">{selectedRole?.name}</strong>?
            Esta ação não pode ser desfeita.
          </p>
        )}
      </Modal>
    </div>
  );
}

// Mock data
const mockRoles: Role[] = [
  {
    id: 'role-admin',
    tenantId: 'demo-tenant',
    name: 'Administrador',
    description: 'Acesso completo ao sistema com todas as permissões',
    isSystem: true,
    permissions: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'role-manager',
    tenantId: 'demo-tenant',
    name: 'Gerente',
    description: 'Pode gerenciar usuários e conteúdo',
    isSystem: false,
    permissions: [],
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z',
  },
  {
    id: 'role-member',
    tenantId: 'demo-tenant',
    name: 'Membro',
    description: 'Acesso básico à plataforma',
    isSystem: false,
    permissions: [],
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'role-viewer',
    tenantId: 'demo-tenant',
    name: 'Visualizador',
    description: 'Acesso somente leitura',
    isSystem: false,
    permissions: [],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
];

mockRoles[0].permissions = [
  { id: 'users-create', resource: 'Usuários', action: 'CREATE', description: 'Criar novos usuários' },
  { id: 'users-read', resource: 'Usuários', action: 'READ', description: 'Ver detalhes de usuários' },
  { id: 'users-update', resource: 'Usuários', action: 'UPDATE', description: 'Editar informações de usuários' },
  { id: 'users-delete', resource: 'Usuários', action: 'DELETE', description: 'Remover usuários' },
  { id: 'roles-create', resource: 'Funções', action: 'CREATE', description: 'Criar novas funções' },
  { id: 'roles-read', resource: 'Funções', action: 'READ', description: 'Ver funções' },
  { id: 'roles-update', resource: 'Funções', action: 'UPDATE', description: 'Modificar permissões de funções' },
  { id: 'roles-delete', resource: 'Funções', action: 'DELETE', description: 'Remover funções' },
  { id: 'network-create', resource: 'Rede', action: 'CREATE', description: 'Criar nós de rede' },
  { id: 'network-read', resource: 'Rede', action: 'READ', description: 'Ver estrutura da rede' },
  { id: 'network-update', resource: 'Rede', action: 'UPDATE', description: 'Modificar nós de rede' },
  { id: 'network-delete', resource: 'Rede', action: 'DELETE', description: 'Remover nós de rede' },
  { id: 'audit-read', resource: 'Auditoria', action: 'READ', description: 'Ver logs de auditoria' },
  { id: 'audit-manage', resource: 'Auditoria', action: 'MANAGE', description: 'Executar verificações de conformidade' },
];

mockRoles[1].permissions = [
  { id: 'users-create', resource: 'Usuários', action: 'CREATE', description: 'Criar novos usuários' },
  { id: 'users-read', resource: 'Usuários', action: 'READ', description: 'Ver detalhes de usuários' },
  { id: 'users-update', resource: 'Usuários', action: 'UPDATE', description: 'Editar informações de usuários' },
  { id: 'roles-read', resource: 'Funções', action: 'READ', description: 'Ver funções' },
  { id: 'network-read', resource: 'Rede', action: 'READ', description: 'Ver estrutura da rede' },
  { id: 'audit-read', resource: 'Auditoria', action: 'READ', description: 'Ver logs de auditoria' },
];

mockRoles[2].permissions = [
  { id: 'users-read', resource: 'Usuários', action: 'READ', description: 'Ver detalhes de usuários' },
  { id: 'network-read', resource: 'Rede', action: 'READ', description: 'Ver estrutura da rede' },
];

mockRoles[3].permissions = [
  { id: 'users-read', resource: 'Usuários', action: 'READ', description: 'Ver detalhes de usuários' },
];

const mockPermissions: Permission[] = [
  { id: 'users-create', resource: 'Usuários', action: 'CREATE', description: 'Criar novos usuários' },
  { id: 'users-read', resource: 'Usuários', action: 'READ', description: 'Ver detalhes de usuários' },
  { id: 'users-update', resource: 'Usuários', action: 'UPDATE', description: 'Editar informações de usuários' },
  { id: 'users-delete', resource: 'Usuários', action: 'DELETE', description: 'Remover usuários' },
  { id: 'roles-create', resource: 'Funções', action: 'CREATE', description: 'Criar novas funções' },
  { id: 'roles-read', resource: 'Funções', action: 'READ', description: 'Ver funções' },
  { id: 'roles-update', resource: 'Funções', action: 'UPDATE', description: 'Modificar permissões de funções' },
  { id: 'roles-delete', resource: 'Funções', action: 'DELETE', description: 'Remover funções' },
  { id: 'network-create', resource: 'Rede', action: 'CREATE', description: 'Criar nós de rede' },
  { id: 'network-read', resource: 'Rede', action: 'READ', description: 'Ver estrutura da rede' },
  { id: 'network-update', resource: 'Rede', action: 'UPDATE', description: 'Modificar nós de rede' },
  { id: 'network-delete', resource: 'Rede', action: 'DELETE', description: 'Remover nós de rede' },
  { id: 'audit-read', resource: 'Auditoria', action: 'READ', description: 'Ver logs de auditoria' },
  { id: 'audit-manage', resource: 'Auditoria', action: 'MANAGE', description: 'Executar verificações de conformidade' },
];
