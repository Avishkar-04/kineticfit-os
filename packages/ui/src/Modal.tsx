import React, { useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = '2xl'
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* 80% Scrim with 8px backdrop blur */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#0c0f14]/80 backdrop-blur-md transition-opacity duration-200"
      />

      {/* Modal Surface Box */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className={clsx(
          'relative w-full bg-kf-surface-1 border border-kf-border rounded-lg shadow-2xl flex flex-col',
          'max-h-[min(88vh,860px)] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150',
          maxWidthStyles[maxWidth]
        )}
      >
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-kf-border bg-kf-surface-lowest">
          <div>
            <h2 className="font-display font-bold text-lg text-white tracking-tight">{title}</h2>
            {subtitle && (
              <p className="font-mono text-xs text-kf-text-steel tracking-wide mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-kf-text-steel hover:text-white transition-colors p-1 rounded hover:bg-kf-surface-2 focus:outline-none focus:ring-1 focus:ring-kf-lime"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 text-kf-text space-y-4">{children}</div>

        {/* Fixed Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-kf-border bg-kf-surface-lowest">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
