'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAgentStore } from '@/store/useAgentStore';
import { useOfficeStore } from '@/store/useOfficeStore';
import { useEditorStore } from '@/store/useEditorStore';
import { GameLoop } from '@/engine/GameLoop';
import { Renderer, TILE_SIZE } from '@/engine/Renderer';
import { TileMap } from '@/engine/TileMap';
import { Pathfinder } from '@/engine/Pathfinder';
import { SpriteSheet, AGENT_ANIMATIONS } from '@/engine/SpriteSheet';
import { mapLayout } from '@/data/mapLayout';
import { Scheduler } from '@/simulation/Scheduler';
import { getFurnitureById } from '@/data/furnitureCatalog';
import MiniMap from '@/components/office/MiniMap';
import AgentEditor from '@/components/agents/AgentEditor';
import type { AgentId } from '@/types/agent';
import type { FurnitureItem } from '@/types/office';

// Movement speed: tiles per second
const TILES_PER_SECOND = 3;
const PIXELS_PER_MS = (TILES_PER_SECOND * TILE_SIZE) / 1000;

// How many pixels of drag before we consider it a drag (not a click)
const DRAG_THRESHOLD = 5;

export default function OfficeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const gameLoopRef = useRef<GameLoop | null>(null);
  const tileMapRef = useRef<TileMap | null>(null);
  const schedulerRef = useRef<Scheduler | null>(null);

  // Loading state: true until engine is initialized
  const [isLoading, setIsLoading] = useState(true);

  // Selected agent for editor modal
  const [selectedAgentId, setSelectedAgentId] = useState<AgentId | null>(null);

  // Camera state mirrored into React for MiniMap re-renders
  const [cameraState, setCameraState] = useState({ cameraX: 0, cameraY: 0, zoom: 1.5 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Per-agent SpriteSheet instances keyed by AgentId
  const spriteSheets = useRef<Record<string, SpriteSheet>>({});

  // Editor state
  const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);

  // Camera drag state
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const cameraAtDragStart = useRef({ x: 0, y: 0 });
  // Track how far we've dragged to distinguish click vs drag
  const dragDistance = useRef(0);

  // Snapshots of store state used inside the game loop callbacks
  // (captured via refs to avoid stale closures)
  const agentsRef = useRef(useAgentStore.getState().agents);
  const furnitureRef = useRef(useOfficeStore.getState().furniture);

  // Keep editor state in refs for use inside the game loop render callback
  const isEditorModeRef = useRef(useOfficeStore.getState().isEditorMode);
  const selectedCatalogIdRef = useRef(useEditorStore.getState().selectedCatalogId);
  const hoveredTileRef = useRef<{ x: number; y: number } | null>(null);

  // Sync agents to React state for MiniMap (throttled via rAF tick)
  const agentsForMiniMap = useAgentStore((state) => state.agents);
  const rooms = useOfficeStore((state) => state.rooms);

  // Subscribe to editor store for selectedCatalogId ref updates
  useEffect(() => {
    const unsubEditor = useEditorStore.subscribe((state) => {
      selectedCatalogIdRef.current = state.selectedCatalogId;
    });
    const unsubOfficeEditor = useOfficeStore.subscribe((state) => {
      isEditorModeRef.current = state.isEditorMode;
    });
    return () => {
      unsubEditor();
      unsubOfficeEditor();
    };
  }, []);

  // Sync hoveredTile React state to ref for use in game loop
  useEffect(() => {
    hoveredTileRef.current = hoveredTile;
  }, [hoveredTile]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cleanup: (() => void) | undefined;

    try {
    // ── Initialize core engine objects ──────────────────────────
    const tileMap = new TileMap(mapLayout);
    tileMapRef.current = tileMap;

    const pathfinder = new Pathfinder(tileMap);

    const renderer = new Renderer(canvas, tileMap);
    rendererRef.current = renderer;

    // Center camera on workspace initially
    renderer.cameraX = 4 * TILE_SIZE;
    renderer.cameraY = 2 * TILE_SIZE;
    renderer.zoom = 1.5;

    // Build a SpriteSheet per agent
    const agentIds: AgentId[] = ['luna', 'max', 'ava', 'sam', 'rio'];
    for (const id of agentIds) {
      spriteSheets.current[id] = new SpriteSheet(AGENT_ANIMATIONS);
    }

    const gameLoop = new GameLoop();
    gameLoopRef.current = gameLoop;

    // ── Create and start the Scheduler ──────────────────────────
    const scheduler = new Scheduler(tileMap, pathfinder);
    schedulerRef.current = scheduler;
    scheduler.start();

    // ── Subscribe to store changes and keep refs current ────────
    const unsubAgents = useAgentStore.subscribe((state) => {
      agentsRef.current = state.agents;
    });
    const unsubFurniture = useOfficeStore.subscribe((state) => {
      furnitureRef.current = state.furniture;
    });

    // ── Pause scheduler when editor mode is active ───────────────
    const unsubEditor = useOfficeStore.subscribe((state) => {
      if (schedulerRef.current) {
        if (state.isEditorMode) {
          schedulerRef.current.pause();
        } else {
          schedulerRef.current.resume();
        }
      }
    });

    // ── Update function ──────────────────────────────────────────
    gameLoop.setUpdate((dt: number) => {
      // Advance simulation
      schedulerRef.current?.update(dt);

      const setAgentPosition = useAgentStore.getState().setAgentPosition;
      const setAgentState = useAgentStore.getState().setAgentState;
      const setAgentDirection = useAgentStore.getState().setAgentDirection;
      const setAgentPath = useAgentStore.getState().setAgentPath;
      const clearSpeechBubble = useAgentStore.getState().clearSpeechBubble;

      const agents = agentsRef.current;

      for (const id of agentIds) {
        const agent = agents[id];
        if (!agent) continue;

        const sheet = spriteSheets.current[id];

        // ── Path following ──────────────────────────────────────
        if (agent.currentPath.length > 0) {
          const target = agent.currentPath[0];
          const targetPx = target.x * TILE_SIZE;
          const targetPy = target.y * TILE_SIZE;

          let { px, py } = agent.position;
          const dx = targetPx - px;
          const dy = targetPy - py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const step = PIXELS_PER_MS * dt;

          // Determine direction
          if (Math.abs(dx) > Math.abs(dy)) {
            const dir = dx > 0 ? 'right' : 'left';
            if (agent.direction !== dir) {
              setAgentDirection(id, dir);
            }
            sheet.setAnimation(`walk_${dir}`);
          } else {
            const dir = dy > 0 ? 'down' : 'up';
            if (agent.direction !== dir) {
              setAgentDirection(id, dir);
            }
            sheet.setAnimation(`walk_${dir}`);
          }

          if (dist <= step) {
            // Snap to target tile
            px = targetPx;
            py = targetPy;

            const newPath = agent.currentPath.slice(1);
            setAgentPosition(id, { x: target.x, y: target.y, px, py });
            setAgentPath(id, newPath);

            if (newPath.length === 0) {
              setAgentState(id, 'idle');
              sheet.setAnimation(`idle_${agent.direction}`);
            }
          } else {
            // Move toward target
            const ratio = step / dist;
            px += dx * ratio;
            py += dy * ratio;
            setAgentPosition(id, { x: agent.position.x, y: agent.position.y, px, py });

            if (agent.state !== 'walking') {
              setAgentState(id, 'walking');
            }
          }
        } else {
          // Idle animation
          if (agent.state !== 'walking') {
            sheet.setAnimation(`idle_${agent.direction}`);
          }
        }

        sheet.update(dt);

        // ── Speech bubble expiry ────────────────────────────────
        if (agent.speechBubble && Date.now() > agent.speechBubble.expiresAt) {
          clearSpeechBubble(id);
        }
      }
    });

    // ── Render function ──────────────────────────────────────────
    let frameCount = 0;
    gameLoop.setRender(() => {
      const r = rendererRef.current;
      if (!r) return;

      // Update renderer time for animations
      r.setTime(performance.now() / 1000);

      const agents = agentsRef.current;
      const furniture = furnitureRef.current;

      r.clear();
      r.drawMap(furniture);

      // ── Editor placement preview ──────────────────────────────
      const editorMode = isEditorModeRef.current;
      const catalogId = selectedCatalogIdRef.current;
      const hovered = hoveredTileRef.current;

      if (editorMode && catalogId && hovered) {
        const def = getFurnitureById(catalogId);
        if (def) {
          // Check if placement is valid (no wall tiles under footprint)
          const tMap = tileMapRef.current;
          let isValid = true;
          if (tMap) {
            for (let dy = 0; dy < def.tileHeight; dy++) {
              for (let dx = 0; dx < def.tileWidth; dx++) {
                const tileVal = tMap.getTile(hovered.x + dx, hovered.y + dy);
                // Tile value 2 = wall, 0 = void
                if (tileVal === 2 || tileVal === 0) {
                  isValid = false;
                  break;
                }
              }
              if (!isValid) break;
            }
          }

          r.drawPlacementPreview(
            hovered.x,
            hovered.y,
            def.tileWidth,
            def.tileHeight,
            def.color,
            isValid
          );
        }
      }

      // Sort agents by pixel y so southern agents render on top
      const sortedIds = [...agentIds].sort((a, b) => {
        const ay = agents[a]?.position.py ?? 0;
        const by2 = agents[b]?.position.py ?? 0;
        return ay - by2;
      });

      for (const id of sortedIds) {
        const agent = agents[id];
        if (!agent) continue;
        const frameIndex = spriteSheets.current[id].getCurrentFrame();
        r.drawAgent(agent, frameIndex);
      }

      // Draw speech bubbles after all agents (render on top)
      for (const id of sortedIds) {
        const agent = agents[id];
        if (!agent) continue;
        if (agent.speechBubble && Date.now() <= agent.speechBubble.expiresAt) {
          r.drawSpeechBubble(agent, agent.speechBubble.text);
        }
      }

      // Name tags last
      for (const id of sortedIds) {
        const agent = agents[id];
        if (!agent) continue;
        r.drawAgentNameTag(agent);
      }

      // Sync camera state to React every ~10 frames (for MiniMap)
      frameCount++;
      if (frameCount % 10 === 0) {
        setCameraState({ cameraX: r.cameraX, cameraY: r.cameraY, zoom: r.zoom });
      }
    });

    // ── Handle resize ────────────────────────────────────────────
    const handleResize = () => {
      const r = rendererRef.current;
      if (!r || !canvas.parentElement) return;
      const { clientWidth, clientHeight } = canvas.parentElement;
      r.resize(clientWidth, clientHeight);
      setCanvasSize({ width: clientWidth, height: clientHeight });
    };

    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    gameLoop.start();

    // Mark as loaded — canvas is ready
    setIsLoading(false);

    cleanup = () => {
      gameLoop.stop();
      scheduler.stop();
      schedulerRef.current = null;
      resizeObserver.disconnect();
      unsubAgents();
      unsubFurniture();
      unsubEditor();
    };
    } catch (err) {
      console.error('[OfficeCanvas] initialization error:', err);
      // Always dismiss loading screen so user sees something
      setIsLoading(false);
    }

    return () => cleanup?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Keyboard: ESC cancels placement ───────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        useEditorStore.getState().selectCatalogItem(null);
        useEditorStore.getState().selectFurniture(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ── Camera pan with mouse ──────────────────────────────────────

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    dragDistance.current = 0;
    dragStart.current = { x: e.clientX, y: e.clientY };
    const r = rendererRef.current;
    if (r) {
      cameraAtDragStart.current = { x: r.cameraX, y: r.cameraY };
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = rendererRef.current;
    if (!r) return;

    // Always track hovered tile for editor placement preview
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const tile = r.screenToTile(screenX, screenY);
    setHoveredTile(tile);

    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    dragDistance.current = Math.sqrt(dx * dx + dy * dy);
    r.cameraX = cameraAtDragStart.current.x - dx / r.zoom;
    r.cameraY = cameraAtDragStart.current.y - dy / r.zoom;
  }, []);

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const wasDrag = dragDistance.current > DRAG_THRESHOLD;
      isDragging.current = false;
      dragDistance.current = 0;

      if (!wasDrag) {
        // Treat as a click
        const r = rendererRef.current;
        if (!r) return;

        const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        const tile = r.screenToTile(screenX, screenY);

        const isEditorMode = useOfficeStore.getState().isEditorMode;

        if (isEditorMode) {
          const { selectedCatalogId, selectCatalogItem, selectFurniture, pushHistory } =
            useEditorStore.getState();

          if (selectedCatalogId) {
            // Validate placement: no wall (2) or void (0) tiles under footprint
            const def = getFurnitureById(selectedCatalogId);
            if (def) {
              const tMap = tileMapRef.current;
              let isValid = true;
              if (tMap) {
                for (let dy = 0; dy < def.tileHeight; dy++) {
                  for (let dx = 0; dx < def.tileWidth; dx++) {
                    const tileVal = tMap.getTile(tile.x + dx, tile.y + dy);
                    if (tileVal === 2 || tileVal === 0) {
                      isValid = false;
                      break;
                    }
                  }
                  if (!isValid) break;
                }
              }

              if (isValid) {
                const newId = Date.now().toString();
                const newItem: FurnitureItem = {
                  id: newId,
                  catalogId: selectedCatalogId,
                  name: def.name,
                  x: tile.x,
                  y: tile.y,
                  width: def.tileWidth,
                  height: def.tileHeight,
                  color: def.color,
                  walkable: def.walkable,
                };
                useOfficeStore.getState().addFurniture(newItem);
                pushHistory({
                  type: 'add',
                  furnitureId: newId,
                  after: { x: tile.x, y: tile.y },
                });
                // Keep catalog item selected for rapid placement
              }
            }
          } else {
            // Click on existing furniture tile → select it
            const furniture = useOfficeStore.getState().furniture;
            const clicked = furniture.find(
              (f) =>
                tile.x >= f.x &&
                tile.x < f.x + f.width &&
                tile.y >= f.y &&
                tile.y < f.y + f.height
            );
            if (clicked) {
              selectFurniture(clicked.id);
            } else {
              selectFurniture(null);
              selectCatalogItem(null);
            }
          }
        } else {
          // Non-editor mode: check for agent hit
          const agents = agentsRef.current;
          const agentIds: AgentId[] = ['luna', 'max', 'ava', 'sam', 'rio'];
          for (const id of agentIds) {
            const agent = agents[id];
            if (!agent) continue;
            if (agent.position.x === tile.x && agent.position.y === tile.y) {
              setSelectedAgentId(id);
              break;
            }
          }
        }
      }
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    isDragging.current = false;
    setHoveredTile(null);
  }, []);

  // ── Scroll to zoom ─────────────────────────────────────────────

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const r = rendererRef.current;
    if (!r) return;
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    r.zoom = Math.max(0.5, Math.min(3, r.zoom * zoomFactor));
  }, []);

  // ── Touch support ──────────────────────────────────────────────

  // Single-finger pan state
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const cameraAtTouchStart = useRef({ x: 0, y: 0 });
  // Track touch start position to detect tap vs drag
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  // Pinch-to-zoom state
  const lastPinchDistance = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2) {
      // Begin pinch gesture — record initial distance
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastPinchDistance.current = dist;
      // Cancel any single-finger pan
      touchStart.current = null;
      touchStartPos.current = null;
    } else if (e.touches.length === 1) {
      const pos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      touchStart.current = pos;
      touchStartPos.current = pos;
      lastPinchDistance.current = null;
      const r = rendererRef.current;
      if (r) {
        cameraAtTouchStart.current = { x: r.cameraX, y: r.cameraY };
      }
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const r = rendererRef.current;
    if (!r) return;

    if (e.touches.length === 2) {
      // Pinch-to-zoom
      const newDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (lastPinchDistance.current !== null) {
        const delta = newDist - lastPinchDistance.current;
        r.zoom = Math.max(0.5, Math.min(3, r.zoom + delta * 0.01));
      }
      lastPinchDistance.current = newDist;
    } else if (e.touches.length === 1 && touchStart.current) {
      // Single-finger pan
      const dx = e.touches[0].clientX - touchStart.current.x;
      const dy = e.touches[0].clientY - touchStart.current.y;
      r.cameraX = cameraAtTouchStart.current.x - dx / r.zoom;
      r.cameraY = cameraAtTouchStart.current.y - dy / r.zoom;
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      // If the touch ended and we still have a recorded start position,
      // check if it was a tap (minimal movement) to select an agent
      if (touchStartPos.current && e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        const dx = touch.clientX - touchStartPos.current.x;
        const dy = touch.clientY - touchStartPos.current.y;
        const moved = Math.sqrt(dx * dx + dy * dy);

        if (moved <= DRAG_THRESHOLD) {
          // Treat as a tap
          const r = rendererRef.current;
          if (r) {
            const canvas = canvasRef.current;
            if (canvas) {
              const rect = canvas.getBoundingClientRect();
              const screenX = touch.clientX - rect.left;
              const screenY = touch.clientY - rect.top;
              const tile = r.screenToTile(screenX, screenY);

              const isEditorMode = useOfficeStore.getState().isEditorMode;
              if (!isEditorMode) {
                const agents = agentsRef.current;
                const ids: AgentId[] = ['luna', 'max', 'ava', 'sam', 'rio'];
                for (const id of ids) {
                  const agent = agents[id];
                  if (!agent) continue;
                  if (agent.position.x === tile.x && agent.position.y === tile.y) {
                    setSelectedAgentId(id);
                    break;
                  }
                }
              }
            }
          }
        }
      }

      touchStart.current = null;
      touchStartPos.current = null;
      if (e.touches.length < 2) {
        lastPinchDistance.current = null;
      }
    },
    []
  );

  // ── MiniMap click → pan camera ─────────────────────────────────

  const handleMiniMapClick = useCallback((worldX: number, worldY: number) => {
    const r = rendererRef.current;
    if (!r) return;
    // Center camera on the clicked world position
    r.cameraX = worldX - canvasSize.width / 2 / r.zoom;
    r.cameraY = worldY - canvasSize.height / 2 / r.zoom;
    setCameraState({ cameraX: r.cameraX, cameraY: r.cameraY, zoom: r.zoom });
  }, [canvasSize]);

  // Determine cursor style based on editor mode
  const isEditorMode = useOfficeStore((state) => state.isEditorMode);
  const selectedCatalogId = useEditorStore((state) => state.selectedCatalogId);
  const cursorClass =
    isEditorMode && selectedCatalogId
      ? 'cursor-crosshair'
      : 'cursor-grab active:cursor-grabbing';

  return (
    <div className="relative w-full h-full overflow-hidden no-select">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center" style={{ backgroundColor: '#12121e' }}>
          <div className="font-pixel text-[10px] tracking-widest mb-4" style={{ color: 'var(--color-accent)' }}>
            PIXEL AGENTS OFFICE
          </div>
          <div className="font-pixel text-[8px] tracking-widest animate-pulse" style={{ color: 'var(--color-text-muted)' }}>
            LOADING...
          </div>
        </div>
      )}

      {/* Main canvas */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full ${cursorClass}`}
        style={{ imageRendering: 'pixelated' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Editor mode placement hint overlay */}
      {isEditorMode && selectedCatalogId && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="panel-glass px-3 py-1">
            <span className="font-pixel text-[7px] tracking-wide" style={{ color: 'var(--color-accent-green)' }}>
              CLICK TO PLACE • ESC TO CANCEL
            </span>
          </div>
        </div>
      )}

      {/* MiniMap overlay — bottom-left */}
      {!isLoading && (
        <MiniMap
          rooms={rooms}
          agents={agentsForMiniMap}
          cameraX={cameraState.cameraX}
          cameraY={cameraState.cameraY}
          zoom={cameraState.zoom}
          canvasWidth={canvasSize.width}
          canvasHeight={canvasSize.height}
          onClickMiniMap={handleMiniMapClick}
        />
      )}

      {/* Agent editor modal */}
      {selectedAgentId && (
        <AgentEditor
          agentId={selectedAgentId}
          isOpen={true}
          onClose={() => setSelectedAgentId(null)}
        />
      )}
    </div>
  );
}
