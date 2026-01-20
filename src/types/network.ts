// Structure Type Types
export type StructureScope =
  | 'GLOBAL_ALL_COUNTRIES'
  | 'COUNTRY_GROUP'
  | 'CITY_GROUP'
  | 'SINGLE_CITY';

export interface StructureType {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  scope: StructureScope;
  hierarchyLevel: number;
  leadershipRoleId: string;
  leadershipRole?: {
    id: string;
    name: string;
  };
  maxLeaders: number;
  activeStructures?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStructureTypeDto {
  name: string;
  description?: string;
  scope: StructureScope;
  leadershipRoleId: string;
  maxLeaders: number;
}

export interface UpdateStructureTypeDto {
  name?: string;
  description?: string;
  leadershipRoleId?: string;
  maxLeaders?: number;
}

// Structure Types
export type StructureStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

export interface Structure {
  id: string;
  tenantId: string;
  name: string;
  typeId: string;
  type?: StructureType;
  parentId?: string;
  parent?: Structure;
  status: StructureStatus;
  scope: StructureScope;
  hierarchyLevel: number;
  leaders?: StructureLeader[];
  children?: Structure[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStructureDto {
  name: string;
  typeId: string;
  parentId?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateStructureDto {
  name?: string;
  status?: StructureStatus;
  metadata?: Record<string, unknown>;
}

// Structure Leader Types
export interface StructureLeader {
  id: string;
  structureId: string;
  userId: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
  roleId: string;
  role?: {
    id: string;
    name: string;
  };
  isPrimary: boolean;
  assignedAt: string;
}

export interface AssignLeaderDto {
  userId: string;
  roleId: string;
  isPrimary?: boolean;
}

// Structure Relation Types
export type RelationType = 'PARENT_CHILD' | 'SIBLING' | 'CROSS_REFERENCE';

export interface StructureRelation {
  id: string;
  relationType: RelationType;
  parentStructureId: string;
  parentStructure?: Structure;
  childStructureId: string;
  childStructure?: Structure;
  createdAt: string;
}

// Approval Chain Types
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED';

export interface ApprovalChainStep {
  id: string;
  order: number;
  structureId: string;
  structure?: Structure;
  approverId?: string;
  approver?: {
    id: string;
    fullName: string;
  };
  roleId: string;
  role?: {
    id: string;
    name: string;
  };
  status: ApprovalStatus;
  comments?: string;
  decidedAt?: string;
}

export interface ApprovalChain {
  id: string;
  structureId: string;
  structure?: Structure;
  actionType: string;
  requesterId: string;
  requester?: {
    id: string;
    fullName: string;
  };
  status: ApprovalStatus;
  steps: ApprovalChainStep[];
  createdAt: string;
  updatedAt: string;
}

export interface ValidateAuthorityDto {
  requesterStructureId: string;
  actionType: string;
}

export interface ValidateAuthorityResult {
  isAuthorized: boolean;
  requiredApprovals: ApprovalChainStep[];
  message?: string;
}

// Network Stats
export interface NetworkStats {
  totalStructures: number;
  activeStructures: number;
  structureTypes: number;
  approvalChains: number;
  pendingApprovals: number;
}

// Tree Node for visualization
export interface NetworkTreeNode {
  id: string;
  name: string;
  type: string;
  scope: StructureScope;
  status: StructureStatus;
  hierarchyLevel: number;
  leadersCount: number;
  children?: NetworkTreeNode[];
}
