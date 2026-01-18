'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDownIcon } from '../icons';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className = '', id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-text-secondary mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full h-10 px-4 pr-10 bg-background-alt border rounded-lg text-sm text-text-primary
              appearance-none cursor-pointer transition-colors
              ${error ? 'border-error focus:border-error focus:ring-error/20' : 'border-border focus:border-gold focus:ring-gold/10'}
              focus:outline-none focus:ring-2
              disabled:opacity-50 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          />
        </div>
        {error && <p className="mt-1.5 text-xs text-error">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-text-muted">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
