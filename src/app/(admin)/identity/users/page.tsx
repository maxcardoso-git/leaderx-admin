'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Button, Table, StatusPill, Input, Select, Card, Avatar, Pagination } from '@/components/ui';
import { PlusIcon, SearchIcon, FilterIcon, EditIcon, TrashIcon, EyeIcon } from '@/components/icons';
import { User, UserStatus } from '@/types/identity';
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

export default function UsersPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('users');
  const common = useTranslations('common');

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
    </div>
  );
}

// Mock data for demo
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
