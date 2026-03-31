import type { AgentPosition } from '@/types/agent';
import { TileMap } from './TileMap';

interface PathNode {
  x: number;
  y: number;
  g: number; // cost from start
  h: number; // heuristic to end
  f: number; // g + h
  parent?: PathNode;
}

class Pathfinder {
  private tileMap: TileMap;

  constructor(tileMap: TileMap) {
    this.tileMap = tileMap;
  }

  findPath(
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ): AgentPosition[] {
    // Guard: same tile
    if (startX === endX && startY === endY) return [];

    // Guard: destination not walkable
    if (!this.tileMap.isWalkable(endX, endY)) return [];

    const openSet: PathNode[] = [];
    // closed set stored as "x,y" string keys
    const closedSet = new Set<string>();

    const startNode: PathNode = {
      x: startX,
      y: startY,
      g: 0,
      h: this.heuristic(startX, startY, endX, endY),
      f: 0,
    };
    startNode.f = startNode.g + startNode.h;
    openSet.push(startNode);

    while (openSet.length > 0) {
      // Pick node with lowest f
      let lowestIdx = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[lowestIdx].f) lowestIdx = i;
      }
      const current = openSet[lowestIdx];

      // Reached goal
      if (current.x === endX && current.y === endY) {
        return this.reconstructPath(current);
      }

      // Move current from open to closed
      openSet.splice(lowestIdx, 1);
      closedSet.add(`${current.x},${current.y}`);

      const neighbors = this.getNeighbors(current, endX, endY);
      for (const neighbor of neighbors) {
        const key = `${neighbor.x},${neighbor.y}`;
        if (closedSet.has(key)) continue;

        const existingIdx = openSet.findIndex(
          (n) => n.x === neighbor.x && n.y === neighbor.y
        );

        if (existingIdx === -1) {
          openSet.push(neighbor);
        } else if (neighbor.g < openSet[existingIdx].g) {
          // Found a better path to this node
          openSet[existingIdx] = neighbor;
        }
      }
    }

    // No path found
    return [];
  }

  private heuristic(ax: number, ay: number, bx: number, by: number): number {
    // Manhattan distance (4-directional movement)
    return Math.abs(ax - bx) + Math.abs(ay - by);
  }

  private getNeighbors(node: PathNode, endX: number, endY: number): PathNode[] {
    // 4-directional: up, down, left, right
    const directions = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
    ];

    const neighbors: PathNode[] = [];

    for (const { dx, dy } of directions) {
      const nx = node.x + dx;
      const ny = node.y + dy;

      if (!this.tileMap.isWalkable(nx, ny)) continue;

      const g = node.g + 1;
      const h = this.heuristic(nx, ny, endX, endY);
      neighbors.push({
        x: nx,
        y: ny,
        g,
        h,
        f: g + h,
        parent: node,
      });
    }

    return neighbors;
  }

  private reconstructPath(node: PathNode): AgentPosition[] {
    const path: AgentPosition[] = [];
    let current: PathNode | undefined = node;

    while (current) {
      path.unshift({
        x: current.x,
        y: current.y,
        px: current.x * 16,
        py: current.y * 16,
      });
      current = current.parent;
    }

    // Remove the start node (agent is already there)
    if (path.length > 0) path.shift();

    return path;
  }
}

export { Pathfinder };
export type { PathNode };
