import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function createEditablePlan() {
  await fitnessRepository.seedStarterData()
  const exercise = await fitnessRepository.createExercise({ name: 'Cable Fly', category: 'chest', defaultRestSeconds: 75 })
  const plan = await fitnessRepository.createBlankPersonalPlan({ name: 'Cleanup Block', goal: 'Fix mistakes fast' })
  const structure = await fitnessRepository.getPlanStructure(plan.id)
  const week = structure.weeks[0]
  if (!week) {
    throw new Error('Week missing')
  }

  const day = await fitnessRepository.addPlanDay(week.id, { dayIndex: 0, label: 'Chest Day' })
  const workout = await fitnessRepository.addPlanWorkout(day.id, { name: 'Chest Builder' })
  const planned = await fitnessRepository.addPlanExercise(workout.id, {
    exerciseId: exercise.id,
    targetSets: 3,
    minReps: 12,
    maxReps: 15,
    targetRir: 2,
    restSeconds: 75,
  })

  return { plan, week, day, workout, exercise, planned }
}

describe('fitness plan cleanup repository', () => {
  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
  })

  afterEach(async () => {
    await resetDatabaseState()
  })

  test('removes planned exercises, workouts, and days with cascading plan cleanup', async () => {
    const { plan, day, workout, exercise, planned } = await createEditablePlan()

    await fitnessRepository.removePlanExercise(planned.id)
    let structure = await fitnessRepository.getPlanStructure(plan.id)
    expect(structure.weeks[0]?.days[0]?.workouts[0]?.exercises).toEqual([])

    await fitnessRepository.addPlanExercise(workout.id, {
      exerciseId: exercise.id,
      targetSets: 3,
      minReps: 12,
      maxReps: 15,
      targetRir: 2,
      restSeconds: 75,
    })
    await fitnessRepository.removePlanWorkout(workout.id)
    structure = await fitnessRepository.getPlanStructure(plan.id)
    expect(structure.weeks[0]?.days[0]?.workouts).toEqual([])

    const rebuiltWorkout = await fitnessRepository.addPlanWorkout(day.id, { name: 'Chest Builder Rebuilt' })
    await fitnessRepository.addPlanExercise(rebuiltWorkout.id, {
      exerciseId: exercise.id,
      targetSets: 2,
      minReps: 10,
      maxReps: 12,
      targetRir: 2,
      restSeconds: 75,
    })
    await fitnessRepository.removePlanDay(day.id)
    structure = await fitnessRepository.getPlanStructure(plan.id)
    expect(structure.weeks[0]?.days).toEqual([])
  })

  test('throws clear errors when removing missing plan entities', async () => {
    await expect(fitnessRepository.removePlanExercise('missing-exercise')).rejects.toThrow('Fitness plan exercise not found')
    await expect(fitnessRepository.removePlanWorkout('missing-workout')).rejects.toThrow('Fitness plan workout not found')
    await expect(fitnessRepository.removePlanDay('missing-day')).rejects.toThrow('Fitness plan day not found')
  })
})
