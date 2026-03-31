'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
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
    <div className="bg-slate-800 border-b-2 border-slate-700 shrink-0">
      {/* Filter header toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <span className="font-pixel text-[7px] text-slate-400 tracking-wide">FILTERS</span>
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 bg-violet-400 inline-block" />
          )}
        </div>
        <span className="font-pixel text-[8px] text-slate-500">
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
            className="w-full bg-slate-900 border-2 border-slate-600 text-slate-200 font-pixel text-[7px] px-2 py-1 outline-none focus:border-violet-500 placeholder:text-slate-600 leading-none"
          />

          {/* Agent toggles */}
          <div>
            <div className="font-pixel text-[6px] text-slate-500 mb-1 tracking-wide">AGENTS</div>
            <div className="flex flex-wrap gap-1">
              {agentProfiles.map((agent) => {
                const active = filter.agents.includes(agent.id);
                return (
                  <button
                    key={agent.id}
                    onClick={() => toggleAgent(agent.id)}
                    className={clsx(
                      'w-6 h-6 font-pixel text-[8px] leading-none border-2 transition-all duration-75 flex items-center justify-center',
                      active
                        ? 'border-current text-white'
                        : 'border-slate-600 text-slate-500 hover:border-slate-400 hover:text-slate-300'
                    )}
                    style={active ? { borderColor: agent.primaryColor, color: agent.primaryColor, backgroundColor: agent.primaryColor + '22' } : {}}
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
            <div className="font-pixel text-[6px] text-slate-500 mb-1 tracking-wide">TYPES</div>
            <div className="flex flex-wrap gap-1">
              {ALL_TYPES.map((type) => {
                const active = filter.types.includes(type);
                return (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={clsx(
                      'flex items-center gap-0.5 px-1.5 py-0.5 font-pixel text-[6px] border-2 transition-all duration-75',
                      active
                        ? 'bg-violet-700/60 border-violet-500 text-violet-200'
                        : 'bg-slate-700/40 border-slate-600 text-slate-400 hover:border-slate-400 hover:text-slate-300'
                    )}
                    title={ACTIVITY_LABELS[type]}
                  >
                    <span className="text-[8px] leading-none">{ACTIVITY_ICONS[type]}</span>
                    <span>{ACTIVITY_LABELS[type]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clear button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="self-start font-pixel text-[6px] text-red-400 hover:text-red-300 border-2 border-red-800 hover:border-red-600 px-2 py-0.5 transition-colors"
            >
              CLEAR ALL
            </button>
          )}
        </div>
      )}
    </div>
  );
}
