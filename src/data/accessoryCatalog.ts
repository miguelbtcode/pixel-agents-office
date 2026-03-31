import type { AccessoryItem } from '@/types/editor';

export const accessoryCatalog: AccessoryItem[] = [
  { id: 'glasses', name: 'Glasses', type: 'glasses', color: '#374151' },
  { id: 'glasses_round', name: 'Round Glasses', type: 'glasses', color: '#92400e' },
  { id: 'glasses_neon', name: 'Neon Glasses', type: 'glasses', color: '#10b981' },
  { id: 'hat_cap', name: 'Cap', type: 'hat', color: '#1e40af' },
  { id: 'hat_beanie', name: 'Beanie', type: 'hat', color: '#7c3aed' },
  { id: 'hat_cowboy', name: 'Cowboy Hat', type: 'hat', color: '#78350f' },
  { id: 'headphones', name: 'Headphones', type: 'headphones', color: '#111827' },
  { id: 'headphones_pink', name: 'Pink Headphones', type: 'headphones', color: '#db2777' },
  { id: 'tie', name: 'Tie', type: 'tie', color: '#dc2626' },
  { id: 'tie_blue', name: 'Blue Tie', type: 'tie', color: '#2563eb' },
  { id: 'badge', name: 'ID Badge', type: 'badge', color: '#f59e0b' },
  { id: 'badge_red', name: 'Red Badge', type: 'badge', color: '#dc2626' },
  { id: 'scarf', name: 'Scarf', type: 'scarf', color: '#7c3aed' },
  { id: 'scarf_green', name: 'Green Scarf', type: 'scarf', color: '#16a34a' },
];

export function getAccessoryById(id: string): AccessoryItem | undefined {
  return accessoryCatalog.find((a) => a.id === id);
}
