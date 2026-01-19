import { api } from '@/lib/api';
import {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  Segment,
  CreateSegmentDto,
  UpdateSegmentDto,
  Line,
  CreateLineDto,
  UpdateLineDto,
  Position,
  CreatePositionDto,
  UpdatePositionDto,
  HierarchyGroup,
  Cycle,
  CreateCycleDto,
  UpdateCycleDto,
  Supplier,
  CreateSupplierDto,
  UpdateSupplierDto,
  ListResponse,
} from '@/types/settings';

// ============================================
// CATEGORIES SERVICE (TAXONOMY)
// ============================================

export const categoriesService = {
  async list(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ListResponse<Category>> {
    try {
      const response = await api.get<ListResponse<Category>>('/taxonomy/categories', params);
      return response || { items: [], page: 1, size: 25, total: 0 };
    } catch {
      return { items: [], page: 1, size: 25, total: 0 };
    }
  },

  async getById(id: string): Promise<Category> {
    return api.get<Category>(`/taxonomy/categories/${id}`);
  },

  async create(data: CreateCategoryDto): Promise<Category> {
    return api.post<Category>('/taxonomy/categories', data);
  },

  async update(id: string, data: UpdateCategoryDto): Promise<Category> {
    return api.put<Category>(`/taxonomy/categories/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return api.delete(`/taxonomy/categories/${id}`);
  },
};

// ============================================
// SEGMENTS SERVICE (TAXONOMY)
// ============================================

export const segmentsService = {
  async list(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ListResponse<Segment>> {
    try {
      const response = await api.get<ListResponse<Segment>>('/taxonomy/segments', params);
      return response || { items: [], page: 1, size: 25, total: 0 };
    } catch {
      return { items: [], page: 1, size: 25, total: 0 };
    }
  },

  async getById(id: string): Promise<Segment> {
    return api.get<Segment>(`/taxonomy/segments/${id}`);
  },

  async create(data: CreateSegmentDto): Promise<Segment> {
    return api.post<Segment>('/taxonomy/segments', data);
  },

  async update(id: string, data: UpdateSegmentDto): Promise<Segment> {
    return api.put<Segment>(`/taxonomy/segments/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return api.delete(`/taxonomy/segments/${id}`);
  },
};

// ============================================
// LINES SERVICE (TAXONOMY)
// ============================================

export const linesService = {
  async list(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ListResponse<Line>> {
    try {
      const response = await api.get<ListResponse<Line>>('/taxonomy/lines', params);
      return response || { items: [], page: 1, size: 25, total: 0 };
    } catch {
      return { items: [], page: 1, size: 25, total: 0 };
    }
  },

  async getById(id: string): Promise<Line> {
    return api.get<Line>(`/taxonomy/lines/${id}`);
  },

  async create(data: CreateLineDto): Promise<Line> {
    return api.post<Line>('/taxonomy/lines', data);
  },

  async update(id: string, data: UpdateLineDto): Promise<Line> {
    return api.put<Line>(`/taxonomy/lines/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return api.delete(`/taxonomy/lines/${id}`);
  },
};

// ============================================
// POSITIONS SERVICE (GOVERNANCE - CARGOS)
// ============================================

export const positionsService = {
  async list(params?: {
    page?: number;
    limit?: number;
    search?: string;
    hierarchyGroup?: string;
  }): Promise<ListResponse<Position>> {
    try {
      const response = await api.get<ListResponse<Position>>('/governance/roles', params);
      return response || { items: [], page: 1, size: 25, total: 0 };
    } catch {
      return { items: [], page: 1, size: 25, total: 0 };
    }
  },

  async getById(id: string): Promise<Position> {
    return api.get<Position>(`/governance/roles/${id}`);
  },

  async create(data: CreatePositionDto): Promise<Position> {
    return api.post<Position>('/governance/roles', data);
  },

  async update(id: string, data: UpdatePositionDto): Promise<Position> {
    return api.put<Position>(`/governance/roles/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return api.delete(`/governance/roles/${id}`);
  },

  async getHierarchyGroups(): Promise<HierarchyGroup[]> {
    try {
      const response = await api.get<{ items: HierarchyGroup[] }>('/governance/role-groups');
      return response?.items || [];
    } catch {
      return [];
    }
  },
};

// ============================================
// CYCLES SERVICE (WORKFLOW)
// ============================================

export const cyclesService = {
  async list(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ListResponse<Cycle>> {
    try {
      const response = await api.get<ListResponse<Cycle>>('/workflow/cycles', params);
      return response || { items: [], page: 1, size: 25, total: 0 };
    } catch {
      return { items: [], page: 1, size: 25, total: 0 };
    }
  },

  async getById(id: string): Promise<Cycle> {
    return api.get<Cycle>(`/workflow/cycles/${id}`);
  },

  async create(data: CreateCycleDto): Promise<Cycle> {
    return api.post<Cycle>('/workflow/cycles', data);
  },

  async update(id: string, data: UpdateCycleDto): Promise<Cycle> {
    return api.put<Cycle>(`/workflow/cycles/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return api.delete(`/workflow/cycles/${id}`);
  },
};

// ============================================
// SUPPLIERS SERVICE
// ============================================

export const suppliersService = {
  async list(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ListResponse<Supplier>> {
    try {
      const response = await api.get<ListResponse<Supplier>>('/suppliers', params);
      return response || { items: [], page: 1, size: 25, total: 0 };
    } catch {
      return { items: [], page: 1, size: 25, total: 0 };
    }
  },

  async getById(id: string): Promise<Supplier> {
    return api.get<Supplier>(`/suppliers/${id}`);
  },

  async create(data: CreateSupplierDto): Promise<Supplier> {
    return api.post<Supplier>('/suppliers', data);
  },

  async update(id: string, data: UpdateSupplierDto): Promise<Supplier> {
    return api.put<Supplier>(`/suppliers/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return api.delete(`/suppliers/${id}`);
  },

  async lookupCep(cep: string): Promise<{
    street?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    country?: string;
  }> {
    try {
      return await api.get(`/integrations/cep/${cep}`);
    } catch {
      return {};
    }
  },
};
