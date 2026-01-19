// User Types
export interface User {
  id: string;
  tenantId: string;
  externalId?: string;
  email: string;
  fullName: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

export interface CreateUserDto {
  externalId?: string;
  email: string;
  fullName: string;
  status?: UserStatus;
}

export interface UpdateUserDto {
  fullName?: string;
  status?: UserStatus;
}

// Role Types
export interface Role {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  isSystem: boolean;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissionIds: string[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissionIds?: string[];
}

// Permission Types
export interface Permission {
  id: string;
  resource: string;
  action: PermissionAction;
  description?: string;
}

export type PermissionAction = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'MANAGE';

// User Role Assignment
export interface UserRole {
  userId: string;
  roleId: string;
  assignedAt: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
