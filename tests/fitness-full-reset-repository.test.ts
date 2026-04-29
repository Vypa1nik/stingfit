import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function createPplPlan() {
  await fitnessRepository.seedStarterData()
  const starter = (await fitnessRepository.listStarterPlans()).find((plan) => plan.name === 'Tlak / Ťah / Nohy')
  if (!starter) {
    throw new Error('PPL starter missing')
  }

  await fitnessRepository.createPersonalPlanFromStarter(starter.id, { name: 'My PPL Block', goal: 'Build muscle' })
}

async function finishFirstWorkout() {
  const workout = (await fitnessRepository.listStartableWorkouts())[0]
  if (!workout) {
    throw new Error('No startable workout')
  }

  const session = await fitnessRepository.startSessionFromPlanWorkout(workout.workoutId)
  await fitnessRepository.finishSession(session.id)
}

describe('fitness full reset repository safety', () => {
  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
  })

  afterEach(async () => {
    await resetDatabaseState()
  })

  test('clears fitness data and restores default fitness settings', async () => {
    await createPplPlan()
    await fitnessRepository.createExercise({ name: 'Custom Curl', category: 'arms', defaultRestSeconds: 60 })
    await finishFirstWorkout()
    await fitnessRepository.updateSettings({ displayUnit: 'lb', showGuidance: false })

    await expect(fitnessRepository.listPersonalPlans()).resolves.toHaveLength(1)
    await expect(fitnessRepository.listCompletedSessions()).resolves.toHaveLength(1)

    await fitnessRepository.resetFitnessData()

    await expect(fitnessRepository.listExercises()).resolves.toHaveLength(0)
    await expect(fitnessRepository.listStarterPlans()).resolves.toHaveLength(0)
    await expect(fitnessRepository.listPersonalPlans()).resolves.toHaveLength(0)
    await expect(fitnessRepository.listCompletedSessions()).resolves.toHaveLength(0)
    await expect(fitnessRepository.getSettings()).resolves.toMatchObject({ displayUnit: 'kg', showGuidance: true })
  })
})
