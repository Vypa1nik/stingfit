import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessDashboard } from '@/features/fitness/FitnessDashboard'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 500))
}

async function createSimplePlan() {
  await fitnessRepository.seedStarterData()
  const starter = (await fitnessRepository.listStarterPlans()).find((plan) => plan.id === 'starter-full-body-3x')
  if (!starter) {
    throw new Error('Full-body starter missing')
  }

  await fitnessRepository.createPersonalPlanFromStarter(starter.id, { name: 'Môj jednoduchý 3-dňový plán', goal: 'Začať pravidelne' })
}

describe('FitnessDashboard beginner training focus', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
    await createSimplePlan()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(async () => {
    act(() => {
      root.unmount()
    })
    container.remove()
    await resetDatabaseState()
  })

  test('focuses a new user on one first workout instead of a dense workout list', async () => {
    await act(async () => {
      root.render(<FitnessDashboard />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Dnes stačí spustiť jeden tréning')
    expect(container.textContent).toContain('Tvoj prvý tréning')
    expect(container.textContent).toContain('Celé telo A')
    expect(container.textContent).toContain('Nerieš celý plán naraz')
    expect(container.textContent).toContain('Ukázať všetky tréningy')
    expect(container.textContent).not.toContain('Nabitý tréning')
    expect(container.textContent).not.toContain('Spustiteľné tréningy')
  })
})
