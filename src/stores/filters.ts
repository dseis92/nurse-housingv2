import { create } from 'zustand'
import type { Filters } from '../types'

type State = {
  filters: Filters
  setDates: (start?: string, end?: string) => void
  toggle: (k: keyof Omit<Filters,'dates'|'hospital'>) => void
  setHospital: (id?: string) => void
  reset: () => void
}
export const useFilterStore = create<State>((set) => ({
  filters: { dates: {} },
  setDates: (start, end) => set(s => ({ filters: { ...s.filters, dates: { start, end } } })),
  toggle: (k) => set(s => ({ filters: { ...s.filters, [k]: !s.filters[k] } as Filters })),
  setHospital: (id) => set(s => ({ filters: { ...s.filters, hospital: id } })),
  reset: () => set({ filters: { dates: {} } })
}))
