'use client';

import { useTranslations } from 'next-intl';
import { UnderDevelopment } from '@/components/ui';
import { TrophyIcon } from '@/components/icons';

export default function GamificationPage() {
  const t = useTranslations('nav');

  return (
    <UnderDevelopment
      title={t('gamification')}
      icon={<TrophyIcon size={40} />}
    />
  );
}
