'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAgentStore } from '@/store/useAgentStore';
import { useOfficeStore } from '@/store/useOfficeStore';
import { GameLoop } from '@/engine/GameLoop';
import { Renderer, TILE_SIZE } from '@/engine/Renderer';
import { TileMap } from '@/engine/TileMap';
import { SpriteSheet, AGENT_ANIMATIONS } from '@/engine/SpriteSheet';
import { mapLayout } from '@/data/mapLayout';
import type { AgentId } from '@/types/agent';

// Movement speed: tiles per second
const TILES_PER_SECOND = 3;
const PIXELS_PER_MS = (TILES_PER_SECOND * TILE_SIZE) / 1000;

export default function OfficeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const gameLoopRef = useRef<GameLoop | null>(null);
  const tileMapRef = useRef<TileMap | null>(null);

  // Per-agent SpriteSheet instances keyed by AgentId
  const spriteSheets = useRef<Record<string, SpriteSheet>>({});

  // Camera drag state
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const cameraAtDragStart = useRef({ x: 0, y: 0 });

  // Snapshots of store state used inside the game loop callbacks
  // (captured via refs to avoid stale closures)
  const agentsRef = useRef(useAgentStore.getState().agents);
  const furnitureRef = useRef(useOfficeStore.getState().furniture);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Initialize core engine objects ──────────────────────────
    const tileMap = new TileMap(mapLayout);
    tileMapRef.current = tileMap;

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

    // ── Subscribe to store changes and keep refs current ────────
    const unsubAgents = useAgentStore.subscribe((state) => {
      agentsRef.current = state.agents;
    });
    const unsubFurniture = useOfficeStore.subscribe((state) => {
      furnitureRef.current = state.furniture;
    });

    // ── Update function ──────────────────────────────────────────
    gameLoop.setUpdate((dt: number) => {
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
    gameLoop.setRender(() => {
      const r = rendererRef.current;
      if (!r) return;

      const agents = agentsRef.current;
      const furniture = furnitureRef.current;

      r.clear();
      r.drawMap(furniture);

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
    });

    // ── Handle resize ────────────────────────────────────────────
    const handleResize = () => {
      const r = rendererRef.current;
      if (!r || !canvas.parentElement) return;
      const { clientWidth, clientHeight } = canvas.parentElement;
      r.resize(clientWidth, clientHeight);
    };

    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    gameLoop.start();

    return () => {
      gameLoop.stop();
      resizeObserver.disconnect();
      unsubAgents();
      unsubFurniture();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Camera pan with mouse ──────────────────────────────────────

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    const r = rendererRef.current;
    if (r) {
      cameraAtDragStart.current = { x: r.cameraX, y: r.cameraY };
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;
    const r = rendererRef.current;
    if (!r) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    r.cameraX = cameraAtDragStart.current.x - dx / r.zoom;
    r.cameraY = cameraAtDragStart.current.y - dy / r.zoom;
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isDragging.current = false;
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

  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const cameraAtTouchStart = useRef({ x: 0, y: 0 });

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      const r = rendererRef.current;
      if (r) {
        cameraAtTouchStart.current = { x: r.cameraX, y: r.cameraY };
      }
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!touchStart.current || e.touches.length !== 1) return;
    const r = rendererRef.current;
    if (!r) return;
    const dx = e.touches[0].clientX - touchStart.current.x;
    const dy = e.touches[0].clientY - touchStart.current.y;
    r.cameraX = cameraAtTouchStart.current.x - dx / r.zoom;
    r.cameraY = cameraAtTouchStart.current.y - dy / r.zoom;
  }, []);

  const handleTouchEnd = useCallback(() => {
    touchStart.current = null;
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-grab active:cursor-grabbing"
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
  );
}
