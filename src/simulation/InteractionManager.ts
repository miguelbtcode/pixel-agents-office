import type { AgentId, AgentPosition } from '@/types/agent';
import { useAgentStore } from '@/store/useAgentStore';
import { useActivityStore } from '@/store/useActivityStore';
import { Pathfinder } from '@/engine/Pathfinder';
import { TileMap } from '@/engine/TileMap';
import type { Scenario } from './scenarios';
import { pickMessage } from './scenarios';

// Tile coordinates for key locations
const MEETING_ROOM_CENTER = { x: 6, y: 21 };
const KITCHEN_CENTER = { x: 19, y: 21 };

// Duration constants (ms)
const TALKING_DURATION = 3000;
const RESPONSE_DURATION = 3000;

// Response messages keyed by agent id for simple canned responses
const RESPONSE_MESSAGES: Record<AgentId, string[]> = {
  luna: [
    'Got it, on it!',
    'Sure, reviewing now.',
    'Acknowledged!',
    'Will handle it.',
  ],
  max: [
    'On it!',
    'Checking now.',
    'Sure thing!',
    'Will fix that.',
  ],
  ava: [
    'Looking into it!',
    'Will debug that.',
    'On it!',
    'Thanks for the heads-up!',
  ],
  sam: [
    'Running tests now.',
    'Will investigate.',
    'On it!',
    'Checking the logs.',
  ],
  rio: [
    'Deploying now!',
    'Pipeline looks good.',
    'On it!',
    'Infrastructure ready.',
  ],
};

function pickResponse(agentId: AgentId): string {
  const pool = RESPONSE_MESSAGES[agentId];
  return pool[Math.floor(Math.random() * pool.length)];
}

interface InteractionState {
  scenario: Scenario;
  phase: 'walking' | 'talking' | 'responding' | 'returning';
  elapsedMs: number;
  message: string;
  targetPosition: { x: number; y: number };
  // For meetings: track which agents have arrived
  arrivedAgents?: Set<AgentId>;
  // Origin positions to return to after interaction
  senderOrigin?: AgentPosition;
  receiverOrigin?: AgentPosition;
}

// Meeting-specific state for group interactions
interface MeetingState {
  message: string;
  phase: 'walking' | 'meeting' | 'returning';
  elapsedMs: number;
  arrivedAgents: Set<AgentId>;
  origins: Map<AgentId, AgentPosition>;
}

const ALL_AGENT_IDS: AgentId[] = ['luna', 'max', 'ava', 'sam', 'rio'];

// Spread positions around the meeting table so agents don't all pile up on one tile
const MEETING_POSITIONS: AgentPosition[] = [
  { x: 4, y: 20, px: 4 * 32, py: 20 * 32 },
  { x: 6, y: 20, px: 6 * 32, py: 20 * 32 },
  { x: 8, y: 20, px: 8 * 32, py: 20 * 32 },
  { x: 4, y: 23, px: 4 * 32, py: 23 * 32 },
  { x: 8, y: 23, px: 8 * 32, py: 23 * 32 },
];

export class InteractionManager {
  private tileMap: TileMap;
  private pathfinder: Pathfinder;
  // Maps senderId → active interaction for 1-on-1 interactions
  private activeInteractions: Map<AgentId, InteractionState>;
  private meetingState: MeetingState | null;

  constructor(tileMap: TileMap, pathfinder: Pathfinder) {
    this.tileMap = tileMap;
    this.pathfinder = pathfinder;
    this.activeInteractions = new Map();
    this.meetingState = null;
  }

  /**
   * Returns true if the given agent is currently busy with an interaction or meeting.
   */
  isBusy(agentId: AgentId): boolean {
    if (this.meetingState !== null) return true;
    if (this.activeInteractions.has(agentId)) return true;
    // Also check if this agent is the receiver in an active interaction
    for (const [, state] of this.activeInteractions) {
      if (state.scenario.receiverId === agentId) return true;
    }
    return false;
  }

