'use client';

import { AuditIcon } from '@/components/icons';

export default function AuditReportsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Relatórios</h1>
        <p className="text-white/40" style={{ marginTop: '8px' }}>Visualize relatórios de auditoria</p>
      </div>

      {/* Coming Soon */}
      <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
        <div className="p-4 rounded-2xl bg-violet-500/10 text-violet-400 mb-6">
          <AuditIcon size={32} />
        </div>
        <h2 className="text-xl font-medium text-white mb-2">Em Desenvolvimento</h2>
        <p className="text-white/40 text-center max-w-md">
          O módulo de relatórios está em desenvolvimento e estará disponível em breve.
        </p>
      </div>
    </div>
  );
}
