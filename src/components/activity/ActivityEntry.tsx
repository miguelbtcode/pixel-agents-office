'use client';

import { useMemo } from 'react';
import type { ActivityEntry as ActivityEntryType } from '@/types/activity';
import { ACTIVITY_ICONS } from '@/types/activity';
import { agentProfiles } from '@/data/agentProfiles';

interface ActivityEntryProps {
  entry: ActivityEntryType;
}

const TYPE_ACCENT_COLORS: Record<string, string> = {
  message: '#5a8cff',
  code_commit: '#5ac88c',
  review: '#fbbf24',
  bug_found: '#ef4444',
  deployment: '#a78bfa',
  meeting: '#6a5acd',
  break: '#fb923c',
  task_start: '#5ac88c',
  task_done: '#5ac88c',
};

export default function ActivityEntry({ entry }: ActivityEntryProps) {
  const agent = useMemo(
    () => agentProfiles.find((a) => a.id === entry.agentId),
    [entry.agentId],
  );

  const relatedAgents = useMemo(
    () =>
      (entry.relatedAgents ?? [])
        .map((id) => agentProfiles.find((a) => a.id === id))
        .filter(Boolean),
    [entry.relatedAgents],
  );

  const isNew = Date.now() - entry.timestamp < 3000;
  const formattedTime = new Date(entry.timestamp).toLocaleTimeString('en-US', { hour12: false });
  const icon = ACTIVITY_ICONS[entry.type] ?? '•';
  const accentColor = TYPE_ACCENT_COLORS[entry.type] ?? '#8888aa';

  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 min-h-[36px] transition-colors duration-100 ${
        isNew ? 'animate-entry-flash' : ''
      }`}
      style={{
        borderLeft: `2px solid ${accentColor}`,
        backgroundColor: isNew ? 'rgba(90,140,255,0.08)' : 'transparent',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isNew ? 'rgba(90,140,255,0.08)' : 'transparent'; }}
    >
      {/* Icon */}
      <div
        className="shrink-0 w-5 h-5 flex items-center justify-center text-[10px] leading-none"
        style={{ backgroundColor: `${accentColor}20` }}
        aria-label={entry.type}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex items-baseline gap-1 overflow-hidden">
        <span
          className="font-pixel text-[7px] leading-none shrink-0 font-bold"
          style={{ color: agent?.primaryColor ?? '#8888aa' }}
        >
          {agent?.name ?? entry.agentId}
        </span>
        <span
          className="font-pixel text-[6px] leading-none truncate"
          style={{ color: 'var(--color-text)' }}
          title={entry.description}
        >
          {entry.description}
        </span>
      </div>

      {/* Related agents */}
      {relatedAgents.length > 0 && (
        <div className="flex items-center gap-0.5 shrink-0">
          {relatedAgents.slice(0, 3).map((rel) =>
            rel ? (
              <span
                key={rel.id}
                className="w-2 h-2 inline-block"
                style={{ backgroundColor: rel.primaryColor }}
                title={rel.name}
              />
            ) : null,
          )}
        </div>
      )}

      {/* Timestamp */}
      <span className="font-pixel text-[5px] shrink-0 tabular-nums leading-none" style={{ color: 'var(--color-text-muted)' }}>
        {formattedTime}
      </span>
    </div>
  );
}
