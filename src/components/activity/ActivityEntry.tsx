'use client';

import { useMemo } from 'react';
import { clsx } from 'clsx';
import type { ActivityEntry as ActivityEntryType } from '@/types/activity';
import { ACTIVITY_ICONS } from '@/types/activity';
import { agentProfiles } from '@/data/agentProfiles';

interface ActivityEntryProps {
  entry: ActivityEntryType;
}

const TYPE_BORDER_COLORS: Record<string, string> = {
  message: 'border-l-blue-500',
  code_commit: 'border-l-green-500',
  review: 'border-l-yellow-500',
  bug_found: 'border-l-red-500',
  deployment: 'border-l-purple-500',
  meeting: 'border-l-indigo-500',
  break: 'border-l-orange-500',
  task_start: 'border-l-teal-500',
  task_done: 'border-l-teal-500',
};

const TYPE_ICON_BG: Record<string, string> = {
  message: 'bg-blue-900/60',
  code_commit: 'bg-green-900/60',
  review: 'bg-yellow-900/60',
  bug_found: 'bg-red-900/60',
  deployment: 'bg-purple-900/60',
  meeting: 'bg-indigo-900/60',
  break: 'bg-orange-900/60',
  task_start: 'bg-teal-900/60',
  task_done: 'bg-teal-900/60',
};

export default function ActivityEntry({ entry }: ActivityEntryProps) {
  const agent = useMemo(
    () => agentProfiles.find((a) => a.id === entry.agentId),
    [entry.agentId]
  );

  const relatedAgents = useMemo(
    () =>
      (entry.relatedAgents ?? [])
        .map((id) => agentProfiles.find((a) => a.id === id))
        .filter(Boolean),
    [entry.relatedAgents]
  );

  const isNew = Date.now() - entry.timestamp < 3000;

  const formattedTime = new Date(entry.timestamp).toLocaleTimeString('en-US', { hour12: false });

  const icon = ACTIVITY_ICONS[entry.type] ?? '•';
  const borderColor = TYPE_BORDER_COLORS[entry.type] ?? 'border-l-slate-500';
  const iconBg = TYPE_ICON_BG[entry.type] ?? 'bg-slate-700/60';

  return (
    <div
      className={clsx(
        'flex items-center gap-1.5 px-2 py-1 border-l-2 min-h-[40px]',
        borderColor,
        isNew ? 'animate-entry-flash bg-slate-700/80' : 'bg-slate-800/60',
        'hover:bg-slate-700/50 transition-colors duration-100'
      )}
    >
      {/* Icon */}
      <div
        className={clsx(
          'shrink-0 w-5 h-5 flex items-center justify-center text-[10px] leading-none',
          iconBg
        )}
        aria-label={entry.type}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex items-baseline gap-1 overflow-hidden">
        {/* Agent name */}
        <span
          className="font-pixel text-[7px] leading-none shrink-0 font-bold"
          style={{ color: agent?.primaryColor ?? '#94a3b8' }}
        >
          {agent?.name ?? entry.agentId}
        </span>

        {/* Description */}
        <span
          className="font-pixel text-[6px] text-slate-300 leading-none truncate"
          title={entry.description}
        >
          {entry.description}
        </span>
      </div>

      {/* Related agents dots */}
      {relatedAgents.length > 0 && (
        <div className="flex items-center gap-0.5 shrink-0">
          {relatedAgents.slice(0, 3).map((rel) =>
            rel ? (
              <span
                key={rel.id}
                className="w-2 h-2 rounded-none inline-block border border-slate-900/50"
                style={{ backgroundColor: rel.primaryColor }}
                title={rel.name}
              />
            ) : null
          )}
        </div>
      )}

      {/* Timestamp */}
      <span className="font-pixel text-[5px] text-slate-500 shrink-0 tabular-nums leading-none">
        {formattedTime}
      </span>
    </div>
  );
}
