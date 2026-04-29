import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

describe('fitness plan structure metadata editing repository', () => {
  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
    await fitnessRepository.seedStarterData()
  })

  afterEach(async () => {
    await resetDatabaseState()
  })

  test('updates day slot/label and workout name/notes without changing planned exercises', async () => {
    const plan = await fitnessRepository.createBlankPersonalPlan({ name: 'Edit Block', goal: 'Refine structure' })
    const week = (await fitnessRepository.getPlanStructure(plan.id)).weeks[0]
    const benchPress = (await fitnessRepository.listExercises()).find((exercise) => exercise.name === 'Tlak na lavičke')
    if (!week || !benchPress) {
      throw new Error('Structure edit setup missing week or Tlak na lavičke')
    }

    const day = await fitnessRepository.addPlanDay(week.id, { dayIndex: 0, label: 'Push Day' })
    const workout = await fitnessRepository.addPlanWorkout(day.id, { name: 'Tlak Builder' })
    await fitnessRepository.addPlanExercise(workout.id, {
      exerciseId: benchPress.id,
      targetSets: 3,
      minReps: 6,
      maxReps: 8,
      targetRir: 1,
      restSeconds: 150,
    })

    const updatedDay = await fitnessRepository.updatePlanDay(day.id, { label: 'Upper Day', dayIndex: 2 })
    const updatedWorkout = await fitnessRepository.updatePlanWorkout(workout.id, { name: 'Vrch Builder', notes: 'Controlled tempo' })
    const structure = await fitnessRepository.getPlanStructure(plan.id)

    expect(updatedDay).toMatchObject({ label: 'Upper Day', dayIndex: 2 })
    expect(updatedWorkout).toMatchObject({ name: 'Vrch Builder', notes: 'Controlled tempo' })
    expect(structure.weeks[0]?.days[0]).toMatchObject({ label: 'Upper Day', dayIndex: 2 })
    expect(structure.weeks[0]?.days[0]?.workouts[0]).toMatchObject({ name: 'Vrch Builder', notes: 'Controlled tempo' })
    expect(structure.weeks[0]?.days[0]?.workouts[0]?.exercises[0]).toMatchObject({ exerciseName: 'Tlak na lavičke', targetSets: 3 })
  })
})
