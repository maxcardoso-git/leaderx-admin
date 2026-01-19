'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
}

export function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
}: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-5',
    md: 'p-8',
    lg: 'p-10',
    xl: 'p-12',
  };

  return (
    <div
      className={`
        bg-background-card border border-border rounded-xl
        ${paddings[padding]}
        ${hover ? 'transition-all hover:border-border-light hover:shadow-lg' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h3 className="font-heading text-xl font-semibold text-text-primary">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-text-muted mt-2">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon?: ReactNode;
}

export function StatCard({ label, value, change, icon }: StatCardProps) {
  return (
    <Card padding="lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-muted mb-2">{label}</p>
          <p className="text-3xl font-heading font-semibold text-text-primary">
            {value}
          </p>
          {change && (
            <p
              className={`text-sm mt-3 flex items-center gap-1 ${
                change.isPositive ? 'text-success' : 'text-error'
              }`}
            >
              <span>{change.isPositive ? '+' : ''}{change.value}%</span>
              <span className="text-text-muted">vs last month</span>
            </p>
          )}
        </div>
        {icon && (
          <div className="p-4 bg-gold/10 rounded-xl text-gold">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
