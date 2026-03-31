interface SpriteFrame {
  frameIndex: number;
  duration: number; // ms per frame
}

interface Animation {
  name: string;
  frames: SpriteFrame[];
  loop: boolean;
}

class SpriteSheet {
  private animations: Map<string, Animation>;
  private currentAnim: string;
  private currentFrame: number;
  private elapsed: number;
  private finished: boolean;

  constructor(animations: Animation[]) {
    this.animations = new Map(animations.map((a) => [a.name, a]));
    this.currentAnim = animations.length > 0 ? animations[0].name : '';
    this.currentFrame = 0;
    this.elapsed = 0;
    this.finished = false;
  }

  setAnimation(name: string): void {
    if (this.currentAnim === name) return;
    const anim = this.animations.get(name);
    if (!anim) return;
    this.currentAnim = name;
    this.currentFrame = 0;
    this.elapsed = 0;
    this.finished = false;
  }

  update(dt: number): void {
    const anim = this.animations.get(this.currentAnim);
    if (!anim || anim.frames.length === 0) return;
    if (this.finished) return;

    this.elapsed += dt;
    const frameDuration = anim.frames[this.currentFrame].duration;

    if (this.elapsed >= frameDuration) {
      this.elapsed -= frameDuration;
      const nextFrame = this.currentFrame + 1;

      if (nextFrame >= anim.frames.length) {
        if (anim.loop) {
          this.currentFrame = 0;
        } else {
          this.currentFrame = anim.frames.length - 1;
          this.finished = true;
        }
      } else {
        this.currentFrame = nextFrame;
      }
    }
  }

  getCurrentFrame(): number {
    const anim = this.animations.get(this.currentAnim);
    if (!anim || anim.frames.length === 0) return 0;
    return anim.frames[this.currentFrame].frameIndex;
  }

  isFinished(): boolean {
    return this.finished;
  }
}

// Pre-defined animations for agents
export const AGENT_ANIMATIONS: Animation[] = [
  {
    name: 'idle_down',
    frames: [
      { frameIndex: 0, duration: 500 },
      { frameIndex: 1, duration: 500 },
    ],
    loop: true,
  },
  {
    name: 'idle_up',
    frames: [
      { frameIndex: 2, duration: 500 },
      { frameIndex: 3, duration: 500 },
    ],
    loop: true,
  },
  {
    name: 'idle_left',
    frames: [
      { frameIndex: 4, duration: 500 },
      { frameIndex: 5, duration: 500 },
    ],
    loop: true,
  },
  {
    name: 'idle_right',
    frames: [
      { frameIndex: 6, duration: 500 },
      { frameIndex: 7, duration: 500 },
    ],
    loop: true,
  },
  {
    name: 'walk_down',
    frames: [
      { frameIndex: 8, duration: 150 },
      { frameIndex: 9, duration: 150 },
      { frameIndex: 10, duration: 150 },
      { frameIndex: 11, duration: 150 },
    ],
    loop: true,
  },
  {
    name: 'walk_up',
    frames: [
      { frameIndex: 12, duration: 150 },
      { frameIndex: 13, duration: 150 },
      { frameIndex: 14, duration: 150 },
      { frameIndex: 15, duration: 150 },
    ],
    loop: true,
  },
  {
    name: 'walk_left',
    frames: [
      { frameIndex: 16, duration: 150 },
      { frameIndex: 17, duration: 150 },
      { frameIndex: 18, duration: 150 },
      { frameIndex: 19, duration: 150 },
    ],
    loop: true,
  },
  {
    name: 'walk_right',
    frames: [
      { frameIndex: 20, duration: 150 },
      { frameIndex: 21, duration: 150 },
      { frameIndex: 22, duration: 150 },
      { frameIndex: 23, duration: 150 },
    ],
    loop: true,
  },
];

export { SpriteSheet };
export type { SpriteFrame, Animation };
