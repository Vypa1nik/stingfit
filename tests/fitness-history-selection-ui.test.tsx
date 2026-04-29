import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessHistoryPage } from '@/features/fitness/FitnessHistoryPage'
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

async function finishWorkout(workoutName: string, weightKg: number) {
  const workout = (await fitnessRepository.listStartableWorkouts()).find((item) => item.workoutName === workoutName)
  if (!workout) {
    throw new Error(`${workoutName} workout missing`)
  }

  const session = await fitnessRepository.startSessionFromPlanWorkout(workout.workoutId)
  const firstSet = session.exercises[0]?.sets[0]
  if (!firstSet) {
    throw new Error(`${workoutName} first set missing`)
  }

  await fitnessRepository.logSet(firstSet.id, { weightKg, reps: 8, rir: 1 })
  await fitnessRepository.finishSession(session.id)
  return session.id
}

describe('fitness history workout selection', () => {
  let container: HTMLDivElement
  let root: Root
  let olderSessionId: string

  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
    await createPplPlan()
    olderSessionId = await finishWorkout('Tlakový deň A', 90)
    await finishWorkout('Ťahový deň A', 120)
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

  test('shows the selected historical workout detail and keeps selection after correcting a set', async () => {
    await act(async () => {
      root.render(<FitnessHistoryPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    let selectedDetail = container.querySelector('[data-testid="selected-history-session"]')
    expect(selectedDetail).toBeTruthy()
    expect(selectedDetail?.textContent).toContain('Ťahový deň A')

    const openOlderButton = container.querySelector<HTMLButtonElement>('button[aria-label="Zobraziť detail tréningu Tlakový deň A"]')
    expect(openOlderButton).toBeTruthy()

    await act(async () => {
      openOlderButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    selectedDetail = container.querySelector('[data-testid="selected-history-session"]')
    expect(selectedDetail?.textContent).toContain('Tlakový deň A')
    expect(selectedDetail?.textContent).toContain('Tlak na lavičke')
    expect(selectedDetail?.textContent).not.toContain('Mŕtvy ťah')

    const editButton = container.querySelector<HTMLButtonElement>('button[aria-label="Opraviť historickú sériu 1 cviku Tlak na lavičke"]')
    expect(editButton).toBeTruthy()

    await act(async () => {
      editButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    const weightInput = container.querySelector<HTMLInputElement>('input[aria-label="Váha v kg"]')
    expect(weightInput).toBeTruthy()
    await act(async () => {
      if (weightInput) {
        weightInput.value = '95'
        weightInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })

    const saveButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Uložiť opravu série'))
    expect(saveButton).toBeDefined()

    await act(async () => {
      saveButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    selectedDetail = container.querySelector('[data-testid="selected-history-session"]')
    expect(selectedDetail?.textContent).toContain('Tlakový deň A')
    expect(selectedDetail?.textContent).toContain('95 kg × 8')
    expect(selectedDetail?.textContent).not.toContain('Mŕtvy ťah')

    const olderDetail = await fitnessRepository.getSessionHistoryDetail(olderSessionId)
    expect(olderDetail.exercises[0]?.sets[0]).toMatchObject({ weightKg: 95, correctionCount: 1 })
  })
})
