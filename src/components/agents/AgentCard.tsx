'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { useAgentStore } from '@/store/useAgentStore';
import type { AgentId, AgentState } from '@/types/agent';
import AgentSprite from './AgentSprite';
import AgentEditor from './AgentEditor';

interface AgentCardProps {
  agentId: AgentId;
}

// State dot color + label
const STATE_CONFIG: Record<
  AgentState,
  { label: string; color: string; pulse: boolean; bgColor: string }
> = {
  idle:    { label: 'Idle',    color: '#94a3b8', pulse: false, bgColor: 'bg-slate-400' },
  working: { label: 'Working', color: '#60a5fa', pulse: true,  bgColor: 'bg-blue-400' },
  walking: { label: 'Walking', color: '#fbbf24', pulse: false, bgColor: 'bg-yellow-400' },
  talking: { label: 'Talking', color: '#4ade80', pulse: true,  bgColor: 'bg-green-400' },
  meeting: { label: 'Meeting', color: '#c084fc', pulse: false, bgColor: 'bg-purple-400' },
  break:   { label: 'Break',   color: '#fb923c', pulse: false, bgColor: 'bg-orange-400' },
};

export default function AgentCard({ agentId }: AgentCardProps) {
  const agent = useAgentStore((state) => state.agents[agentId]);
  const [editorOpen, setEditorOpen] = useState(false);

  if (!agent) return null;

  const stateConfig = STATE_CONFIG[agent.state];

  return (
    <>
      <div
        className="flex flex-col bg-slate-800 border-2 border-slate-700 hover:border-slate-500 transition-colors p-2 gap-2"
        style={{ borderLeftColor: agent.primaryColor, borderLeftWidth: 3 }}
      >
        {/* Top row: sprite preview + name/role */}
        <div className="flex items-center gap-2">
          {/* Mini sprite preview */}
          <div className="shrink-0">
            <AgentSprite
              appearance={agent.appearance}
              primaryColor={agent.primaryColor}
              direction={agent.direction}
              size={40}
              animated={false}
            />
          </div>

          {/* Name + role */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <div
              className="font-pixel text-[8px] leading-tight truncate"
              style={{ color: agent.primaryColor }}
            >
              {agent.name}
            </div>
            <div className="font-pixel text-[6px] text-slate-400 mt-1 leading-tight truncate">
              {agent.role}
            </div>
          </div>
        </div>

        {/* State indicator row */}
        <div className="flex items-center gap-1.5">
          {/* Dot */}
          <span
            className={clsx(
              'inline-block w-2 h-2 rounded-none shrink-0',
              stateConfig.bgColor,
              stateConfig.pulse && 'animate-pulse'
            )}
          />
          <span className="font-pixel text-[6px] text-slate-300">{stateConfig.label}</span>
        </div>

        {/* Edit button */}
        <button
          onClick={() => setEditorOpen(true)}
          className="w-full font-pixel text-[6px] px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white border border-slate-600 hover:border-slate-400 transition-colors text-left leading-none"
        >
          Edit Appearance
        </button>
      </div>

      {/* Agent Editor modal */}
      <AgentEditor
        agentId={agentId}
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
      />
    </>
  );
}
