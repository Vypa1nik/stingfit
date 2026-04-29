import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function createStartedPushSession() {
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

  return fitnessRepository.startSessionFromPlanWorkout(workout.workoutId)
}

describe('fitness session review repository', () => {
  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
  })

  afterEach(async () => {
    await resetDatabaseState()
  })

  test('persists finish check-in metadata and preserves it through fitness export/import', async () => {
    const session = await createStartedPushSession()
    const finished = await fitnessRepository.finishSession(session.id, {
      notes: 'Heavy but crisp. Keep the wasp tempo next push day.',
      sessionRpe: 9,
      energyLevel: 4,
    })

    expect(finished).toMatchObject({
      status: 'completed',
      notes: 'Heavy but crisp. Keep the wasp tempo next push day.',
      sessionRpe: 9,
      energyLevel: 4,
    })

    await expect(fitnessRepository.getSessionHistoryDetail(session.id)).resolves.toMatchObject({
      notes: 'Heavy but crisp. Keep the wasp tempo next push day.',
      sessionRpe: 9,
      energyLevel: 4,
    })

    const exported = await fitnessRepository.exportFitnessData()
    expect(exported.sessions[0]).toMatchObject({
      notes: 'Heavy but crisp. Keep the wasp tempo next push day.',
      sessionRpe: 9,
      energyLevel: 4,
    })

    await fitnessRepository.importFitnessData(exported, { mode: 'replace' })
    const restored = (await fitnessRepository.listCompletedSessions())[0]

    expect(restored).toMatchObject({
      notes: 'Heavy but crisp. Keep the wasp tempo next push day.',
      sessionRpe: 9,
      energyLevel: 4,
    })
  })

  test('validates finish check-in rating ranges', async () => {
    const session = await createStartedPushSession()

    await expect(fitnessRepository.finishSession(session.id, { sessionRpe: 11 })).rejects.toThrow('RPE tréningu musí byť medzi 1 a 10')
    await expect(fitnessRepository.finishSession(session.id, { energyLevel: 0 })).rejects.toThrow('Energia musí byť medzi 1 a 5')
  })
})
