import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, execute, resetDatabaseState } from '@/lib/database'

async function createPplPlan() {
  await fitnessRepository.seedStarterData()
  const starter = (await fitnessRepository.listStarterPlans()).find((plan) => plan.name === 'Tlak / Ťah / Nohy')
  if (!starter) {
    throw new Error('PPL starter missing')
  }

  return fitnessRepository.createPersonalPlanFromStarter(starter.id, { name: 'My PPL Block', goal: 'Build muscle' })
}

describe('fitness settings repository', () => {
  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
  })

  afterEach(async () => {
    await resetDatabaseState()
  })

  test('loads default kg settings and persists lb display unit', async () => {
    await expect(fitnessRepository.getSettings()).resolves.toMatchObject({ displayUnit: 'kg' })

    const updated = await fitnessRepository.updateSettings({ displayUnit: 'lb' })

    expect(updated).toMatchObject({ displayUnit: 'lb' })
    await expect(fitnessRepository.getSettings()).resolves.toMatchObject({ displayUnit: 'lb' })
  })

  test('resets starter data while preserving custom exercises and personal plans', async () => {
    await createPplPlan()
    const customExercise = await fitnessRepository.createExercise({ name: 'Cable Fly', category: 'chest', defaultRestSeconds: 75 })
    await execute(`DELETE FROM fitness_plans WHERE id = 'starter-push-pull-legs'`)

    const resetResult = await fitnessRepository.resetStarterData()

    expect(resetResult.starterPlanCount).toBe(3)
    expect((await fitnessRepository.listStarterPlans()).map((plan) => plan.name)).toContain('Tlak / Ťah / Nohy')
    expect((await fitnessRepository.listExercises()).map((exercise) => exercise.id)).toContain(customExercise.id)
    expect((await fitnessRepository.listPersonalPlans()).map((plan) => plan.name)).toContain('My PPL Block')
  })

  test('exports a local fitness payload with settings, plans, exercises, and sessions', async () => {
    await createPplPlan()
    await fitnessRepository.updateSettings({ displayUnit: 'lb' })
    const workout = (await fitnessRepository.listStartableWorkouts())[0]
    const session = await fitnessRepository.startSessionFromPlanWorkout(workout!.workoutId)
    await fitnessRepository.logSet(session.exercises[0]!.sets[0]!.id, { weightKg: 100, reps: 8, rir: 1 })
    await fitnessRepository.finishSession(session.id)

    const exported = await fitnessRepository.exportFitnessData()

    expect(exported).toMatchObject({ version: 1, settings: { displayUnit: 'lb' } })
    expect(exported.exercises.some((exercise) => exercise.name === 'Tlak na lavičke')).toBe(true)
    expect(exported.personalPlans.some((structure) => structure.plan.name === 'My PPL Block')).toBe(true)
    expect(exported.sessions[0]).toMatchObject({ name: 'Tlakový deň A', status: 'completed' })
  })
})
