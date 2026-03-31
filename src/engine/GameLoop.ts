type UpdateFn = (dt: number) => void;
type RenderFn = () => void;

// Maximum delta time to prevent spiral of death (ms)
const MAX_DELTA = 100;

class GameLoop {
  private updateFn: UpdateFn | null;
  private renderFn: RenderFn | null;
  private rafId: number | null;
  private lastTime: number;
  private isRunning: boolean;
  private isPaused: boolean;

  // Throttle support: minimum ms between render calls (0 = uncapped)
  private throttleInterval: number;
  private lastRenderTime: number;

  // Visibility-change handler reference for cleanup
  private visibilityHandler: (() => void) | null;

  constructor() {
    this.updateFn = null;
    this.renderFn = null;
    this.rafId = null;
    this.lastTime = 0;
    this.isRunning = false;
    this.isPaused = false;
    this.throttleInterval = 0;
    this.lastRenderTime = 0;
    this.visibilityHandler = null;

    // Bind tick so it can be passed directly to rAF
    this.tick = this.tick.bind(this);
  }

  setUpdate(fn: UpdateFn): void {
    this.updateFn = fn;
  }

  setRender(fn: RenderFn): void {
    this.renderFn = fn;
  }

  /**
   * Limit rendering to at most `fps` frames per second.
   * Pass 0 (or any falsy value) to remove the throttle (default).
   */
  setThrottleRate(fps: number): void {
    this.throttleInterval = fps > 0 ? 1000 / fps : 0;
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.lastRenderTime = this.lastTime;
    this.rafId = requestAnimationFrame(this.tick);

    // Pause/resume based on document visibility (saves battery on mobile)
    this.visibilityHandler = () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  stop(): void {
    this.isRunning = false;
    this.isPaused = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }
  }

  pause(): void {
    if (!this.isRunning) return;
    this.isPaused = true;
  }

  resume(): void {
    if (!this.isRunning) return;
    if (this.isPaused) {
      this.isPaused = false;
      // Reset lastTime so we don't get a huge dt spike after unpause
      this.lastTime = performance.now();
      this.lastRenderTime = this.lastTime;
    }
  }

  private tick(timestamp: number): void {
    if (!this.isRunning) return;

    // Schedule next frame immediately so we keep looping
    this.rafId = requestAnimationFrame(this.tick);

    if (this.isPaused) return;

    const rawDt = timestamp - this.lastTime;
    this.lastTime = timestamp;

    // Cap dt to avoid spiral of death
    const dt = Math.min(rawDt, MAX_DELTA);

    if (this.updateFn) this.updateFn(dt);

    // Throttle rendering if a target fps was set
    if (this.throttleInterval > 0) {
      const timeSinceLastRender = timestamp - this.lastRenderTime;
      if (timeSinceLastRender < this.throttleInterval) return;
      this.lastRenderTime = timestamp;
    }

    if (this.renderFn) this.renderFn();
  }
}

export { GameLoop };
export type { UpdateFn, RenderFn };
