import React from 'react';
import { clsx } from 'clsx';

export interface ProgressRingProps {
  value?: number; // 0 to 100
  percentage?: number; // alias for value
  size?: number; // diameter in px
  strokeWidth?: number;
  color?: 'lime' | 'cyan' | 'danger';
  label?: string;
  sublabel?: string;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  percentage,
  size = 120,
  strokeWidth = 6,
  color = 'lime',
  label,
  sublabel,
  className
}) => {
  const actualValue = value ?? percentage ?? 0;
  const clampedValue = Math.min(100, Math.max(0, actualValue));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  const colorClasses = {
    lime: 'text-kf-lime drop-shadow-[0_0_8px_rgba(195,244,0,0.3)]',
    cyan: 'text-kf-cyan drop-shadow-[0_0_8px_rgba(0,238,252,0.3)]',
    danger: 'text-kf-danger drop-shadow-[0_0_8px_rgba(255,180,171,0.3)]'
  };

  return (
    <div className={clsx('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1d2025"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Active progress sweep */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className={clsx('transition-all duration-700 ease-out', colorClasses[color])}
        />
      </svg>

      {/* Centered readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-mono font-bold text-lg lg:text-xl text-white tracking-tight tabular-nums">
          {label ?? `${Math.round(clampedValue)}%`}
        </span>
        {sublabel && (
          <span className="font-mono text-[10px] uppercase tracking-wider text-kf-text-steel mt-0.5">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};
