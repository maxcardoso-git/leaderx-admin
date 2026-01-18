'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { CheckIcon } from '../icons';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className = '', id, checked, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <label
        htmlFor={checkboxId}
        className={`flex items-start gap-3 cursor-pointer ${className}`}
      >
        <div className="relative flex-shrink-0 mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <div
            className={`
              w-5 h-5 rounded border-2 transition-all
              ${checked ? 'bg-gold border-gold' : 'bg-transparent border-border'}
              peer-focus-visible:ring-2 peer-focus-visible:ring-gold peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background
              peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
            `}
          >
            {checked && (
              <CheckIcon size={14} className="text-background absolute top-0.5 left-0.5" />
            )}
          </div>
        </div>
        {(label || description) && (
          <div>
            {label && (
              <span className="text-sm font-medium text-text-primary">{label}</span>
            )}
            {description && (
              <p className="text-xs text-text-muted mt-0.5">{description}</p>
            )}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
