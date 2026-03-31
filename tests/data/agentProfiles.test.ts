import { describe, it, expect } from 'vitest'
import { agentProfiles } from '@/data/agentProfiles'
import { TileMap } from '@/engine/TileMap'
import { mapLayout } from '@/data/mapLayout'
import type { AgentId, AgentRole } from '@/types/agent'

const VALID_IDS: AgentId[] = ['luna', 'max', 'ava', 'sam', 'rio']
const VALID_ROLES: AgentRole[] = [
  'Tech Lead',
  'Frontend Dev',
  'Backend Dev',
  'QA Engineer',
  'DevOps/Fullstack',
]

describe('agentProfiles', () => {
  it('has exactly 5 agent profiles', () => {
    expect(agentProfiles.length).toBe(5)
  })

  it('each agent has a unique id', () => {
    const ids = agentProfiles.map(a => a.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('all agent ids are one of the 5 valid ids', () => {
    for (const agent of agentProfiles) {
      expect(VALID_IDS).toContain(agent.id)
    }
  })

  it('each agent has a valid role', () => {
    for (const agent of agentProfiles) {
      expect(VALID_ROLES).toContain(agent.role)
    }
  })

  it('all 5 expected roles are represented exactly once', () => {
    const roles = agentProfiles.map(a => a.role)
    for (const role of VALID_ROLES) {
      expect(roles.filter(r => r === role).length).toBe(1)
    }
  })

  it('each agent has appearance with hairColor', () => {
    for (const agent of agentProfiles) {
      expect(typeof agent.appearance.hairColor).toBe('string')
      expect(agent.appearance.hairColor.length).toBeGreaterThan(0)
    }
  })

  it('each agent has appearance with outfitColor', () => {
    for (const agent of agentProfiles) {
      expect(typeof agent.appearance.outfitColor).toBe('string')
      expect(agent.appearance.outfitColor.length).toBeGreaterThan(0)
    }
  })

  it('each agent has appearance with skinColor', () => {
    for (const agent of agentProfiles) {
      expect(typeof agent.appearance.skinColor).toBe('string')
      expect(agent.appearance.skinColor.length).toBeGreaterThan(0)
    }
  })

  it('each agent has an accessories array in appearance', () => {
    for (const agent of agentProfiles) {
      expect(Array.isArray(agent.appearance.accessories)).toBe(true)
    }
  })

  it('each agent has an initial position with x, y, px, py', () => {
    for (const agent of agentProfiles) {
      expect(typeof agent.position.x).toBe('number')
      expect(typeof agent.position.y).toBe('number')
      expect(typeof agent.position.px).toBe('number')
      expect(typeof agent.position.py).toBe('number')
    }
  })

  it('each agent has an initial position on a walkable tile', () => {
    const tileMap = new TileMap(mapLayout)
    for (const agent of agentProfiles) {
      expect(tileMap.isWalkable(agent.position.x, agent.position.y)).toBe(true)
    }
  })

  it('px and py match tile coordinates * 32', () => {
    for (const agent of agentProfiles) {
      expect(agent.position.px).toBe(agent.position.x * 32)
      expect(agent.position.py).toBe(agent.position.y * 32)
    }
  })

  it('each agent starts with idle state', () => {
    for (const agent of agentProfiles) {
      expect(agent.state).toBe('idle')
    }
  })

  it('each agent starts with an empty currentPath', () => {
    for (const agent of agentProfiles) {
      expect(agent.currentPath).toEqual([])
    }
  })
})
