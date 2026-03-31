import { create } from 'zustand';
import type { Agent, AgentAppearance, AgentDirection, AgentId, AgentPosition, AgentState } from '@/types/agent';
import { agentProfiles } from '@/data/agentProfiles';

interface AgentStore {
  agents: Record<AgentId, Agent>;

  setAgentPosition: (id: AgentId, position: AgentPosition) => void;
  setAgentState: (id: AgentId, state: AgentState) => void;
  setAgentPath: (id: AgentId, path: AgentPosition[]) => void;
  setAgentDirection: (id: AgentId, direction: AgentDirection) => void;
  setSpeechBubble: (id: AgentId, text: string, duration: number) => void;
  clearSpeechBubble: (id: AgentId) => void;
  updateAppearance: (id: AgentId, appearance: Partial<AgentAppearance>) => void;
}

// Build initial record from agentProfiles array
const initialAgents = agentProfiles.reduce<Record<AgentId, Agent>>(
  (acc, agent) => {
    acc[agent.id] = agent;
    return acc;
  },
  {} as Record<AgentId, Agent>
);

export const useAgentStore = create<AgentStore>((set) => ({
  agents: initialAgents,

  setAgentPosition: (id, position) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [id]: { ...state.agents[id], position },
      },
    })),

  setAgentState: (id, agentState) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [id]: { ...state.agents[id], state: agentState },
      },
    })),

  setAgentPath: (id, path) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [id]: { ...state.agents[id], currentPath: path },
      },
    })),

  setAgentDirection: (id, direction) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [id]: { ...state.agents[id], direction },
      },
    })),

  setSpeechBubble: (id, text, duration) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [id]: {
          ...state.agents[id],
          speechBubble: {
            text,
            expiresAt: Date.now() + duration,
          },
        },
      },
    })),

  clearSpeechBubble: (id) =>
    set((state) => {
      const agent = { ...state.agents[id] };
      delete agent.speechBubble;
      return { agents: { ...state.agents, [id]: agent } };
    }),

  updateAppearance: (id, appearance) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [id]: {
          ...state.agents[id],
          appearance: { ...state.agents[id].appearance, ...appearance },
        },
      },
    })),
}));
