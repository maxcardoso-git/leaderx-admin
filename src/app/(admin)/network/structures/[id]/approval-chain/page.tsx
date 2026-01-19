'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button, Card, Select, Input } from '@/components/ui';
import {
  ChevronLeftIcon,
  NetworkIcon,
  CheckIcon,
  ClockIcon,
  XIcon,
  ChevronRightIcon,
  PlayIcon,
  UsersIcon,
  ShieldIcon,
} from '@/components/icons';
import { structuresService } from '@/services/network.service';
import { ApprovalChain, ApprovalChainStep, ApprovalStatus, ValidateAuthorityResult, Structure } from '@/types/network';

// Flow Diagram Component
function FlowDiagram({ chain }: { chain: ApprovalChain }) {
  const t = useTranslations('network');

  const statusIcons: Record<ApprovalStatus, { icon: React.ReactNode; color: string; bgColor: string }> = {
    PENDING: { icon: <ClockIcon size={20} />, color: 'text-amber-400', bgColor: 'bg-amber-400/10 border-amber-400/30' },
    APPROVED: { icon: <CheckIcon size={20} />, color: 'text-emerald-400', bgColor: 'bg-emerald-400/10 border-emerald-400/30' },
    REJECTED: { icon: <XIcon size={20} />, color: 'text-red-400', bgColor: 'bg-red-400/10 border-red-400/30' },
    ESCALATED: { icon: <ChevronRightIcon size={20} />, color: 'text-violet-400', bgColor: 'bg-violet-400/10 border-violet-400/30' },
  };

  return (
    <div className="relative">
      {/* Flow Steps */}
      <div className="flex flex-col items-center">
        {chain.steps.map((step, index) => {
          const statusStyle = statusIcons[step.status];
          const isLast = index === chain.steps.length - 1;

          return (
            <div key={step.id} className="flex flex-col items-center">
              {/* Step Node */}
              <div
                className={`
                  relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all
                  ${statusStyle.bgColor}
                `}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusStyle.color} bg-white/[0.05]`}>
                  {statusStyle.icon}
                </div>
                <div className="min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">{t('step')} {step.order}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusStyle.bgColor} ${statusStyle.color}`}>
                      {t(`status${step.status}`)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-text-primary mt-1">
                    {step.structure?.name || t('unknownStructure')}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <ShieldIcon size={12} className="text-text-muted" />
                    <span className="text-xs text-text-muted">{step.role?.name || '-'}</span>
                  </div>
                  {step.approver && (
                    <div className="flex items-center gap-2 mt-1">
                      <UsersIcon size={12} className="text-text-muted" />
                      <span className="text-xs text-text-muted">{step.approver.fullName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Connector */}
              {!isLast && (
                <div className="flex flex-col items-center py-2">
                  <div className="w-0.5 h-8 bg-border" />
                  <ChevronRightIcon size={16} className="text-text-muted rotate-90" />
                  <div className="w-0.5 h-8 bg-border" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Chain Info */}
      <div className="mt-8 p-4 bg-white/[0.02] rounded-xl border border-white/[0.05]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-text-muted">{t('actionType')}</p>
            <p className="text-sm font-medium text-text-primary mt-1">{chain.actionType}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">{t('requester')}</p>
            <p className="text-sm font-medium text-text-primary mt-1">{chain.requester?.fullName || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">{t('totalSteps')}</p>
            <p className="text-sm font-medium text-text-primary mt-1">{chain.steps.length}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">{t('chainStatus')}</p>
            <p className={`text-sm font-medium mt-1 ${statusIcons[chain.status].color}`}>
              {t(`status${chain.status}`)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simulation Panel Component
function SimulationPanel({
  structureId,
  structures,
}: {
  structureId: string;
  structures: Structure[];
}) {
  const t = useTranslations('network');
  const tCommon = useTranslations('common');

  const [requesterStructureId, setRequesterStructureId] = useState('');
  const [actionType, setActionType] = useState('');
  const [result, setResult] = useState<ValidateAuthorityResult | null>(null);
  const [loading, setLoading] = useState(false);

  const actionTypes = [
    { value: 'CREATE_STRUCTURE', label: t('actionCreateStructure') },
    { value: 'UPDATE_STRUCTURE', label: t('actionUpdateStructure') },
    { value: 'DELETE_STRUCTURE', label: t('actionDeleteStructure') },
    { value: 'ASSIGN_LEADER', label: t('actionAssignLeader') },
    { value: 'REMOVE_LEADER', label: t('actionRemoveLeader') },
  ];

  const handleSimulate = async () => {
    if (!requesterStructureId || !actionType) return;
    setLoading(true);
    try {
      const validationResult = await structuresService.validateAuthority(structureId, {
        requesterStructureId,
        actionType,
      });
      setResult(validationResult);
    } catch (error) {
      console.error('Failed to validate authority:', error);
      // Mock result for demo
      setResult({
        isAuthorized: requesterStructureId === structureId || structures.some(
          (s) => s.id === requesterStructureId && s.hierarchyLevel < (structures.find((st) => st.id === structureId)?.hierarchyLevel || 0)
        ),
        requiredApprovals: mockApprovalSteps,
        message: t('simulationComplete'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="!p-0 overflow-hidden">
      <div className="p-6 border-b border-white/[0.05]">
        <h2 className="text-lg font-medium text-text-primary">{t('authoritySimulation')}</h2>
        <p className="text-sm text-text-muted mt-1">{t('authoritySimulationHint')}</p>
      </div>
      <div className="p-6 space-y-4">
        <Select
          label={t('requesterStructure')}
          options={structures.map((s) => ({ value: s.id, label: s.name }))}
          value={requesterStructureId}
          onChange={(e) => setRequesterStructureId(e.target.value)}
        />
        <Select
          label={t('actionType')}
          options={actionTypes}
          value={actionType}
          onChange={(e) => setActionType(e.target.value)}
        />
        <Button
          leftIcon={<PlayIcon size={16} />}
          onClick={handleSimulate}
          disabled={!requesterStructureId || !actionType || loading}
          className="w-full"
        >
          {loading ? t('simulating') : t('simulate')}
        </Button>

        {result && (
          <div className={`p-4 rounded-xl border ${result.isAuthorized ? 'bg-emerald-400/10 border-emerald-400/30' : 'bg-red-400/10 border-red-400/30'}`}>
            <div className="flex items-center gap-3 mb-3">
              {result.isAuthorized ? (
                <CheckIcon size={20} className="text-emerald-400" />
              ) : (
                <XIcon size={20} className="text-red-400" />
              )}
              <span className={`font-medium ${result.isAuthorized ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.isAuthorized ? t('authorized') : t('notAuthorized')}
              </span>
            </div>
            {result.message && (
              <p className="text-sm text-text-muted mb-3">{result.message}</p>
            )}
            {result.requiredApprovals && result.requiredApprovals.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-text-muted">{t('requiredApprovals')}:</p>
                {result.requiredApprovals.map((step, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-text-primary">
                    <span className="w-5 h-5 rounded-full bg-white/[0.05] flex items-center justify-center text-xs">
                      {step.order}
                    </span>
                    <span>{step.structure?.name} - {step.role?.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

export default function ApprovalChainPage() {
  const params = useParams();
  const structureId = params.id as string;

  const t = useTranslations('network');
  const tCommon = useTranslations('common');

  const [structure, setStructure] = useState<Structure | null>(null);
  const [chain, setChain] = useState<ApprovalChain | null>(null);
  const [allStructures, setAllStructures] = useState<Structure[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [structureId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [structureData, chainData, structuresData] = await Promise.all([
        structuresService.getById(structureId),
        structuresService.getApprovalChain(structureId),
        structuresService.list(),
      ]);
      setStructure(structureData);
      setChain(chainData);
      setAllStructures(structuresData.items);
    } catch (error) {
      console.error('Failed to load approval chain:', error);
      setStructure(mockStructure);
      setChain(mockApprovalChain);
      setAllStructures(mockAllStructures);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-text-muted">{tCommon('loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href={`/network/structures/${structureId}`}
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        <ChevronLeftIcon size={16} />
        {t('backToStructure')}
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-400">
            <NetworkIcon size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-light text-text-primary">{t('approvalChain')}</h1>
            <p className="text-text-muted mt-1">{structure?.name}</p>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flow Diagram */}
        <div className="lg:col-span-2">
          <Card className="!p-0 overflow-hidden">
            <div className="p-6 border-b border-white/[0.05]">
              <h2 className="text-lg font-medium text-text-primary">{t('approvalFlow')}</h2>
              <p className="text-sm text-text-muted mt-1">{t('approvalFlowHint')}</p>
            </div>
            <div className="p-6">
              {chain ? (
                <FlowDiagram chain={chain} />
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.03] flex items-center justify-center">
                    <NetworkIcon size={32} className="text-text-muted" />
                  </div>
                  <p className="text-text-muted">{t('noApprovalChain')}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Simulation Panel */}
        <div>
          <SimulationPanel
            structureId={structureId}
            structures={allStructures.length > 0 ? allStructures : mockAllStructures}
          />
        </div>
      </div>
    </div>
  );
}

// Mock data
const mockStructure: Structure = {
  id: 'brazil-1',
  tenantId: 'demo-tenant',
  name: 'LeaderX Brasil',
  typeId: 'type-national',
  status: 'ACTIVE',
  scope: 'COUNTRY_GROUP',
  hierarchyLevel: 3,
  createdAt: '',
  updatedAt: '',
};

const mockApprovalSteps: ApprovalChainStep[] = [
  {
    id: 'step-1',
    order: 1,
    structureId: 'sp-1',
    structure: { id: 'sp-1', tenantId: 'demo', name: 'LeaderX São Paulo', typeId: 'type-state', status: 'ACTIVE', scope: 'CITY_GROUP', hierarchyLevel: 4, createdAt: '', updatedAt: '' },
    roleId: 'role-member',
    role: { id: 'role-member', name: 'Coordenador' },
    status: 'APPROVED',
    decidedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'step-2',
    order: 2,
    structureId: 'brazil-1',
    structure: { id: 'brazil-1', tenantId: 'demo', name: 'LeaderX Brasil', typeId: 'type-national', status: 'ACTIVE', scope: 'COUNTRY_GROUP', hierarchyLevel: 3, createdAt: '', updatedAt: '' },
    approverId: 'user-1',
    approver: { id: 'user-1', fullName: 'João Silva' },
    roleId: 'role-manager',
    role: { id: 'role-manager', name: 'Gerente Nacional' },
    status: 'PENDING',
  },
  {
    id: 'step-3',
    order: 3,
    structureId: 'latam-1',
    structure: { id: 'latam-1', tenantId: 'demo', name: 'LeaderX LATAM', typeId: 'type-regional', status: 'ACTIVE', scope: 'COUNTRY_GROUP', hierarchyLevel: 2, createdAt: '', updatedAt: '' },
    roleId: 'role-admin',
    role: { id: 'role-admin', name: 'Diretor Regional' },
    status: 'PENDING',
  },
];

const mockApprovalChain: ApprovalChain = {
  id: 'chain-1',
  structureId: 'brazil-1',
  structure: mockStructure,
  actionType: 'CREATE_STRUCTURE',
  requesterId: 'user-2',
  requester: { id: 'user-2', fullName: 'Maria Santos' },
  status: 'PENDING',
  steps: mockApprovalSteps,
  createdAt: '2024-01-15T09:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
};

const mockAllStructures: Structure[] = [
  { id: 'global-1', tenantId: 'demo', name: 'LeaderX Global', typeId: 'type-global', status: 'ACTIVE', scope: 'GLOBAL_ALL_COUNTRIES', hierarchyLevel: 1, createdAt: '', updatedAt: '' },
  { id: 'latam-1', tenantId: 'demo', name: 'LeaderX LATAM', typeId: 'type-regional', status: 'ACTIVE', scope: 'COUNTRY_GROUP', hierarchyLevel: 2, createdAt: '', updatedAt: '' },
  { id: 'brazil-1', tenantId: 'demo', name: 'LeaderX Brasil', typeId: 'type-national', status: 'ACTIVE', scope: 'COUNTRY_GROUP', hierarchyLevel: 3, createdAt: '', updatedAt: '' },
  { id: 'sp-1', tenantId: 'demo', name: 'LeaderX São Paulo', typeId: 'type-state', status: 'ACTIVE', scope: 'CITY_GROUP', hierarchyLevel: 4, createdAt: '', updatedAt: '' },
  { id: 'rj-1', tenantId: 'demo', name: 'LeaderX Rio de Janeiro', typeId: 'type-state', status: 'ACTIVE', scope: 'CITY_GROUP', hierarchyLevel: 4, createdAt: '', updatedAt: '' },
];
