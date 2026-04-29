import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, test } from 'vitest'

import { FitnessHistoryPage } from '@/features/fitness/FitnessHistoryPage'
import { FitnessPlansPage } from '@/features/fitness/FitnessPlansPage'
import { FitnessSettingsPage } from '@/features/fitness/FitnessSettingsPage'
import { FitnessStatsPage } from '@/features/fitness/FitnessStatsPage'

function render(element: ReactNode) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)

  act(() => {
    root.render(element)
  })

  return { container, root }
}

describe('fitness page shells', () => {
  let roots: Root[] = []
  let containers: HTMLDivElement[] = []

  afterEach(() => {
    roots.forEach((root) => {
      act(() => root.unmount())
    })
    containers.forEach((container) => container.remove())
    roots = []
    containers = []
  })

  test('renders Plans with personal plan builder language', () => {
    const rendered = render(<FitnessPlansPage />)
    roots.push(rendered.root)
    containers.push(rendered.container)

    expect(rendered.container.textContent).toContain('Tvorba osobného plánu')
    expect(rendered.container.textContent).toContain('Tlak / Ťah / Nohy')
    expect(rendered.container.textContent).toContain('Duplikuj týždeň')
  })

  test('renders History, Stats, and Settings as fitness surfaces', () => {
    const history = render(<FitnessHistoryPage />)
    const stats = render(<FitnessStatsPage />)
    const settings = render(<FitnessSettingsPage />)
    roots.push(history.root, stats.root, settings.root)
    containers.push(history.container, stats.container, settings.container)

    expect(history.container.textContent).toContain('História tréningov')
    expect(stats.container.textContent).toContain('PR napätie')
    expect(settings.container.textContent).toContain('kg / lb')
  })
})
