import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useOfficeStore } from '@/store/useOfficeStore'
import type { FurnitureItem, OfficeTheme } from '@/types/office'
import { mapLayout } from '@/data/mapLayout'

// Minimal furniture list for resetting state
const defaultFurnitureSnapshot = useOfficeStore.getState().furniture

const getInitialState = () => ({
  furniture: defaultFurnitureSnapshot,
  rooms: mapLayout.rooms,
  activeTheme: 'dark' as OfficeTheme,
  isEditorMode: false,
})

const sampleFurniture: FurnitureItem = {
  id: 'test-chair',
  catalogId: 'chair_office',
  name: 'Test Chair',
  x: 5,
  y: 5,
  width: 1,
  height: 1,
  color: '#ffffff',
  walkable: false,
}

describe('useOfficeStore', () => {
  beforeEach(() => {
    act(() => {
      useOfficeStore.setState(getInitialState())
    })
  })

  describe('initial state', () => {
    it('has furniture items by default', () => {
      const { furniture } = useOfficeStore.getState()
      expect(furniture.length).toBeGreaterThan(0)
    })

    it('has activeTheme set to dark', () => {
      expect(useOfficeStore.getState().activeTheme).toBe('dark')
    })

    it('has isEditorMode set to false', () => {
      expect(useOfficeStore.getState().isEditorMode).toBe(false)
    })

    it('has rooms from mapLayout', () => {
      const { rooms } = useOfficeStore.getState()
      expect(rooms.length).toBe(mapLayout.rooms.length)
    })
  })

  describe('addFurniture', () => {
    it('adds item to furniture array', () => {
      const before = useOfficeStore.getState().furniture.length
      act(() => {
        useOfficeStore.getState().addFurniture(sampleFurniture)
      })
      expect(useOfficeStore.getState().furniture.length).toBe(before + 1)
    })

    it('added item can be found by id', () => {
      act(() => {
        useOfficeStore.getState().addFurniture(sampleFurniture)
      })
      const found = useOfficeStore.getState().furniture.find(f => f.id === 'test-chair')
      expect(found).toBeDefined()
      expect(found!.name).toBe('Test Chair')
    })

    it('added item preserves all properties', () => {
      act(() => {
        useOfficeStore.getState().addFurniture(sampleFurniture)
      })
      const found = useOfficeStore.getState().furniture.find(f => f.id === 'test-chair')
      expect(found).toEqual(sampleFurniture)
    })
  })

  describe('removeFurniture', () => {
    it('removes item by id', () => {
      act(() => {
        useOfficeStore.getState().addFurniture(sampleFurniture)
      })
      const before = useOfficeStore.getState().furniture.length
      act(() => {
        useOfficeStore.getState().removeFurniture('test-chair')
      })
      expect(useOfficeStore.getState().furniture.length).toBe(before - 1)
    })

    it('removed item is no longer in array', () => {
      act(() => {
        useOfficeStore.getState().addFurniture(sampleFurniture)
        useOfficeStore.getState().removeFurniture('test-chair')
      })
      const found = useOfficeStore.getState().furniture.find(f => f.id === 'test-chair')
      expect(found).toBeUndefined()
    })

    it('removing non-existent id does not change array length', () => {
      const before = useOfficeStore.getState().furniture.length
      act(() => {
        useOfficeStore.getState().removeFurniture('non-existent-id')
      })
      expect(useOfficeStore.getState().furniture.length).toBe(before)
    })
  })

  describe('moveFurniture', () => {
    it('updates x and y of existing item', () => {
      act(() => {
        useOfficeStore.getState().addFurniture(sampleFurniture)
        useOfficeStore.getState().moveFurniture('test-chair', 10, 15)
      })
      const found = useOfficeStore.getState().furniture.find(f => f.id === 'test-chair')
      expect(found!.x).toBe(10)
      expect(found!.y).toBe(15)
    })

    it('does not mutate other properties of the item', () => {
      act(() => {
        useOfficeStore.getState().addFurniture(sampleFurniture)
        useOfficeStore.getState().moveFurniture('test-chair', 10, 15)
      })
      const found = useOfficeStore.getState().furniture.find(f => f.id === 'test-chair')
      expect(found!.name).toBe('Test Chair')
      expect(found!.color).toBe('#ffffff')
    })

    it('does not affect other furniture items', () => {
      // 'furniture-meeting-table' is in the default set
      const tableBefore = useOfficeStore.getState().furniture.find(f => f.id === 'furniture-meeting-table')
      act(() => {
        useOfficeStore.getState().addFurniture(sampleFurniture)
        useOfficeStore.getState().moveFurniture('test-chair', 10, 15)
      })
      const tableAfter = useOfficeStore.getState().furniture.find(f => f.id === 'furniture-meeting-table')
      expect(tableAfter!.x).toBe(tableBefore!.x)
      expect(tableAfter!.y).toBe(tableBefore!.y)
    })
  })

  describe('setTheme', () => {
    it('updates activeTheme to modern', () => {
      act(() => {
        useOfficeStore.getState().setTheme('modern')
      })
      expect(useOfficeStore.getState().activeTheme).toBe('modern')
    })

    it('updates activeTheme to retro', () => {
      act(() => {
        useOfficeStore.getState().setTheme('retro')
      })
      expect(useOfficeStore.getState().activeTheme).toBe('retro')
    })

    it('updates activeTheme to neon', () => {
      act(() => {
        useOfficeStore.getState().setTheme('neon')
      })
      expect(useOfficeStore.getState().activeTheme).toBe('neon')
    })
  })

  describe('toggleEditorMode', () => {
    it('flips isEditorMode from false to true', () => {
      act(() => {
        useOfficeStore.getState().toggleEditorMode()
      })
      expect(useOfficeStore.getState().isEditorMode).toBe(true)
    })

    it('flips isEditorMode from true back to false', () => {
      act(() => {
        useOfficeStore.getState().toggleEditorMode()
        useOfficeStore.getState().toggleEditorMode()
      })
      expect(useOfficeStore.getState().isEditorMode).toBe(false)
    })
  })
})
