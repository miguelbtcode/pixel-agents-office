'use client';

import { useState } from 'react';
import OfficeCanvas from '@/components/office/OfficeCanvas';
import AgentCard from '@/components/agents/AgentCard';
import ActivityLog from '@/components/activity/ActivityLog';
import { agentProfiles } from '@/data/agentProfiles';

export default function Home() {
  const [mobileLogOpen, setMobileLogOpen] = useState(false);

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-slate-900">
      {/* Left Sidebar: Agent Cards — hidden on mobile */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-slate-900 border-r-2 border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="px-3 py-2 border-b-2 border-slate-700 bg-slate-800 shrink-0">
          <span className="font-pixel text-[7px] text-violet-300 tracking-wide">AGENTS</span>
        </div>

        {/* Agent card list */}
        <div className="flex-1 overflow-y-auto py-2 flex flex-col gap-2 px-2">
          {agentProfiles.map((profile) => (
            <AgentCard key={profile.id} agentId={profile.id} />
          ))}
        </div>
      </aside>

      {/* Center: Office Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <OfficeCanvas />

        {/* Mobile: Activity Log toggle button (bottom center) */}
        <button
          onClick={() => setMobileLogOpen((o) => !o)}
          className="lg:hidden absolute bottom-4 right-4 z-20 bg-slate-800 border-2 border-slate-600 hover:border-violet-500 font-pixel text-[7px] text-violet-300 px-3 py-2 shadow-[3px_3px_0px_#0f172a] transition-colors"
          aria-label="Toggle activity log"
        >
          {mobileLogOpen ? 'HIDE LOG' : 'SHOW LOG'}
        </button>
      </div>

      {/* Right Sidebar: Activity Log — hidden on mobile by default */}
      <aside className="hidden lg:flex flex-col w-72 shrink-0 bg-slate-900 border-l-2 border-slate-700 overflow-hidden">
        <ActivityLog className="flex-1 overflow-hidden" />
      </aside>

      {/* Mobile: Activity Log bottom sheet */}
      {mobileLogOpen && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-30 h-2/3 bg-slate-900 border-t-2 border-slate-700 flex flex-col overflow-hidden shadow-[0_-4px_16px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-800 border-b-2 border-slate-700 shrink-0">
            <span className="font-pixel text-[7px] text-violet-300 tracking-wide">ACTIVITY LOG</span>
            <button
              onClick={() => setMobileLogOpen(false)}
              className="font-pixel text-[8px] text-slate-400 hover:text-white w-6 h-6 flex items-center justify-center border border-slate-600 hover:border-slate-400 transition-colors"
              aria-label="Close activity log"
            >
              ✕
            </button>
          </div>
          <ActivityLog className="flex-1 overflow-hidden" />
        </div>
      )}
    </main>
  );
}
