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

  constructor() {
    this.updateFn = null;
    this.renderFn = null;
    this.rafId = null;
    this.lastTime = 0;
    this.isRunning = false;
    this.isPaused = false;

    // Bind tick so it can be passed directly to rAF
    this.tick = this.tick.bind(this);
  }

  setUpdate(fn: UpdateFn): void {
    this.updateFn = fn;
  }

  setRender(fn: RenderFn): void {
    this.renderFn = fn;
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.isRunning = false;
    this.isPaused = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
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
    if (this.renderFn) this.renderFn();
  }
}

export { GameLoop };
export type { UpdateFn, RenderFn };
