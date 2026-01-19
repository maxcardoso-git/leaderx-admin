'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Button, Table, StatusPill, Input, Select, Card, Avatar, Pagination, Modal, Checkbox } from '@/components/ui';
import { PlusIcon, SearchIcon, FilterIcon, EditIcon, TrashIcon, EyeIcon, ShieldIcon } from '@/components/icons';
import { User, UserStatus, Role } from '@/types/identity';
import { usersService, rolesService } from '@/services/identity.service';

const mapStatus = (status: UserStatus): 'active' | 'inactive' | 'pending' | 'suspended' => {
  const mapping: Record<UserStatus, 'active' | 'inactive' | 'pending' | 'suspended'> = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
    PENDING_VERIFICATION: 'pending',
  };
  return mapping[status];
};

export default function UsersPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('users');
  const common = useTranslations('common');
  const tRoles = useTranslations('roles');

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Roles modal state
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [isSavingRoles, setIsSavingRoles] = useState(false);

  const statusOptions = [
    { value: '', label: t('allStatus') },
    { value: 'ACTIVE', label: common('active') },
    { value: 'INACTIVE', label: common('inactive') },
    { value: 'SUSPENDED', label: common('suspended') },
    { value: 'PENDING_VERIFICATION', label: common('pending') },
  ];

  useEffect(() => {
    loadUsers();
  }, [statusFilter]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await usersService.list({
        status: statusFilter || undefined,
      });
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
      // Use mock data for demo
      setUsers(mockUsers);
    } finally {
      setIsLoading(false);
    }
  };

  const openRolesModal = async (user: User) => {
    setSelectedUser(user);
    setShowRolesModal(true);
    setIsLoadingRoles(true);

    try {
      const [rolesResponse, currentUserRoles] = await Promise.all([
        rolesService.list(),
        usersService.getUserRoles(user.id),
      ]);

      const roles = rolesResponse.items || [];

      // Use mock data if API returns empty
      if (roles.length === 0) {
        setAvailableRoles(mockRoles);
      } else {
        setAvailableRoles(roles);
      }

      setUserRoles(currentUserRoles.map((r) => r.id));
    } catch (error) {
      console.error('Failed to load roles:', error);
      // Fallback to mock data
      setAvailableRoles(mockRoles);
      setUserRoles(['role-admin']);
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const closeRolesModal = () => {
    setShowRolesModal(false);
    setSelectedUser(null);
    setUserRoles([]);
  };

  const toggleRole = async (roleId: string) => {
    if (!selectedUser) return;

    setIsSavingRoles(true);
    try {
      if (userRoles.includes(roleId)) {
        await usersService.removeRole(selectedUser.id, roleId);
        setUserRoles((prev) => prev.filter((id) => id !== roleId));
      } else {
        await usersService.assignRole(selectedUser.id, roleId);
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
    } finally {
      setIsSavingRoles(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const columns = [
    {
      key: 'fullName',
      header: t('user'),
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <Avatar name={user.fullName} size="md" />
          <div>
            <p className="font-medium text-text-primary">{user.fullName}</p>
            <p className="text-xs text-text-muted">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: t('status'),
      width: '120px',
      render: (user: User) => (
        <StatusPill status={mapStatus(user.status)} />
      ),
    },
    {
      key: 'createdAt',
      header: t('created'),
      width: '150px',
      render: (user: User) => (
        <span className="text-text-muted">
          {new Date(user.createdAt).toLocaleDateString(locale)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '120px',
      render: (user: User) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/identity/users/${user.id}`);
            }}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-background-hover transition-colors"
            title={common('view')}
          >
            <EyeIcon size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openRolesModal(user);
            }}
            className="p-2 rounded-lg text-text-muted hover:text-gold hover:bg-background-hover transition-colors"
            title={t('manageRoles')}
          >
            <ShieldIcon size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/identity/users/${user.id}/edit`);
            }}
            className="p-2 rounded-lg text-text-muted hover:text-gold hover:bg-background-hover transition-colors"
            title={common('edit')}
          >
            <EditIcon size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle delete
            }}
            className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-background-hover transition-colors"
            title={common('delete')}
          >
            <TrashIcon size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-text-primary">{t('title')}</h1>
          <p className="text-sm text-text-muted mt-1">
            {t('subtitle')}
          </p>
        </div>
        <Link href="/identity/users/create">
          <Button leftIcon={<PlusIcon size={18} />}>
            {t('addUser')}
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card padding="md">
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder={t('searchPlaceholder')}
              leftIcon={<SearchIcon size={18} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-48">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>
          <Button variant="secondary" leftIcon={<FilterIcon size={18} />}>
            {t('moreFilters')}
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Table
        columns={columns}
        data={paginatedUsers}
        keyExtractor={(user) => user.id}
        onRowClick={(user) => router.push(`/identity/users/${user.id}`)}
        isLoading={isLoading}
        emptyMessage={t('noUsersFound')}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <Card padding="none">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredUsers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </Card>
      )}

      {/* Roles Modal */}
      <Modal
        isOpen={showRolesModal}
        onClose={closeRolesModal}
        title={t('manageRoles')}
        footer={
          <Button onClick={closeRolesModal}>
            {common('save')}
          </Button>
        }
      >
        {selectedUser && (
          <div className="space-y-4">
            {/* User Info */}
            <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg">
              <Avatar name={selectedUser.fullName} size="md" />
              <div>
                <p className="font-medium text-text-primary">{selectedUser.fullName}</p>
                <p className="text-xs text-text-muted">{selectedUser.email}</p>
              </div>
            </div>

            {/* Roles List */}
            <div className="space-y-2">
              <p className="text-sm text-text-muted mb-3">{t('assignedRoles')}</p>
              {isLoadingRoles ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 bg-white/[0.02] rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : availableRoles.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-4">{t('noRolesAvailable')}</p>
              ) : (
                <div className="space-y-2">
                  {availableRoles.map((role) => (
                    <div
                      key={role.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                        userRoles.includes(role.id)
                          ? 'bg-gold/10 border-gold/30'
                          : 'bg-white/[0.02] border-white/[0.05] hover:border-white/[0.1]'
                      }`}
                      onClick={() => toggleRole(role.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${userRoles.includes(role.id) ? 'bg-gold/20 text-gold' : 'bg-white/[0.05] text-text-muted'}`}>
                          <ShieldIcon size={16} />
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${userRoles.includes(role.id) ? 'text-gold' : 'text-text-primary'}`}>
                            {role.name}
                          </p>
                          {role.description && (
                            <p className="text-xs text-text-muted">{role.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {role.isSystem && (
                          <span className="text-xs text-text-muted bg-white/[0.05] px-2 py-0.5 rounded">
                            {tRoles('systemRole')}
                          </span>
                        )}
                        <Checkbox
                          checked={userRoles.includes(role.id)}
                          onChange={() => toggleRole(role.id)}
                          disabled={isSavingRoles}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// Mock data for demo
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

const mockUsers: User[] = [
  {
    id: '1',
    tenantId: 'demo-tenant',
    email: 'max.cardoso@leaderx.com',
    fullName: 'Max Cardoso',
    status: 'ACTIVE',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    lastLoginAt: '2024-01-20T14:30:00Z',
  },
  {
    id: '2',
    tenantId: 'demo-tenant',
    email: 'ana.silva@leaderx.com',
    fullName: 'Ana Silva',
    status: 'ACTIVE',
    createdAt: '2024-01-16T09:00:00Z',
    updatedAt: '2024-01-16T09:00:00Z',
  },
  {
    id: '3',
    tenantId: 'demo-tenant',
    email: 'carlos.santos@leaderx.com',
    fullName: 'Carlos Santos',
    status: 'PENDING_VERIFICATION',
    createdAt: '2024-01-17T11:00:00Z',
    updatedAt: '2024-01-17T11:00:00Z',
  },
  {
    id: '4',
    tenantId: 'demo-tenant',
    email: 'julia.costa@leaderx.com',
    fullName: 'Julia Costa',
    status: 'SUSPENDED',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-18T16:00:00Z',
  },
  {
    id: '5',
    tenantId: 'demo-tenant',
    email: 'pedro.lima@leaderx.com',
    fullName: 'Pedro Lima',
    status: 'INACTIVE',
    createdAt: '2024-01-05T14:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z',
  },
  {
    id: '6',
    tenantId: 'demo-tenant',
    email: 'maria.oliveira@leaderx.com',
    fullName: 'Maria Oliveira',
    status: 'ACTIVE',
    createdAt: '2024-01-08T09:30:00Z',
    updatedAt: '2024-01-19T11:00:00Z',
  },
];
