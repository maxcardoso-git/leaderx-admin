'use client';

import { useTranslations } from 'next-intl';
import { UnderDevelopment } from '@/components/ui';
import { BellIcon } from '@/components/icons';

export default function NotificationsPage() {
  const t = useTranslations('nav');

  return (
    <UnderDevelopment
      title={t('notifications')}
      icon={<BellIcon size={40} />}
    />
  );
}
