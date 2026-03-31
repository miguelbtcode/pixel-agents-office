import { describe, it, expect, beforeEach } from 'vitest'
import { Pathfinder } from '@/engine/Pathfinder'
import { TileMap } from '@/engine/TileMap'
import type { MapLayout } from '@/types/office'

// 5x5 test map:
// Row 0: W W W W W  (all walls)
// Row 1: W F F F W
// Row 2: W W W F W  (walls in middle, open on right)
// Row 3: W F F F W
// Row 4: W W W W W  (all walls)
// 1=floor, 2=wall
const W = 2
const F = 1

const testLayout: MapLayout = {
  width: 5,
  height: 5,
  tiles: [
    [W, W, W, W, W],
    [W, F, F, F, W],
    [W, W, W, F, W],
    [W, F, F, F, W],
    [W, W, W, W, W],
  ],
  rooms: [],
}

// Simple open 5x5 map (all floors surrounded by walls)
const openLayout: MapLayout = {
  width: 5,
  height: 5,
  tiles: [
    [W, W, W, W, W],
    [W, F, F, F, W],
    [W, F, F, F, W],
    [W, F, F, F, W],
    [W, W, W, W, W],
  ],
  rooms: [],
}

// Fully blocked map (no walkable tiles)
const blockedLayout: MapLayout = {
  width: 5,
  height: 5,
  tiles: [
    [W, W, W, W, W],
    [W, W, W, W, W],
    [W, W, W, W, W],
    [W, W, W, W, W],
    [W, W, W, W, W],
  ],
  rooms: [],
}

describe('Pathfinder', () => {
  describe('findPath on open map', () => {
    let pathfinder: Pathfinder

    beforeEach(() => {
      pathfinder = new Pathfinder(new TileMap(openLayout))
    })

    it('returns a non-empty path between two walkable tiles', () => {
      const path = pathfinder.findPath(1, 1, 3, 3)
      expect(path.length).toBeGreaterThan(0)
    })

    it('path starts adjacent to start position', () => {
      const path = pathfinder.findPath(1, 1, 3, 3)
      expect(path.length).toBeGreaterThan(0)
      // First step should be adjacent to (1,1)
      const first = path[0]
      const dist = Math.abs(first.x - 1) + Math.abs(first.y - 1)
      expect(dist).toBe(1)
    })

    it('path ends at destination', () => {
      const path = pathfinder.findPath(1, 1, 3, 3)
      expect(path.length).toBeGreaterThan(0)
      const last = path[path.length - 1]
      expect(last.x).toBe(3)
      expect(last.y).toBe(3)
    })

    it('start === end returns empty array', () => {
      const path = pathfinder.findPath(2, 2, 2, 2)
      expect(path).toEqual([])
    })

    it('path length >= manhattan distance (admissible heuristic)', () => {
      const path = pathfinder.findPath(1, 1, 3, 3)
      const manhattan = Math.abs(3 - 1) + Math.abs(3 - 1) // 4
      expect(path.length).toBeGreaterThanOrEqual(manhattan)
    })

    it('all path tiles have px = x * 32 and py = y * 32', () => {
      const path = pathfinder.findPath(1, 1, 3, 3)
      for (const step of path) {
        expect(step.px).toBe(step.x * 32)
        expect(step.py).toBe(step.y * 32)
      }
    })
  })

  describe('findPath with obstacles', () => {
    let pathfinder: Pathfinder

    beforeEach(() => {
      pathfinder = new Pathfinder(new TileMap(testLayout))
    })

    it('finds path around wall blocking direct route', () => {
      // From (1,1) to (1,3): direct vertical route is blocked by wall row at y=2
      // Must go around via x=3
      const path = pathfinder.findPath(1, 1, 1, 3)
      expect(path.length).toBeGreaterThan(0)
      const last = path[path.length - 1]
      expect(last.x).toBe(1)
      expect(last.y).toBe(3)
    })

    it('path only contains walkable tiles', () => {
      const tileMap = new TileMap(testLayout)
      const path = pathfinder.findPath(1, 1, 1, 3)
      for (const step of path) {
        expect(tileMap.isWalkable(step.x, step.y)).toBe(true)
      }
    })

    it('returns empty array when destination is a wall', () => {
      // (0,0) is a wall
      const path = pathfinder.findPath(1, 1, 0, 0)
      expect(path).toEqual([])
    })
  })

  describe('findPath with no possible route', () => {
    it('returns empty array when map is completely blocked', () => {
      const pathfinder = new Pathfinder(new TileMap(blockedLayout))
      const path = pathfinder.findPath(1, 1, 3, 3)
      expect(path).toEqual([])
    })

    it('returns empty array when destination is unreachable (isolated region)', () => {
      // In testLayout, (1,1) and (1,3) are separated by a wall row, but connected via (3,x).
      // Create a layout where they truly cannot connect.
      const isolatedLayout: MapLayout = {
        width: 5,
        height: 5,
        tiles: [
          [W, W, W, W, W],
          [W, F, W, F, W],
          [W, W, W, W, W],
          [W, F, W, F, W],
          [W, W, W, W, W],
        ],
        rooms: [],
      }
      const pathfinder = new Pathfinder(new TileMap(isolatedLayout))
      const path = pathfinder.findPath(1, 1, 3, 3)
      expect(path).toEqual([])
    })
  })

  describe('out of bounds handling', () => {
    it('returns empty array when start is out of bounds', () => {
      const pathfinder = new Pathfinder(new TileMap(openLayout))
      // destination is wall so returns [] - test that OOB start also handled
      const path = pathfinder.findPath(-1, -1, 2, 2)
      expect(path).toEqual([])
    })

    it('returns empty array when destination is out of bounds', () => {
      const pathfinder = new Pathfinder(new TileMap(openLayout))
      const path = pathfinder.findPath(1, 1, 10, 10)
      expect(path).toEqual([])
    })
  })
})
