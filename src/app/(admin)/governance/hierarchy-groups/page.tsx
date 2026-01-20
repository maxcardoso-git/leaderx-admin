'use client';

import { useTranslations } from 'next-intl';
import { UnderDevelopment } from '@/components/ui';
import { LayersIcon } from '@/components/icons';

export default function HierarchyGroupsPage() {
  const t = useTranslations('nav');

  return (
    <UnderDevelopment
      title={t('hierarchyGroups')}
      icon={<LayersIcon size={40} />}
    />
  );
}
