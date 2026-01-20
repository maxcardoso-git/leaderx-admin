// ============================================
// TAXONOMY DOMAIN
// ============================================

// Category Types
export interface Category {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  previousCategoryId?: string;
  previousCategory?: Category;
  displayOrder?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  previousCategoryId?: string;
  displayOrder?: number;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  previousCategoryId?: string;
  displayOrder?: number;
}

// Segment Types
export interface Segment {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSegmentDto {
  name: string;
  description?: string;
}

export interface UpdateSegmentDto {
  name?: string;
  description?: string;
}

// Line Types
export interface EventBlock {
  key: string;
  label: string;
  subLabel?: string;
  enabled: boolean;
}

export interface Line {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  eventBlocks?: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLineDto {
  name: string;
  description?: string;
  eventBlocks?: Record<string, boolean>;
}

export interface UpdateLineDto {
  name?: string;
  description?: string;
  eventBlocks?: Record<string, boolean>;
}

// ============================================
// GOVERNANCE DOMAIN - POSITIONS (CARGOS)
// ============================================

export interface Position {
  id: string;
  tenantId: string;
  name: string;
  hierarchyGroup: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePositionDto {
  name: string;
  hierarchyGroup: string;
  description?: string;
}

export interface UpdatePositionDto {
  name?: string;
  hierarchyGroup?: string;
  description?: string;
}

export interface HierarchyGroup {
  id: string;
  name: string;
  displayOrder?: number;
}

// ============================================
// WORKFLOW DOMAIN - CYCLES
// ============================================

export interface CyclePhase {
  key: string;
  label: string;
}

export interface CycleBlock {
  key: string;
  label: string;
  group: string;
}

export interface Cycle {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  phaseBlocks?: Record<string, Record<string, boolean>>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCycleDto {
  name: string;
  description?: string;
  isDefault?: boolean;
  phaseBlocks?: Record<string, Record<string, boolean>>;
}

export interface UpdateCycleDto {
  name?: string;
  description?: string;
  isDefault?: boolean;
  phaseBlocks?: Record<string, Record<string, boolean>>;
}

// ============================================
// SUPPLIERS DOMAIN
// ============================================

export type PixKeyType = 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM';
export type BankAccountType = 'CHECKING' | 'SAVINGS' | 'PAYMENT';

export interface SupplierAddress {
  zip?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface SupplierContact {
  memberId?: string;
  member?: {
    id: string;
    fullName: string;
    email: string;
  };
  manual?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export interface SupplierPix {
  type?: PixKeyType;
  key?: string;
}

export interface SupplierBank {
  name?: string;
  code?: string;
  branch?: string;
  account?: string;
  accountType?: BankAccountType;
}

export interface Supplier {
  id: string;
  tenantId: string;
  name: string;
  legalName?: string;
  cnpj?: string;
  stateRegistration?: string;
  municipalRegistration?: string;
  address?: SupplierAddress;
  contact?: SupplierContact;
  pix?: SupplierPix;
  bank?: SupplierBank;
  profileDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierDto {
  name: string;
  legalName?: string;
  cnpj?: string;
  stateRegistration?: string;
  municipalRegistration?: string;
  address?: SupplierAddress;
  contact?: SupplierContact;
  pix?: SupplierPix;
  bank?: SupplierBank;
  profileDescription?: string;
}

export interface UpdateSupplierDto {
  name?: string;
  legalName?: string;
  cnpj?: string;
  stateRegistration?: string;
  municipalRegistration?: string;
  address?: SupplierAddress;
  contact?: SupplierContact;
  pix?: SupplierPix;
  bank?: SupplierBank;
  profileDescription?: string;
}

// ============================================
// CLASSIFICATIONS DOMAIN (CLASSIFICAÇÕES)
// ============================================

export interface Classification {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  categoryId: string;
  category?: Category;
  badgeColor: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassificationDto {
  name: string;
  description?: string;
  categoryId: string;
  badgeColor: string;
  displayOrder?: number;
}

export interface UpdateClassificationDto {
  name?: string;
  description?: string;
  categoryId?: string;
  badgeColor?: string;
  displayOrder?: number;
}

// ============================================
// SCOPES DOMAIN (ESCOPOS DE ESTRUTURA)
// ============================================

export interface Scope {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description?: string;
  level: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScopeDto {
  code: string;
  name: string;
  description?: string;
  level: number;
}

export interface UpdateScopeDto {
  name?: string;
  description?: string;
  level?: number;
}

// ============================================
// LIST RESPONSE TYPES
// ============================================

export interface ListResponse<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
}

// ============================================
// CATALOGS
// ============================================

export const EVENT_BLOCKS_CATALOG = [
  { key: 'INFORMACOES_BASICAS', label: 'Informações Básicas', subLabel: 'Essencial' },
  { key: 'DATAS_E_HORARIOS', label: 'Datas e Horários', subLabel: 'Essencial' },
  { key: 'LOCAL_E_ESTACIONAMENTO', label: 'Local e Estacionamento', subLabel: 'Essencial' },
  { key: 'PARTICIPANTES', label: 'Participantes', subLabel: 'Configuração' },
  { key: 'ANFITRIAO', label: 'Anfitrião', subLabel: 'Configuração' },
  { key: 'MESAS_ENGAJAMENTO', label: 'Mesas de Engajamento', subLabel: 'Configuração' },
  { key: 'PROGRAMACAO', label: 'Programação', subLabel: 'Configuração' },
  { key: 'INGRESSOS', label: 'Ingressos', subLabel: 'Comercial' },
  { key: 'HOSPITALIDADE', label: 'Hospitalidade', subLabel: 'Operacional' },
  { key: 'FORNECEDORES', label: 'Fornecedores', subLabel: 'Operacional' },
  { key: 'VIABILIDADE', label: 'Viabilidade', subLabel: 'Financeiro' },
  { key: 'CAMPANHAS', label: 'Campanhas', subLabel: 'Marketing' },
  { key: 'RESUMO_FINANCEIRO', label: 'Resumo Financeiro', subLabel: 'Financeiro' },
];

export const CYCLE_PHASES_CATALOG = [
  { key: 'RASCUNHO', label: 'Rascunho' },
  { key: 'ESCOPO', label: 'Escopo' },
  { key: 'VISTORIA_PREVISAO', label: 'Vistoria e Previsão' },
  { key: 'VIABILIDADE', label: 'Viabilidade' },
  { key: 'PLANEJAMENTO', label: 'Planejamento' },
  { key: 'EXECUCAO', label: 'Execução' },
  { key: 'CONCLUSAO', label: 'Conclusão' },
];

export const CYCLE_BLOCKS_CATALOG = [
  { key: 'INFORMACOES_BASICAS', label: 'Informações Básicas', group: 'Essencial' },
  { key: 'DATAS_E_HORARIOS', label: 'Datas e Horários', group: 'Essencial' },
  { key: 'LOCAL_E_ESTACIONAMENTO', label: 'Local e Estacionamento', group: 'Essencial' },
  { key: 'PARTICIPANTES', label: 'Participantes', group: 'Configuração' },
  { key: 'ANFITRIAO', label: 'Anfitrião', group: 'Configuração' },
  { key: 'MESAS_ENGAJAMENTO', label: 'Mesas de Engajamento', group: 'Configuração' },
  { key: 'PROGRAMACAO', label: 'Programação', group: 'Configuração' },
  { key: 'INGRESSOS', label: 'Ingressos', group: 'Comercial' },
  { key: 'HOSPITALIDADE', label: 'Hospitalidade', group: 'Operacional' },
  { key: 'FORNECEDORES', label: 'Fornecedores', group: 'Operacional' },
  { key: 'VIABILIDADE_FINANCEIRA', label: 'Viabilidade Financeira', group: 'Financeiro' },
  { key: 'CAMPANHAS_MARKETING', label: 'Campanhas de Marketing', group: 'Marketing' },
  { key: 'RESUMO_FINANCEIRO', label: 'Resumo Financeiro', group: 'Financeiro' },
  { key: 'SELECAO_CICLO_VIDA', label: 'Seleção de Ciclo de Vida', group: 'Workflow' },
  { key: 'APROVADORES_POR_FASE', label: 'Aprovadores por Fase', group: 'Workflow' },
];

export const PIX_KEY_TYPES = [
  { label: 'CPF', value: 'CPF' },
  { label: 'CNPJ', value: 'CNPJ' },
  { label: 'E-mail', value: 'EMAIL' },
  { label: 'Telefone', value: 'PHONE' },
  { label: 'Chave Aleatória', value: 'RANDOM' },
];

export const BANK_ACCOUNT_TYPES = [
  { label: 'Conta Corrente', value: 'CHECKING' },
  { label: 'Conta Poupança', value: 'SAVINGS' },
  { label: 'Conta Pagamento', value: 'PAYMENT' },
];
