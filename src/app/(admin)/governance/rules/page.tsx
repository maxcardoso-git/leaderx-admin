'use client';

import { GovernanceIcon } from '@/components/icons';

export default function GovernanceRulesPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Regras</h1>
        <p className="text-white/40 mt-1">Configure as regras de governança</p>
      </div>

      {/* Coming Soon */}
      <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
        <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 mb-6">
          <GovernanceIcon size={32} />
        </div>
        <h2 className="text-xl font-medium text-white mb-2">Em Desenvolvimento</h2>
        <p className="text-white/40 text-center max-w-md">
          O módulo de configuração de regras está em desenvolvimento e estará disponível em breve.
        </p>
      </div>
    </div>
  );
}
