import { create } from 'zustand';
import type { EditorHistoryEntry } from '@/types/editor';

interface EditorStore {
  selectedCatalogId: string | null;
  selectedFurnitureId: string | null;
  editorHistory: EditorHistoryEntry[];
  historyIndex: number;

  selectCatalogItem: (catalogId: string | null) => void;
  selectFurniture: (id: string | null) => void;
  pushHistory: (entry: EditorHistoryEntry) => void;
  undo: () => void;
  redo: () => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  selectedCatalogId: null,
  selectedFurnitureId: null,
  editorHistory: [],
  historyIndex: -1,

  selectCatalogItem: (catalogId) =>
    set({ selectedCatalogId: catalogId, selectedFurnitureId: null }),

  selectFurniture: (id) =>
    set({ selectedFurnitureId: id, selectedCatalogId: null }),

  pushHistory: (entry) =>
    set((state) => {
      // Truncate any redo history past current index
      const history = state.editorHistory.slice(0, state.historyIndex + 1);
      const newHistory = [...history, entry];
      return {
        editorHistory: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }),

  undo: () => {
    const { historyIndex } = get();
    if (historyIndex < 0) return;
    set((state) => ({ historyIndex: state.historyIndex - 1 }));
  },

  redo: () => {
    const { historyIndex, editorHistory } = get();
    if (historyIndex >= editorHistory.length - 1) return;
    set((state) => ({ historyIndex: state.historyIndex + 1 }));
  },
}));
