export interface FurnitureDef {
  id: string;
  name: string;
  category: 'desk' | 'seating' | 'storage' | 'decoration' | 'appliance' | 'tech';
  tileWidth: number;
  tileHeight: number;
  color: string;
  walkable: boolean;
  description: string;
}

export const furnitureCatalog: FurnitureDef[] = [
  // Desks
  {
    id: 'desk_single',
    name: 'Desk',
    category: 'desk',
    tileWidth: 2,
    tileHeight: 1,
    color: '#92400e',
    walkable: false,
    description: 'Standard single desk',
  },
  {
    id: 'desk_large',
    name: 'Large Desk',
    category: 'desk',
    tileWidth: 3,
    tileHeight: 1,
    color: '#78350f',
    walkable: false,
    description: 'Wide standing desk',
  },
  {
    id: 'desk_corner',
    name: 'Corner Desk',
    category: 'desk',
    tileWidth: 2,
    tileHeight: 2,
    color: '#92400e',
    walkable: false,
    description: 'L-shaped corner desk',
  },
  // Seating
  {
    id: 'chair_office',
    name: 'Office Chair',
    category: 'seating',
    tileWidth: 1,
    tileHeight: 1,
    color: '#374151',
    walkable: false,
    description: 'Ergonomic office chair',
  },
  {
    id: 'chair_meeting',
    name: 'Meeting Chair',
    category: 'seating',
    tileWidth: 1,
    tileHeight: 1,
    color: '#1e40af',
    walkable: false,
    description: 'Conference room chair',
  },
  {
    id: 'sofa',
    name: 'Sofa',
    category: 'seating',
    tileWidth: 3,
    tileHeight: 1,
    color: '#4b5563',
    walkable: false,
    description: 'Break area sofa',
  },
  // Whiteboards & Display
  {
    id: 'whiteboard',
    name: 'Whiteboard',
    category: 'tech',
    tileWidth: 2,
    tileHeight: 1,
    color: '#f1f5f9',
    walkable: false,
    description: 'Wall-mounted whiteboard',
  },
  {
    id: 'monitor',
    name: 'Monitor',
    category: 'tech',
    tileWidth: 1,
    tileHeight: 1,
    color: '#111827',
    walkable: false,
    description: 'Computer monitor',
  },
  {
    id: 'server_rack',
    name: 'Server Rack',
    category: 'tech',
    tileWidth: 1,
    tileHeight: 2,
    color: '#1f2937',
    walkable: false,
    description: 'Server equipment rack',
  },
  // Storage
  {
    id: 'bookshelf',
    name: 'Bookshelf',
    category: 'storage',
    tileWidth: 2,
    tileHeight: 1,
    color: '#7c3aed',
    walkable: false,
    description: 'Bookshelf for documents',
  },
  {
    id: 'cabinet',
    name: 'Filing Cabinet',
    category: 'storage',
    tileWidth: 1,
    tileHeight: 1,
    color: '#6b7280',
    walkable: false,
    description: 'Filing cabinet',
  },
  // Appliances
  {
    id: 'coffee_machine',
    name: 'Coffee Machine',
    category: 'appliance',
    tileWidth: 1,
    tileHeight: 1,
    color: '#7f1d1d',
    walkable: false,
    description: 'Espresso coffee machine',
  },
  {
    id: 'vending_machine',
    name: 'Vending Machine',
    category: 'appliance',
    tileWidth: 1,
    tileHeight: 2,
    color: '#064e3b',
    walkable: false,
    description: 'Snack vending machine',
  },
  {
    id: 'microwave',
    name: 'Microwave',
    category: 'appliance',
    tileWidth: 1,
    tileHeight: 1,
    color: '#374151',
    walkable: false,
    description: 'Kitchen microwave',
  },
  // Decorations
  {
    id: 'plant_small',
    name: 'Small Plant',
    category: 'decoration',
    tileWidth: 1,
    tileHeight: 1,
    color: '#15803d',
    walkable: false,
    description: 'Small potted plant',
  },
  {
    id: 'plant_large',
    name: 'Large Plant',
    category: 'decoration',
    tileWidth: 1,
    tileHeight: 1,
    color: '#166534',
    walkable: false,
    description: 'Large tropical plant',
  },
  {
    id: 'table_meeting',
    name: 'Meeting Table',
    category: 'desk',
    tileWidth: 4,
    tileHeight: 2,
    color: '#92400e',
    walkable: false,
    description: 'Large conference table',
  },
  {
    id: 'table_small',
    name: 'Small Table',
    category: 'desk',
    tileWidth: 2,
    tileHeight: 2,
    color: '#78350f',
    walkable: false,
    description: 'Break room table',
  },
];

export function getFurnitureById(id: string): FurnitureDef | undefined {
  return furnitureCatalog.find((f) => f.id === id);
}

export function getFurnitureByCategory(category: FurnitureDef['category']): FurnitureDef[] {
  return furnitureCatalog.filter((f) => f.category === category);
}
