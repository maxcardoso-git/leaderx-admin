'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Table, StatusPill, Input, Select, Card, Avatar, Pagination } from '@/components/ui';
import { PlusIcon, SearchIcon, FilterIcon, EditIcon, TrashIcon, EyeIcon } from '@/components/icons';
import { User, UserStatus } from '@/types/identity';
import { usersService } from '@/services/identity.service';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'PENDING_VERIFICATION', label: 'Pending' },
];

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
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      key: 'name',
      header: 'User',
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <Avatar name={user.name} size="md" />
          <div>
            <p className="font-medium text-text-primary">{user.name}</p>
            <p className="text-xs text-text-muted">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      render: (user: User) => (
        <StatusPill status={mapStatus(user.status)} />
      ),
    },
    {
      key: 'emailVerified',
      header: 'Verified',
      width: '100px',
      render: (user: User) => (
        <span className={user.emailVerified ? 'text-success' : 'text-text-muted'}>
          {user.emailVerified ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      width: '150px',
      render: (user: User) => (
        <span className="text-text-muted">
          {new Date(user.createdAt).toLocaleDateString('pt-BR')}
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
            title="View"
          >
            <EyeIcon size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/identity/users/${user.id}/edit`);
            }}
            className="p-2 rounded-lg text-text-muted hover:text-gold hover:bg-background-hover transition-colors"
            title="Edit"
          >
            <EditIcon size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle delete
            }}
            className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-background-hover transition-colors"
            title="Delete"
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
          <h1 className="font-heading text-2xl font-semibold text-text-primary">Users</h1>
          <p className="text-sm text-text-muted mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        <Link href="/identity/users/create">
          <Button leftIcon={<PlusIcon size={18} />}>
            Add User
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card padding="md">
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search by name or email..."
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
            More Filters
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
        emptyMessage="No users found"
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
    </div>
  );
}

// Mock data for demo
const mockUsers: User[] = [
  {
    id: '1',
    tenantId: 'demo-tenant',
    email: 'max.cardoso@leaderx.com',
    name: 'Max Cardoso',
    phone: '+55 11 99999-9999',
    status: 'ACTIVE',
    emailVerified: true,
    phoneVerified: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    lastLoginAt: '2024-01-20T14:30:00Z',
  },
  {
    id: '2',
    tenantId: 'demo-tenant',
    email: 'ana.silva@leaderx.com',
    name: 'Ana Silva',
    status: 'ACTIVE',
    emailVerified: true,
    phoneVerified: false,
    createdAt: '2024-01-16T09:00:00Z',
    updatedAt: '2024-01-16T09:00:00Z',
  },
  {
    id: '3',
    tenantId: 'demo-tenant',
    email: 'carlos.santos@leaderx.com',
    name: 'Carlos Santos',
    status: 'PENDING_VERIFICATION',
    emailVerified: false,
    phoneVerified: false,
    createdAt: '2024-01-17T11:00:00Z',
    updatedAt: '2024-01-17T11:00:00Z',
  },
  {
    id: '4',
    tenantId: 'demo-tenant',
    email: 'julia.costa@leaderx.com',
    name: 'Julia Costa',
    status: 'SUSPENDED',
    emailVerified: true,
    phoneVerified: true,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-18T16:00:00Z',
  },
  {
    id: '5',
    tenantId: 'demo-tenant',
    email: 'pedro.lima@leaderx.com',
    name: 'Pedro Lima',
    status: 'INACTIVE',
    emailVerified: true,
    phoneVerified: false,
    createdAt: '2024-01-05T14:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z',
  },
  {
    id: '6',
    tenantId: 'demo-tenant',
    email: 'maria.oliveira@leaderx.com',
    name: 'Maria Oliveira',
    status: 'ACTIVE',
    emailVerified: true,
    phoneVerified: true,
    createdAt: '2024-01-08T09:30:00Z',
    updatedAt: '2024-01-19T11:00:00Z',
  },
];
