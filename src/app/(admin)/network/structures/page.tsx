'use client';

import { useTranslations } from 'next-intl';
import { UnderDevelopment } from '@/components/ui';
import { LayersIcon } from '@/components/icons';

export default function StructuresPage() {
  const t = useTranslations('nav');

  return (
    <UnderDevelopment
      title={t('structures')}
      icon={<LayersIcon size={40} />}
    />
  );
}
