'use client';

import { ReactNode, useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface PanelProps {
  title?: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
  headerExtra?: ReactNode;
}

export default function Panel({
  title,
  children,
  collapsible = false,
  defaultCollapsed = false,
  className,
  headerExtra,
}: PanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div
      className={twMerge(
        clsx('flex flex-col bg-slate-800 border-2 border-slate-600 overflow-hidden'),
        className
      )}
    >
      {title !== undefined && (
        <div className="flex items-center justify-between px-3 py-2 bg-slate-700 border-b-2 border-slate-600 shrink-0">
          <div className="flex items-center gap-2">
            {collapsible && (
              <button
                onClick={() => setCollapsed((c) => !c)}
                className="font-pixel text-[8px] text-slate-400 hover:text-white w-4 h-4 flex items-center justify-center leading-none"
                aria-label={collapsed ? 'Expand' : 'Collapse'}
              >
                {collapsed ? '▶' : '▼'}
              </button>
            )}
            <span className="font-pixel text-[8px] text-slate-300 tracking-wide">{title}</span>
          </div>
          {headerExtra && <div className="flex items-center">{headerExtra}</div>}
        </div>
      )}

      {!collapsed && <div className="flex-1 overflow-y-auto">{children}</div>}
    </div>
  );
}
