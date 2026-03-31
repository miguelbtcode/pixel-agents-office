'use client';

import OfficeCanvas from '@/components/office/OfficeCanvas';
import AgentCard from '@/components/agents/AgentCard';
import { agentProfiles } from '@/data/agentProfiles';

export default function Home() {
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
      </div>

      {/* Right Sidebar: Activity Panel — hidden on mobile */}
      <aside className="hidden lg:flex flex-col w-72 shrink-0 bg-slate-900 border-l-2 border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="px-3 py-2 border-b-2 border-slate-700 bg-slate-800 shrink-0">
          <span className="font-pixel text-[7px] text-violet-300 tracking-wide">ACTIVITY</span>
        </div>

        {/* Placeholder content */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          <div className="text-center py-8">
            <p className="font-pixel text-[7px] text-slate-500 leading-relaxed">
              Activity log
            </p>
            <p className="font-pixel text-[6px] text-slate-600 mt-2 leading-relaxed">
              Coming soon
            </p>
          </div>

          {/* Decorative placeholder entries */}
          {[
            { color: '#a78bfa', name: 'Luna', action: 'started sprint planning', time: '09:00' },
            { color: '#34d399', name: 'Max', action: 'pushed UI update', time: '09:12' },
            { color: '#60a5fa', name: 'Ava', action: 'reviewed API spec', time: '09:25' },
          ].map((entry, i) => (
            <div
              key={i}
              className="flex gap-2 p-2 bg-slate-800 border border-slate-700 rounded-none"
            >
              <div
                className="w-2 h-2 rounded-none shrink-0 mt-0.5"
                style={{ backgroundColor: entry.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-pixel text-[6px] text-slate-400 mb-0.5">{entry.time}</div>
                <div className="font-pixel text-[6px] leading-relaxed">
                  <span style={{ color: entry.color }}>{entry.name}</span>{' '}
                  <span className="text-slate-300">{entry.action}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </main>
  );
}
