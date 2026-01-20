'use client';

import { useTranslations } from 'next-intl';
import { UnderDevelopment } from '@/components/ui';
import { CheckSquareIcon } from '@/components/icons';

export default function ApprovalsPage() {
  const t = useTranslations('nav');

  return (
    <UnderDevelopment
      title={t('approvals')}
      icon={<CheckSquareIcon size={40} />}
    />
  );
}
