import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { FitnessSettingsPage } from '@/features/fitness/FitnessSettingsPage'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 1000))
}

async function createExportJson() {
  await fitnessRepository.seedStarterData()
  await fitnessRepository.updateSettings({ displayUnit: 'lb' })
  const starter = (await fitnessRepository.listStarterPlans()).find((plan) => plan.name === 'Tlak / Ťah / Nohy')
  if (!starter) {
    throw new Error('PPL starter missing')
  }

  await fitnessRepository.createPersonalPlanFromStarter(starter.id, { name: 'My PPL Block', goal: 'Build muscle' })
  const workout = (await fitnessRepository.listStartableWorkouts()).find((item) => item.workoutName === 'Tlakový deň A')
  if (!workout) {
    throw new Error('Push workout missing')
  }

  const session = await fitnessRepository.startSessionFromPlanWorkout(workout.workoutId)
  await fitnessRepository.logSet(session.exercises[0]!.sets[0]!.id, { weightKg: 100, reps: 8, rir: 1 })
  await fitnessRepository.finishSession(session.id)

  return JSON.stringify(await fitnessRepository.exportFitnessData())
}

describe('FitnessSettingsPage import flow', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
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

  test('previews pasted fitness JSON and restores it after confirmation', async () => {
    const exportJson = await createExportJson()
    await clearAllData()
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    await act(async () => {
      root.render(<FitnessSettingsPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea[aria-label="Import tréningového JSON"]')
    expect(textarea).toBeTruthy()

    await act(async () => {
      if (textarea) {
        textarea.value = exportJson
        textarea.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })

    const previewButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Zobraziť náhľad importu'))
    expect(previewButton).toBeDefined()

    await act(async () => {
      previewButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Náhľad importu: 1 osobných plánov, 1 tréningových záznamov, 1 dokončených.')

    const restoreButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Obnoviť tréningový JSON'))
    expect(restoreButton).toBeDefined()

    await act(async () => {
      restoreButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Import tréningových dát obnovený: 1 osobných plánov a 1 tréningových záznamov.')
    await expect(fitnessRepository.getSettings()).resolves.toMatchObject({ displayUnit: 'lb' })
    expect((await fitnessRepository.listPersonalPlans()).map((plan) => plan.name)).toContain('My PPL Block')
    expect((await fitnessRepository.listCompletedSessions())[0]).toMatchObject({ name: 'Tlakový deň A' })
  })
})
