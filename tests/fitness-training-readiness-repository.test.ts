import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

describe('fitness training readiness repository', () => {
  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
    await fitnessRepository.seedStarterData()
  })

  afterEach(async () => {
    await resetDatabaseState()
  })

  test('only lists workouts with planned exercises as startable', async () => {
    const plan = await fitnessRepository.createBlankPersonalPlan({ name: 'Readiness Block', goal: 'Build a usable plan' })
    const structure = await fitnessRepository.getPlanStructure(plan.id)
    const week = structure.weeks[0]
    const benchPress = (await fitnessRepository.listExercises()).find((exercise) => exercise.name === 'Tlak na lavičke')
    if (!week || !benchPress) {
      throw new Error('Readiness test setup missing week or Tlak na lavičke')
    }

    const day = await fitnessRepository.addPlanDay(week.id, { dayIndex: 0, label: 'Chest Day' })
    const workout = await fitnessRepository.addPlanWorkout(day.id, { name: 'Chest Builder' })

    await expect(fitnessRepository.listStartableWorkouts()).resolves.not.toEqual(
      expect.arrayContaining([expect.objectContaining({ workoutId: workout.id, workoutName: 'Chest Builder' })]),
    )

    await fitnessRepository.addPlanExercise(workout.id, {
      exerciseId: benchPress.id,
      targetSets: 3,
      minReps: 6,
      maxReps: 8,
      targetRir: 1,
      restSeconds: 150,
    })

    await expect(fitnessRepository.listStartableWorkouts()).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ workoutId: workout.id, workoutName: 'Chest Builder' })]),
    )
  })

  test('uses only the active personal plan when one is selected', async () => {
    const starters = await fitnessRepository.listStarterPlans()
    const fullBodyStarter = starters.find((plan) => plan.name === 'Celé telo 3×')
    const upperLowerStarter = starters.find((plan) => plan.name === 'Vrch / Spodok')
    if (!fullBodyStarter || !upperLowerStarter) {
      throw new Error('Starter plans missing')
    }

    const fullBody = await fitnessRepository.createPersonalPlanFromStarter(fullBodyStarter.id, { name: 'Full Body', goal: 'Simple start' })
    const upperLower = await fitnessRepository.createPersonalPlanFromStarter(upperLowerStarter.id, { name: 'Upper Lower', goal: 'More days' })

    const allWorkouts = await fitnessRepository.listStartableWorkouts()
    expect(new Set(allWorkouts.map((workout) => workout.planId))).toEqual(new Set([fullBody.id, upperLower.id]))

    const active = await fitnessRepository.activatePersonalPlan(upperLower.id)
    expect(active).toMatchObject({ id: upperLower.id, status: 'active' })

    const filteredWorkouts = await fitnessRepository.listStartableWorkouts()
    expect(new Set(filteredWorkouts.map((workout) => workout.planId))).toEqual(new Set([upperLower.id]))

    const plans = await fitnessRepository.listPersonalPlans()
    expect(plans.find((plan) => plan.id === fullBody.id)?.status).toBe('draft')
    expect(plans.find((plan) => plan.id === upperLower.id)?.status).toBe('active')
  })

})
