import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

describe('fitness training start summary repository', () => {
  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
    await fitnessRepository.seedStarterData()
  })

  afterEach(async () => {
    await resetDatabaseState()
  })

  test('includes exercise count, planned set count, and first exercise for startable workouts', async () => {
    const starter = (await fitnessRepository.listStarterPlans()).find((plan) => plan.name === 'Tlak / Ťah / Nohy')
    if (!starter) {
      throw new Error('PPL starter missing')
    }

    await fitnessRepository.createPersonalPlanFromStarter(starter.id, { name: 'My PPL Block', goal: 'Build muscle' })
    const pushDay = (await fitnessRepository.listStartableWorkouts()).find((workout) => workout.workoutName === 'Tlakový deň A')

    expect(pushDay).toMatchObject({
      workoutName: 'Tlakový deň A',
      exerciseCount: 4,
      plannedSetCount: 12,
      firstExerciseName: 'Tlak na lavičke',
    })
  })
})
