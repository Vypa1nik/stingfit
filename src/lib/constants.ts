import type { ThemeMode } from '@/types/common'

export const APP_NAME = 'StingFit'
export const APP_VERSION = '2.0.0'
export const DATABASE_NAME = 'stingfit.db'
export const DATABASE_STORAGE_KEY = 'stingfit.sqlite.binary'
export const DEFAULT_THEME: ThemeMode = 'system'

export const VIEW_NAV_ITEMS = [
  { id: 'fitness', label: 'Tréning', path: '/training' },
  { id: 'plans', label: 'Plány', path: '/plans' },
  { id: 'history', label: 'História', path: '/history' },
  { id: 'stats', label: 'Štatistiky', path: '/stats' },
] as const

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
