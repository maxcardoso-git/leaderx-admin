'use client';

import { useTranslations } from 'next-intl';
import { UnderDevelopment } from '@/components/ui';
import { MailIcon } from '@/components/icons';

export default function InvitationsPage() {
  const t = useTranslations('nav');

  return (
    <UnderDevelopment
      title={t('invitations')}
      icon={<MailIcon size={40} />}
    />
  );
}
