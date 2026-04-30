import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessPlansPage } from '@/features/fitness/FitnessPlansPage'
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

describe('FitnessPlansPage beginner summary', () => {
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

  test('shows a simple plan summary before the advanced editor', async () => {
    await act(async () => {
      root.render(<FitnessPlansPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Môj plán bez stresu')
    expect(container.textContent).toContain('Nemusíš nič upravovať')
    expect(container.textContent).toContain('3 tréningové dni')
    expect(container.textContent).toContain('Prvý tréning')
    expect(container.textContent).toContain('Celé telo A')
    expect(container.textContent).toContain('Prejsť na Tréning')

    const advancedSection = Array.from(container.querySelectorAll('details')).find((details) => details.textContent?.includes('Pokročilé úpravy plánu'))
    expect(advancedSection).toBeDefined()
    expect(advancedSection?.hasAttribute('open')).toBe(false)
    expect(advancedSection?.textContent).toContain('Editor plánu')
  })
})
