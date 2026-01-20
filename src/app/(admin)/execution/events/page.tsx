'use client';

import { useTranslations } from 'next-intl';
import { UnderDevelopment } from '@/components/ui';
import { CalendarIcon } from '@/components/icons';

export default function EventsPage() {
  const t = useTranslations('nav');

  return (
    <UnderDevelopment
      title={t('events')}
      icon={<CalendarIcon size={40} />}
    />
  );
}
