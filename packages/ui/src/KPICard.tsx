import React from 'react';
import { clsx } from 'clsx';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface KPICardProps {
  label: string;
  value: string | number;
  delta?: {
    value: string;
    isPositive: boolean;
    period?: string;
  };
  chip?: React.ReactNode;
  subtext?: string;
  className?: string;
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  delta,
  chip,
  subtext,
  className,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={clsx(
        'bg-kf-surface-1 border border-kf-border rounded-lg p-4 flex flex-col justify-between transition-all duration-150',
        onClick &&
          'cursor-pointer hover:bg-kf-surface-2 hover:border-slate-600 active:scale-[0.99] focus:outline-none focus:ring-1 focus:ring-kf-lime',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-mono text-[11px] font-semibold text-kf-text-steel uppercase tracking-widest">
          {label}
        </span>
        {chip}
      </div>

      <div className="my-1">
        <div className="font-display font-extrabold text-2xl lg:text-3xl text-white tracking-tight tabular-nums">
          {value}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs">
        {delta ? (
          <div
            className={clsx(
              'inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded',
              delta.isPositive
                ? 'text-kf-lime bg-kf-lime/10'
                : 'text-kf-danger bg-kf-danger/10'
            )}
          >
            {delta.isPositive ? (
              <TrendingUp className="w-3 h-3 stroke-[2.5]" />
            ) : (
              <TrendingDown className="w-3 h-3 stroke-[2.5]" />
            )}
            <span>{delta.value}</span>
            {delta.period && <span className="text-kf-text-steel ml-1">{delta.period}</span>}
          </div>
        ) : (
          <span />
        )}

        {subtext && (
          <span className="font-mono text-[11px] text-kf-text-steel tracking-wide truncate">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};
