import { useEffect } from 'react'

import { create } from 'zustand'

import { DEFAULT_THEME } from '@/lib/constants'
import type { ThemeMode } from '@/types/common'

const STORAGE_KEY = 'stingfit.theme.mode'

interface ThemeStore {
  mode: ThemeMode
  resolvedMode: 'light' | 'dark'
  setMode: (mode: ThemeMode) => void
}

function resolveTheme(mode: ThemeMode) {
  if (mode !== 'system') {
    return mode
  }

  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const getInitialMode = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME
  }

  const saved = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null
  if (saved === 'light' || saved === 'dark' || saved === 'system') {
    return saved
  }

  return DEFAULT_THEME
}

export const useThemeStore = create<ThemeStore>((set) => {
  const mode = getInitialMode()
  return {
    mode,
    resolvedMode: resolveTheme(mode),
    setMode: (nextMode) => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, nextMode)
      }
      set({ mode: nextMode, resolvedMode: resolveTheme(nextMode) })
    },
  }
})

export function useTheme() {
  const { mode, resolvedMode, setMode } = useThemeStore()

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', resolvedMode === 'dark')
    root.dataset.theme = resolvedMode
  }, [resolvedMode])

  useEffect(() => {
    if (mode !== 'system') {
      return undefined
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = () => {
      useThemeStore.setState({ resolvedMode: resolveTheme('system') })
    }
    media.addEventListener('change', listener)

    return () => media.removeEventListener('change', listener)
  }, [mode])

  return { mode, resolvedMode, setMode }
}
