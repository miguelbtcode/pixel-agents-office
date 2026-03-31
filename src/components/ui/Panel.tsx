'use client';

import { ReactNode, useState } from 'react';
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
      className={twMerge('flex flex-col overflow-hidden', className)}
    >
      {title !== undefined && (
        <div
          className="flex items-center justify-between px-3 py-2 shrink-0"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-2">
            {collapsible && (
              <button
                onClick={() => setCollapsed((c) => !c)}
                className="font-pixel text-[8px] w-4 h-4 flex items-center justify-center leading-none transition-colors hover:text-white"
                style={{ color: 'var(--color-text-muted)' }}
                aria-label={collapsed ? 'Expand' : 'Collapse'}
              >
                {collapsed ? '▶' : '▼'}
              </button>
            )}
            <span className="font-pixel text-[8px] tracking-wide" style={{ color: 'var(--color-text)' }}>{title}</span>
          </div>
          {headerExtra && <div className="flex items-center">{headerExtra}</div>}
        </div>
      )}

      {!collapsed && <div className="flex-1 overflow-y-auto">{children}</div>}
    </div>
  );
}
