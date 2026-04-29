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

const STRONG_CSV = `Date,Workout Name,Exercise Name,Set Order,Weight,Weight Unit,Reps,RPE,Notes,Workout Notes
2026-04-25 10:00:00,Push A,Bench Press,1,100,kg,8,8,,Imported from Strong
`

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

  test('previews Strong CSV and imports it as local completed workout history', async () => {
    await act(async () => {
      root.render(<FitnessSettingsPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea[aria-label="Import zo Strong CSV"]')
    expect(textarea).toBeTruthy()

    await act(async () => {
      if (textarea) {
        textarea.value = STRONG_CSV
        textarea.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })

    const previewButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Zobraziť náhľad Strong CSV'))
    expect(previewButton).toBeDefined()

    await act(async () => {
      previewButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Náhľad Strong CSV: 1 tréning, 1 cvik, 1 séria.')

    const importButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Importovať Strong CSV'))
    expect(importButton).toBeDefined()

    await act(async () => {
      importButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Strong CSV import hotový: 1 tréning, 1 cvik a 1 séria pridané do histórie.')
    expect((await fitnessRepository.listCompletedSessions())[0]).toMatchObject({ name: 'Push A', status: 'completed' })
  })

  test('previews pasted fitness JSON and restores it after confirmation', async () => {
    const exportJson = await createExportJson()
    await clearAllData()
    const confirmSpy = vi.spyOn(window, 'confirm')

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

    expect(container.textContent).toContain('Nahradiť tréningové dáta týmto JSON súborom?')

    const confirmRestoreButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.trim() === 'Nahradiť tréningové dáta')
    expect(confirmRestoreButton).toBeDefined()

    await act(async () => {
      confirmRestoreButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(confirmSpy).not.toHaveBeenCalled()
    expect(container.textContent).toContain('Import tréningových dát obnovený: 1 osobných plánov a 1 tréningových záznamov.')
    await expect(fitnessRepository.getSettings()).resolves.toMatchObject({ displayUnit: 'lb' })
    expect((await fitnessRepository.listPersonalPlans()).map((plan) => plan.name)).toContain('My PPL Block')
    expect((await fitnessRepository.listCompletedSessions())[0]).toMatchObject({ name: 'Tlakový deň A' })
  })
})
