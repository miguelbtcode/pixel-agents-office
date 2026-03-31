'use client';

import { useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { useActivityStore } from '@/store/useActivityStore';
import ActivityEntry from './ActivityEntry';
import ActivityFilter from './ActivityFilter';

interface ActivityLogProps {
  className?: string;
}

const MAX_VISIBLE = 100;

export default function ActivityLog({ className }: ActivityLogProps) {
  const entries = useActivityStore((s) => s.getFilteredEntries());
  const totalEntries = useActivityStore((s) => s.entries.length);
  const clearEntries = useActivityStore((s) => s.clearEntries);
  const filter = useActivityStore((s) => s.filter);

  const bottomRef = useRef<HTMLDivElement>(null);
  const [headerFlash, setHeaderFlash] = useState(false);
  const prevLengthRef = useRef(totalEntries);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries.length]);

  useEffect(() => {
    if (totalEntries > prevLengthRef.current) {
      prevLengthRef.current = totalEntries;
      setHeaderFlash(true);
      const t = setTimeout(() => setHeaderFlash(false), 600);
      return () => clearTimeout(t);
    }
    prevLengthRef.current = totalEntries;
  }, [totalEntries]);

  const isFiltered =
    filter.agents.length > 0 ||
    filter.types.length > 0 ||
    filter.searchText.trim() !== '';

  const visibleEntries = entries.slice(0, MAX_VISIBLE).reverse();

  return (
    <div className={clsx('flex flex-col overflow-hidden', className)}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 shrink-0 transition-colors duration-300"
        style={{
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: headerFlash ? 'rgba(90,140,255,0.15)' : 'transparent',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="font-pixel text-[6px] px-1.5 py-0.5 leading-none" style={{
            backgroundColor: 'rgba(90,140,255,0.15)',
            color: 'var(--color-accent)',
            border: '1px solid rgba(90,140,255,0.3)',
          }}>
            {isFiltered ? `${entries.length}/${totalEntries}` : totalEntries}
          </span>
        </div>
        <button
          onClick={clearEntries}
          className="font-pixel text-[6px] px-1.5 py-0.5 transition-colors leading-none"
          style={{ color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
          title="Clear log"
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ef4444';
            e.currentTarget.style.borderColor = '#7f1d1d';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-text-muted)';
            e.currentTarget.style.borderColor = 'var(--color-border)';
          }}
        >
          CLEAR
        </button>
      </div>

      <ActivityFilter />

      {isFiltered && (
        <div className="px-2 py-1 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <span className="font-pixel text-[6px]" style={{ color: 'var(--color-text-muted)' }}>
            Showing {entries.length} of {totalEntries} entries
          </span>
        </div>
      )}

      {/* Log list */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {visibleEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10 gap-2">
            <p className="font-pixel text-[6px] leading-relaxed text-center" style={{ color: 'var(--color-text-muted)' }}>
              {isFiltered ? 'No matching entries' : 'No activity yet'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {visibleEntries.map((entry) => (
              <ActivityEntry key={entry.id} entry={entry} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
}
