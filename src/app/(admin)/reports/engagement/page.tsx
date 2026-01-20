'use client';

import { useTranslations } from 'next-intl';
import { UnderDevelopment } from '@/components/ui';
import { ChartLineIcon } from '@/components/icons';

export default function EngagementPage() {
  const t = useTranslations('nav');

  return (
    <UnderDevelopment
      title={t('engagement')}
      icon={<ChartLineIcon size={40} />}
    />
  );
}
