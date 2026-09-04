import { create } from 'zustand'

interface UIState {
  captureOpen: boolean
  paletteOpen: boolean
  openCapture: () => void
  closeCapture: () => void
  setPalette: (open: boolean) => void
  togglePalette: () => void
}

export const useUIStore = create<UIState>((set) => ({
  captureOpen: false,
  paletteOpen: false,
  openCapture: () => set({ captureOpen: true }),
  closeCapture: () => set({ captureOpen: false }),
  setPalette: (open) => set({ paletteOpen: open }),
  togglePalette: () => set((state) => ({ paletteOpen: !state.paletteOpen })),
}))
