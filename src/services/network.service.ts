import { api } from '@/lib/api';
import {
  StructureType,
  CreateStructureTypeDto,
  UpdateStructureTypeDto,
  Structure,
  CreateStructureDto,
  UpdateStructureDto,
  StructureRelation,
  StructureLeader,
  AssignLeaderDto,
  ApprovalChain,
  ValidateAuthorityDto,
  ValidateAuthorityResult,
  NetworkStats,
  NetworkTreeNode,
} from '@/types/network';

// ============================================
// STRUCTURE TYPES SERVICE
// ============================================

interface StructureTypesListResponse {
  items: StructureType[];
  page: number;
  size: number;
  total: number;
}

export const structureTypesService = {
  async list(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<StructureTypesListResponse> {
    try {
      const response = await api.get<StructureTypesListResponse>('/network/structure-types', params);
      return response || { items: [], page: 1, size: 25, total: 0 };
    } catch {
      return { items: [], page: 1, size: 25, total: 0 };
    }
  },

  async getById(typeId: string): Promise<StructureType> {
    return api.get<StructureType>(`/network/structure-types/${typeId}`);
  },

  async create(data: CreateStructureTypeDto): Promise<StructureType> {
    return api.post<StructureType>('/network/structure-types', data);
  },

  async update(typeId: string, data: UpdateStructureTypeDto): Promise<StructureType> {
    return api.put<StructureType>(`/network/structure-types/${typeId}`, data);
  },

  async delete(typeId: string): Promise<void> {
    return api.delete(`/network/structure-types/${typeId}`);
  },
};

// ============================================
// STRUCTURES SERVICE
// ============================================

interface StructuresListResponse {
  items: Structure[];
  page: number;
  size: number;
  total: number;
}

export const structuresService = {
  async list(params?: {
    page?: number;
    limit?: number;
    typeId?: string;
    parentId?: string;
    status?: string;
    search?: string;
  }): Promise<StructuresListResponse> {
    try {
      const response = await api.get<StructuresListResponse>('/network/structures', params);
      return response || { items: [], page: 1, size: 25, total: 0 };
    } catch {
      return { items: [], page: 1, size: 25, total: 0 };
    }
  },

  async getById(structureId: string): Promise<Structure> {
    return api.get<Structure>(`/network/structures/${structureId}`);
  },

  async create(data: CreateStructureDto): Promise<Structure> {
    return api.post<Structure>('/network/structures', data);
  },

  async update(structureId: string, data: UpdateStructureDto): Promise<Structure> {
    return api.put<Structure>(`/network/structures/${structureId}`, data);
  },

  async delete(structureId: string): Promise<void> {
    return api.delete(`/network/structures/${structureId}`);
  },

  async getTree(): Promise<NetworkTreeNode[]> {
    try {
      const response = await api.get<{ items: NetworkTreeNode[] } | NetworkTreeNode[]>('/network/structures/tree');
      // Handle both { items: [] } and direct array responses
      if (Array.isArray(response)) {
        return response;
      }
      return response?.items || [];
    } catch {
      return [];
    }
  },

  async getRelations(structureId: string): Promise<StructureRelation[]> {
    try {
      const response = await api.get<{ items: StructureRelation[] }>(`/network/structures/${structureId}/relations`);
      return response?.items || [];
    } catch {
      return [];
    }
  },

  async getLeaders(structureId: string): Promise<StructureLeader[]> {
    try {
      const response = await api.get<{ items: StructureLeader[] }>(`/network/structures/${structureId}/leaders`);
      return response?.items || [];
    } catch {
      return [];
    }
  },

  async assignLeader(structureId: string, data: AssignLeaderDto): Promise<StructureLeader> {
    return api.post<StructureLeader>(`/network/structures/${structureId}/leaders`, data);
  },

  async removeLeader(structureId: string, leaderId: string): Promise<void> {
    return api.delete(`/network/structures/${structureId}/leaders/${leaderId}`);
  },

  async getApprovalChain(structureId: string): Promise<ApprovalChain | null> {
    try {
      return await api.get<ApprovalChain>(`/network/structures/${structureId}/approval-chain`);
    } catch {
      return null;
    }
  },

  async validateAuthority(structureId: string, data: ValidateAuthorityDto): Promise<ValidateAuthorityResult> {
    return api.post<ValidateAuthorityResult>(`/network/structures/${structureId}/validate-authority`, data);
  },
};

// ============================================
// NETWORK STATS SERVICE
// ============================================

export const networkStatsService = {
  async getStats(): Promise<NetworkStats> {
    try {
      return await api.get<NetworkStats>('/network/stats');
    } catch {
      return {
        totalStructures: 0,
        activeStructures: 0,
        structureTypes: 0,
        approvalChains: 0,
        pendingApprovals: 0,
      };
    }
  },
};
