import { useReducer } from 'react'
import type { PageEntry } from '../../types/pdf'

type Action =
  | { type: 'ADD_PAGES'; pages: PageEntry[] }
  | { type: 'REORDER'; fromId: string; toId: string }
  | { type: 'DELETE_PAGE'; id: string }
  | { type: 'ROTATE_PAGE'; id: string }
  | { type: 'TOGGLE_SELECT'; id: string }
  | { type: 'SELECT_ALL' }
  | { type: 'CLEAR' }

function reducer(state: PageEntry[], action: Action): PageEntry[] {
  switch (action.type) {
    case 'ADD_PAGES':
      return [...state, ...action.pages]
    case 'REORDER': {
      const fromIndex = state.findIndex((p) => p.id === action.fromId)
      const toIndex = state.findIndex((p) => p.id === action.toId)
      if (fromIndex === -1 || toIndex === -1) return state
      const next = state.slice()
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    }
    case 'DELETE_PAGE':
      return state.filter((p) => p.id !== action.id)
    case 'ROTATE_PAGE':
      return state.map((p) =>
        p.id === action.id ? { ...p, rotation: (p.rotation + 90) % 360 } : p,
      )
    case 'TOGGLE_SELECT':
      return state.map((p) => (p.id === action.id ? { ...p, selected: !p.selected } : p))
    case 'SELECT_ALL': {
      const allSelected = state.every((p) => p.selected)
      return state.map((p) => ({ ...p, selected: !allSelected }))
    }
    case 'CLEAR':
      return []
    default:
      return state
  }
}

export function usePageEntries(initial: PageEntry[] = []) {
  return useReducer(reducer, initial)
}
