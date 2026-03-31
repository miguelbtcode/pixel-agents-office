import { describe, it, expect, beforeEach } from 'vitest'
import { TileMap } from '@/engine/TileMap'
import type { MapLayout } from '@/types/office'

// Tile values: 0=void, 1=floor, 2=wall, 3=carpet, 4=door, 5=window
const testLayout: MapLayout = {
  width: 6,
  height: 5,
  tiles: [
    [2, 2, 2, 2, 2, 2], // row 0: all walls
    [2, 1, 3, 4, 5, 2], // row 1: wall, floor, carpet, door, window, wall
    [2, 1, 1, 1, 1, 2], // row 2: wall, floors, wall
    [2, 0, 2, 2, 2, 2], // row 3: wall, void, walls
    [2, 2, 2, 2, 2, 2], // row 4: all walls
  ],
  rooms: [
    {
      id: 'room_a',
      name: 'Room A',
      type: 'workspace',
      bounds: { x: 1, y: 1, width: 3, height: 2 },
      color: '#fff',
    },
    {
      id: 'room_b',
      name: 'Room B',
      type: 'kitchen',
      bounds: { x: 1, y: 3, width: 1, height: 1 },
      color: '#000',
    },
  ],
}

describe('TileMap', () => {
  let tileMap: TileMap

  beforeEach(() => {
    tileMap = new TileMap(testLayout)
  })

  describe('getTile', () => {
    it('returns correct tile type for floor', () => {
      expect(tileMap.getTile(1, 1)).toBe(1)
    })

    it('returns correct tile type for wall', () => {
      expect(tileMap.getTile(0, 0)).toBe(2)
    })

    it('returns correct tile type for carpet', () => {
      expect(tileMap.getTile(2, 1)).toBe(3)
    })

    it('returns correct tile type for door', () => {
      expect(tileMap.getTile(3, 1)).toBe(4)
    })

    it('returns correct tile type for window', () => {
      expect(tileMap.getTile(4, 1)).toBe(5)
    })

    it('returns correct tile type for void', () => {
      expect(tileMap.getTile(1, 3)).toBe(0)
    })

    it('returns 0 for out of bounds x', () => {
      expect(tileMap.getTile(100, 1)).toBe(0)
    })

    it('returns 0 for out of bounds y', () => {
      expect(tileMap.getTile(1, 100)).toBe(0)
    })

    it('returns 0 for negative x', () => {
      expect(tileMap.getTile(-1, 1)).toBe(0)
    })

    it('returns 0 for negative y', () => {
      expect(tileMap.getTile(1, -1)).toBe(0)
    })
  })

  describe('isWalkable', () => {
    it('returns true for floor tile', () => {
      expect(tileMap.isWalkable(1, 1)).toBe(true)
    })

    it('returns true for carpet tile', () => {
      expect(tileMap.isWalkable(2, 1)).toBe(true)
    })

    it('returns true for door tile', () => {
      expect(tileMap.isWalkable(3, 1)).toBe(true)
    })

    it('returns false for wall tile', () => {
      expect(tileMap.isWalkable(0, 0)).toBe(false)
    })

    it('returns false for void tile', () => {
      expect(tileMap.isWalkable(1, 3)).toBe(false)
    })

    it('returns false for window tile', () => {
      expect(tileMap.isWalkable(4, 1)).toBe(false)
    })

    it('returns false for out of bounds coordinates', () => {
      expect(tileMap.isWalkable(-1, 0)).toBe(false)
      expect(tileMap.isWalkable(0, -1)).toBe(false)
      expect(tileMap.isWalkable(100, 0)).toBe(false)
      expect(tileMap.isWalkable(0, 100)).toBe(false)
    })

    it('respects setTileWalkable override - set walkable true', () => {
      tileMap.setTileWalkable(0, 0, true)
      expect(tileMap.isWalkable(0, 0)).toBe(true)
    })

    it('respects setTileWalkable override - set walkable false', () => {
      tileMap.setTileWalkable(1, 1, false)
      expect(tileMap.isWalkable(1, 1)).toBe(false)
    })
  })

  describe('getRoomAt', () => {
    it('returns correct room for coordinates inside room_a', () => {
      const room = tileMap.getRoomAt(1, 1)
      expect(room).toBeDefined()
      expect(room!.id).toBe('room_a')
    })

    it('returns correct room for coordinates inside room_b', () => {
      const room = tileMap.getRoomAt(1, 3)
      expect(room).toBeDefined()
      expect(room!.id).toBe('room_b')
    })

    it('returns undefined for coordinates outside all rooms', () => {
      // (0,0) is outside all room bounds
      const room = tileMap.getRoomAt(0, 0)
      expect(room).toBeUndefined()
    })

    it('returns undefined for coordinates at room boundary (exclusive end)', () => {
      // room_a: x:1, y:1, width:3, height:2 => x in [1,3), y in [1,3)
      // x=4 is outside
      const room = tileMap.getRoomAt(4, 1)
      expect(room).toBeUndefined()
    })
  })

  describe('getWalkableGrid', () => {
    it('returns a 2D boolean array with correct dimensions', () => {
      const grid = tileMap.getWalkableGrid()
      expect(grid.length).toBe(testLayout.height)
      expect(grid[0].length).toBe(testLayout.width)
    })

    it('grid values match isWalkable results', () => {
      const grid = tileMap.getWalkableGrid()
      for (let y = 0; y < testLayout.height; y++) {
        for (let x = 0; x < testLayout.width; x++) {
          expect(grid[y][x]).toBe(tileMap.isWalkable(x, y))
        }
      }
    })

    it('wall tiles are false in the grid', () => {
      const grid = tileMap.getWalkableGrid()
      expect(grid[0][0]).toBe(false) // wall
    })

    it('floor tiles are true in the grid', () => {
      const grid = tileMap.getWalkableGrid()
      expect(grid[1][1]).toBe(true) // floor
    })
  })

  describe('getWidth / getHeight', () => {
    it('getWidth returns correct map width', () => {
      expect(tileMap.getWidth()).toBe(testLayout.width)
    })

    it('getHeight returns correct map height', () => {
      expect(tileMap.getHeight()).toBe(testLayout.height)
    })
  })
})
