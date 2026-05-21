import { describe, expect, test } from 'vitest'

import { sk } from '@/i18n/sk'
import {
  APP_NAME,
  PLAN_NAV_ITEMS,
  PROGRESS_NAV_ITEMS,
  TOOLS_NAV_ITEMS,
  TRAIN_NAV_ITEMS,
} from '@/lib/constants'
import { SHORTCUTS } from '@/lib/shortcuts'

describe('fitness shell configuration (V3 IA)', () => {
  test('uses fitness-first branding and the four V3 nav groups', () => {
    expect(APP_NAME).toBe('StingFit')

    expect(TRAIN_NAV_ITEMS.map((item) => [item.id, item.label, item.path])).toEqual([
      ['train', sk.fitness.nav.items.today, '/train'],
      ['quick', sk.fitness.nav.items.quickTraining, '/train/quick'],
    ])

    expect(PROGRESS_NAV_ITEMS.map((item) => [item.id, item.label, item.path])).toEqual([
      ['lifts', sk.fitness.nav.items.progressLifts, '/progress/lifts'],
      ['prs', sk.fitness.nav.items.progressPrs, '/progress/prs'],
      ['body', sk.fitness.nav.items.progressBody, '/progress/body'],
      ['journal', sk.fitness.nav.items.progressJournal, '/progress/journal'],
      ['history', sk.fitness.nav.items.progressHistory, '/progress/history'],
    ])

    expect(PLAN_NAV_ITEMS.map((item) => [item.id, item.label, item.path])).toEqual([
      ['plans', sk.fitness.nav.items.plans, '/plans'],
    ])

    expect(TOOLS_NAV_ITEMS.map((item) => [item.id, item.label, item.path])).toEqual([
      ['plates', sk.fitness.nav.items.plates, '/tools/plates'],
    ])
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
      }),
    )
  })
})
