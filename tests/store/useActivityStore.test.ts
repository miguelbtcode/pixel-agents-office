import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useActivityStore } from '@/store/useActivityStore'

// Snapshot of the default (empty) state to reset between tests
const emptyState = {
  entries: [],
  filter: {
    agents: [],
    types: [],
    rooms: [],
    searchText: '',
  },
}

describe('useActivityStore', () => {
  beforeEach(() => {
    act(() => {
      useActivityStore.setState(emptyState)
    })
  })

  describe('addEntry', () => {
    it('adds an entry with an auto-generated id', () => {
      act(() => {
        useActivityStore.getState().addEntry({
          agentId: 'luna',
          type: 'message',
          description: 'Hello world',
        })
      })
      const { entries } = useActivityStore.getState()
      expect(entries.length).toBe(1)
      expect(entries[0].id).toBeTruthy()
      expect(typeof entries[0].id).toBe('string')
    })

    it('adds an entry with a timestamp', () => {
      const before = Date.now()
      act(() => {
        useActivityStore.getState().addEntry({
          agentId: 'luna',
          type: 'message',
          description: 'Hello world',
        })
      })
      const after = Date.now()
      const { entries } = useActivityStore.getState()
      expect(entries[0].timestamp).toBeGreaterThanOrEqual(before)
      expect(entries[0].timestamp).toBeLessThanOrEqual(after)
    })

    it('stores the provided entry fields', () => {
      act(() => {
        useActivityStore.getState().addEntry({
          agentId: 'ava',
          type: 'bug_found',
          description: 'Found a bug',
          roomId: 'workspace',
        })
      })
      const { entries } = useActivityStore.getState()
      expect(entries[0].agentId).toBe('ava')
      expect(entries[0].type).toBe('bug_found')
      expect(entries[0].description).toBe('Found a bug')
      expect(entries[0].roomId).toBe('workspace')
    })

    it('prepends new entries (newest first)', () => {
      act(() => {
        useActivityStore.getState().addEntry({ agentId: 'luna', type: 'message', description: 'First' })
        useActivityStore.getState().addEntry({ agentId: 'max', type: 'message', description: 'Second' })
      })
      const { entries } = useActivityStore.getState()
      expect(entries[0].description).toBe('Second')
      expect(entries[1].description).toBe('First')
    })

    it('caps entries at 500 (oldest removed)', () => {
      act(() => {
        for (let i = 0; i < 505; i++) {
          useActivityStore.getState().addEntry({
            agentId: 'luna',
            type: 'message',
            description: `Entry ${i}`,
          })
        }
      })
      const { entries } = useActivityStore.getState()
      expect(entries.length).toBe(500)
    })

    it('after capping, oldest entries are removed (most recent kept)', () => {
      act(() => {
        for (let i = 0; i < 505; i++) {
          useActivityStore.getState().addEntry({
            agentId: 'luna',
            type: 'message',
            description: `Entry ${i}`,
          })
        }
      })
      const { entries } = useActivityStore.getState()
      // Newest is Entry 504 (added last), oldest kept should be Entry 5
      expect(entries[0].description).toBe('Entry 504')
    })
  })

  describe('clearEntries', () => {
    it('empties the entries array', () => {
      act(() => {
        useActivityStore.getState().addEntry({ agentId: 'luna', type: 'message', description: 'Test' })
        useActivityStore.getState().clearEntries()
      })
      expect(useActivityStore.getState().entries.length).toBe(0)
    })
  })

  describe('setFilter', () => {
    it('updates agents filter', () => {
      act(() => {
        useActivityStore.getState().setFilter({ agents: ['luna', 'max'] })
      })
      expect(useActivityStore.getState().filter.agents).toEqual(['luna', 'max'])
    })

    it('updates types filter', () => {
      act(() => {
        useActivityStore.getState().setFilter({ types: ['bug_found'] })
      })
      expect(useActivityStore.getState().filter.types).toEqual(['bug_found'])
    })

    it('updates searchText filter', () => {
      act(() => {
        useActivityStore.getState().setFilter({ searchText: 'hello' })
      })
      expect(useActivityStore.getState().filter.searchText).toBe('hello')
    })

    it('merges partial filter (preserves other filter fields)', () => {
      act(() => {
        useActivityStore.getState().setFilter({ agents: ['ava'] })
        useActivityStore.getState().setFilter({ searchText: 'test' })
      })
      const { filter } = useActivityStore.getState()
      expect(filter.agents).toEqual(['ava'])
      expect(filter.searchText).toBe('test')
    })
  })

  describe('getFilteredEntries', () => {
    beforeEach(() => {
      act(() => {
        useActivityStore.getState().addEntry({ agentId: 'luna', type: 'message', description: 'Luna says hello', roomId: 'workspace' })
        useActivityStore.getState().addEntry({ agentId: 'max', type: 'bug_found', description: 'Max found a BUG', roomId: 'workspace' })
        useActivityStore.getState().addEntry({ agentId: 'ava', type: 'deployment', description: 'Ava deployed', roomId: 'server_room' })
        useActivityStore.getState().addEntry({ agentId: 'sam', type: 'review', description: 'Sam reviewed code', roomId: 'meeting_room' })
      })
    })

    it('returns all entries when no filter is active', () => {
      const filtered = useActivityStore.getState().getFilteredEntries()
      expect(filtered.length).toBe(4)
    })

    it('filters by agentId correctly', () => {
      act(() => {
        useActivityStore.getState().setFilter({ agents: ['luna'] })
      })
      const filtered = useActivityStore.getState().getFilteredEntries()
      expect(filtered.length).toBe(1)
      expect(filtered[0].agentId).toBe('luna')
    })

    it('filters by multiple agentIds', () => {
      act(() => {
        useActivityStore.getState().setFilter({ agents: ['luna', 'max'] })
      })
      const filtered = useActivityStore.getState().getFilteredEntries()
      expect(filtered.length).toBe(2)
    })

    it('filters by type correctly', () => {
      act(() => {
        useActivityStore.getState().setFilter({ types: ['bug_found'] })
      })
      const filtered = useActivityStore.getState().getFilteredEntries()
      expect(filtered.length).toBe(1)
      expect(filtered[0].type).toBe('bug_found')
    })

    it('filters by searchText (case insensitive)', () => {
      act(() => {
        useActivityStore.getState().setFilter({ searchText: 'bug' })
      })
      const filtered = useActivityStore.getState().getFilteredEntries()
      expect(filtered.length).toBe(1)
      expect(filtered[0].agentId).toBe('max')
    })

    it('searchText filter is case insensitive', () => {
      act(() => {
        useActivityStore.getState().setFilter({ searchText: 'BUG' })
      })
      const filtered = useActivityStore.getState().getFilteredEntries()
      expect(filtered.length).toBe(1)
    })

    it('combines multiple filters (AND logic)', () => {
      act(() => {
        useActivityStore.getState().setFilter({ agents: ['max'], types: ['bug_found'] })
      })
      const filtered = useActivityStore.getState().getFilteredEntries()
      expect(filtered.length).toBe(1)
      expect(filtered[0].agentId).toBe('max')
    })

    it('returns empty array when filters match nothing', () => {
      act(() => {
        useActivityStore.getState().setFilter({ agents: ['rio'] })
      })
      const filtered = useActivityStore.getState().getFilteredEntries()
      expect(filtered.length).toBe(0)
    })

    it('filters by room', () => {
      act(() => {
        useActivityStore.getState().setFilter({ rooms: ['server_room'] })
      })
      const filtered = useActivityStore.getState().getFilteredEntries()
      expect(filtered.length).toBe(1)
      expect(filtered[0].agentId).toBe('ava')
    })
  })
})
