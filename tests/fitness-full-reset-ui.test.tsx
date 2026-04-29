import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { FitnessSettingsPage } from '@/features/fitness/FitnessSettingsPage'
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

describe('FitnessSettingsPage full fitness data reset', () => {
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
    vi.restoreAllMocks()
    await resetDatabaseState()
  })

  test('requires exact typed confirmation before deleting all local fitness data', async () => {
    const promptSpy = vi.spyOn(window, 'prompt')

    await act(async () => {
      root.render(<FitnessSettingsPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Nebezpečná zóna')
    expect(container.textContent).toContain('Vymazať tréningové dáta')

    promptSpy.mockReturnValueOnce('delete')
    await act(async () => {
      findButton(container, 'Vymazať tréningové dáta')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    await expect(fitnessRepository.listPersonalPlans()).resolves.toHaveLength(1)

    promptSpy.mockReturnValueOnce('VYMAZAT TRENING')
    await act(async () => {
      findButton(container, 'Vymazať tréningové dáta')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Tréningové dáta sú vymazané')
    await expect(fitnessRepository.listPersonalPlans()).resolves.toHaveLength(0)
    await expect(fitnessRepository.listExercises()).resolves.toHaveLength(0)
    await expect(fitnessRepository.getSettings()).resolves.toMatchObject({ displayUnit: 'kg', showGuidance: true })
  })
})
