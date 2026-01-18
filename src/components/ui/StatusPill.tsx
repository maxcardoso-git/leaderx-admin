'use client';

interface StatusPillProps {
  status: 'active' | 'inactive' | 'pending' | 'suspended' | 'error' | 'success' | 'warning';
  label?: string;
  size?: 'sm' | 'md';
}

const statusConfig = {
  active: {
    bg: 'bg-success/10',
    text: 'text-success',
    dot: 'bg-success',
    label: 'Active',
  },
  inactive: {
    bg: 'bg-text-muted/10',
    text: 'text-text-muted',
    dot: 'bg-text-muted',
    label: 'Inactive',
  },
  pending: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    dot: 'bg-warning',
    label: 'Pending',
  },
  suspended: {
    bg: 'bg-error/10',
    text: 'text-error',
    dot: 'bg-error',
    label: 'Suspended',
  },
  error: {
    bg: 'bg-error/10',
    text: 'text-error',
    dot: 'bg-error',
    label: 'Error',
  },
  success: {
    bg: 'bg-success/10',
    text: 'text-success',
    dot: 'bg-success',
    label: 'Success',
  },
  warning: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    dot: 'bg-warning',
    label: 'Warning',
  },
};

export function StatusPill({ status, label, size = 'md' }: StatusPillProps) {
  const config = statusConfig[status];
  const displayLabel = label || config.label;

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bg} ${config.text} ${sizes[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {displayLabel}
    </span>
  );
}
