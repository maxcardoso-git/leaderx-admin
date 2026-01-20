'use client';

import { useTranslations } from 'next-intl';
import { UnderDevelopment } from '@/components/ui';
import { BriefcaseIcon } from '@/components/icons';

export default function PositionsPage() {
  const t = useTranslations('nav');

  return (
    <UnderDevelopment
      title={t('positions')}
      icon={<BriefcaseIcon size={40} />}
    />
  );
}
