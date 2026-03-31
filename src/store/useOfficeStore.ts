import { create } from 'zustand';
import type { FurnitureItem, OfficeTheme, Room } from '@/types/office';
import { mapLayout } from '@/data/mapLayout';

interface OfficeStore {
  furniture: FurnitureItem[];
  rooms: Room[];
  activeTheme: OfficeTheme;
  isEditorMode: boolean;

  addFurniture: (item: FurnitureItem) => void;
  removeFurniture: (id: string) => void;
  moveFurniture: (id: string, x: number, y: number) => void;
  setTheme: (theme: OfficeTheme) => void;
  toggleEditorMode: () => void;
}

// Default furniture layout
const defaultFurniture: FurnitureItem[] = [
  // ── Meeting Room (x:1-12, y:15-28) ───────────────────────────
  {
    id: 'furniture-meeting-table',
    catalogId: 'table_meeting',
    name: 'Meeting Table',
    x: 3,
    y: 19,
    width: 6,
    height: 3,
    color: '#6b4226',
    roomId: 'meeting_room',
    walkable: false,
  },
  // 8 chairs around the meeting table
  { id: 'chair-m1', catalogId: 'chair_meeting', name: 'Chair', x: 3,  y: 18, width: 1, height: 1, color: '#4a3728', roomId: 'meeting_room', walkable: false },
  { id: 'chair-m2', catalogId: 'chair_meeting', name: 'Chair', x: 5,  y: 18, width: 1, height: 1, color: '#4a3728', roomId: 'meeting_room', walkable: false },
  { id: 'chair-m3', catalogId: 'chair_meeting', name: 'Chair', x: 7,  y: 18, width: 1, height: 1, color: '#4a3728', roomId: 'meeting_room', walkable: false },
  { id: 'chair-m4', catalogId: 'chair_meeting', name: 'Chair', x: 3,  y: 22, width: 1, height: 1, color: '#4a3728', roomId: 'meeting_room', walkable: false },
  { id: 'chair-m5', catalogId: 'chair_meeting', name: 'Chair', x: 5,  y: 22, width: 1, height: 1, color: '#4a3728', roomId: 'meeting_room', walkable: false },
  { id: 'chair-m6', catalogId: 'chair_meeting', name: 'Chair', x: 7,  y: 22, width: 1, height: 1, color: '#4a3728', roomId: 'meeting_room', walkable: false },
  { id: 'chair-m7', catalogId: 'chair_meeting', name: 'Chair', x: 2,  y: 20, width: 1, height: 1, color: '#4a3728', roomId: 'meeting_room', walkable: false },
  { id: 'chair-m8', catalogId: 'chair_meeting', name: 'Chair', x: 9,  y: 20, width: 1, height: 1, color: '#4a3728', roomId: 'meeting_room', walkable: false },

  // ── Workspace – 5 desks (one per agent) ──────────────────────
  // Luna (Tech Lead)
  { id: 'desk-luna',  catalogId: 'desk_office',  name: "Luna's Desk",  x: 8,  y: 4, width: 2, height: 1, color: '#374151', roomId: 'workspace', walkable: false },
  { id: 'chair-luna', catalogId: 'chair_office', name: "Luna's Chair", x: 8,  y: 5, width: 1, height: 1, color: '#1f2937', roomId: 'workspace', walkable: false },
  // Max (Frontend Dev)
  { id: 'desk-max',   catalogId: 'desk_office',  name: "Max's Desk",   x: 13, y: 4, width: 2, height: 1, color: '#374151', roomId: 'workspace', walkable: false },
  { id: 'chair-max',  catalogId: 'chair_office', name: "Max's Chair",  x: 13, y: 5, width: 1, height: 1, color: '#1f2937', roomId: 'workspace', walkable: false },
  // Ava (Backend Dev)
  { id: 'desk-ava',   catalogId: 'desk_office',  name: "Ava's Desk",   x: 17, y: 4, width: 2, height: 1, color: '#374151', roomId: 'workspace', walkable: false },
  { id: 'chair-ava',  catalogId: 'chair_office', name: "Ava's Chair",  x: 17, y: 5, width: 1, height: 1, color: '#1f2937', roomId: 'workspace', walkable: false },
  // Sam (QA Engineer)
  { id: 'desk-sam',   catalogId: 'desk_office',  name: "Sam's Desk",   x: 21, y: 4, width: 2, height: 1, color: '#374151', roomId: 'workspace', walkable: false },
  { id: 'chair-sam',  catalogId: 'chair_office', name: "Sam's Chair",  x: 21, y: 5, width: 1, height: 1, color: '#1f2937', roomId: 'workspace', walkable: false },
  // Rio (DevOps)
  { id: 'desk-rio',   catalogId: 'desk_office',  name: "Rio's Desk",   x: 25, y: 4, width: 2, height: 1, color: '#374151', roomId: 'workspace', walkable: false },
  { id: 'chair-rio',  catalogId: 'chair_office', name: "Rio's Chair",  x: 25, y: 5, width: 1, height: 1, color: '#1f2937', roomId: 'workspace', walkable: false },

  // ── Kitchen / Break Area (x:14-24, y:15-28) ──────────────────
  { id: 'coffee-machine',  catalogId: 'coffee_machine',  name: 'Coffee Machine', x: 15, y: 16, width: 1, height: 1, color: '#b45309', roomId: 'kitchen', walkable: false },
  { id: 'table-kitchen',   catalogId: 'table_small',     name: 'Kitchen Table',  x: 18, y: 17, width: 2, height: 2, color: '#6b4226', roomId: 'kitchen', walkable: false },
  { id: 'vending-machine', catalogId: 'vending_machine', name: 'Vending Machine',x: 23, y: 16, width: 1, height: 2, color: '#1d4ed8', roomId: 'kitchen', walkable: false },
  { id: 'chair-k1',        catalogId: 'chair_office',    name: 'Kitchen Chair',  x: 18, y: 19, width: 1, height: 1, color: '#4a3728', roomId: 'kitchen', walkable: false },
  { id: 'chair-k2',        catalogId: 'chair_office',    name: 'Kitchen Chair',  x: 19, y: 19, width: 1, height: 1, color: '#4a3728', roomId: 'kitchen', walkable: false },

  // ── Server Room (x:26-38, y:15-28) ───────────────────────────
  { id: 'server-rack-1', catalogId: 'server_rack', name: 'Server Rack', x: 27, y: 16, width: 1, height: 2, color: '#111827', roomId: 'server_room', walkable: false },
  { id: 'server-rack-2', catalogId: 'server_rack', name: 'Server Rack', x: 29, y: 16, width: 1, height: 2, color: '#111827', roomId: 'server_room', walkable: false },
  { id: 'server-rack-3', catalogId: 'server_rack', name: 'Server Rack', x: 31, y: 16, width: 1, height: 2, color: '#111827', roomId: 'server_room', walkable: false },
  { id: 'server-desk',   catalogId: 'desk_office',  name: 'Server Desk', x: 27, y: 22, width: 3, height: 1, color: '#374151', roomId: 'server_room', walkable: false },
];

export const useOfficeStore = create<OfficeStore>((set) => ({
  furniture: defaultFurniture,
  rooms: mapLayout.rooms,
  activeTheme: 'dark',
  isEditorMode: false,

  addFurniture: (item) =>
    set((state) => ({ furniture: [...state.furniture, item] })),

  removeFurniture: (id) =>
    set((state) => ({ furniture: state.furniture.filter((f) => f.id !== id) })),

  moveFurniture: (id, x, y) =>
    set((state) => ({
      furniture: state.furniture.map((f) => (f.id === id ? { ...f, x, y } : f)),
    })),

  setTheme: (theme) => set({ activeTheme: theme }),

  toggleEditorMode: () =>
    set((state) => ({ isEditorMode: !state.isEditorMode })),
}));
