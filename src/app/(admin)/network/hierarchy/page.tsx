'use client';

import { NetworkIcon } from '@/components/icons';

export default function NetworkHierarchyPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Hierarquia</h1>
        <p className="text-white/40 mt-1">Visualize a estrutura hierárquica da rede</p>
      </div>

      {/* Coming Soon */}
      <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
        <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-400 mb-6">
          <NetworkIcon size={32} />
        </div>
        <h2 className="text-xl font-medium text-white mb-2">Em Desenvolvimento</h2>
        <p className="text-white/40 text-center max-w-md">
          A visualização da hierarquia da rede está em desenvolvimento e estará disponível em breve.
        </p>
      </div>
    </div>
  );
}
