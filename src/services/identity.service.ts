import { api } from '@/lib/api';
import {
  User,
  CreateUserDto,
  UpdateUserDto,
  Role,
  CreateRoleDto,
  Permission,
} from '@/types/identity';

// ============================================
// USERS SERVICE
// ============================================

interface UsersListResponse {
  items: User[];
  page: number;
  size: number;
  total: number;
}

export const usersService = {
  async list(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<User[]> {
    try {
      const response = await api.get<UsersListResponse>('/identity/users', params);
      return response?.items || [];
    } catch {
      return [];
    }
  },

  async getById(userId: string): Promise<User> {
    return api.get<User>(`/identity/users/${userId}`);
  },

  async create(data: CreateUserDto): Promise<User> {
    return api.post<User>('/identity/users', data);
  },

  async update(userId: string, data: UpdateUserDto): Promise<User> {
    return api.put<User>(`/identity/users/${userId}`, data);
  },

  async delete(userId: string): Promise<void> {
    return api.delete(`/identity/users/${userId}`);
  },

  async suspend(userId: string): Promise<User> {
    return api.post<User>(`/identity/users/${userId}/suspend`);
  },

  async activate(userId: string): Promise<User> {
    return api.post<User>(`/identity/users/${userId}/activate`);
  },

  async assignRole(userId: string, roleId: string): Promise<void> {
    return api.post(`/identity/users/${userId}/roles`, { roleId });
  },

  async removeRole(userId: string, roleId: string): Promise<void> {
    return api.delete(`/identity/users/${userId}/roles/${roleId}`);
  },

  async getUserRoles(userId: string): Promise<Role[]> {
    try {
      const response = await api.get<{ items: Role[] }>(`/identity/users/${userId}/roles`);
      return response?.items || [];
    } catch {
      return [];
    }
  },
};

// ============================================
// ROLES SERVICE
// ============================================

interface RolesListResponse {
  items: Role[];
  page: number;
  size: number;
  total: number;
}

export const rolesService = {
  async list(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<RolesListResponse> {
    try {
      const response = await api.get<RolesListResponse>('/identity/roles', params);
      return response || { items: [], page: 1, size: 25, total: 0 };
    } catch {
      return { items: [], page: 1, size: 25, total: 0 };
    }
  },

  async getById(roleId: string): Promise<Role> {
    return api.get<Role>(`/identity/roles/${roleId}`);
  },

  async create(data: CreateRoleDto): Promise<Role> {
    return api.post<Role>('/identity/roles', data);
  },

  async update(roleId: string, data: { name?: string; description?: string }): Promise<Role> {
    return api.put<Role>(`/identity/roles/${roleId}`, data);
  },

  async updatePermissions(
    roleId: string,
    permissions: Array<{ permissionCode: string; effect?: 'ALLOW' | 'DENY' }>,
  ): Promise<void> {
    return api.put(`/identity/roles/${roleId}/permissions`, { permissions });
  },

  async delete(roleId: string): Promise<void> {
    return api.delete(`/identity/roles/${roleId}`);
  },

  async getUsersWithRole(roleId: string): Promise<{ count: number }> {
    // This endpoint may not exist, but we'll try to check users
    try {
      const response = await api.get<{ items: unknown[]; total: number }>('/identity/users', { roleId });
      return { count: response.total || response.items?.length || 0 };
    } catch {
      return { count: 0 };
    }
  },
};

// ============================================
// PERMISSIONS SERVICE
// ============================================

interface PermissionsListResponse {
  items: Permission[];
  page: number;
  size: number;
  total: number;
}

export const permissionsService = {
  async list(): Promise<Permission[]> {
    try {
      const response = await api.get<PermissionsListResponse>('/identity/permissions');
      return response?.items || [];
    } catch {
      return [];
    }
  },

  async getByRole(roleId: string): Promise<Permission[]> {
    try {
      const response = await api.get<PermissionsListResponse>(`/identity/roles/${roleId}/permissions`);
      return response?.items || [];
    } catch {
      return [];
    }
  },
};
