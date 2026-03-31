export type EditorMode = 'view' | 'place' | 'move' | 'delete' | 'agent';

export interface DragState {
  isDragging: boolean;
  catalogId: string | null;
  furnitureId: string | null; // when moving existing furniture
  offsetX: number;
  offsetY: number;
  currentTileX: number;
  currentTileY: number;
  isValid: boolean;
}

export interface PlacementPreview {
  catalogId: string;
  tileX: number;
  tileY: number;
  isValid: boolean;
}

export interface AccessoryItem {
  id: string;
  name: string;
  type: 'glasses' | 'hat' | 'headphones' | 'tie' | 'badge' | 'scarf';
  color?: string;
}

export interface EditorHistoryEntry {
  type: 'add' | 'remove' | 'move';
  furnitureId: string;
  before?: { x: number; y: number };
  after?: { x: number; y: number };
}
