import type { MapLayout, Room } from '@/types/office';

// Tile numeric values
// 0 = void, 1 = floor, 2 = wall, 3 = carpet, 4 = door, 5 = window

const WALKABLE_TILES = new Set([1, 3, 4]); // floor, carpet, door

class TileMap {
  private tiles: number[][];
  private width: number;
  private height: number;
  private rooms: Room[];
  // Override walkability (for furniture blocking)
  private walkableOverride: Map<string, boolean>;

  constructor(layout: MapLayout) {
    this.width = layout.width;
    this.height = layout.height;
    // Deep-copy the tile grid so mutations don't affect source data
    this.tiles = layout.tiles.map((row) => [...row]);
    this.rooms = layout.rooms;
    this.walkableOverride = new Map();
  }

  getTile(x: number, y: number): number {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return 0;
    return this.tiles[y][x];
  }

  isWalkable(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return false;
    const key = `${x},${y}`;
    if (this.walkableOverride.has(key)) {
      return this.walkableOverride.get(key)!;
    }
    return WALKABLE_TILES.has(this.tiles[y][x]);
  }

  getRoomAt(x: number, y: number): Room | undefined {
    return this.rooms.find(
      (room) =>
        x >= room.bounds.x &&
        x < room.bounds.x + room.bounds.width &&
        y >= room.bounds.y &&
        y < room.bounds.y + room.bounds.height
    );
  }

  setTileWalkable(x: number, y: number, walkable: boolean): void {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    this.walkableOverride.set(`${x},${y}`, walkable);
  }

  getWalkableGrid(): boolean[][] {
    const grid: boolean[][] = [];
    for (let y = 0; y < this.height; y++) {
      const row: boolean[] = [];
      for (let x = 0; x < this.width; x++) {
        row.push(this.isWalkable(x, y));
      }
      grid.push(row);
    }
    return grid;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }
}

export { TileMap };
