import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessStatsPage } from '@/features/fitness/FitnessStatsPage'
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
  await fitnessRepository.finishSession(session.id, { sessionRpe: 8, energyLevel: 4, notes: '' })
}

describe('FitnessStatsPage simplified beginner overview', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
    await createFinishedPushSession()
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

  test('starts with this week training count before detailed analytics', async () => {
    await act(async () => {
      root.render(<FitnessStatsPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Ako sa ti darí?')
    expect(container.textContent).toContain('Tréningy tento týždeň')
    expect(container.textContent).toContain('1 tréning')
    expect(container.textContent).toContain('Objem tento týždeň')
    expect(container.textContent).toContain('2,400 kg')
    expect(container.textContent).toContain('Najlepší progres')
    expect(container.textContent).toContain('Tlak na lavičke · 126.7 kg e1RM')
    expect(container.textContent).toContain('Regenerácia')

    const details = Array.from(container.querySelectorAll('details')).find((element) => element.textContent?.includes('Podrobné grafy a odporúčania'))
    expect(details).toBeDefined()
    expect(details?.hasAttribute('open')).toBe(false)
    expect(details?.textContent).toContain('Konzistentnosť 12 týždňov')
  })
})