  /**
   * Trigger a 1-on-1 interaction from a scenario.
   */
  triggerInteraction(scenario: Scenario): void {
    // Don't support 'all' receiver in this path
    if (scenario.receiverId === 'all') {
      const msg = pickMessage(scenario);
      this.triggerMeeting(msg);
      return;
    }

    const senderId = scenario.senderId;
    const receiverId = scenario.receiverId as AgentId;

    // Don't double-trigger
    if (this.isBusy(senderId) || this.isBusy(receiverId)) return;

    const agents = useAgentStore.getState().agents;
    const sender = agents[senderId];
    const receiver = agents[receiverId];

    if (!sender || !receiver) return;

    const message = pickMessage(scenario);

    // Determine where the sender should walk to (adjacent to receiver)
    const targetPos = this.findAdjacentWalkable(receiver.position.x, receiver.position.y);

    // Calculate path
    const path = this.pathfinder.findPath(
      sender.position.x,
      sender.position.y,
      targetPos.x,
      targetPos.y
    );

    // Set sender walking
    useAgentStore.getState().setAgentState(senderId, 'walking');
    if (path.length > 0) {
      useAgentStore.getState().setAgentPath(senderId, path);
    }

    // Log the interaction start
    useActivityStore.getState().addEntry({
      agentId: senderId,
      type: scenario.type,
      description: `${sender.name} → ${receiver.name}: "${message}"`,
      relatedAgents: [receiverId],
      roomId: useAgentStore.getState().agents[senderId]
        ? this.getRoomId(sender.position.x, sender.position.y)
        : undefined,
    });

    const interactionState: InteractionState = {
      scenario,
      phase: 'walking',
      elapsedMs: 0,
      message,
      targetPosition: targetPos,
      senderOrigin: { ...sender.position },
      receiverOrigin: { ...receiver.position },
    };

    this.activeInteractions.set(senderId, interactionState);
  }

  /**
   * Trigger a group meeting: all agents walk to the meeting room.
   */
  triggerMeeting(message: string): void {
    if (this.meetingState !== null) return;

    const agents = useAgentStore.getState().agents;
    const origins = new Map<AgentId, AgentPosition>();

    for (const id of ALL_AGENT_IDS) {
      const agent = agents[id];
      if (!agent) continue;
      origins.set(id, { ...agent.position });
    }

    this.meetingState = {
      message,
      phase: 'walking',
      elapsedMs: 0,
      arrivedAgents: new Set(),
      origins,
    };

    // Send each agent to their meeting position
    ALL_AGENT_IDS.forEach((id, idx) => {
      const agent = agents[id];
      if (!agent) return;

      const dest = MEETING_POSITIONS[idx] ?? { x: MEETING_ROOM_CENTER.x, y: MEETING_ROOM_CENTER.y };
      const path = this.pathfinder.findPath(
        agent.position.x,
        agent.position.y,
        dest.x,
        dest.y
      );

      useAgentStore.getState().setAgentState(id, 'walking');
      if (path.length > 0) {
        useAgentStore.getState().setAgentPath(id, path);
      }
    });

    // Log the meeting
    useActivityStore.getState().addEntry({
      agentId: 'luna',
      type: 'meeting',
      description: `Luna called a meeting: "${message}"`,
      relatedAgents: ['max', 'ava', 'sam', 'rio'],
      roomId: 'meeting_room',
    });
  }

  /**
   * Called every game loop tick to advance interaction states.
   */
  update(dt: number): void {
    this.updateMeeting(dt);
    this.updateInteractions(dt);
  }

