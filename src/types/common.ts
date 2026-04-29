export type ThemeMode = 'light' | 'dark' | 'system'

export interface ToastMessage {
  id: string
  title: string
  description?: string
  tone: 'success' | 'error' | 'info'
}

export interface AppAction {
  id: string
  title: string
  description: string
  group: string
  shortcut?: string
  keywords: string[]
  action: () => void
}

export interface ShortcutDefinition {
  group: string
  label: string
  keys: string
  description: string
}
