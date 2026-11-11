import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      id,
      type = 'text',
      label,
      error,
      helperText,
      leftIcon,
      isPassword = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const generatedId = React.useId();
    const inputId = id || generatedId;

    const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="font-mono text-xs font-semibold tracking-wider uppercase text-kf-text-steel flex items-center justify-between"
          >
            <span>{label}</span>
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-kf-text-steel pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            disabled={disabled}
            className={clsx(
              'w-full h-10 px-3 bg-kf-surface-lowest text-white font-body text-sm border rounded transition-all duration-150',
              'placeholder:text-kf-text-steel/60',
              'focus:outline-none focus:border-kf-lime focus:shadow-lime-glow',
              error ? 'border-kf-danger text-kf-danger focus:border-kf-danger' : 'border-kf-border',
              leftIcon ? 'pl-9' : '',
              isPassword ? 'pr-10' : '',
              disabled ? 'opacity-50 cursor-not-allowed' : '',
              className
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-kf-text-steel hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-kf-lime rounded"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>

        {error ? (
          <p className="font-mono text-xs text-kf-danger tracking-wide">{error}</p>
        ) : helperText ? (
          <p className="font-mono text-xs text-kf-text-steel tracking-wide">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
