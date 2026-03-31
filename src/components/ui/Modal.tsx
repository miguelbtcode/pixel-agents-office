'use client';

import { useEffect, useCallback, ReactNode } from 'react';
import { clsx } from 'clsx';

type ModalSize = 'sm' | 'md' | 'lg';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: ModalSize;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
};

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={clsx(
          'relative w-full flex flex-col bg-slate-900 border-4 border-slate-600',
          'animate-in fade-in slide-in-from-bottom-4 duration-150',
          // Pixel corner accents via outline
          'outline outline-2 outline-offset-[-6px] outline-slate-700',
          sizeClasses[size]
        )}
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-slate-700 bg-slate-800 shrink-0">
          <span className="font-pixel text-[9px] text-violet-300 tracking-wide">{title}</span>
          <button
            onClick={onClose}
            className="font-pixel text-[9px] text-slate-400 hover:text-white leading-none w-6 h-6 flex items-center justify-center border border-slate-600 hover:border-slate-400 transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 p-4">{children}</div>
      </div>
    </div>
  );
}
