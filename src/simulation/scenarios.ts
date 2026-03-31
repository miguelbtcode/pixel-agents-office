import type { ActivityType } from '@/types/activity';
import type { AgentId } from '@/types/agent';

export interface Scenario {
  id: string;
  type: ActivityType;
  senderId: AgentId;
  receiverId: AgentId | 'all'; // 'all' = meeting room gathering
  messages: string[]; // pool of messages to pick from randomly
  weight: number; // probability weight for scheduler
}

export const scenarios: Scenario[] = [
  // Luna → Max: code review
  {
    id: 'luna_review_max',
    type: 'review',
    senderId: 'luna',
    receiverId: 'max',
    messages: [
      'Hey Max, can you review PR #42?',
      'Max, your component needs some refactoring.',
      'Great work on the UI! Just a few comments.',
      'The responsive design looks perfect. Approved!',
    ],
    weight: 3,
  },

  // Sam → Ava: bug report
  {
    id: 'sam_bug_ava',
    type: 'bug_found',
    senderId: 'sam',
    receiverId: 'ava',
    messages: [
      'Ava, found a critical bug in the API!',
      'The auth endpoint is returning 500 errors.',
      'Database query is timing out under load.',
      'Sam here - regression in the payment flow.',
    ],
    weight: 3,
  },

  // Rio → Luna: deploy request
  {
    id: 'rio_deploy_luna',
    type: 'deployment',
    senderId: 'rio',
    receiverId: 'luna',
    messages: [
      'Luna, ready to deploy to production?',
      'CI/CD pipeline is green. Deploying now!',
      'Infrastructure scaled up for the release.',
      'Rollback ready just in case.',
    ],
    weight: 2,
  },

  // Max → Ava: API question
  {
    id: 'max_question_ava',
    type: 'message',
    senderId: 'max',
    receiverId: 'ava',
    messages: [
      "Ava, what's the endpoint for user data?",
      'Does the API support pagination?',
      'Can you add a filter param to this route?',
      'The CORS config is blocking my requests.',
    ],
    weight: 2,
  },

  // Ava → Sam: test request
  {
    id: 'ava_test_sam',
    type: 'review',
    senderId: 'ava',
    receiverId: 'sam',
    messages: [
      'Sam, can you test the new endpoints?',
      'Added unit tests. Can you verify coverage?',
      'The migration is done - please QA it.',
      'New feature ready for testing!',
    ],
    weight: 2,
  },

  // Rio → Max: frontend deploy
  {
    id: 'rio_message_max',
    type: 'deployment',
    senderId: 'rio',
    receiverId: 'max',
    messages: [
      'Max, frontend build is live!',
      'CDN cache cleared. Check the staging env.',
      'Docker image updated with your latest.',
      'Nginx config updated for the new routes.',
    ],
    weight: 1,
  },

  // Luna standup: all agents meet
  {
    id: 'standup_meeting',
    type: 'meeting',
    senderId: 'luna',
    receiverId: 'all',
    messages: [
      'Team standup in the meeting room!',
      "Sprint review time - let's meet!",
      'Quick sync needed - meeting room now.',
      'Architecture discussion - everyone join!',
    ],
    weight: 1,
  },

  // Break scenarios
  {
    id: 'max_break',
    type: 'break',
    senderId: 'max',
    receiverId: 'rio',
    messages: ['Coffee break?', 'Need a break. Join me?', 'Grabbing a snack!'],
    weight: 1,
  },
  {
    id: 'sam_break',
    type: 'break',
    senderId: 'sam',
    receiverId: 'max',
    messages: ['Coffee time!', 'Taking 5 mins.', 'Snack run!'],
    weight: 1,
  },
];

/**
 * Pick a random scenario using weighted probability.
 */
export function pickWeightedScenario(pool: Scenario[]): Scenario | null {
  if (pool.length === 0) return null;

  const totalWeight = pool.reduce((sum, s) => sum + s.weight, 0);
  let rand = Math.random() * totalWeight;

  for (const scenario of pool) {
    rand -= scenario.weight;
    if (rand <= 0) return scenario;
  }

  return pool[pool.length - 1];
}

/**
 * Pick a random message from a scenario's message pool.
 */
export function pickMessage(scenario: Scenario): string {
  return scenario.messages[Math.floor(Math.random() * scenario.messages.length)];
}
