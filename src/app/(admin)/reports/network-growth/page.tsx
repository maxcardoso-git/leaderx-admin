'use client';

import { useTranslations } from 'next-intl';
import { UnderDevelopment } from '@/components/ui';
import { BarChartIcon } from '@/components/icons';

export default function NetworkGrowthPage() {
  const t = useTranslations('nav');

  return (
    <UnderDevelopment
      title={t('networkGrowth')}
      icon={<BarChartIcon size={40} />}
    />
  );
}
