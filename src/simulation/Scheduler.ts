import { TileMap } from '@/engine/TileMap';
import { Pathfinder } from '@/engine/Pathfinder';
import { InteractionManager } from './InteractionManager';
import { AgentBehavior } from './AgentBehavior';

export class Scheduler {
  private interactionManager: InteractionManager;
  private agentBehavior: AgentBehavior;
  private isRunning: boolean;
  private isPaused: boolean;

  constructor(tileMap: TileMap, pathfinder: Pathfinder) {
    this.interactionManager = new InteractionManager(tileMap, pathfinder);
    this.agentBehavior = new AgentBehavior(this.interactionManager);
    this.isRunning = false;
    this.isPaused = false;
  }

  start(): void {
    this.isRunning = true;
    this.isPaused = false;
  }

  stop(): void {
    this.isRunning = false;
    this.isPaused = false;
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }

  /**
   * Called by the GameLoop's update function every tick.
   * dt is in milliseconds.
   */
  update(dt: number): void {
    if (!this.isRunning || this.isPaused) return;

    this.interactionManager.update(dt);
    this.agentBehavior.update(dt);
  }

  /**
   * Expose the InteractionManager for external use (e.g. manual triggers).
   */
  getInteractionManager(): InteractionManager {
    return this.interactionManager;
  }
}
