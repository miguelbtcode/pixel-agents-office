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
  // Mobile bottom sheet state
  const [mobileLogOpen, setMobileLogOpen] = useState(false);
  const [mobileAgentId, setMobileAgentId] = useState<AgentId | null>(null);

  // Tablet sidebar toggles
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  const isEditorMode = useOfficeStore((state) => state.isEditorMode);
  const toggleEditorMode = useOfficeStore((state) => state.toggleEditorMode);
  const totalEntries = useActivityStore((s) => s.entries.length);
  const agents = useAgentStore((s) => s.agents);

  return (
    <main className="flex flex-col h-screen w-screen overflow-hidden bg-slate-900 no-select">
      {/* ── Top Toolbar — 32px, always visible ─────────────────────── */}
      <div
        className="flex items-center justify-between px-3 shrink-0 bg-slate-950 border-b-2 border-slate-700 safe-top"
        style={{ height: 32 }}
      >
        {/* Left: title */}
        <span className="font-pixel text-[8px] text-violet-300 tracking-wide truncate">
          PIXEL AGENTS OFFICE
        </span>

        {/* Center tablet: sidebar toggle buttons */}
        <div className="hidden md:flex lg:hidden items-center gap-2">
          <button
            onClick={() => setLeftSidebarOpen((o) => !o)}
            className={[
              'font-pixel text-[6px] px-2 py-1 border transition-colors',
              leftSidebarOpen
                ? 'bg-violet-700 border-violet-500 text-white'
                : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-violet-500',
            ].join(' ')}
            aria-label="Toggle agents sidebar"
          >
            AGENTS
          </button>
          <button
            onClick={() => setRightSidebarOpen((o) => !o)}
            className={[
              'font-pixel text-[6px] px-2 py-1 border transition-colors',
              rightSidebarOpen
                ? 'bg-violet-700 border-violet-500 text-white'
                : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-violet-500',
            ].join(' ')}
            aria-label="Toggle activity log"
          >
            LOG
            {totalEntries > 0 && (
              <span className="ml-1 bg-violet-600 text-white text-[5px] px-1 rounded-none">
                {totalEntries > 99 ? '99+' : totalEntries}
              </span>
            )}
          </button>
        </div>

        {/* Right: editor mode toggle */}
        <button
          onClick={toggleEditorMode}
          className={[
            'font-pixel text-[7px] px-2 py-1 border-2 transition-colors shrink-0',
            isEditorMode
              ? 'bg-violet-700 border-violet-500 text-white hover:bg-violet-600'
              : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-violet-500 hover:text-violet-300',
          ].join(' ')}
          aria-label={isEditorMode ? 'Switch to play mode' : 'Switch to edit mode'}
        >
          {/* Mobile: short label */}
          <span className="md:hidden">{isEditorMode ? 'PLAY' : 'EDIT'}</span>
          {/* Tablet+: full label */}
          <span className="hidden md:inline">{isEditorMode ? 'PLAY MODE' : 'EDIT MODE'}</span>
        </button>
      </div>

      {/* ── Body row: sidebars + canvas ──────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left Sidebar ──────────────────────────────────────────── */}
        {/* Desktop: always visible, 240px */}
        {/* Tablet: collapsible, 200px */}
        {/* Mobile: hidden */}
        <aside
          className={[
            'flex flex-col shrink-0 bg-slate-900 border-r-2 border-slate-700 overflow-hidden transition-all duration-200',
            // Mobile: always hidden
            'hidden',
            // Tablet: show/hide based on toggle, 200px wide
            leftSidebarOpen ? 'md:flex md:w-[200px]' : 'md:hidden',
            // Desktop: always show, 240px wide
            'lg:flex lg:w-60',
          ].join(' ')}
        >
          {isEditorMode ? (
            <>
              <div className="flex-1 overflow-hidden flex flex-col">
                <FurniturePanel />
              </div>
              <div className="shrink-0 border-t-2 border-slate-700 bg-slate-800 p-2">
                <ThemeSelector />
              </div>
            </>
          ) : (
            <>
              <div className="px-3 py-2 border-b-2 border-slate-700 bg-slate-800 shrink-0">
                <span className="font-pixel text-[7px] text-violet-300 tracking-wide">AGENTS</span>
              </div>
              <div className="flex-1 overflow-y-auto py-2 flex flex-col gap-2 px-2">
                {agentProfiles.map((profile) => (
                  <AgentCard key={profile.id} agentId={profile.id} />
                ))}
              </div>
            </>
          )}
        </aside>

        {/* ── Center: Office Canvas ────────────────────────────────── */}
        <div className="flex-1 relative overflow-hidden">
          <OfficeCanvas />
        </div>

        {/* ── Right Sidebar: Activity Log ───────────────────────────── */}
        {/* Desktop: always visible, 280px */}
        {/* Tablet: collapsible, 280px */}
        {/* Mobile: hidden (uses bottom sheet instead) */}
        <aside
          className={[
            'flex flex-col shrink-0 bg-slate-900 border-l-2 border-slate-700 overflow-hidden transition-all duration-200',
            // Mobile: always hidden
            'hidden',
            // Tablet: show/hide based on toggle
            rightSidebarOpen ? 'md:flex md:w-[280px]' : 'md:hidden',
            // Desktop: always show, 280px wide
            'lg:flex lg:w-72',
          ].join(' ')}
        >
          {isEditorMode && (
            <div className="shrink-0 border-b-2 border-slate-700 bg-slate-800 p-2">
              <ThemeSelector />
            </div>
          )}
          <ActivityLog className="flex-1 overflow-hidden" />
        </aside>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MOBILE-ONLY UI  (hidden on md+)
      ════════════════════════════════════════════════════════════════ */}

      {/* ── Mobile: Floating agent dots bottom bar ───────────────────
          Fixed, centered horizontally, sits just above the safe-bottom area.
          Height 48px. Shows 5 colored 32px dots + activity count badge.
      */}
      <div
        className="md:hidden fixed left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-slate-900/90 border-2 border-slate-700 px-4 safe-bottom"
        style={{ bottom: 8, height: 48, backdropFilter: 'blur(8px)' }}
        aria-label="Agent quick-access bar"
      >
        {/* Agent avatar dots */}
        {AGENT_DOT_CONFIG.map(({ id, name, color }) => {
          const agent = agents[id];
          const isActive = agent?.state === 'talking' || agent?.state === 'meeting';
          return (
            <button
              key={id}
              onClick={() => setMobileAgentId(id)}
              className="relative shrink-0 flex items-center justify-center rounded-none border-2 transition-all active:scale-95"
              style={{
                width: 32,
                height: 32,
                backgroundColor: color + '33', // 20% opacity fill
                borderColor: color,
              }}
              aria-label={`Open ${name} card`}
              title={name}
            >
              {/* Initial letter */}
              <span
                className="font-pixel text-[6px] leading-none"
                style={{ color }}
              >
                {name[0]}
              </span>
              {/* Pulse dot when active (talking/meeting) */}
              {isActive && (
                <span
                  className="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: color }}
                />
              )}
            </button>
          );
        })}

        {/* Divider */}
        <div className="w-px h-6 bg-slate-700 shrink-0" />

        {/* Activity log badge button */}
        <button
          onClick={() => setMobileLogOpen((o) => !o)}
          className="relative shrink-0 flex items-center justify-center w-8 h-8 bg-slate-800 border-2 border-slate-600 hover:border-violet-500 transition-colors active:scale-95"
          aria-label="Open activity log"
          title="Activity Log"
        >
          <span className="font-pixel text-[6px] text-violet-300">LOG</span>
          {totalEntries > 0 && (
            <span className="absolute -top-2 -right-2 font-pixel text-[5px] bg-violet-600 text-white px-1 py-0.5 leading-none min-w-[16px] text-center">
              {totalEntries > 99 ? '99+' : totalEntries}
            </span>
          )}
        </button>
      </div>

      {/* ── Mobile: AgentCard bottom sheet ───────────────────────────
          Opens when a dot is tapped. Slides up from bottom.
      */}
      {mobileAgentId && (
        <div
          className="md:hidden fixed inset-x-0 bottom-0 z-40 animate-slide-up safe-bottom"
          style={{ maxHeight: '70vh' }}
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-[-1]"
            onClick={() => setMobileAgentId(null)}
            aria-hidden="true"
          />
          <div className="bg-slate-900 border-t-2 border-slate-700 flex flex-col overflow-hidden shadow-[0_-4px_24px_rgba(0,0,0,0.7)]">
            {/* Sheet header */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b-2 border-slate-700 shrink-0">
              <span className="font-pixel text-[7px] text-violet-300 tracking-wide">AGENT INFO</span>
              <button
                onClick={() => setMobileAgentId(null)}
                className="font-pixel text-[8px] text-slate-400 hover:text-white w-7 h-7 flex items-center justify-center border border-slate-600 hover:border-slate-400 transition-colors"
                aria-label="Close agent card"
              >
                ✕
              </button>
            </div>
            {/* Agent card content */}
            <div className="overflow-y-auto p-3">
              <AgentCard agentId={mobileAgentId} />
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile: ActivityLog bottom sheet ─────────────────────────
          Fixed, 80vh height, slides up from bottom.
      */}
      {mobileLogOpen && (
        <div
          className="md:hidden fixed inset-x-0 bottom-0 z-50 animate-slide-up safe-bottom"
          style={{ height: '80vh' }}
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-[-1]"
            onClick={() => setMobileLogOpen(false)}
            aria-hidden="true"
          />
          <div className="h-full bg-slate-900 border-t-2 border-slate-700 flex flex-col overflow-hidden shadow-[0_-4px_24px_rgba(0,0,0,0.7)]">
            {/* Sheet header */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-800 border-b-2 border-slate-700 shrink-0">
              <span className="font-pixel text-[7px] text-violet-300 tracking-wide">ACTIVITY LOG</span>
              <button
                onClick={() => setMobileLogOpen(false)}
                className="font-pixel text-[8px] text-slate-400 hover:text-white w-7 h-7 flex items-center justify-center border border-slate-600 hover:border-slate-400 transition-colors"
                aria-label="Close activity log"
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
