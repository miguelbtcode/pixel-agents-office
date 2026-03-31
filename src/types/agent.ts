export type AgentId = 'luna' | 'max' | 'ava' | 'sam' | 'rio';

export type AgentRole =
  | 'Tech Lead'
  | 'Frontend Dev'
  | 'Backend Dev'
  | 'QA Engineer'
  | 'DevOps/Fullstack';

export type AgentState =
  | 'idle'
  | 'walking'
  | 'talking'
  | 'meeting'
  | 'break'
  | 'working';

export type AgentDirection = 'up' | 'down' | 'left' | 'right';

export interface AgentPosition {
  x: number; // tile x
  y: number; // tile y
  px: number; // pixel x (for smooth interpolation)
  py: number; // pixel y (for smooth interpolation)
}

export interface AgentAppearance {
  hairColor: string;
  outfitColor: string;
  skinColor: string;
  accessories: string[]; // accessory IDs
}

export interface Agent {
  id: AgentId;
  name: string;
  role: AgentRole;
  primaryColor: string;
  position: AgentPosition;
  state: AgentState;
  direction: AgentDirection;
  appearance: AgentAppearance;
  currentPath: AgentPosition[];
  targetAgentId?: AgentId;
  speechBubble?: {
    text: string;
    expiresAt: number;
  };
}
