import { readFileSync } from 'node:fs'

import { describe, expect, test } from 'vitest'

import { VIEW_NAV_ITEMS } from '@/lib/constants'
import { SHORTCUTS } from '@/lib/shortcuts'

describe('fitness navigation', () => {
  test('promotes the training screen as a primary view', () => {
    expect(VIEW_NAV_ITEMS[0]).toMatchObject({ id: 'fitness', label: 'Tréning', path: '/training' })
  })

  test('keeps only fitness routes in the application router', () => {
    const routerSource = readFileSync('src/router.tsx', 'utf8')

    expect(routerSource).toContain("path: '/training'")
    expect(routerSource).toContain("path: '/quick'")
    expect(routerSource).toContain("path: '/plans'")
    expect(routerSource).toContain("path: '/history'")
    expect(routerSource).toContain("path: '/stats'")
    expect(routerSource).toContain("path: '/settings'")
    expect(routerSource).not.toMatch(/path: '\/(notes|tasks|projects|inbox|today|archive|search|view)/)
    expect(routerSource).not.toContain('@/features/notes')
    expect(routerSource).not.toContain('@/features/tasks')
    expect(routerSource).not.toContain('@/features/projects')
    expect(routerSource).not.toContain('@/features/search')
    expect(routerSource).not.toContain('@/features/today')
    expect(routerSource).not.toContain('@/features/views')
  })

  test('fitness dashboard uses custom confirmation UI instead of native browser confirm', () => {
    const dashboardSource = readFileSync('src/features/fitness/FitnessDashboard.tsx', 'utf8')

    expect(dashboardSource).not.toContain('window.confirm')
  })

  test('fitness screens use SPA navigation instead of hard reloads', () => {
    const files = [
      'src/features/fitness/FitnessDashboard.tsx',
      'src/features/fitness/FitnessHistoryPage.tsx',
      'src/features/fitness/FitnessStatsPage.tsx',
    ]

    for (const file of files) {
      expect(readFileSync(file, 'utf8'), file).not.toContain('window.location.href')
    }
  })

  test('documents the training dashboard shortcut', () => {
    expect(SHORTCUTS).toContainEqual(
      expect.objectContaining({
        group: 'Navigate',
        label: 'Prejsť na tréning',
        keys: 'Cmd/Ctrl + D',
        description: 'Otvoriť živý tréningový panel odkiaľkoľvek.',
      }),
    )
  })
})
