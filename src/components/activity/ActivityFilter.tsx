'use client';

import { useState } from 'react';
import { useActivityStore } from '@/store/useActivityStore';
import { agentProfiles } from '@/data/agentProfiles';
import { ACTIVITY_ICONS, ACTIVITY_LABELS } from '@/types/activity';
import type { ActivityType } from '@/types/activity';
import type { AgentId } from '@/types/agent';

const ALL_TYPES: ActivityType[] = [
  'message',
  'code_commit',
  'review',
  'bug_found',
  'deployment',
  'meeting',
  'break',
  'task_start',
  'task_done',
];

export default function ActivityFilter() {
  const filter = useActivityStore((s) => s.filter);
  const setFilter = useActivityStore((s) => s.setFilter);
  const [collapsed, setCollapsed] = useState(false);

  const toggleAgent = (agentId: AgentId) => {
    const current = filter.agents;
    if (current.includes(agentId)) {
      setFilter({ agents: current.filter((a) => a !== agentId) });
    } else {
      setFilter({ agents: [...current, agentId] });
    }
  };

  const toggleType = (type: ActivityType) => {
    const current = filter.types;
    if (current.includes(type)) {
      setFilter({ types: current.filter((t) => t !== type) });
    } else {
      setFilter({ types: [...current, type] });
    }
  };

  const clearFilters = () => {
    setFilter({ agents: [], types: [], rooms: [], searchText: '' });
  };

  const hasActiveFilters =
    filter.agents.length > 0 ||
    filter.types.length > 0 ||
    filter.searchText.trim() !== '';

  return (
    <div className="shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-2 py-1.5 transition-colors"
        style={{ color: 'var(--color-text-muted)' }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        <div className="flex items-center gap-1.5">
          <span className="font-pixel text-[7px] tracking-wide">FILTERS</span>
          {hasActiveFilters && (
            <span style={{ width: 5, height: 5, backgroundColor: 'var(--color-accent)', display: 'inline-block' }} />
          )}
        </div>
        <span className="font-pixel text-[8px]">
          {collapsed ? '▶' : '▼'}
        </span>
      </button>

      {!collapsed && (
        <div className="px-2 pb-2 flex flex-col gap-2">
          {/* Search */}
          <input
            type="text"
            value={filter.searchText}
            onChange={(e) => setFilter({ searchText: e.target.value })}
            placeholder="Search..."
            className="w-full font-pixel text-[7px] px-2 py-1 outline-none leading-none"
            style={{
              backgroundColor: 'rgba(18,18,30,0.6)',
              border: '2px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
          />

          {/* Agent toggles */}
          <div>
            <div className="font-pixel text-[6px] mb-1 tracking-wide" style={{ color: 'var(--color-text-muted)' }}>AGENTS</div>
            <div className="flex flex-wrap gap-1">
              {agentProfiles.map((agent) => {
                const active = filter.agents.includes(agent.id);
                return (
                  <button
                    key={agent.id}
                    onClick={() => toggleAgent(agent.id)}
                    className="w-6 h-6 font-pixel text-[8px] leading-none flex items-center justify-center transition-all duration-75"
                    style={{
                      border: `2px solid ${active ? agent.primaryColor : 'var(--color-border)'}`,
                      color: active ? agent.primaryColor : 'var(--color-text-muted)',
                      backgroundColor: active ? `${agent.primaryColor}22` : 'transparent',
                    }}
                    title={agent.name}
                  >
                    {agent.name[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Type toggles */}
          <div>
            <div className="font-pixel text-[6px] mb-1 tracking-wide" style={{ color: 'var(--color-text-muted)' }}>TYPES</div>
            <div className="flex flex-wrap gap-1">
              {ALL_TYPES.map((type) => {
                const active = filter.types.includes(type);
                return (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className="flex items-center gap-0.5 px-1.5 py-0.5 font-pixel text-[6px] transition-all duration-75"
                    style={{
                      border: `2px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      backgroundColor: active ? 'rgba(90,140,255,0.15)' : 'transparent',
                      color: active ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    }}
                    title={ACTIVITY_LABELS[type]}
                  >
                    <span className="text-[8px] leading-none">{ACTIVITY_ICONS[type]}</span>
                    <span>{ACTIVITY_LABELS[type]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="self-start font-pixel text-[6px] px-2 py-0.5 transition-colors"
              style={{ color: '#ef4444', border: '2px solid #7f1d1d' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ef4444'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#7f1d1d'; }}
            >
              CLEAR ALL
            </button>
          )}
        </div>
      )}
    </div>
  );
}
