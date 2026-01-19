'use client';

import { useTranslations } from 'next-intl';
import { NetworkIcon } from '@/components/icons';

export default function NetworkNodesPage() {
  const nav = useTranslations('nav');
  const common = useTranslations('common');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">{nav('nodes')}</h1>
        <p className="text-white/40 mt-1">{nav('network')}</p>
      </div>

      {/* Coming Soon */}
      <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
        <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-400 mb-6">
          <NetworkIcon size={32} />
        </div>
        <h2 className="text-xl font-medium text-white mb-2">{common('underDevelopment')}</h2>
        <p className="text-white/40 text-center max-w-md">
          {common('comingSoonMessage')}
        </p>
      </div>
    </div>
  );
}
