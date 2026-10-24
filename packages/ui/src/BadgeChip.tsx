import React from 'react';
import { clsx } from 'clsx';

export type BadgeVariant = 'active' | 'cyan' | 'danger' | 'neutral';

export interface BadgeChipProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

export const BadgeChip: React.FC<BadgeChipProps> = ({
  children,
  variant = 'active',
  className = '',
  dot = true
}) => {
  const variantStyles = {
    active: 'bg-kf-lime/10 text-kf-lime border-kf-lime/30 shadow-[0_0_8px_rgba(195,244,0,0.15)]',
    cyan: 'bg-kf-cyan/10 text-kf-cyan border-kf-cyan/30 shadow-[0_0_8px_rgba(0,238,252,0.15)]',
    danger: 'bg-kf-danger/15 text-kf-danger border-kf-danger/30 shadow-[0_0_8px_rgba(255,180,171,0.15)]',
    neutral: 'bg-kf-surface-3/40 text-kf-text-muted border-kf-border'
  };

  const dotColors = {
    active: 'bg-kf-lime',
    cyan: 'bg-kf-cyan',
    danger: 'bg-kf-danger',
    neutral: 'bg-kf-text-steel'
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 h-5 px-2 rounded-full border text-[11px] font-mono font-semibold uppercase tracking-wider select-none whitespace-nowrap',
        variantStyles[variant],
        className
      )}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />}
      <span>{children}</span>
    </span>
  );
};