  private updateMeeting(dt: number): void {
    if (!this.meetingState) return;
    const meeting = this.meetingState;

    if (meeting.phase === 'walking') {
      const agents = useAgentStore.getState().agents;

      // Check which agents have arrived at their meeting position
      ALL_AGENT_IDS.forEach((id, idx) => {
        if (meeting.arrivedAgents.has(id)) return;
        const agent = agents[id];
        if (!agent) return;

        const dest = MEETING_POSITIONS[idx] ?? MEETING_ROOM_CENTER;

        // Arrived if path is empty and they're close to destination
        if (
          agent.currentPath.length === 0 &&
          Math.abs(agent.position.x - dest.x) <= 1 &&
          Math.abs(agent.position.y - dest.y) <= 1
        ) {
          meeting.arrivedAgents.add(id);
          useAgentStore.getState().setAgentState(id, 'meeting');
        }
      });

      // All agents arrived → start talking phase
      if (meeting.arrivedAgents.size >= ALL_AGENT_IDS.length) {
        meeting.phase = 'meeting';
        meeting.elapsedMs = 0;

        // Show speech bubble on luna
        useAgentStore.getState().setSpeechBubble('luna', meeting.message, TALKING_DURATION);
      }
    } else if (meeting.phase === 'meeting') {
      meeting.elapsedMs += dt;

      if (meeting.elapsedMs >= TALKING_DURATION + RESPONSE_DURATION) {
        // Meeting over — send everyone back
        meeting.phase = 'returning';
        meeting.elapsedMs = 0;

        // Clear speech bubbles and send agents back to origins
        for (const id of ALL_AGENT_IDS) {
          useAgentStore.getState().clearSpeechBubble(id);
          const origin = meeting.origins.get(id);
          if (!origin) continue;

          const agents = useAgentStore.getState().agents;
          const agent = agents[id];
          if (!agent) continue;

          const path = this.pathfinder.findPath(
            agent.position.x,
            agent.position.y,
            origin.x,
            origin.y
          );

          useAgentStore.getState().setAgentState(id, 'walking');
          if (path.length > 0) {
            useAgentStore.getState().setAgentPath(id, path);
          }
        }
      } else if (meeting.elapsedMs >= TALKING_DURATION) {
        // Show response bubbles on non-luna agents
        const responders: AgentId[] = ['max', 'ava', 'sam', 'rio'];
        // Pick one random responder to show a bubble
        const responder = responders[Math.floor(Math.random() * responders.length)];
        const currentAgent = useAgentStore.getState().agents[responder];
        if (currentAgent && !currentAgent.speechBubble) {
          useAgentStore.getState().setSpeechBubble(
            responder,
            pickResponse(responder),
            RESPONSE_DURATION
          );
        }
      }
    } else if (meeting.phase === 'returning') {
      // Check if all agents have returned (paths empty)
      const agents = useAgentStore.getState().agents;
      const allReturned = ALL_AGENT_IDS.every((id) => {
        const agent = agents[id];
        return !agent || agent.currentPath.length === 0;
      });

      if (allReturned) {
        // Set all agents back to working/idle
        for (const id of ALL_AGENT_IDS) {
          const agent = agents[id];
          if (agent && (agent.state === 'walking' || agent.state === 'meeting')) {
            useAgentStore.getState().setAgentState(id, 'working');
          }
        }
        this.meetingState = null;
      }
    }
  }

