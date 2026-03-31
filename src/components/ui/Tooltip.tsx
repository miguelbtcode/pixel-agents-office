'use client';

import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ children, content, position = 'top' }: TooltipProps) {
  const tooltipBase =
    'absolute z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-150 whitespace-nowrap font-pixel text-[8px] text-white bg-slate-900 border-2 border-slate-600 px-2 py-1 leading-none';

  const arrowBase = 'absolute w-0 h-0 border-solid';

  const positionClasses: Record<string, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses: Record<string, string> = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-600',
    bottom:
      'bottom-full left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-slate-600',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-slate-600',
    right:
      'right-full top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-slate-600',
  };

  return (
    <div className="relative group inline-flex">
      {children}
      <div className={clsx(tooltipBase, positionClasses[position])}>
        {content}
        <span className={clsx(arrowBase, arrowClasses[position])} />
      </div>
    </div>
  );
}
