'use client';

import { useTranslations } from 'next-intl';
import { UnderDevelopment } from '@/components/ui';
import { CheckSquareIcon } from '@/components/icons';

export default function ApprovalChainsPage() {
  const t = useTranslations('nav');

  return (
    <UnderDevelopment
      title={t('approvalChains')}
      icon={<CheckSquareIcon size={40} />}
    />
  );
}
