// User Types
export interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  phone?: string;
  document?: string;
  documentType?: string;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  metadata?: Record<string, unknown>;
}

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

export interface CreateUserDto {
  email: string;
  name: string;
  phone?: string;
  document?: string;
  documentType?: string;
  password: string;
  roleIds?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateUserDto {
  name?: string;
  phone?: string;
  document?: string;
  documentType?: string;
  status?: UserStatus;
  metadata?: Record<string, unknown>;
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
