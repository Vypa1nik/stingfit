import type { ShortcutDefinition } from '@/types/common'

export const SHORTCUTS: ShortcutDefinition[] = [
  {
    group: 'Create',
    label: 'Spustiť tréning',
    keys: 'Cmd/Ctrl + T',
    description: 'Prejsť rovno na živý tréningový zápis.',
  },
  {
    group: 'Create',
    label: 'Vytvoriť plán',
    keys: 'Cmd/Ctrl + N',
    description: 'Otvoriť tvorbu osobného tréningového plánu.',
  },
  {
    group: 'Global',
    label: 'Paleta príkazov',
    keys: 'Cmd/Ctrl + K',
    description: 'Otvoriť rýchlu navigáciu a akcie.',
  },
  {
    group: 'Global',
    label: 'Zobraziť skratky',
    keys: '?',
    description: 'Otvoriť prehľad klávesových skratiek mimo textových polí.',
  },
  {
    group: 'Navigate',
    label: 'Otvoriť históriu',
    keys: 'Cmd/Ctrl + F',
    description: 'Prejsť priamo do tréningovej histórie.',
  },
  {
    group: 'Navigate',
    label: 'Prejsť na tréning',
    keys: 'Cmd/Ctrl + D',
    description: 'Otvoriť živý tréningový panel odkiaľkoľvek.',
  },
  {
    group: 'Navigate',
    label: 'Nastavenia',
    keys: 'Cmd/Ctrl + ,',
    description: 'Otvoriť jednotky, predvoľby a lokálne dáta.',
  },
  {
    group: 'Navigate',
    label: 'Rýchla navigácia 1–5',
    keys: 'Cmd/Ctrl + 1-5',
    description: 'Prepínať medzi Tréningom, Plánmi, Históriou, Štatistikami a Nastaveniami.',
  },
  {
    group: 'Global',
    label: 'Zavrieť panel',
    keys: 'Escape',
    description: 'Zavrieť aktívne okno, panel alebo prekrytie.',
  },
]
