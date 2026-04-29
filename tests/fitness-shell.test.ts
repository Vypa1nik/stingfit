import { describe, expect, test } from 'vitest'

import { APP_NAME, VIEW_NAV_ITEMS, WORKSPACE_NAV_ITEMS } from '@/lib/constants'
import { SHORTCUTS } from '@/lib/shortcuts'

describe('fitness shell configuration', () => {
  test('uses fitness-first branding and primary navigation', () => {
    expect(APP_NAME).toBe('StingFit')
    expect(VIEW_NAV_ITEMS.map((item) => [item.id, item.label, item.path])).toEqual([
      ['fitness', 'Tréning', '/training'],
      ['plans', 'Plány', '/plans'],
      ['history', 'História', '/history'],
      ['stats', 'Štatistiky', '/stats'],
    ])
    expect(WORKSPACE_NAV_ITEMS).toEqual([])
  })

  test('documents fitness quick navigation', () => {
    expect(SHORTCUTS).toContainEqual(
      expect.objectContaining({
        group: 'Navigate',
        label: 'Prejsť na tréning',
        keys: 'Cmd/Ctrl + D',
      }),
    )
    expect(SHORTCUTS).toContainEqual(
      expect.objectContaining({
        group: 'Navigate',
        label: 'Rýchla navigácia 1–5',
        description: 'Prepínať medzi Tréningom, Plánmi, Históriou, Štatistikami a Nastaveniami.',
      }),
    )
  })
})
