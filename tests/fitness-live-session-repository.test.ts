import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function createPplPlan() {
  await fitnessRepository.seedStarterData()
  const starter = (await fitnessRepository.listStarterPlans()).find((plan) => plan.name === 'Tlak / Ťah / Nohy')
  if (!starter) {
    throw new Error('PPL starter missing')
  }

  return fitnessRepository.createPersonalPlanFromStarter(starter.id, { name: 'My PPL Block', goal: 'Build muscle' })
}

describe('fitness live session repository', () => {
  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
  })

  afterEach(async () => {
    await resetDatabaseState()
  })

  test('starts a session by snapshotting a planned workout', async () => {
    await createPplPlan()
    const workouts = await fitnessRepository.listStartableWorkouts()
    expect(workouts[0]).toMatchObject({ workoutName: 'Tlakový deň A', planName: 'My PPL Block', weekNumber: 1, dayLabel: 'Tlak A' })

    const session = await fitnessRepository.startSessionFromPlanWorkout(workouts[0]!.workoutId)

    expect(session).toMatchObject({ name: 'Tlakový deň A', status: 'active' })
    expect(session.exercises[0]).toMatchObject({ nameSnapshot: 'Tlak na lavičke', categorySnapshot: 'hrudník', status: 'active', targetSets: 3 })
    expect(session.exercises[0]?.sets).toHaveLength(3)
    expect(session.exercises[0]?.sets[0]).toMatchObject({ status: 'planned', reps: 8, weightKg: 0 })
  })

  test('prevents duplicate active sessions and can abandon a recovered workout', async () => {
    await createPplPlan()
    const workout = (await fitnessRepository.listStartableWorkouts())[0]
    const started = await fitnessRepository.startSessionFromPlanWorkout(workout!.workoutId)

    await expect(fitnessRepository.startSessionFromPlanWorkout(workout!.workoutId)).rejects.toThrow(
      'Finish or abandon the active workout before starting another.',
    )

    const abandoned = await fitnessRepository.abandonSession(started.id)

    expect(abandoned).toMatchObject({ id: started.id, name: 'Tlakový deň A', status: 'abandoned' })
    expect(abandoned.completedAt).toBeTruthy()
    expect(abandoned.exercises[0]?.sets[0]?.status).toBe('skipped')
    await expect(fitnessRepository.getActiveSession()).resolves.toBeNull()
  })

  test('starts a quick session without requiring a plan', async () => {
    await fitnessRepository.seedStarterData()

    const quickSession = await fitnessRepository.startQuickSession()

    expect(quickSession).toMatchObject({
      name: 'Rýchly tréning',
      status: 'active',
      planId: null,
      planWorkoutId: null,
    })
    expect(quickSession.exercises).toHaveLength(0)

    await expect(fitnessRepository.startQuickSession()).rejects.toThrow('Finish or abandon the active workout before starting another.')

    const exercise = (await fitnessRepository.listExercises())[0]
    const withExercise = await fitnessRepository.addUnplannedExerciseToSession(quickSession.id, {
      exerciseId: exercise!.id,
      targetSets: 2,
    })

    expect(withExercise).toMatchObject({ planId: null, planWorkoutId: null })
    expect(withExercise.exercises[0]).toMatchObject({ nameSnapshot: exercise!.name, categorySnapshot: exercise!.category, targetSets: 2, status: 'active' })
  })

  test('hydrates each live exercise with the previous completed performance', async () => {
    await createPplPlan()
    const workout = (await fitnessRepository.listStartableWorkouts())[0]
    const firstSession = await fitnessRepository.startSessionFromPlanWorkout(workout!.workoutId)
    const firstSet = firstSession.exercises[0]!.sets[0]!

    await fitnessRepository.logSet(firstSet.id, { weightKg: 80, reps: 8, rir: 2 })
    await fitnessRepository.finishSession(firstSession.id)

    const nextSession = await fitnessRepository.startSessionFromPlanWorkout(workout!.workoutId)

    expect(nextSession.exercises[0]?.lastPerformance).toMatchObject({
      weightKg: 80,
      reps: 8,
      rir: 2,
    })
    expect(nextSession.exercises[0]?.lastPerformance?.completedAt).toBeTruthy()
  })

  test('edits a completed set without changing its original completion timestamp', async () => {
    await createPplPlan()
    const workout = (await fitnessRepository.listStartableWorkouts())[0]
    const started = await fitnessRepository.startSessionFromPlanWorkout(workout!.workoutId)
    const firstSet = started.exercises[0]!.sets[0]!

    const afterLog = await fitnessRepository.logSet(firstSet.id, { weightKg: 60, reps: 8, rir: 2 })
    const completedAt = afterLog.exercises[0]!.sets[0]!.completedAt
    expect(completedAt).toBeTruthy()

    const afterEdit = await fitnessRepository.updateLoggedSet(firstSet.id, {
      weightKg: 42.5,
      reps: 10,
      rir: 0,
      setType: 'failure',
      weightEntryMode: 'per_side',
      leftWeightKg: 22.5,
      rightWeightKg: 20,
    })

    expect(afterEdit.exercises[0]?.sets[0]).toMatchObject({
      status: 'completed',
      completedAt,
      weightKg: 42.5,
      reps: 10,
      rir: 0,
      setType: 'failure',
      weightEntryMode: 'per_side',
      leftWeightKg: 22.5,
      rightWeightKg: 20,
      correctionCount: 1,
    })
    expect(afterEdit.exercises[0]?.sets[0]?.correctedAt).toBeTruthy()

    const afterSecondEdit = await fitnessRepository.updateLoggedSet(firstSet.id, { weightKg: 45, reps: 9, rir: 1 })
    expect(afterSecondEdit.exercises[0]?.sets[0]).toMatchObject({ correctionCount: 2, weightKg: 45, reps: 9, rir: 1 })

    const exported = await fitnessRepository.exportFitnessData()
    expect(exported.sessions.find((session) => session.id === started.id)?.exercises[0]).toMatchObject({ categorySnapshot: 'hrudník' })
    expect(exported.sessions.find((session) => session.id === started.id)?.exercises[0]?.sets[0]).toMatchObject({ correctionCount: 2 })

    await fitnessRepository.resetFitnessData()
    await fitnessRepository.importFitnessData(exported, { mode: 'replace' })
    const restored = await fitnessRepository.getLiveSession(started.id)
    expect(restored.exercises[0]).toMatchObject({ categorySnapshot: 'hrudník' })
    expect(restored.exercises[0]?.sets[0]).toMatchObject({ correctionCount: 2, correctedAt: afterSecondEdit.exercises[0]?.sets[0]?.correctedAt })

    await expect(fitnessRepository.updateLoggedSet(started.exercises[0]!.sets[1]!.id, { weightKg: 10, reps: 5, rir: 2 })).rejects.toThrow(
      'Only completed sets can be edited.',
    )
  })

  test('logs sets, adds and removes a set, skips an exercise, adds an unplanned exercise, and finishes', async () => {
    await createPplPlan()
    const workout = (await fitnessRepository.listStartableWorkouts())[0]
    const started = await fitnessRepository.startSessionFromPlanWorkout(workout!.workoutId)
    const firstExercise = started.exercises[0]!
    const firstSet = firstExercise.sets[0]!

    const afterLog = await fitnessRepository.logSet(firstSet.id, { weightKg: 97.5, reps: 8, rir: 1 })
    expect(afterLog.exercises[0]?.sets[0]).toMatchObject({ status: 'completed', weightKg: 97.5, reps: 8, rir: 1 })

    const addedSet = await fitnessRepository.addSessionSet(firstExercise.id)
    expect(addedSet.setNumber).toBe(4)
    expect(addedSet).toMatchObject({ weightKg: 97.5, reps: 8, rir: 1, status: 'planned' })

    await fitnessRepository.removeSessionSet(addedSet.id)
    const afterRemove = await fitnessRepository.getLiveSession(started.id)
    expect(afterRemove.exercises[0]?.sets).toHaveLength(3)

    const skipped = await fitnessRepository.skipSessionExercise(firstExercise.id)
    expect(skipped.exercises[0]?.status).toBe('skipped')
    expect(skipped.exercises[1]?.status).toBe('active')

    const cableFly = await fitnessRepository.createExercise({ name: 'Cable Fly', category: 'chest', defaultRestSeconds: 75 })
    const withUnplanned = await fitnessRepository.addUnplannedExerciseToSession(started.id, { exerciseId: cableFly.id, targetSets: 2 })
    expect(withUnplanned.exercises.at(-1)).toMatchObject({ nameSnapshot: 'Cable Fly', targetSets: 2 })

    const finished = await fitnessRepository.finishSession(started.id)
    expect(finished.status).toBe('completed')
    expect(finished.completedAt).toBeTruthy()
    await expect(fitnessRepository.getActiveSession()).resolves.toBeNull()

    const completedSessions = await fitnessRepository.listCompletedSessions()
    expect(completedSessions[0]).toMatchObject({ id: started.id, name: 'Tlakový deň A', status: 'completed' })

    const historyDetail = await fitnessRepository.getSessionHistoryDetail(started.id)
    expect(historyDetail.exercises[0]?.sets[0]).toMatchObject({ status: 'completed', weightKg: 97.5, reps: 8 })
  })
})
