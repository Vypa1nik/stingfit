import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessHistoryPage } from '@/features/fitness/FitnessHistoryPage'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 300))
}

async function createHighStrainFinishedPushSession() {
  await fitnessRepository.seedStarterData()
  const starter = (await fitnessRepository.listStarterPlans()).find((plan) => plan.name === 'Tlak / Ťah / Nohy')
  if (!starter) {
    throw new Error('PPL starter missing')
  }

  await fitnessRepository.createPersonalPlanFromStarter(starter.id, { name: 'My PPL Block', goal: 'Build muscle' })
  const workout = (await fitnessRepository.listStartableWorkouts()).find((item) => item.workoutName === 'Tlakový deň A')
  if (!workout) {
    throw new Error('Tlakový deň A missing')
  }

  const session = await fitnessRepository.startSessionFromPlanWorkout(workout.workoutId)
  const benchPress = session.exercises[0]
  if (!benchPress) {
    throw new Error('Tlak na lavičke missing')
  }

  for (const set of benchPress.sets) {
    await fitnessRepository.logSet(set.id, { weightKg: 100, reps: 8, rir: 1 })
  }

  await fitnessRepository.finishSession(session.id, {
    sessionRpe: 9,
    energyLevel: 2,
    notes: 'Great numbers, but the session was a grind.',
  })
}

describe('quality-aware progression in history', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
    await createHighStrainFinishedPushSession()
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

  test('shows a hold-load plan signal when top-range performance had high strain', async () => {
    await act(async () => {
      root.render(<FitnessHistoryPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Signál plánu')
    expect(container.textContent).toContain('Tlak na lavičke: Nabudúce podrž váhu')
    expect(container.textContent).toContain('RPE 9/10')
    expect(container.textContent).toContain('energia 2/5')
  })
})
