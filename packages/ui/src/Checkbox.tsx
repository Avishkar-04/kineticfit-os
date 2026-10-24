import React from 'react';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, checked, onChange, disabled, id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <label
        htmlFor={inputId}
        className={clsx(
          'inline-flex items-center gap-2.5 cursor-pointer select-none text-sm text-kf-text',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <div className="relative flex items-center justify-center">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="sr-only"
            {...props}
          />
          <div
            className={clsx(
              'w-4 h-4 rounded-sm border transition-all duration-150 flex items-center justify-center',
              checked
                ? 'bg-kf-lime border-kf-lime text-kf-bg shadow-sm'
                : 'bg-kf-surface-lowest border-kf-border hover:border-slate-500'
            )}
          >
            {checked && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
        </div>
        {label && <span className="font-body text-xs text-kf-text-muted leading-tight">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
