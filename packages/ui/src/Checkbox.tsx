import React from 'react';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, checked, onChange, disabled, id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <label
        htmlFor={disabled ? undefined : inputId}
        onClick={disabled ? (e) => e.preventDefault() : undefined}
        className={clsx(
          'inline-flex items-start gap-2.5 select-none text-sm text-kf-text',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          className
        )}
      >
        <div className="relative flex items-center justify-center pt-0.5">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            checked={checked}
            onChange={(e) => {
              if (disabled) return;
              onChange?.(e);
            }}
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
        {(label || description) && (
          <div className="flex flex-col">
            {label && <span className="font-body text-xs text-kf-text leading-tight">{label}</span>}
            {description && (
              <span className="font-body text-[11px] text-kf-text-steel leading-tight mt-0.5">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
