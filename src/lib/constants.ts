import { sk } from '@/i18n/sk'
import type { ThemeMode } from '@/types/common'

export const APP_NAME = 'StingFit'
export const APP_VERSION = '3.0.0'
export const DATABASE_NAME = 'stingfit.db'
export const DATABASE_STORAGE_KEY = 'stingfit.sqlite.binary'
export const DEFAULT_THEME: ThemeMode = 'system'

/**
 * Sidebar groups for the V3 information architecture.
 *
 * Each top-level destination answers one question:
 *  - Train     — "what do I do right now?"
 *  - Progress  — "am I getting better?"
 *  - Plans     — "what's next?"
 *  - Tools     — small utilities
 *
 * Settings is the footer link rendered separately in `NavigationSidebar`.
 *
 * The `id` field maps into the `icons` lookup in `NavigationSidebar.tsx`,
 * so every new id must have an icon registered there.
 */
const navItems = sk.fitness.nav.items

export const TRAIN_NAV_ITEMS = [
  { id: 'train', label: navItems.today, path: '/train' },
  { id: 'quick', label: navItems.quickTraining, path: '/train/quick' },
] as const

export const PROGRESS_NAV_ITEMS = [
  { id: 'lifts', label: navItems.progressLifts, path: '/progress/lifts' },
  { id: 'prs', label: navItems.progressPrs, path: '/progress/prs' },
  { id: 'body', label: navItems.progressBody, path: '/progress/body' },
  { id: 'journal', label: navItems.progressJournal, path: '/progress/journal' },
  { id: 'history', label: navItems.progressHistory, path: '/progress/history' },
] as const

export const PLAN_NAV_ITEMS = [
  { id: 'plans', label: navItems.plans, path: '/plans' },
] as const

export const TOOLS_NAV_ITEMS = [
  { id: 'plates', label: navItems.plates, path: '/tools/plates' },
] as const

/**
 * Legacy export kept for any consumer still importing the old name.
 * V3 keeps it pointing at the Train group so it stays a valid fallback.
 */
export const VIEW_NAV_ITEMS = TRAIN_NAV_ITEMS
export const WORKSPACE_NAV_ITEMS = [] as const

export const THEME_OPTIONS: Array<{
  value: ThemeMode
  label: string
  description: string
}> = [
  { value: 'system', label: 'Podľa systému', description: 'StingFit nasleduje nastavenie zariadenia.' },
  { value: 'light', label: 'Svetlý režim', description: 'Čisté svetlé pozadie pre denné plánovanie.' },
  { value: 'dark', label: 'Tmavý režim', description: 'Kontrastný fitko režim pre tréning so slabším svetlom.' },
]
