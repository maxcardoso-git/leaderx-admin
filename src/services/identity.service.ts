import { api } from '@/lib/api';
import {
  User,
  CreateUserDto,
  UpdateUserDto,
  Role,
  CreateRoleDto,
  UpdateRoleDto,
  Permission,
} from '@/types/identity';

// ============================================
// USERS SERVICE
// ============================================

export const usersService = {
  async list(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<User[]> {
    return api.get<User[]>('/identity/users', params);
  },

  async getById(userId: string): Promise<User> {
    return api.get<User>(`/identity/users/${userId}`);
  },

  async create(data: CreateUserDto): Promise<User> {
    return api.post<User>('/identity/users', data);
  },

  async update(userId: string, data: UpdateUserDto): Promise<User> {
    return api.patch<User>(`/identity/users/${userId}`, data);
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
    return api.get<Role[]>(`/identity/users/${userId}/roles`);
  },
};

// ============================================
// ROLES SERVICE
// ============================================

export const rolesService = {
  async list(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<Role[]> {
    return api.get<Role[]>('/identity/roles', params);
  },

  async getById(roleId: string): Promise<Role> {
    return api.get<Role>(`/identity/roles/${roleId}`);
  },

  async create(data: CreateRoleDto): Promise<Role> {
    return api.post<Role>('/identity/roles', data);
  },

  async update(roleId: string, data: UpdateRoleDto): Promise<Role> {
    return api.patch<Role>(`/identity/roles/${roleId}`, data);
  },

  async delete(roleId: string): Promise<void> {
    return api.delete(`/identity/roles/${roleId}`);
  },
};

// ============================================
// PERMISSIONS SERVICE
// ============================================

export const permissionsService = {
  async list(): Promise<Permission[]> {
    return api.get<Permission[]>('/identity/permissions');
  },

  async getByRole(roleId: string): Promise<Permission[]> {
    return api.get<Permission[]>(`/identity/roles/${roleId}/permissions`);
  },
};
