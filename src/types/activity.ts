import type { AgentId } from './agent';

export type ActivityType =
  | 'message'
  | 'code_commit'
  | 'review'
  | 'bug_found'
  | 'deployment'
  | 'meeting'
  | 'break'
  | 'task_start'
  | 'task_done';

export interface ActivityEntry {
  id: string;
  timestamp: number;
  agentId: AgentId;
  type: ActivityType;
  description: string;
  relatedAgents?: AgentId[];
  roomId?: string;
  metadata?: Record<string, unknown>;
}

export interface ActivityFilter {
  agents: AgentId[];
  types: ActivityType[];
  rooms: string[];
  searchText: string;
}

export const ACTIVITY_ICONS: Record<ActivityType, string> = {
  message: '💬',
  code_commit: '📦',
  review: '🔍',
  bug_found: '🐛',
  deployment: '🚀',
  meeting: '👥',
  break: '☕',
  task_start: '▶️',
  task_done: '✅',
};

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  message: 'Message',
  code_commit: 'Commit',
  review: 'Review',
  bug_found: 'Bug',
  deployment: 'Deploy',
  meeting: 'Meeting',
  break: 'Break',
  task_start: 'Task Start',
  task_done: 'Task Done',
};
