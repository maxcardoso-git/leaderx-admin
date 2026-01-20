'use client';

import { useTranslations } from 'next-intl';
import { Card } from './Card';

interface UnderDevelopmentProps {
  title?: string;
  icon?: React.ReactNode;
}

export function UnderDevelopment({ title, icon }: UnderDevelopmentProps) {
  const t = useTranslations('common');

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="!p-12 max-w-lg text-center">
        <div className="flex flex-col items-center">
          {icon && (
            <div className="w-20 h-20 rounded-2xl bg-gold/10 flex items-center justify-center mb-6 text-gold">
              {icon}
            </div>
          )}
          <h1 className="text-2xl font-light text-text-primary mb-3">
            {title || t('underDevelopment')}
          </h1>
          <p className="text-text-muted">
            {t('comingSoonMessage')}
          </p>
        </div>
      </Card>
    </div>
  );
}
