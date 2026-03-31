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
      <div className="flex flex-wrap gap-px p-1 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className="font-pixel text-[7px] px-2 py-1 transition-colors"
            style={{
              backgroundColor: activeCategory === cat.id ? 'rgba(90,140,255,0.2)' : 'transparent',
              border: `1px solid ${activeCategory === cat.id ? 'var(--color-accent)' : 'var(--color-border)'}`,
              color: activeCategory === cat.id ? 'var(--color-accent)' : 'var(--color-text-muted)',
            }}
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
                className="flex flex-col items-center gap-1 p-2 transition-colors"
                style={{
                  border: `2px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  backgroundColor: isSelected ? 'rgba(90,140,255,0.1)' : 'rgba(255,255,255,0.03)',
                }}
              >
                <div
                  className="w-8 h-8 shrink-0"
                  style={{ backgroundColor: item.color, border: '1px solid var(--color-border)' }}
                />
                <span className="font-pixel text-[7px] text-center leading-tight" style={{ color: 'var(--color-text)' }}>
                  {item.name}
                </span>
                <span className="font-pixel text-[6px]" style={{ color: 'var(--color-text-muted)' }}>
                  {item.tileWidth}×{item.tileHeight}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Instruction footer */}
      <div className="shrink-0 px-2 py-2" style={{ borderTop: '1px solid var(--color-border)' }}>
        {selectedCatalogId ? (
          <p className="font-pixel text-[6px] leading-relaxed text-center" style={{ color: 'var(--color-accent-green)' }}>
            CLICK CANVAS TO PLACE • ESC TO CANCEL
          </p>
        ) : (
          <p className="font-pixel text-[6px] leading-relaxed text-center" style={{ color: 'var(--color-text-muted)' }}>
            SELECT AN ITEM TO PLACE
          </p>
        )}
      </div>
    </Panel>
  );
}
