export type TileType =
  | 'floor'
  | 'wall'
  | 'furniture'
  | 'door'
  | 'window'
  | 'carpet'
  | 'void';

export type RoomType =
  | 'workspace'
  | 'meeting_room'
  | 'kitchen'
  | 'server_room'
  | 'hallway';

export interface Tile {
  x: number;
  y: number;
  type: TileType;
  walkable: boolean;
  roomId?: string;
  furnitureId?: string;
  color?: string;
}

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  color: string;
}

export interface FurnitureItem {
  id: string;
  catalogId: string;
  name: string;
  x: number; // tile x
  y: number; // tile y
  width: number; // in tiles
  height: number; // in tiles
  color: string;
  roomId?: string;
  walkable: boolean;
}

export type OfficeTheme = 'modern' | 'retro' | 'dark' | 'neon';

export interface OfficeThemeConfig {
  id: OfficeTheme;
  name: string;
  floorColor: string;
  wallColor: string;
  carpetColor: string;
  furnitureColor: string;
  accentColor: string;
  bgColor: string;
}

export interface MapLayout {
  width: number;
  height: number;
  tiles: number[][]; // 2D grid, values map to TileType index
  rooms: Room[];
}
