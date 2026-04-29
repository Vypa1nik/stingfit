import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function createFinishedExportableState() {
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
}

describe('fitness import repository', () => {
  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
  })

  afterEach(async () => {
    await resetDatabaseState()
  })

  test('previews a fitness export payload before mutating local data', async () => {
    await createFinishedExportableState()
    const exported = await fitnessRepository.exportFitnessData()

    const preview = fitnessRepository.previewFitnessImport(exported)

    expect(preview).toMatchObject({
      version: 1,
      displayUnit: 'lb',
      exerciseCount: 8,
      starterPlanCount: 3,
      personalPlanCount: 1,
      sessionCount: 1,
      completedSessionCount: 1,
    })
  })

  test('rejects invalid fitness import payloads with a useful error', () => {
    expect(() => fitnessRepository.previewFitnessImport({ version: 99 })).toThrow('Unsupported fitness import version')
    expect(() => fitnessRepository.previewFitnessImport({ version: 1, settings: {}, exercises: [] })).toThrow('Fitness import payload is missing plan arrays')
  })

  test('restores a fitness export payload in replace mode', async () => {
    await createFinishedExportableState()
    const exported = await fitnessRepository.exportFitnessData()

    await clearAllData()
    expect(await fitnessRepository.listPersonalPlans()).toHaveLength(0)

    const result = await fitnessRepository.importFitnessData(exported, { mode: 'replace' })

    expect(result).toMatchObject({ mode: 'replace', personalPlanCount: 1, sessionCount: 1 })
    await expect(fitnessRepository.getSettings()).resolves.toMatchObject({ displayUnit: 'lb' })
    expect((await fitnessRepository.listPersonalPlans()).map((plan) => plan.name)).toContain('My PPL Block')
    expect((await fitnessRepository.listCompletedSessions())[0]).toMatchObject({ name: 'Tlakový deň A', status: 'completed' })
  })
})
