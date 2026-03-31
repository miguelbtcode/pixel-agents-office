import type { MapLayout } from '@/types/office';

// Tile type indices
// 0 = void, 1 = floor, 2 = wall, 3 = carpet, 4 = door, 5 = window

// 40x30 office map layout
// Rooms:
//   Workspace:    x:1-38, y:1-13  (main open area)
//   Meeting Room: x:1-12, y:15-28
//   Kitchen:      x:14-24, y:15-28
//   Server Room:  x:26-38, y:15-28

const W = 2; // wall
const F = 1; // floor
const C = 3; // carpet
const D = 4; // door
const V = 0; // void
const _ = 1; // floor alias

// prettier-ignore
const rawTiles: number[][] = [
  // Row 0 - top border wall
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
  // Row 1-13 - main workspace
  [W,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,W],
  [W,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,W],
  [W,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,W],
  [W,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,W],
  [W,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,W],
  [W,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,W],
  [W,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,W],
  [W,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,W],
  [W,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,W],
  [W,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,W],
  [W,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,W],
  [W,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,W],
  [W,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,W],
  // Row 14 - horizontal divider wall with doors
  [W,W,W,W,W,W,D,W,W,W,W,W,W,W,D,W,W,W,W,W,W,W,W,W,D,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
  // Row 15-28 - lower rooms
  [W,C,C,C,C,C,C,C,C,C,C,C,W,W,F,F,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W],
  [W,C,C,C,C,C,C,C,C,C,C,C,W,W,F,F,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W],
  [W,C,C,C,C,C,C,C,C,C,C,C,W,W,F,F,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W],
  [W,C,C,C,C,C,C,C,C,C,C,C,W,W,F,F,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W],
  [W,C,C,C,C,C,C,C,C,C,C,C,W,W,F,F,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W],
  [W,C,C,C,C,C,C,C,C,C,C,C,W,W,F,F,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W],
  [W,C,C,C,C,C,C,C,C,C,C,C,W,W,F,F,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W],
  [W,C,C,C,C,C,C,C,C,C,C,C,W,W,F,F,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W],
  [W,C,C,C,C,C,C,C,C,C,C,C,W,W,F,F,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W],
  [W,C,C,C,C,C,C,C,C,C,C,C,W,W,F,F,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W],
  [W,C,C,C,C,C,C,C,C,C,C,C,W,W,F,F,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W],
  [W,C,C,C,C,C,C,C,C,C,C,C,W,W,F,F,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W],
  [W,C,C,C,C,C,C,C,C,C,C,C,W,W,F,F,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W],
  [W,C,C,C,C,C,C,C,C,C,C,C,W,W,F,F,F,F,F,F,F,F,F,F,W,F,F,F,F,F,F,F,F,F,F,F,F,F,F,W],
  // Row 29 - bottom border wall
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
];

export const mapLayout: MapLayout = {
  width: 40,
  height: 30,
  tiles: rawTiles,
  rooms: [
    {
      id: 'workspace',
      name: 'Open Workspace',
      type: 'workspace',
      bounds: { x: 1, y: 1, width: 38, height: 13 },
      color: '#1e293b',
    },
    {
      id: 'meeting_room',
      name: 'Meeting Room',
      type: 'meeting_room',
      bounds: { x: 1, y: 15, width: 11, height: 14 },
      color: '#1a2744',
    },
    {
      id: 'kitchen',
      name: 'Kitchen / Break Area',
      type: 'kitchen',
      bounds: { x: 14, y: 15, width: 10, height: 14 },
      color: '#1a2e1a',
    },
    {
      id: 'server_room',
      name: 'Server Room',
      type: 'server_room',
      bounds: { x: 26, y: 15, width: 13, height: 14 },
      color: '#2a1a1a',
    },
  ],
};
