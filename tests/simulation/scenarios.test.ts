import { describe, it, expect } from 'vitest'
import { scenarios, pickWeightedScenario } from '@/simulation/scenarios'
import type { AgentId } from '@/types/agent'

const VALID_AGENT_IDS: AgentId[] = ['luna', 'max', 'ava', 'sam', 'rio']

describe('scenarios', () => {
  describe('scenarios array', () => {
    it('is non-empty', () => {
      expect(scenarios.length).toBeGreaterThan(0)
    })

    it('each scenario has a valid senderId (one of the 5 agents)', () => {
      for (const scenario of scenarios) {
        expect(VALID_AGENT_IDS).toContain(scenario.senderId)
      }
    })

    it('each scenario has a non-empty messages array', () => {
      for (const scenario of scenarios) {
        expect(scenario.messages.length).toBeGreaterThan(0)
      }
    })

    it('each scenario has weight > 0', () => {
      for (const scenario of scenarios) {
        expect(scenario.weight).toBeGreaterThan(0)
      }
    })

    it('each scenario has a non-empty id', () => {
      for (const scenario of scenarios) {
        expect(typeof scenario.id).toBe('string')
        expect(scenario.id.length).toBeGreaterThan(0)
      }
    })

    it('all scenario ids are unique', () => {
      const ids = scenarios.map(s => s.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('standup_meeting scenario has receiverId === "all"', () => {
      const standup = scenarios.find(s => s.id === 'standup_meeting')
      expect(standup).toBeDefined()
      expect(standup!.receiverId).toBe('all')
    })

    it('each scenario receiverId is either a valid agent or "all"', () => {
      for (const scenario of scenarios) {
        const validReceiver = scenario.receiverId === 'all' || VALID_AGENT_IDS.includes(scenario.receiverId as AgentId)
        expect(validReceiver).toBe(true)
      }
    })
  })

  describe('pickWeightedScenario', () => {
    it('returns null for empty pool', () => {
      expect(pickWeightedScenario([])).toBeNull()
    })

    it('returns the only scenario when pool has one item', () => {
      const result = pickWeightedScenario([scenarios[0]])
      expect(result).toEqual(scenarios[0])
    })

    it('always returns a scenario from the provided pool', () => {
      for (let i = 0; i < 50; i++) {
        const result = pickWeightedScenario(scenarios)
        expect(result).not.toBeNull()
        expect(scenarios).toContain(result)
      }
    })

    it('higher weight items are selected more often over many iterations', () => {
      // Create a simple pool: one high weight (10) and one low weight (1)
      const highWeight = { ...scenarios[0], id: 'high', weight: 10 }
      const lowWeight = { ...scenarios[1], id: 'low', weight: 1 }
      const pool = [highWeight, lowWeight]

      let highCount = 0
      let lowCount = 0
      const iterations = 1000

      for (let i = 0; i < iterations; i++) {
        const result = pickWeightedScenario(pool)
        if (result!.id === 'high') highCount++
        else lowCount++
      }

      // With weight 10:1, high should be picked ~10x more often.
      // With 1000 iterations, high should be picked at least 700 times (generous threshold).
      expect(highCount).toBeGreaterThan(lowCount)
      expect(highCount).toBeGreaterThan(600)
    })
  })
})
