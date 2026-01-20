'use client';

import { useTranslations } from 'next-intl';
import { UnderDevelopment } from '@/components/ui';
import { AuditIcon } from '@/components/icons';

export default function SessionsPage() {
  const t = useTranslations('nav');

  return (
    <UnderDevelopment
      title={t('sessions')}
      icon={<AuditIcon size={40} />}
    />
  );
}
