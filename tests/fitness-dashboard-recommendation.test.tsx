import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessDashboard } from '@/features/fitness/FitnessDashboard'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 500))
}

async function createPplPlanAndCompletePushDay() {
  await fitnessRepository.seedStarterData()
  const starter = (await fitnessRepository.listStarterPlans()).find((plan) => plan.name === 'Tlak / Ťah / Nohy')
  if (!starter) {
    throw new Error('PPL starter missing')
  }

  await fitnessRepository.createPersonalPlanFromStarter(starter.id, { name: 'My PPL Block', goal: 'Build muscle' })
  const push = (await fitnessRepository.listStartableWorkouts()).find((workout) => workout.workoutName === 'Tlakový deň A')
  if (!push) {
    throw new Error('Tlakový deň A missing')
  }

  const session = await fitnessRepository.startSessionFromPlanWorkout(push.workoutId)
  await fitnessRepository.finishSession(session.id)
}

describe('FitnessDashboard workout recommendation', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
    await createPplPlanAndCompletePushDay()
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

  test('shows the next workout from completed local history', async () => {
    await act(async () => {
      root.render(<FitnessDashboard />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Nasleduje')
    expect(container.textContent).toContain('Odporúčaný ďalší tréning: Ťahový deň A')
    expect(container.textContent).toContain('Naposledy dokončené: Tlakový deň A')
    expect(container.textContent).toContain('Spustiť odporúčaný tréning: Ťahový deň A')
  })
})
