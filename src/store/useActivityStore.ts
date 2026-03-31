import { create } from 'zustand';
import type { ActivityEntry, ActivityFilter, ActivityType } from '@/types/activity';
import type { AgentId } from '@/types/agent';

interface ActivityStore {
  entries: ActivityEntry[];
  filter: ActivityFilter;

  addEntry: (entry: Omit<ActivityEntry, 'id' | 'timestamp'>) => void;
  clearEntries: () => void;
  setFilter: (filter: Partial<ActivityFilter>) => void;
  getFilteredEntries: () => ActivityEntry[];
}

const defaultFilter: ActivityFilter = {
  agents: [],
  types: [],
  rooms: [],
  searchText: '',
};

let entryCounter = 0;

function generateId(): string {
  return `entry-${Date.now()}-${++entryCounter}`;
}

export const useActivityStore = create<ActivityStore>((set, get) => ({
  entries: [],
  filter: defaultFilter,

  addEntry: (entry) => {
    const newEntry: ActivityEntry = {
      ...entry,
      id: generateId(),
      timestamp: Date.now(),
    };
    set((state) => ({
      // Keep at most 500 entries to avoid unbounded growth
      entries: [newEntry, ...state.entries].slice(0, 500),
    }));
  },

  clearEntries: () => set({ entries: [] }),

  setFilter: (partialFilter) =>
    set((state) => ({
      filter: { ...state.filter, ...partialFilter },
    })),

  getFilteredEntries: () => {
    const { entries, filter } = get();

    return entries.filter((entry) => {
      // Agent filter
      if (filter.agents.length > 0 && !filter.agents.includes(entry.agentId as AgentId)) {
        return false;
      }
      // Type filter
      if (filter.types.length > 0 && !filter.types.includes(entry.type as ActivityType)) {
        return false;
      }
      // Room filter
      if (filter.rooms.length > 0) {
        if (!entry.roomId || !filter.rooms.includes(entry.roomId)) {
          return false;
        }
      }
      // Text search
      if (filter.searchText.trim() !== '') {
        const lower = filter.searchText.toLowerCase();
        if (!entry.description.toLowerCase().includes(lower)) {
          return false;
        }
      }
      return true;
    });
  },
}));
