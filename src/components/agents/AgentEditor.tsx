'use client';

import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { useAgentStore } from '@/store/useAgentStore';
import { agentProfiles } from '@/data/agentProfiles';
import { accessoryCatalog } from '@/data/accessoryCatalog';
import type { AgentId, AgentAppearance } from '@/types/agent';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import AgentSprite from './AgentSprite';

interface AgentEditorProps {
  agentId: AgentId;
  isOpen: boolean;
  onClose: () => void;
}

const HAIR_COLORS = [
  '#7c3aed', '#1e40af', '#065f46', '#92400e', '#111827',
  '#dc2626', '#db2777', '#0369a1', '#d97706', '#f8fafc',
];

const OUTFIT_COLORS = [
  '#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f87171',
  '#f472b6', '#38bdf8', '#4ade80', '#fb923c', '#e2e8f0',
];

function ColorSwatch({
  color,
  selected,
  onClick,
}: {
  color: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-6 h-6 border-2 transition-all',
        selected ? 'border-white scale-110' : 'border-slate-600 hover:border-slate-400'
      )}
      style={{ backgroundColor: color }}
      title={color}
      aria-label={`Color ${color}${selected ? ' (selected)' : ''}`}
    />
  );
}

export default function AgentEditor({ agentId, isOpen, onClose }: AgentEditorProps) {
  const agent = useAgentStore((state) => state.agents[agentId]);
  const updateAppearance = useAgentStore((state) => state.updateAppearance);

  // Local edited appearance (reset when modal opens)
  const [edited, setEdited] = useState<AgentAppearance>(() => ({
    hairColor: '#111827',
    outfitColor: '#a78bfa',
    skinColor: '#fde68a',
    accessories: [],
  }));

  useEffect(() => {
    if (isOpen && agent) {
      setEdited({ ...agent.appearance });
    }
  }, [isOpen, agent]);

  if (!agent) return null;

  const defaultProfile = agentProfiles.find((p) => p.id === agentId);

  const handleSave = () => {
    updateAppearance(agentId, edited);
    onClose();
  };

  const handleReset = () => {
    if (defaultProfile) {
      setEdited({ ...defaultProfile.appearance });
    }
  };

  const toggleAccessory = (accessoryId: string) => {
    setEdited((prev) => {
      const alreadyOn = prev.accessories.includes(accessoryId);
      return {
        ...prev,
        accessories: alreadyOn
          ? prev.accessories.filter((a) => a !== accessoryId)
          : [...prev.accessories, accessoryId],
      };
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit ${agent.name}`} size="lg">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Left: sprite preview */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div className="bg-slate-700 border-2 border-slate-600 p-3 flex items-center justify-center">
            <AgentSprite
              appearance={edited}
              primaryColor={agent.primaryColor}
              direction="down"
              size={96}
              animated={true}
            />
          </div>
          <div className="font-pixel text-[6px] text-slate-400 text-center">{agent.name}</div>
          <div className="font-pixel text-[6px] text-slate-500 text-center">{agent.role}</div>
        </div>

        {/* Right: controls */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Hair color */}
          <div>
            <div className="font-pixel text-[7px] text-slate-300 mb-2">HAIR COLOR</div>
            <div className="flex flex-wrap gap-1.5">
              {HAIR_COLORS.map((color) => (
                <ColorSwatch
                  key={color}
                  color={color}
                  selected={edited.hairColor === color}
                  onClick={() => setEdited((p) => ({ ...p, hairColor: color }))}
                />
              ))}
            </div>
          </div>

          {/* Outfit color */}
          <div>
            <div className="font-pixel text-[7px] text-slate-300 mb-2">OUTFIT COLOR</div>
            <div className="flex flex-wrap gap-1.5">
              {OUTFIT_COLORS.map((color) => (
                <ColorSwatch
                  key={color}
                  color={color}
                  selected={edited.outfitColor === color}
                  onClick={() => setEdited((p) => ({ ...p, outfitColor: color }))}
                />
              ))}
            </div>
          </div>

          {/* Accessories */}
          <div>
            <div className="font-pixel text-[7px] text-slate-300 mb-2">ACCESSORIES</div>
            <div className="grid grid-cols-2 gap-1.5">
              {accessoryCatalog.map((acc) => {
                const active = edited.accessories.includes(acc.id);
                return (
                  <button
                    key={acc.id}
                    onClick={() => toggleAccessory(acc.id)}
                    className={clsx(
                      'flex items-center gap-1.5 px-2 py-1.5 border text-left transition-colors',
                      active
                        ? 'bg-violet-900 border-violet-500 text-violet-200'
                        : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white'
                    )}
                  >
                    {/* Color dot for the accessory */}
                    {acc.color && (
                      <span
                        className="inline-block w-2 h-2 shrink-0 border border-slate-500"
                        style={{ backgroundColor: acc.color }}
                      />
                    )}
                    <span className="font-pixel text-[6px] truncate">{acc.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-slate-700">
            <Button variant="primary" size="sm" onClick={handleSave}>
              SAVE
            </Button>
            <Button variant="secondary" size="sm" onClick={handleReset}>
              RESET
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="ml-auto">
              CANCEL
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
