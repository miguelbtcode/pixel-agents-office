'use client';

import { useState } from 'react';
import OfficeCanvas from '@/components/office/OfficeCanvas';
import AgentCard from '@/components/agents/AgentCard';
import ActivityLog from '@/components/activity/ActivityLog';
import FurniturePanel from '@/components/editor/FurniturePanel';
import ThemeSelector from '@/components/editor/ThemeSelector';
import { agentProfiles } from '@/data/agentProfiles';
import { useOfficeStore } from '@/store/useOfficeStore';
import { useAgentStore } from '@/store/useAgentStore';
import { useActivityStore } from '@/store/useActivityStore';
import type { AgentId } from '@/types/agent';

// Agent dot colors match agentProfiles primaryColor
const AGENT_DOT_CONFIG: { id: AgentId; name: string; color: string }[] = [
  { id: 'luna', name: 'Luna', color: '#a78bfa' },
  { id: 'max',  name: 'Max',  color: '#34d399' },
  { id: 'ava',  name: 'Ava',  color: '#60a5fa' },
  { id: 'sam',  name: 'Sam',  color: '#fbbf24' },
  { id: 'rio',  name: 'Rio',  color: '#f87171' },
];

export default function Home() {
  // Panel visibility
  const [agentsPanelOpen, setAgentsPanelOpen] = useState(false);
  const [activityPanelOpen, setActivityPanelOpen] = useState(false);
  const [mobileAgentId, setMobileAgentId] = useState<AgentId | null>(null);

  const isEditorMode = useOfficeStore((state) => state.isEditorMode);
  const toggleEditorMode = useOfficeStore((state) => state.toggleEditorMode);
  const totalEntries = useActivityStore((s) => s.entries.length);
  const agents = useAgentStore((s) => s.agents);

  return (
    <main className="relative h-screen w-screen overflow-hidden no-select">
      {/* ── Full-screen Canvas (the star of the show) ─────────────── */}
      <div className="absolute inset-0">
        <OfficeCanvas />
      </div>

      {/* ── Vignette overlay for immersive feel ───────────────────── */}
      <div className="vignette" />

      {/* ── Bottom Toolbar — Gather-style floating bar ─────────────── */}
      <div
        className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 panel-glass px-3 safe-bottom"
        style={{ height: 44 }}
      >
        {/* Agent avatar buttons */}
        {AGENT_DOT_CONFIG.map(({ id, name, color }) => {
          const agent = agents[id];
          const isActive = agent?.state === 'talking' || agent?.state === 'meeting';
          return (
            <button
              key={id}
              onClick={() => {
                // Desktop: toggle agents panel, Mobile: open agent sheet
                if (window.innerWidth >= 768) {
                  setAgentsPanelOpen((o) => !o);
                } else {
                  setMobileAgentId(id);
                }
              }}
              className="relative shrink-0 flex items-center justify-center transition-all active:scale-90 hover:scale-110"
              style={{
                width: 30,
                height: 30,
                backgroundColor: color + '25',
                border: `2px solid ${color}`,
              }}
              aria-label={`Open ${name} card`}
              title={name}
            >
              <span
                className="font-pixel text-[7px] leading-none"
                style={{ color }}
              >
                {name[0]}
              </span>
              {isActive && (
                <span
                  className="absolute -top-1 -right-1 w-2 h-2 animate-agent-pulse"
                  style={{ backgroundColor: color }}
                />
              )}
            </button>
          );
        })}

        {/* Divider */}
        <div className="w-px h-6 shrink-0" style={{ backgroundColor: 'var(--color-border)' }} />

        {/* Activity log toggle */}
        <button
          onClick={() => setActivityPanelOpen((o) => !o)}
          className="relative shrink-0 flex items-center justify-center w-8 h-8 transition-all hover:scale-105 active:scale-95"
          style={{
            backgroundColor: activityPanelOpen ? 'rgba(90,140,255,0.2)' : 'rgba(255,255,255,0.08)',
            border: activityPanelOpen ? '2px solid var(--color-accent)' : '2px solid var(--color-border)',
          }}
          aria-label="Toggle activity log"
          title="Activity Log"
        >
          <span className="font-pixel text-[6px]" style={{ color: activityPanelOpen ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>LOG</span>
          {totalEntries > 0 && (
            <span
              className="absolute -top-2 -right-2 font-pixel text-[5px] text-white px-1 py-0.5 leading-none min-w-[14px] text-center"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              {totalEntries > 99 ? '99+' : totalEntries}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="w-px h-6 shrink-0" style={{ backgroundColor: 'var(--color-border)' }} />

        {/* Editor mode toggle */}
        <button
          onClick={toggleEditorMode}
          className="shrink-0 flex items-center justify-center px-3 h-8 font-pixel text-[6px] transition-all hover:scale-105 active:scale-95"
          style={{
            backgroundColor: isEditorMode ? 'rgba(90,200,140,0.2)' : 'rgba(255,255,255,0.08)',
            border: isEditorMode ? '2px solid var(--color-accent-green)' : '2px solid var(--color-border)',
            color: isEditorMode ? 'var(--color-accent-green)' : 'var(--color-text-muted)',
          }}
          aria-label={isEditorMode ? 'Switch to play mode' : 'Switch to edit mode'}
        >
          {isEditorMode ? 'PLAY' : 'EDIT'}
        </button>
      </div>

      {/* ── Floating Agents Panel (left side) ────────────────────── */}
      {agentsPanelOpen && !isEditorMode && (
        <div
          className="fixed top-3 left-3 z-20 panel-glass animate-fade-in hidden md:flex flex-col overflow-hidden"
          style={{ width: 220, maxHeight: 'calc(100vh - 70px)' }}
        >
          <div className="flex items-center justify-between px-3 py-2 shrink-0" style={{ borderBottom: '2px solid var(--color-border)' }}>
            <span className="font-pixel text-[7px] tracking-wide" style={{ color: 'var(--color-accent)' }}>AGENTS</span>
            <button
              onClick={() => setAgentsPanelOpen(false)}
              className="font-pixel text-[8px] w-5 h-5 flex items-center justify-center transition-colors hover:text-white"
              style={{ color: 'var(--color-text-muted)' }}
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-2 flex flex-col gap-2 px-2">
            {agentProfiles.map((profile) => (
              <AgentCard key={profile.id} agentId={profile.id} />
            ))}
          </div>
        </div>
      )}

      {/* ── Floating Editor Panel (left side) ────────────────────── */}
      {isEditorMode && (
        <div
          className="fixed top-3 left-3 z-20 panel-glass animate-fade-in hidden md:flex flex-col overflow-hidden"
          style={{ width: 220, maxHeight: 'calc(100vh - 70px)' }}
        >
          <div className="flex items-center justify-between px-3 py-2 shrink-0" style={{ borderBottom: '2px solid var(--color-border)' }}>
            <span className="font-pixel text-[7px] tracking-wide" style={{ color: 'var(--color-accent-green)' }}>EDITOR</span>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            <FurniturePanel />
          </div>
          <div className="shrink-0 p-2" style={{ borderTop: '2px solid var(--color-border)' }}>
            <ThemeSelector />
          </div>
        </div>
      )}

      {/* ── Floating Activity Log Panel (right side) ──────────────── */}
      {activityPanelOpen && (
        <div
          className="fixed top-3 right-3 z-20 panel-glass animate-fade-in hidden md:flex flex-col overflow-hidden"
          style={{ width: 280, maxHeight: 'calc(100vh - 70px)' }}
        >
          <div className="flex items-center justify-between px-3 py-2 shrink-0" style={{ borderBottom: '2px solid var(--color-border)' }}>
            <span className="font-pixel text-[7px] tracking-wide" style={{ color: 'var(--color-accent)' }}>ACTIVITY LOG</span>
            <button
              onClick={() => setActivityPanelOpen(false)}
              className="font-pixel text-[8px] w-5 h-5 flex items-center justify-center transition-colors hover:text-white"
              style={{ color: 'var(--color-text-muted)' }}
            >
              ✕
            </button>
          </div>
          <ActivityLog className="flex-1 overflow-hidden" />
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MOBILE-ONLY UI (hidden on md+)
      ════════════════════════════════════════════════════════════════ */}

      {/* ── Mobile: AgentCard bottom sheet ─────────────────────────── */}
      {mobileAgentId && (
        <div
          className="md:hidden fixed inset-x-0 bottom-0 z-40 animate-slide-up safe-bottom"
          style={{ maxHeight: '70vh' }}
        >
          <div
            className="fixed inset-0 z-[-1]"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={() => setMobileAgentId(null)}
            aria-hidden="true"
          />
          <div className="flex flex-col overflow-hidden panel-glass" style={{ borderTop: '2px solid var(--color-border)' }}>
            <div className="flex items-center justify-between px-4 py-2 shrink-0" style={{ borderBottom: '2px solid var(--color-border)' }}>
              <span className="font-pixel text-[7px] tracking-wide" style={{ color: 'var(--color-accent)' }}>AGENT INFO</span>
              <button
                onClick={() => setMobileAgentId(null)}
                className="font-pixel text-[8px] w-7 h-7 flex items-center justify-center transition-colors hover:text-white"
                style={{ color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto p-3">
              <AgentCard agentId={mobileAgentId} />
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile: ActivityLog bottom sheet ───────────────────────── */}
      {activityPanelOpen && (
        <div
          className="md:hidden fixed inset-x-0 bottom-0 z-50 animate-slide-up safe-bottom"
          style={{ height: '80vh' }}
        >
          <div
            className="fixed inset-0 z-[-1]"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={() => setActivityPanelOpen(false)}
            aria-hidden="true"
          />
          <div className="h-full flex flex-col overflow-hidden panel-glass" style={{ borderTop: '2px solid var(--color-border)' }}>
            <div className="flex items-center justify-between px-3 py-2 shrink-0" style={{ borderBottom: '2px solid var(--color-border)' }}>
              <span className="font-pixel text-[7px] tracking-wide" style={{ color: 'var(--color-accent)' }}>ACTIVITY LOG</span>
              <button
                onClick={() => setActivityPanelOpen(false)}
                className="font-pixel text-[8px] w-7 h-7 flex items-center justify-center transition-colors hover:text-white"
                style={{ color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
              >
                ✕
              </button>
            </div>
            <ActivityLog className="flex-1 overflow-hidden" />
          </div>
        </div>
      )}
    </main>
  );
}
