import { create } from 'zustand'

import type { ToastMessage } from '@/types/common'

interface UiState {
  isSidebarCollapsed: boolean
  isMobileSidebarOpen: boolean
  isCommandPaletteOpen: boolean
  isShortcutsCheatsheetOpen: boolean
  toasts: ToastMessage[]
  toggleSidebar: () => void
  setMobileSidebarOpen: (value: boolean) => void
  setCommandPaletteOpen: (value: boolean) => void
  setShortcutsCheatsheetOpen: (value: boolean) => void
  pushToast: (toast: Omit<ToastMessage, 'id'>) => void
  dismissToast: (id: string) => void
}

export const useUiStore = create<UiState>((set) => ({
  isSidebarCollapsed: false,
  isMobileSidebarOpen: false,
  isCommandPaletteOpen: false,
  isShortcutsCheatsheetOpen: false,
  toasts: [],
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setMobileSidebarOpen: (value) => set({ isMobileSidebarOpen: value }),
  setCommandPaletteOpen: (value) => set({ isCommandPaletteOpen: value }),
  setShortcutsCheatsheetOpen: (value) => set({ isShortcutsCheatsheetOpen: value }),
  pushToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
    })),
  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}))
