import { api } from '@/lib/api';
import {
  WorkingUnit,
  CreateWorkingUnitDto,
  UpdateWorkingUnitDto,
  WorkingUnitMembership,
  AddMemberDto,
  UpdateMemberDto,
  WorkingUnitsListResponse,
  MembersListResponse,
  WorkingUnitStats,
  WorkingUnitType,
  WorkingUnitStatus,
} from '@/types/governance';

// ============================================
// WORKING UNITS SERVICE
// ============================================

export const workingUnitsService = {
  async list(params?: {
    page?: number;
    limit?: number;
    type?: WorkingUnitType;
    status?: WorkingUnitStatus;
    structureId?: string;
    parentId?: string;
    search?: string;
  }): Promise<WorkingUnitsListResponse> {
    try {
      const response = await api.get<WorkingUnitsListResponse>('/governance/working-units', params);
      return response || { items: [], page: 1, size: 25, total: 0 };
    } catch {
      return { items: [], page: 1, size: 25, total: 0 };
    }
  },

  async getById(workingUnitId: string): Promise<WorkingUnit> {
    return api.get<WorkingUnit>(`/governance/working-units/${workingUnitId}`);
  },

  async create(data: CreateWorkingUnitDto): Promise<WorkingUnit> {
    return api.post<WorkingUnit>('/governance/working-units', data);
  },

  async update(workingUnitId: string, data: UpdateWorkingUnitDto): Promise<WorkingUnit> {
    return api.put<WorkingUnit>(`/governance/working-units/${workingUnitId}`, data);
  },

  async delete(workingUnitId: string): Promise<void> {
    return api.delete(`/governance/working-units/${workingUnitId}`);
  },

  // Members management
  async getMembers(workingUnitId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<MembersListResponse> {
    try {
      const response = await api.get<MembersListResponse>(
        `/governance/working-units/${workingUnitId}/members`,
        params
      );
      return response || { items: [], page: 1, size: 25, total: 0 };
    } catch {
      return { items: [], page: 1, size: 25, total: 0 };
    }
  },

  async addMember(workingUnitId: string, data: AddMemberDto): Promise<WorkingUnitMembership> {
    return api.post<WorkingUnitMembership>(`/governance/working-units/${workingUnitId}/members`, data);
  },

  async updateMember(
    workingUnitId: string,
    memberId: string,
    data: UpdateMemberDto
  ): Promise<WorkingUnitMembership> {
    return api.put<WorkingUnitMembership>(
      `/governance/working-units/${workingUnitId}/members/${memberId}`,
      data
    );
  },

  async removeMember(workingUnitId: string, memberId: string): Promise<void> {
    return api.delete(`/governance/working-units/${workingUnitId}/members/${memberId}`);
  },
};

// ============================================
// GOVERNANCE STATS SERVICE
// ============================================

export const governanceStatsService = {
  async getStats(): Promise<WorkingUnitStats> {
    try {
      return await api.get<WorkingUnitStats>('/governance/stats');
    } catch {
      return {
        totalGroups: 0,
        totalNuclei: 0,
        activeGroups: 0,
        activeNuclei: 0,
        totalMembers: 0,
      };
    }
  },
};
