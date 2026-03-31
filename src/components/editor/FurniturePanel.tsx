'use client';

import { useState } from 'react';
import { useOfficeStore } from '@/store/useOfficeStore';
import { useEditorStore } from '@/store/useEditorStore';
import { getFurnitureByCategory } from '@/data/furnitureCatalog';
import type { FurnitureDef } from '@/data/furnitureCatalog';
import Panel from '@/components/ui/Panel';

type Category = FurnitureDef['category'];

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'desk', label: 'Desk' },
  { id: 'seating', label: 'Seating' },
  { id: 'storage', label: 'Storage' },
  { id: 'tech', label: 'Tech' },
  { id: 'appliance', label: 'Appliance' },
  { id: 'decoration', label: 'Deco' },
];

export default function FurniturePanel() {
  const isEditorMode = useOfficeStore((state) => state.isEditorMode);
  const selectedCatalogId = useEditorStore((state) => state.selectedCatalogId);
  const selectCatalogItem = useEditorStore((state) => state.selectCatalogItem);

  const [activeCategory, setActiveCategory] = useState<Category>('desk');

  if (!isEditorMode) return null;

  const items = getFurnitureByCategory(activeCategory);

  return (
    <Panel title="FURNITURE" className="flex flex-col h-full">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-px p-1 bg-slate-900 border-b-2 border-slate-700 shrink-0">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={[
              'font-pixel text-[7px] px-2 py-1 transition-colors',
              activeCategory === cat.id
                ? 'bg-violet-700 text-white border border-violet-500'
                : 'bg-slate-700 text-slate-400 border border-slate-600 hover:text-slate-200 hover:border-slate-500',
            ].join(' ')}
          >
            {cat.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Furniture grid */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-2 gap-1">
          {items.map((item) => {
            const isSelected = selectedCatalogId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => selectCatalogItem(isSelected ? null : item.id)}
                title={item.description}
                className={[
                  'flex flex-col items-center gap-1 p-2 border-2 transition-colors',
                  isSelected
                    ? 'border-violet-400 bg-violet-900/40'
                    : 'border-slate-600 bg-slate-700 hover:border-slate-400 hover:bg-slate-600',
                ].join(' ')}
              >
                {/* Color preview square */}
                <div
                  className="w-8 h-8 shrink-0 border border-slate-500"
                  style={{ backgroundColor: item.color }}
                />
                {/* Name */}
                <span className="font-pixel text-[7px] text-slate-200 text-center leading-tight">
                  {item.name}
                </span>
                {/* Size */}
                <span className="font-pixel text-[6px] text-slate-500">
                  {item.tileWidth}×{item.tileHeight}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Instruction footer */}
      <div className="shrink-0 px-2 py-2 bg-slate-900 border-t-2 border-slate-700">
        {selectedCatalogId ? (
          <p className="font-pixel text-[6px] text-violet-300 leading-relaxed text-center">
            CLICK CANVAS TO PLACE • ESC TO CANCEL
          </p>
        ) : (
          <p className="font-pixel text-[6px] text-slate-500 leading-relaxed text-center">
            SELECT AN ITEM TO PLACE
          </p>
        )}
      </div>
    </Panel>
  );
}
