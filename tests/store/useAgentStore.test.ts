import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useAgentStore } from '@/store/useAgentStore'
import { agentProfiles } from '@/data/agentProfiles'

// Build initial agents record from agentProfiles (mirrors store initialisation)
const initialAgents = agentProfiles.reduce<Record<string, unknown>>(
  (acc, agent) => {
    acc[agent.id] = agent
    return acc
  },
  {}
)

describe('useAgentStore', () => {
  beforeEach(() => {
    act(() => {
      useAgentStore.setState({ agents: initialAgents as never })
    })
  })

  describe('initial state', () => {
    it('has exactly 5 agents', () => {
      const { agents } = useAgentStore.getState()
      expect(Object.keys(agents).length).toBe(5)
    })

    it('contains luna, max, ava, sam, rio', () => {
      const { agents } = useAgentStore.getState()
      expect(agents['luna']).toBeDefined()
      expect(agents['max']).toBeDefined()
      expect(agents['ava']).toBeDefined()
      expect(agents['sam']).toBeDefined()
      expect(agents['rio']).toBeDefined()
    })
  })

  describe('setAgentPosition', () => {
    it('updates position for the specified agent', () => {
      act(() => {
        useAgentStore.getState().setAgentPosition('luna', { x: 5, y: 10, px: 160, py: 320 })
      })
      const { agents } = useAgentStore.getState()
      expect(agents['luna'].position).toEqual({ x: 5, y: 10, px: 160, py: 320 })
    })

    it('does not mutate other agents', () => {
      const maxBefore = useAgentStore.getState().agents['max'].position
      act(() => {
        useAgentStore.getState().setAgentPosition('luna', { x: 5, y: 10, px: 160, py: 320 })
      })
      expect(useAgentStore.getState().agents['max'].position).toEqual(maxBefore)
    })
  })

  describe('setAgentState', () => {
    it('updates state to walking', () => {
      act(() => {
        useAgentStore.getState().setAgentState('max', 'walking')
      })
      expect(useAgentStore.getState().agents['max'].state).toBe('walking')
    })

    it('updates state to talking', () => {
      act(() => {
        useAgentStore.getState().setAgentState('ava', 'talking')
      })
      expect(useAgentStore.getState().agents['ava'].state).toBe('talking')
    })

    it('does not mutate other agents state', () => {
      act(() => {
        useAgentStore.getState().setAgentState('max', 'walking')
      })
      expect(useAgentStore.getState().agents['luna'].state).toBe('idle')
    })
  })

  describe('setAgentDirection', () => {
    it('updates direction to up', () => {
      act(() => {
        useAgentStore.getState().setAgentDirection('luna', 'up')
      })
      expect(useAgentStore.getState().agents['luna'].direction).toBe('up')
    })

    it('updates direction to left', () => {
      act(() => {
        useAgentStore.getState().setAgentDirection('rio', 'left')
      })
      expect(useAgentStore.getState().agents['rio'].direction).toBe('left')
    })
  })

  describe('setAgentPath', () => {
    it('updates currentPath for the agent', () => {
      const path = [
        { x: 1, y: 1, px: 32, py: 32 },
        { x: 2, y: 1, px: 64, py: 32 },
      ]
      act(() => {
        useAgentStore.getState().setAgentPath('sam', path)
      })
      expect(useAgentStore.getState().agents['sam'].currentPath).toEqual(path)
    })

    it('setting empty path clears currentPath', () => {
      act(() => {
        useAgentStore.getState().setAgentPath('sam', [{ x: 1, y: 1, px: 32, py: 32 }])
        useAgentStore.getState().setAgentPath('sam', [])
      })
      expect(useAgentStore.getState().agents['sam'].currentPath).toEqual([])
    })
  })

  describe('setSpeechBubble', () => {
    it('sets the speech bubble text', () => {
      act(() => {
        useAgentStore.getState().setSpeechBubble('luna', 'Hello team!', 3000)
      })
      const bubble = useAgentStore.getState().agents['luna'].speechBubble
      expect(bubble).toBeDefined()
      expect(bubble!.text).toBe('Hello team!')
    })

    it('sets expiresAt approximately = Date.now() + duration', () => {
      const before = Date.now()
      act(() => {
        useAgentStore.getState().setSpeechBubble('luna', 'Hi', 5000)
      })
      const after = Date.now()
      const bubble = useAgentStore.getState().agents['luna'].speechBubble
      expect(bubble!.expiresAt).toBeGreaterThanOrEqual(before + 5000)
      expect(bubble!.expiresAt).toBeLessThanOrEqual(after + 5000)
    })
  })

  describe('clearSpeechBubble', () => {
    it('removes speech bubble from agent', () => {
      act(() => {
        useAgentStore.getState().setSpeechBubble('luna', 'Hello!', 3000)
        useAgentStore.getState().clearSpeechBubble('luna')
      })
      expect(useAgentStore.getState().agents['luna'].speechBubble).toBeUndefined()
    })

    it('does not affect other agents speech bubbles', () => {
      act(() => {
        useAgentStore.getState().setSpeechBubble('luna', 'Hello!', 3000)
        useAgentStore.getState().setSpeechBubble('max', 'Hi!', 3000)
        useAgentStore.getState().clearSpeechBubble('luna')
      })
      expect(useAgentStore.getState().agents['max'].speechBubble).toBeDefined()
    })
  })

  describe('updateAppearance', () => {
    it('merges partial appearance - updates hairColor only', () => {
      act(() => {
        useAgentStore.getState().updateAppearance('luna', { hairColor: '#ff0000' })
      })
      const { appearance } = useAgentStore.getState().agents['luna']
      expect(appearance.hairColor).toBe('#ff0000')
      // Other fields should remain unchanged
      expect(appearance.outfitColor).toBe(agentProfiles.find(a => a.id === 'luna')!.appearance.outfitColor)
    })

    it('merges partial appearance - updates outfitColor only', () => {
      const original = agentProfiles.find(a => a.id === 'max')!.appearance
      act(() => {
        useAgentStore.getState().updateAppearance('max', { outfitColor: '#abcdef' })
      })
      const { appearance } = useAgentStore.getState().agents['max']
      expect(appearance.outfitColor).toBe('#abcdef')
      expect(appearance.hairColor).toBe(original.hairColor)
      expect(appearance.skinColor).toBe(original.skinColor)
    })

    it('can update multiple appearance fields at once', () => {
      act(() => {
        useAgentStore.getState().updateAppearance('ava', { hairColor: '#111', skinColor: '#222' })
      })
      const { appearance } = useAgentStore.getState().agents['ava']
      expect(appearance.hairColor).toBe('#111')
      expect(appearance.skinColor).toBe('#222')
    })

    it('can update accessories', () => {
      act(() => {
        useAgentStore.getState().updateAppearance('sam', { accessories: ['glasses', 'hat'] })
      })
      expect(useAgentStore.getState().agents['sam'].appearance.accessories).toEqual(['glasses', 'hat'])
    })
  })
})
