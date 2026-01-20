// Working Unit Types
export type WorkingUnitType = 'GROUP' | 'NUCLEUS';
export type WorkingUnitStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type MembershipRole = 'COORDINATOR' | 'SECRETARY' | 'MEMBER';
export type MembershipStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

export interface WorkingUnit {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  type: WorkingUnitType;
  structureId: string;
  structure?: {
    id: string;
    name: string;
  };
  parentId?: string;
  parent?: WorkingUnit;
  status: WorkingUnitStatus;
  maxMembers: number;
  membersCount?: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkingUnitDto {
  name: string;
  description?: string;
  type: WorkingUnitType;
  structureId: string;
  parentId?: string;
  maxMembers: number;
  metadata?: Record<string, unknown>;
}

export interface UpdateWorkingUnitDto {
  name?: string;
  description?: string;
  type?: WorkingUnitType;
  status?: WorkingUnitStatus;
  maxMembers?: number;
  structureId?: string;
  metadata?: Record<string, unknown>;
}

// Working Unit Membership Types
export interface WorkingUnitMembership {
  id: string;
  workingUnitId: string;
  workingUnit?: WorkingUnit;
  userId: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
  role: MembershipRole;
  status: MembershipStatus;
  joinedAt: string;
  leftAt?: string;
}

export interface AddMemberDto {
  userId: string;
  role: MembershipRole;
}

export interface UpdateMemberDto {
  role?: MembershipRole;
  status?: MembershipStatus;
}

// Working Unit Stats
export interface WorkingUnitStats {
  totalGroups: number;
  totalNuclei: number;
  activeGroups: number;
  activeNuclei: number;
  totalMembers: number;
}

// List Response Types
export interface WorkingUnitsListResponse {
  items: WorkingUnit[];
  page: number;
  size: number;
  total: number;
}

export interface MembersListResponse {
  items: WorkingUnitMembership[];
  page: number;
  size: number;
  total: number;
}
