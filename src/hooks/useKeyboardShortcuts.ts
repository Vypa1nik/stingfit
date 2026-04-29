import { useEffect, useEffectEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { useUiStore } from '@/lib/uiStore'

function isTextEntryTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return Boolean(target.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]'))
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate()
  const setCommandPaletteOpen = useUiStore((state) => state.setCommandPaletteOpen)
  const setShortcutsCheatsheetOpen = useUiStore((state) => state.setShortcutsCheatsheetOpen)
  const setMobileSidebarOpen = useUiStore((state) => state.setMobileSidebarOpen)

  const handleShortcut = useEffectEvent(async (event: KeyboardEvent) => {
    const meta = event.metaKey || event.ctrlKey

    if (!meta) {
      if (event.key === 'Escape') {
        setCommandPaletteOpen(false)
        setShortcutsCheatsheetOpen(false)
        setMobileSidebarOpen(false)
        return
      }

      const isQuestionMark = event.key === '?' || (event.key === '/' && event.shiftKey)
      if (isQuestionMark && !isTextEntryTarget(event.target)) {
        event.preventDefault()
        setShortcutsCheatsheetOpen(true)
      }
      return
    }

    if (event.key.toLowerCase() === 'k') {
      event.preventDefault()
      setCommandPaletteOpen(true)
      return
    }

    if (event.key.toLowerCase() === 'f') {
      event.preventDefault()
      navigate('/history')
      return
    }

    if (event.key.toLowerCase() === 'd') {
      event.preventDefault()
      navigate('/training')
      return
    }

    if (event.key === ',') {
      event.preventDefault()
      navigate('/settings')
      return
    }

    if (event.key.toLowerCase() === 'n') {
      event.preventDefault()
      navigate('/plans')
      return
    }

    if (event.key.toLowerCase() === 't') {
      event.preventDefault()
      navigate('/training')
      return
    }

    if (['1', '2', '3', '4', '5'].includes(event.key)) {
      event.preventDefault()
      const mapping = ['/training', '/plans', '/history', '/stats', '/settings']
      navigate(mapping[Number(event.key) - 1] ?? '/')
    }
  })

  useEffect(() => {
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])
}
