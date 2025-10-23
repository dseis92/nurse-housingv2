import { create } from 'zustand'

type UIState = {
  selectedId?: string
  open: (id: string) => void
  close: () => void
}

export const useUIStore = create<UIState>((set) => ({
  selectedId: undefined,
  open: (id) => set({ selectedId: id }),
  close: () => set({ selectedId: undefined })
}))
