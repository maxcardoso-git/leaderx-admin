'use client';

import { useTranslations } from 'next-intl';
import { UnderDevelopment } from '@/components/ui';
import { CalendarIcon } from '@/components/icons';

export default function EventPerformancePage() {
  const t = useTranslations('nav');

  return (
    <UnderDevelopment
      title={t('eventPerformance')}
      icon={<CalendarIcon size={40} />}
    />
  );
}
