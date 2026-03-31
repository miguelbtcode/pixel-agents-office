import type { AgentId, AgentPosition } from '@/types/agent';
import { useAgentStore } from '@/store/useAgentStore';
import { InteractionManager } from './InteractionManager';
import { scenarios, pickWeightedScenario } from './scenarios';
import type { Scenario } from './scenarios';

// Time constants (ms)
const MIN_ACTION_INTERVAL = 8_000;   // 8s
const MAX_ACTION_INTERVAL = 15_000;  // 15s
const ACTION_TRIGGER_CHANCE = 0.30;  // 30% chance to trigger when timer fires

const BREAK_INTERVAL = 2 * 60_000;  // 2 minutes per agent
const BREAK_DURATION  = 30_000;     // 30s at kitchen before returning

const MEETING_INTERVAL_MIN = 5 * 60_000;  // 5 minutes
const MEETING_INTERVAL_MAX = 8 * 60_000;  // 8 minutes

const ALL_AGENT_IDS: AgentId[] = ['luna', 'max', 'ava', 'sam', 'rio'];

interface BreakInfo {
  onBreak: boolean;
  breakElapsed: number;        // ms spent at kitchen
  lastBreakTime: number;       // timestamp of last break start
  origin: AgentPosition | null; // where to return after break
}

export class AgentBehavior {
  private interactionManager: InteractionManager;

  // Per-agent countdown until next action check (ms)
  private actionTimers: Map<AgentId, number>;

  // Per-agent break tracking
  private breakInfo: Map<AgentId, BreakInfo>;

  // Meeting cooldown
  private lastMeetingTime: number;
  private nextMeetingInterval: number;

  constructor(interactionManager: InteractionManager) {
    this.interactionManager = interactionManager;
    this.actionTimers = new Map();
    this.breakInfo = new Map();
    this.lastMeetingTime = Date.now();
    this.nextMeetingInterval = this.randomMeetingInterval();

    // Stagger initial timers so all agents don't fire at once
    ALL_AGENT_IDS.forEach((id, idx) => {
      this.actionTimers.set(id, MIN_ACTION_INTERVAL + idx * 2_000);
      this.breakInfo.set(id, {
        onBreak: false,
        breakElapsed: 0,
        lastBreakTime: Date.now() - BREAK_INTERVAL * Math.random(), // stagger first breaks
        origin: null,
      });
    });
  }

  /**
   * Called every game loop tick (dt in ms).
   */
  update(dt: number): void {
    if (this.shouldTriggerMeeting()) {
      this.triggerMeeting();
    }

    for (const id of ALL_AGENT_IDS) {
      this.decideAction(id, dt);
    }
  }

  private decideAction(agentId: AgentId, dt: number): void {
    const agents = useAgentStore.getState().agents;
    const agent = agents[agentId];
    if (!agent) return;

    const info = this.breakInfo.get(agentId)!;

    // ── Handle ongoing break ──────────────────────────────────────
    if (info.onBreak) {
      // Only count elapsed time once the agent has arrived (path empty)
      if (agent.currentPath.length === 0 && agent.state === 'break') {
        info.breakElapsed += dt;
      }

      if (info.breakElapsed >= BREAK_DURATION) {
        // Return from break
        info.onBreak = false;
        info.breakElapsed = 0;

        if (info.origin) {
          this.interactionManager.returnFromBreak(agentId, info.origin);
          info.origin = null;
        }
      }
      return; // Don't do anything else while on break
    }

    // ── Meeting in progress: skip individual decisions ────────────
    if (this.interactionManager.isBusy(agentId)) {
      // Reset action timer while busy so we don't immediately fire after
      this.actionTimers.set(agentId, this.randomActionInterval());
      return;
    }

    // ── Break check ───────────────────────────────────────────────
    if (this.shouldTriggerBreak(agentId)) {
      info.onBreak = true;
      info.breakElapsed = 0;
      info.lastBreakTime = Date.now();
      info.origin = { ...agent.position };
      this.interactionManager.triggerBreak(agentId);
      this.actionTimers.set(agentId, this.randomActionInterval());
      return;
    }

    // ── Action timer countdown ────────────────────────────────────
    const timer = (this.actionTimers.get(agentId) ?? MIN_ACTION_INTERVAL) - dt;
    this.actionTimers.set(agentId, timer);

    if (timer > 0) return;

    // Reset timer for next check
    this.actionTimers.set(agentId, this.randomActionInterval());

    // Only act when idle or working
    if (agent.state !== 'idle' && agent.state !== 'working') return;

    // 30% chance to actually trigger something
    if (Math.random() > ACTION_TRIGGER_CHANCE) return;

    const scenario = this.pickRandomScenarioForAgent(agentId);
    if (scenario) {
      this.interactionManager.triggerInteraction(scenario);
    }
  }

  private shouldTriggerBreak(agentId: AgentId): boolean {
    const info = this.breakInfo.get(agentId);
    if (!info) return false;
    if (info.onBreak) return false;

    const elapsed = Date.now() - info.lastBreakTime;
    return elapsed >= BREAK_INTERVAL;
  }

  private shouldTriggerMeeting(): boolean {
    const elapsed = Date.now() - this.lastMeetingTime;
    return elapsed >= this.nextMeetingInterval;
  }

  private triggerMeeting(): void {
    this.lastMeetingTime = Date.now();
    this.nextMeetingInterval = this.randomMeetingInterval();

    // Find the standup_meeting scenario
    const meetingScenario = scenarios.find((s) => s.id === 'standup_meeting');
    if (meetingScenario) {
      this.interactionManager.triggerInteraction(meetingScenario);
    }
  }

  private pickRandomScenarioForAgent(agentId: AgentId): Scenario | null {
    // Filter scenarios where this agent is the sender and receiver is available
    const available = scenarios.filter((s) => {
      if (s.senderId !== agentId) return false;
      // Skip 'all' receiver meetings — those are triggered separately
      if (s.receiverId === 'all') return false;
      // Skip break scenarios — handled by break logic
      if (s.type === 'break') return false;
      // Receiver must not be busy
      if (this.interactionManager.isBusy(s.receiverId as AgentId)) return false;
      return true;
    });

    return pickWeightedScenario(available);
  }

  private randomActionInterval(): number {
    return MIN_ACTION_INTERVAL + Math.random() * (MAX_ACTION_INTERVAL - MIN_ACTION_INTERVAL);
  }

  private randomMeetingInterval(): number {
    return MEETING_INTERVAL_MIN + Math.random() * (MEETING_INTERVAL_MAX - MEETING_INTERVAL_MIN);
  }
}
