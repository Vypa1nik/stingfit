import { useEffect, useMemo, useState } from 'react'

import { Command, Search } from 'lucide-react'

import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useUiStore } from '@/lib/uiStore'
import type { AppAction } from '@/types/common'

interface CommandPaletteProps {
  actions: AppAction[]
}

export function CommandPalette({ actions }: CommandPaletteProps) {
  const isOpen = useUiStore((state) => state.isCommandPaletteOpen)
  const setOpen = useUiStore((state) => state.setCommandPaletteOpen)

  return (
    <Modal
      open={isOpen}
      onClose={() => setOpen(false)}
      title="Paleta príkazov"
      description="Prejdi kamkoľvek, niečo vytvor alebo spusti rýchlu akciu."
      className="max-w-xl"
    >
      <CommandPaletteContent actions={actions} setOpen={setOpen} />
    </Modal>
  )
}

function CommandPaletteContent({
  actions,
  setOpen,
}: CommandPaletteProps & {
  setOpen: (value: boolean) => void
}) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const filtered = useMemo(() => {
    const target = query.trim().toLowerCase()
    if (!target) {
      return actions
    }

    return actions.filter((action) =>
      [action.title, action.description, action.group, ...action.keywords]
        .join(' ')
        .toLowerCase()
        .includes(target),
    )
  }, [actions, query])

  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setSelectedIndex((value) => Math.min(value + 1, filtered.length - 1))
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setSelectedIndex((value) => Math.max(value - 1, 0))
      }
      if (event.key === 'Enter' && filtered[selectedIndex]) {
        event.preventDefault()
        filtered[selectedIndex].action()
        setOpen(false)
      }
    }

    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [filtered, selectedIndex, setOpen])

  return (
    <div className="space-y-4">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted dark:text-text-muted-dark" />
        <Input
          autoFocus
          className="pl-9"
          placeholder="Hľadať akcie"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1 scrollbar-subtle">
        {filtered.map((action, index) => (
          <button
            key={action.id}
            className={`flex w-full items-center justify-between rounded-lg border px-3 py-3 text-left transition-colors ${
              index === selectedIndex
                ? 'border-accent bg-accent-light/70 dark:bg-accent-dark/20'
                : 'border-border bg-white hover:bg-slate-50 dark:border-border-dark dark:bg-[#191919] dark:hover:bg-[#202020]'
            }`}
            onMouseEnter={() => setSelectedIndex(index)}
            onClick={() => {
              action.action()
              setOpen(false)
            }}
          >
            <div>
              <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark">{action.title}</p>
              <p className="mt-1 text-xs text-text-secondary dark:text-text-secondary-dark">{action.description}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted dark:text-text-muted-dark">
              <span>{action.group}</span>
              {action.shortcut ? (
                <span className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 dark:border-border-dark">
                  <Command className="size-3" />
                  {action.shortcut}
                </span>
              ) : null}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