  private updateInteractions(dt: number): void {
    for (const [senderId, state] of this.activeInteractions) {
      const receiverId = state.scenario.receiverId as AgentId;
      const agents = useAgentStore.getState().agents;
      const sender = agents[senderId];
      const receiver = agents[receiverId];

      if (!sender || !receiver) {
        this.activeInteractions.delete(senderId);
        continue;
      }

      if (state.phase === 'walking') {
        // Check if sender has arrived near receiver
        const arrived =
          sender.currentPath.length === 0 &&
          Math.abs(sender.position.x - state.targetPosition.x) <= 1 &&
          Math.abs(sender.position.y - state.targetPosition.y) <= 1;

        if (arrived) {
          state.phase = 'talking';
          state.elapsedMs = 0;

          // Both agents are now talking
          useAgentStore.getState().setAgentState(senderId, 'talking');
          useAgentStore.getState().setAgentState(receiverId, 'talking');

          // Show speech bubble on sender
          useAgentStore.getState().setSpeechBubble(senderId, state.message, TALKING_DURATION);
        }
      } else if (state.phase === 'talking') {
        state.elapsedMs += dt;

        if (state.elapsedMs >= TALKING_DURATION) {
          state.phase = 'responding';
          state.elapsedMs = 0;

          // Clear sender bubble, show receiver response
          useAgentStore.getState().clearSpeechBubble(senderId);
          useAgentStore.getState().setSpeechBubble(
            receiverId,
            pickResponse(receiverId),
            RESPONSE_DURATION
          );
        }
      } else if (state.phase === 'responding') {
        state.elapsedMs += dt;

        if (state.elapsedMs >= RESPONSE_DURATION) {
          state.phase = 'returning';
          state.elapsedMs = 0;

          // Clear receiver bubble
          useAgentStore.getState().clearSpeechBubble(receiverId);

          // Return sender to their origin
          if (state.senderOrigin) {
            const path = this.pathfinder.findPath(
              sender.position.x,
              sender.position.y,
              state.senderOrigin.x,
              state.senderOrigin.y
            );

            useAgentStore.getState().setAgentState(senderId, 'walking');
            if (path.length > 0) {
              useAgentStore.getState().setAgentPath(senderId, path);
            }
          }

          // Return receiver to their origin
          if (state.receiverOrigin) {
            const path = this.pathfinder.findPath(
              receiver.position.x,
              receiver.position.y,
              state.receiverOrigin.x,
              state.receiverOrigin.y
            );

            useAgentStore.getState().setAgentState(receiverId, 'walking');
            if (path.length > 0) {
              useAgentStore.getState().setAgentPath(receiverId, path);
            }
          }
        }
      } else if (state.phase === 'returning') {
        // Wait for both agents to finish walking back
        const senderBack = sender.currentPath.length === 0;
        const receiverBack = receiver.currentPath.length === 0;

        if (senderBack && receiverBack) {
          // End interaction
          if (sender.state === 'walking' || sender.state === 'talking') {
            useAgentStore.getState().setAgentState(senderId, 'working');
          }
          if (receiver.state === 'walking' || receiver.state === 'talking') {
            useAgentStore.getState().setAgentState(receiverId, 'working');
          }

          this.activeInteractions.delete(senderId);
        }
      }
    }
  }

  /**
   * Find a walkable tile adjacent to the given position.
   * Tries the 4 cardinal directions and falls back to the position itself.
   */
  private findAdjacentWalkable(x: number, y: number): { x: number; y: number } {
    const candidates = [
      { x: x - 1, y },
      { x: x + 1, y },
      { x, y: y - 1 },
      { x, y: y + 1 },
    ];

    for (const c of candidates) {
      if (this.tileMap.isWalkable(c.x, c.y)) return c;
    }

    // Fall back: try the target tile itself
    if (this.tileMap.isWalkable(x, y)) return { x, y };

    // Last resort: return original
    return { x, y };
  }

  private getRoomId(x: number, y: number): string | undefined {
    const room = this.tileMap.getRoomAt(x, y);
    return room?.id;
  }

  /**
   * Send a single agent to the kitchen for a break.
   */
  triggerBreak(agentId: AgentId): void {
    if (this.isBusy(agentId)) return;

    const agents = useAgentStore.getState().agents;
    const agent = agents[agentId];
    if (!agent) return;

    const path = this.pathfinder.findPath(
      agent.position.x,
      agent.position.y,
      KITCHEN_CENTER.x,
      KITCHEN_CENTER.y
    );

    useAgentStore.getState().setAgentState(agentId, 'break');
    if (path.length > 0) {
      useAgentStore.getState().setAgentPath(agentId, path);
    }

    useActivityStore.getState().addEntry({
      agentId,
      type: 'break',
      description: `${agent.name} is heading to the kitchen for a break.`,
      roomId: 'kitchen',
    });
  }

  /**
   * Return an agent from break back to their desk origin.
   */
  returnFromBreak(agentId: AgentId, origin: AgentPosition): void {
    const agents = useAgentStore.getState().agents;
    const agent = agents[agentId];
    if (!agent) return;

    const path = this.pathfinder.findPath(
      agent.position.x,
      agent.position.y,
      origin.x,
      origin.y
    );

    useAgentStore.getState().setAgentState(agentId, 'walking');
    if (path.length > 0) {
      useAgentStore.getState().setAgentPath(agentId, path);
    }
  }
}
