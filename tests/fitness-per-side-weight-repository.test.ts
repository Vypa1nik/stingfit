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

describe('fitness per-side weight repository', () => {
  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
    await createPplPlan()
  })

  afterEach(async () => {
    await resetDatabaseState()
  })

  test('persists per-side weights and preserves them through local export/import', async () => {
    const workout = (await fitnessRepository.listStartableWorkouts())[0]
    if (!workout) {
      throw new Error('No startable workout')
    }

    const session = await fitnessRepository.startSessionFromPlanWorkout(workout.workoutId)
    const setId = session.exercises[0]?.sets[0]?.id
    expect(setId).toBeTruthy()

    const logged = await fitnessRepository.logSet(setId!, {
      weightKg: 42.5,
      reps: 10,
      rir: 2,
      weightEntryMode: 'per_side',
      leftWeightKg: 22.5,
      rightWeightKg: 20,
    })

    expect(logged.exercises[0]?.sets[0]).toMatchObject({
      weightKg: 42.5,
      reps: 10,
      rir: 2,
      status: 'completed',
      weightEntryMode: 'per_side',
      leftWeightKg: 22.5,
      rightWeightKg: 20,
    })

    const exported = await fitnessRepository.exportFitnessData()
    expect(exported.sessions[0]?.exercises[0]?.sets[0]).toMatchObject({
      weightEntryMode: 'per_side',
      leftWeightKg: 22.5,
      rightWeightKg: 20,
    })

    await fitnessRepository.resetFitnessData()
    await fitnessRepository.importFitnessData(exported, { mode: 'replace' })

    const restored = await fitnessRepository.getLiveSession(session.id)
    expect(restored.exercises[0]?.sets[0]).toMatchObject({
      weightKg: 42.5,
      weightEntryMode: 'per_side',
      leftWeightKg: 22.5,
      rightWeightKg: 20,
    })
  })
})
