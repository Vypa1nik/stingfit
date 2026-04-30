import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessDashboard } from '@/features/fitness/FitnessDashboard'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 500))
}

async function createPplPlan() {
  await fitnessRepository.seedStarterData()
  const starter = (await fitnessRepository.listStarterPlans()).find((plan) => plan.name === 'Tlak / Ťah / Nohy')
  if (!starter) {
    throw new Error('PPL starter missing')
  }

  await fitnessRepository.createPersonalPlanFromStarter(starter.id, { name: 'My PPL Block', goal: 'Build muscle' })
}

function findButton(container: HTMLDivElement, label: string) {
  const button = Array.from(container.querySelectorAll('button')).find((item) => item.textContent?.includes(label))
  expect(button).toBeDefined()
  return button
}

async function startWorkout(root: Root, container: HTMLDivElement) {
  await act(async () => {
    root.render(<FitnessDashboard />)
  })
  await act(async () => {
    await waitForAsyncUi()
  })

  await act(async () => {
    findButton(container, 'Spustiť Tlakový deň A')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await waitForAsyncUi()
  })
}

describe('FitnessDashboard simplified finish flow', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
    await createPplPlan()
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

  test('finishes immediately without forcing the RPE and energy check-in', async () => {
    await startWorkout(root, container)

    expect(container.textContent).toContain('Pridať krátku kontrolu')

    await act(async () => {
      findButton(container, 'Dokončiť tréning')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Tréning dokončený')
    expect(container.textContent).not.toContain('Kontrola pred dokončením')

    const completed = (await fitnessRepository.listCompletedSessions())[0]
    expect(completed).toMatchObject({ status: 'completed', sessionRpe: null, energyLevel: null, notes: '' })
  })
})
