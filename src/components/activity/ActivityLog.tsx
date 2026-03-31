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

  // Auto-scroll to bottom on new entries
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries.length]);

  // Flash header when new entry arrives
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

  // Only render last MAX_VISIBLE entries (entries are newest-first, so we take the first MAX_VISIBLE and reverse)
  const visibleEntries = entries.slice(0, MAX_VISIBLE).reverse();

  return (
    <div className={clsx('flex flex-col overflow-hidden', className)}>
      {/* Header */}
      <div
        className={clsx(
          'flex items-center justify-between px-3 py-2 border-b-2 border-slate-700 shrink-0 transition-colors duration-300',
          headerFlash ? 'bg-violet-900/60' : 'bg-slate-800'
        )}
      >
        <div className="flex items-center gap-2">
          <span className="font-pixel text-[7px] text-violet-300 tracking-wide">ACTIVITY LOG</span>
          <span className="font-pixel text-[6px] bg-slate-700 text-slate-300 px-1.5 py-0.5 leading-none border border-slate-600">
            {isFiltered ? `${entries.length}/${totalEntries}` : totalEntries}
          </span>
        </div>
        <button
          onClick={clearEntries}
          className="font-pixel text-[6px] text-slate-500 hover:text-red-400 border border-slate-700 hover:border-red-700 px-1.5 py-0.5 transition-colors leading-none"
          title="Clear log"
        >
          CLEAR
        </button>
      </div>

      {/* Filters */}
      <ActivityFilter />

      {/* Filtered count notice */}
      {isFiltered && (
        <div className="px-2 py-1 bg-slate-900/40 border-b border-slate-700 shrink-0">
          <span className="font-pixel text-[6px] text-slate-500">
            Showing {entries.length} of {totalEntries} entries
          </span>
        </div>
      )}

      {/* Log list */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {visibleEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10 gap-2">
            <span className="text-2xl opacity-30">📋</span>
            <p className="font-pixel text-[6px] text-slate-600 leading-relaxed text-center">
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
