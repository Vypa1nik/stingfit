import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessHistoryPage } from '@/features/fitness/FitnessHistoryPage'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 500))
}

async function createFinishedPushSession() {
  await fitnessRepository.seedStarterData()
  const starter = (await fitnessRepository.listStarterPlans()).find((plan) => plan.name === 'Tlak / Ťah / Nohy')
  if (!starter) {
    throw new Error('PPL starter missing')
  }

  await fitnessRepository.createPersonalPlanFromStarter(starter.id, { name: 'My PPL Block', goal: 'Build muscle' })
  const workout = (await fitnessRepository.listStartableWorkouts()).find((item) => item.workoutName === 'Tlakový deň A')
  if (!workout) {
    throw new Error('Tlakový deň A workout missing')
  }

  const session = await fitnessRepository.startSessionFromPlanWorkout(workout.workoutId)
  const benchPress = session.exercises[0]
  if (!benchPress) {
    throw new Error('Tlak na lavičke session exercise missing')
  }

  for (const set of benchPress.sets) {
    await fitnessRepository.logSet(set.id, { weightKg: 100, reps: 8, rir: 1 })
  }

  await fitnessRepository.finishSession(session.id)
  return session.id
}

describe('fitness history corrections UI', () => {
  let container: HTMLDivElement
  let root: Root
  let sessionId: string

  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
    sessionId = await createFinishedPushSession()
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

  test('shows repeated correction counts at the session level', async () => {
    const detailBeforeRender = await fitnessRepository.getSessionHistoryDetail(sessionId)
    const firstSetId = detailBeforeRender.exercises[0]?.sets[0]?.id
    if (!firstSetId) {
      throw new Error('First completed set missing')
    }

    await fitnessRepository.updateLoggedSet(firstSetId, { weightKg: 90, reps: 8, rir: 1 })
    await fitnessRepository.updateLoggedSet(firstSetId, { weightKg: 85, reps: 8, rir: 1 })

    await act(async () => {
      root.render(<FitnessHistoryPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(container.querySelector('[data-testid="history-session-list"]')?.textContent).toContain('1 opravená séria')
    expect(container.querySelector('[data-testid="history-session-list"]')?.textContent).toContain('2 opravy celkovo')
    expect(container.querySelector('[data-testid="selected-history-session"]')?.textContent).toContain('2 opravy celkovo')
    expect(container.querySelector('[data-testid="selected-history-session"]')?.textContent).toContain('Opravené 2×')
  })

  test('corrects a completed set from history without changing the plan snapshot boundary', async () => {
    await act(async () => {
      root.render(<FitnessHistoryPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('2,400 kg')
    expect(container.textContent).toContain('Úpravy plánu nemenia tento tréning.')
    expect(container.textContent).toContain('Opravy záznamu')

    const editButton = container.querySelector<HTMLButtonElement>('button[aria-label="Opraviť historickú sériu 1 cviku Tlak na lavičke"]')
    expect(editButton).toBeTruthy()

    await act(async () => {
      editButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Oprava série')

    const weightInput = container.querySelector<HTMLInputElement>('input[aria-label="Váha v kg"]')
    const repsInput = container.querySelector<HTMLInputElement>('input[aria-label="Opakovania"]')
    const rirInput = container.querySelector<HTMLInputElement>('input[aria-label="RIR"]')
    expect(weightInput).toBeTruthy()
    expect(repsInput).toBeTruthy()
    expect(rirInput).toBeTruthy()

    await act(async () => {
      if (weightInput && repsInput && rirInput) {
        weightInput.value = '80'
        weightInput.dispatchEvent(new Event('input', { bubbles: true }))
        repsInput.value = '7'
        repsInput.dispatchEvent(new Event('input', { bubbles: true }))
        rirInput.value = '0'
        rirInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })

    const failureButton = container.querySelector<HTMLButtonElement>('button[aria-label="Označiť sériu ako do zlyhania"]')
    expect(failureButton).toBeTruthy()
    await act(async () => {
      failureButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const saveButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Uložiť opravu série'))
    expect(saveButton).toBeDefined()

    await act(async () => {
      saveButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Séria v histórii opravená')
    expect(container.textContent).toContain('Obsahuje opravy')
    expect(container.textContent).toContain('1 opravená séria')
    expect(container.textContent).toContain('Opravené')
    expect(container.textContent).toContain('1×')
    expect(container.textContent).toContain('2,160 kg')
    expect(container.textContent).toContain('80 kg × 7 · RIR 0')
    expect(container.textContent).toContain('Do zlyhania')

    const detail = await fitnessRepository.getSessionHistoryDetail(sessionId)
    expect(detail.exercises[0]?.sets[0]).toMatchObject({ weightKg: 80, reps: 7, rir: 0, setType: 'failure', correctionCount: 1 })
    expect(detail.exercises[0]?.sets[0]?.correctedAt).toBeTruthy()
  })
})
