import { useCallback, useMemo } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HashRouter, useNavigate } from 'react-router-dom'

import { AppShell } from '@/components/layout/AppShell'
import { AppErrorBoundary } from '@/components/ui/AppErrorBoundary'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { ShortcutsCheatsheet } from '@/components/ui/ShortcutsCheatsheet'
import { ToastHost } from '@/components/ui/ToastHost'
import { OnboardingFlow } from '@/features/onboarding/OnboardingFlow'
import { useDatabase } from '@/hooks/useDatabase'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useOnboarding } from '@/hooks/useOnboarding'
import { useTheme, useThemeStore } from '@/hooks/useTheme'
import { useUiStore } from '@/lib/uiStore'
import { AppRouter } from '@/router'
import type { AppAction } from '@/types/common'

const queryClient = new QueryClient()

function AppFrame() {
  const navigate = useNavigate()
  const { isReady, error } = useDatabase()
  const onboarding = useOnboarding()
  useTheme()
  useKeyboardShortcuts()
  const setCommandPaletteOpen = useUiStore((state) => state.setCommandPaletteOpen)
  const setShortcutsCheatsheetOpen = useUiStore((state) => state.setShortcutsCheatsheetOpen)
  const pushToast = useUiStore((state) => state.pushToast)
  const setMode = useThemeStore((state) => state.setMode)

  const handleBackupExport = useCallback(async () => {
    try {
      const { exportFitnessBackup } = await import('@/features/fitness/exportFitnessBackup')
      const filename = await exportFitnessBackup()
      pushToast({
        tone: 'success',
        title: 'Tréningová záloha exportovaná',
        description: `${filename} bol stiahnutý.`,
      })
    } catch (error) {
      pushToast({
        tone: 'error',
        title: 'Export tréningovej zálohy zlyhal',
        description: error instanceof Error ? error.message : 'StingFit nedokázal exportovať tréningovú zálohu.'
      })
      throw error
    }
  }, [pushToast])

  const actions = useMemo<AppAction[]>(
    () => [
      {
        id: 'go-training',
        title: 'Prejsť na tréning',
        description: 'Otvoriť živý tréningový panel.',
        group: 'Navigácia',
        shortcut: 'Cmd/Ctrl + D',
        keywords: ['training', 'fitness', 'workout', 'gym', 'dashboard'],
        action: () => navigate('/training'),
      },
      {
        id: 'go-plans',
        title: 'Prejsť na plány',
        description: 'Otvoriť štartovacie šablóny a tvorbu osobného plánu.',
        group: 'Navigácia',
        keywords: ['plans', 'program', 'template', 'split', 'builder'],
        action: () => navigate('/plans'),
      },
      {
        id: 'go-history',
        title: 'Prejsť na históriu',
        description: 'Otvoriť tréningový zápisník.',
        group: 'Navigácia',
        keywords: ['history', 'log', 'sessions', 'workouts'],
        action: () => navigate('/history'),
      },
      {
        id: 'go-stats',
        title: 'Prejsť na štatistiky',
        description: 'Otvoriť PR napätie a štatistiky progresu.',
        group: 'Navigácia',
        keywords: ['stats', 'progress', 'pr', 'volume'],
        action: () => navigate('/stats'),
      },
      {
        id: 'go-settings',
        title: 'Otvoriť nastavenia',
        description: 'Skontrolovať jednotky a lokálne dátové ovládanie.',
        group: 'Navigácia',
        keywords: ['settings', 'preferences', 'units', 'kg', 'lb'],
        action: () => navigate('/settings'),
      },
      {
        id: 'start-workout',
        title: 'Spustiť tréning',
        description: 'Prejsť na živý zápisník.',
        group: 'Vytvoriť',
        shortcut: 'Cmd/Ctrl + T',
        keywords: ['start', 'workout', 'train', 'log'],
        action: () => navigate('/training'),
      },
      {
        id: 'start-quick-workout',
        title: 'Spustiť rýchly tréning',
        description: 'Otvoriť zápisník bez plánu a pridať cviky až vo fitku.',
        group: 'Vytvoriť',
        keywords: ['quick', 'free', 'pump', 'workout', 'train', 'log'],
        action: () => navigate('/quick'),
      },
      {
        id: 'create-plan',
        title: 'Vytvoriť osobný plán',
        description: 'Otvoriť Plány a postaviť vlastný tréningový blok.',
        group: 'Vytvoriť',
        shortcut: 'Cmd/Ctrl + N',
        keywords: ['plan', 'personal', 'block', 'program'],
        action: () => navigate('/plans'),
      },
      {
        id: 'show-shortcuts',
        title: 'Zobraziť skratky',
        description: 'Otvoriť prehľad klávesových skratiek.',
        group: 'Zobraziť',
        shortcut: '?',
        keywords: ['shortcuts', 'keyboard', 'cheatsheet', 'help'],
        action: () => setShortcutsCheatsheetOpen(true),
      },
      {
        id: 'toggle-theme',
        title: 'Prepnúť tému',
        description: 'Prepnúť medzi svetlým a tmavým režimom.',
        group: 'Zobraziť',
        keywords: ['theme', 'light', 'dark'],
        action: () => setMode(document.documentElement.classList.contains('dark') ? 'light' : 'dark'),
      },
      {
        id: 'export-fitness',
        title: 'Otvoriť tréningový export',
        description: 'Otvoriť Nastavenia na export tréningového JSON.',
        group: 'Dáta',
        keywords: ['export', 'backup', 'download', 'json', 'fitness'],
        action: () => {
          navigate('/settings')
          setCommandPaletteOpen(false)
        },
      },
    ],
    [
      navigate,
      setCommandPaletteOpen,
      setMode,
      setShortcutsCheatsheetOpen,
    ],
  )

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-6 dark:bg-surface-dark">
        <div className="card-surface max-w-lg p-6">
          <h1 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">StingFit narazil na problém pri štarte</h1>
          <p className="mt-2 text-sm text-text-secondary dark:text-text-secondary-dark">{error}</p>
        </div>
      </div>
    )
  }

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-6 dark:bg-surface-dark">
        <div className="card-surface max-w-lg p-6">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-text-muted dark:text-text-muted-dark">Načítavam StingFit</p>
          <h1 className="mt-2 text-2xl font-semibold text-text-primary dark:text-text-primary-dark">Pripravujem tvoj lokálny tréningový priestor...</h1>
        </div>
      </div>
    )
  }

  return (
    <>
      <AppShell>
        <AppErrorBoundary onExportBackup={handleBackupExport}>
          <AppRouter />
        </AppErrorBoundary>
      </AppShell>

      <CommandPalette actions={actions} />
      <ShortcutsCheatsheet />
      <ToastHost />
      {onboarding.isVisible ? <OnboardingFlow /> : null}
    </>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <AppFrame />
      </HashRouter>
    </QueryClientProvider>
  )
}
