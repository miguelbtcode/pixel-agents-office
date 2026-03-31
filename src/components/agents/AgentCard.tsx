'use client';

import { useState } from 'react';
import { useAgentStore } from '@/store/useAgentStore';
import type { AgentId, AgentState } from '@/types/agent';
import AgentSprite from './AgentSprite';
import AgentEditor from './AgentEditor';

interface AgentCardProps {
  agentId: AgentId;
}

const STATE_CONFIG: Record<
  AgentState,
  { label: string; color: string; pulse: boolean }
> = {
  idle:    { label: 'Idle',    color: '#8888aa', pulse: false },
  working: { label: 'Working', color: '#5a8cff', pulse: true },
  walking: { label: 'Walking', color: '#fbbf24', pulse: false },
  talking: { label: 'Talking', color: '#5ac88c', pulse: true },
  meeting: { label: 'Meeting', color: '#a78bfa', pulse: false },
  break:   { label: 'Break',   color: '#fb923c', pulse: false },
};

export default function AgentCard({ agentId }: AgentCardProps) {
  const agent = useAgentStore((state) => state.agents[agentId]);
  const [editorOpen, setEditorOpen] = useState(false);

  if (!agent) return null;

  const stateConfig = STATE_CONFIG[agent.state];

  return (
    <>
      <div
        className="flex flex-col p-2 gap-2 transition-colors"
        style={{
          backgroundColor: 'rgba(37,37,64,0.6)',
          border: '2px solid var(--color-border)',
          borderLeftColor: agent.primaryColor,
          borderLeftWidth: 3,
        }}
      >
        {/* Top row: sprite preview + name/role */}
        <div className="flex items-center gap-2">
          <div className="shrink-0">
            <AgentSprite
              appearance={agent.appearance}
              primaryColor={agent.primaryColor}
              direction={agent.direction}
              size={40}
              animated={false}
            />
          </div>

          <div className="flex-1 min-w-0 overflow-hidden">
            <div
              className="font-pixel text-[8px] leading-tight truncate"
              style={{ color: agent.primaryColor }}
            >
              {agent.name}
            </div>
            <div className="font-pixel text-[6px] mt-1 leading-tight truncate" style={{ color: 'var(--color-text-muted)' }}>
              {agent.role}
            </div>
          </div>
        </div>

        {/* State indicator */}
        <div className="flex items-center gap-1.5">
          <span
            className={stateConfig.pulse ? 'animate-agent-pulse' : ''}
            style={{
              display: 'inline-block',
              width: 6,
              height: 6,
              backgroundColor: stateConfig.color,
              flexShrink: 0,
            }}
          />
          <span className="font-pixel text-[6px]" style={{ color: 'var(--color-text)' }}>{stateConfig.label}</span>
        </div>

        {/* Edit button */}
        <button
          onClick={() => setEditorOpen(true)}
          className="w-full font-pixel text-[6px] px-2 py-1 transition-colors text-left leading-none"
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-muted)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-accent)';
            e.currentTarget.style.color = 'var(--color-accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.color = 'var(--color-text-muted)';
          }}
        >
          Edit Appearance
        </button>
      </div>

      <AgentEditor
        agentId={agentId}
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
      />
    </>
  );
}
