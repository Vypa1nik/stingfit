import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessDashboard } from '@/features/fitness/FitnessDashboard'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 300))
}

async function createPplPlan() {
  await fitnessRepository.seedStarterData()
  const starter = (await fitnessRepository.listStarterPlans()).find((plan) => plan.name === 'Tlak / Ťah / Nohy')
  if (!starter) {
    throw new Error('PPL starter missing')
  }

  await fitnessRepository.createPersonalPlanFromStarter(starter.id, { name: 'My PPL Block', goal: 'Build muscle' })
}

describe('fitness session finish review UI', () => {
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

  test('captures session RPE, energy, and notes before finishing a workout', async () => {
    await act(async () => {
      root.render(<FitnessDashboard />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    const startButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Spustiť Tlakový deň A'))
    expect(startButton).toBeDefined()

    await act(async () => {
      startButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    const reviewButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Pridať krátku kontrolu'))
    expect(reviewButton).toBeDefined()

    await act(async () => {
      reviewButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Krátka kontrola pred uložením')

    const rpeInput = container.querySelector<HTMLInputElement>('input[aria-label="RPE tréningu"]')
    const energyInput = container.querySelector<HTMLInputElement>('input[aria-label="Energia"]')
    const notesInput = container.querySelector<HTMLTextAreaElement>('textarea[aria-label="Poznámky k tréningu"]')
    expect(rpeInput).toBeTruthy()
    expect(energyInput).toBeTruthy()
    expect(notesInput).toBeTruthy()

    await act(async () => {
      if (rpeInput) {
        rpeInput.value = '9'
        rpeInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
      if (energyInput) {
        energyInput.value = '4'
        energyInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
      if (notesInput) {
        notesInput.value = 'Strong press day. Sleep more before next push.'
        notesInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })

    const saveButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Uložiť kontrolu a dokončiť'))
    expect(saveButton).toBeDefined()

    await act(async () => {
      saveButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Tréning dokončený')
    const completed = (await fitnessRepository.listCompletedSessions())[0]
    expect(completed).toMatchObject({
      sessionRpe: 9,
      energyLevel: 4,
      notes: 'Strong press day. Sleep more before next push.',
    })
  })
})
