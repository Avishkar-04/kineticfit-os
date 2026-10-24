import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-display font-semibold transition-all duration-150 select-none disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none';

    const sizeStyles = {
      sm: 'h-8 px-3 text-xs rounded tracking-wider',
      md: 'h-10 px-4 text-sm rounded tracking-wide',
      lg: 'h-12 px-6 text-base rounded-md tracking-wide'
    };

    const variantStyles = {
      primary:
        'bg-kf-lime text-kf-bg hover:bg-kf-lime-dim active:scale-[0.98] shadow-sm hover:shadow-lime-glow focus:ring-2 focus:ring-kf-lime/50 font-bold',
      secondary:
        'bg-transparent border border-kf-border text-white hover:bg-kf-surface-2 hover:border-slate-500 active:scale-[0.98] focus:ring-2 focus:ring-kf-border',
      ghost:
        'bg-transparent text-kf-text-muted hover:text-white hover:bg-kf-surface-1 active:scale-[0.98]',
      danger:
        'bg-kf-danger-container/20 border border-kf-danger/40 text-kf-danger hover:bg-kf-danger/20 hover:border-kf-danger active:scale-[0.98] focus:ring-2 focus:ring-kf-danger/50'
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin text-current" />
        ) : leftIcon ? (
          <span className="mr-2 inline-flex items-center">{leftIcon}</span>
        ) : null}
        {children}
        {!isLoading && rightIcon && (
          <span className="ml-2 inline-flex items-center">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
