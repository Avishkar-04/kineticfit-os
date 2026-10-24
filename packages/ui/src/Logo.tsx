import React from 'react';

export interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showWordmark = true
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const textSizes = {
    sm: 'text-sm tracking-wider',
    md: 'text-lg tracking-wider',
    lg: 'text-2xl tracking-widest'
  };

  return (
    <div className={`flex items-center gap-2.5 font-display select-none ${className}`}>
      {/* Precision kinetic bolt mark */}
      <div className={`relative flex items-center justify-center ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_8px_rgba(195,244,0,0.4)]"
        >
          <path
            d="M19 2L5 18H16L13 30L27 14H16L19 2Z"
            fill="#c3f400"
            stroke="#111319"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showWordmark && (
        <div className={`font-black uppercase flex items-center leading-none ${textSizes[size]}`}>
          <span className="text-white">KINETIC</span>
          <span className="text-kf-lime ml-1">FIT</span>
        </div>
      )}
    </div>
  );
};
