import { Command, Dumbbell, Menu, Search, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { useUiStore } from '@/lib/uiStore'

export function TopBar() {
  const navigate = useNavigate()
  const setCommandPaletteOpen = useUiStore((state) => state.setCommandPaletteOpen)
  const setMobileSidebarOpen = useUiStore((state) => state.setMobileSidebarOpen)

  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-border bg-surface/90 px-4 py-4 backdrop-blur sm:px-6 md:flex-nowrap dark:border-border-dark dark:bg-surface-dark/90">
      <button
        type="button"
        aria-label="Otvoriť navigačné menu"
        className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-white text-text-secondary transition-colors hover:bg-slate-50 md:hidden dark:border-border-dark dark:bg-[#181818] dark:text-text-secondary-dark dark:hover:bg-[#1F1F1F]"
        onClick={() => setMobileSidebarOpen(true)}
      >
        <Menu className="size-5" />
      </button>

      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-border bg-white px-4 py-2 text-left text-sm text-text-secondary transition-colors hover:bg-slate-50 sm:min-w-[240px] dark:border-border-dark dark:bg-[#181818] dark:text-text-secondary-dark dark:hover:bg-[#1F1F1F]"
        aria-label="Otvoriť vyhľadávanie"
        onClick={() => {
          navigate('/history')
        }}
      >
        <Search className="size-4 shrink-0" />
        <span className="flex-1 truncate">Hľadať tréningy, plány, cviky</span>
        <span className="hidden items-center gap-1 rounded border border-border px-2 py-1 text-2xs uppercase tracking-[0.18em] sm:inline-flex dark:border-border-dark">
          <Command className="size-3" />
          K
        </span>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="secondary"
          className="hidden sm:inline-flex"
          leadingIcon={<Sparkles className="size-4" />}
          onClick={() => setCommandPaletteOpen(true)}
        >
          Príkazy
        </Button>
        <Button className="fitness-action" leadingIcon={<Dumbbell className="size-4" />} onClick={() => navigate('/training')}>
          <span className="sm:hidden">Tréning</span>
          <span className="hidden sm:inline">Spustiť tréning</span>
        </Button>
      </div>
    </header>
  )
}
