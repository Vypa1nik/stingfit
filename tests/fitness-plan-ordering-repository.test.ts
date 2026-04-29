import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

describe('fitness plan constrained ordering repository', () => {
  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
    await fitnessRepository.seedStarterData()
  })

  afterEach(async () => {
    await resetDatabaseState()
  })

  test('moves workouts one slot inside the same day and treats boundary moves as safe no-ops', async () => {
    const plan = await fitnessRepository.createBlankPersonalPlan({ name: 'Workout Order Block', goal: 'Control workout order' })
    const week = (await fitnessRepository.getPlanStructure(plan.id)).weeks[0]
    if (!week) {
      throw new Error('Ordering setup missing week')
    }

    const day = await fitnessRepository.addPlanDay(week.id, { dayIndex: 0, label: 'Push Day' })
    const push = await fitnessRepository.addPlanWorkout(day.id, { name: 'Tlak Builder' })
    await fitnessRepository.addPlanWorkout(day.id, { name: 'Accessory Builder' })
    await fitnessRepository.addPlanWorkout(day.id, { name: 'Pump Finisher' })

    await fitnessRepository.movePlanWorkout((await getWorkoutByName(plan.id, 'Accessory Builder')).id, 'up')
    await expectWorkoutOrder(plan.id, ['Accessory Builder', 'Tlak Builder', 'Pump Finisher'])

    await fitnessRepository.movePlanWorkout((await getWorkoutByName(plan.id, 'Accessory Builder')).id, 'up')
    await expectWorkoutOrder(plan.id, ['Accessory Builder', 'Tlak Builder', 'Pump Finisher'])

    await fitnessRepository.movePlanWorkout(push.id, 'down')
    await expectWorkoutOrder(plan.id, ['Accessory Builder', 'Pump Finisher', 'Tlak Builder'])
  })

  test('moves planned exercises one slot inside the same workout and treats boundary moves as safe no-ops', async () => {
    const plan = await fitnessRepository.createBlankPersonalPlan({ name: 'Exercise Order Block', goal: 'Control exercise order' })
    const week = (await fitnessRepository.getPlanStructure(plan.id)).weeks[0]
    const exercises = await fitnessRepository.listExercises()
    const benchPress = exercises.find((exercise) => exercise.name === 'Tlak na lavičke')
    const barbellRow = exercises.find((exercise) => exercise.name === 'Príťahy veľkej činky v predklone')
    const squat = exercises.find((exercise) => exercise.name === 'Drep')
    if (!week || !benchPress || !barbellRow || !squat) {
      throw new Error('Ordering setup missing week or starter exercises')
    }

    const day = await fitnessRepository.addPlanDay(week.id, { dayIndex: 0, label: 'Full Body' })
    const workout = await fitnessRepository.addPlanWorkout(day.id, { name: 'Celé telo Builder' })
    const bench = await addExercise(workout.id, benchPress.id)
    await addExercise(workout.id, barbellRow.id)
    await addExercise(workout.id, squat.id)

    await fitnessRepository.movePlanExercise((await getPlannedExerciseByName(plan.id, 'Drep')).id, 'up')
    await expectExerciseOrder(plan.id, ['Tlak na lavičke', 'Drep', 'Príťahy veľkej činky v predklone'])

    await fitnessRepository.movePlanExercise(bench.id, 'up')
    await expectExerciseOrder(plan.id, ['Tlak na lavičke', 'Drep', 'Príťahy veľkej činky v predklone'])
  })
})

async function addExercise(workoutId: string, exerciseId: string) {
  return fitnessRepository.addPlanExercise(workoutId, {
    exerciseId,
    targetSets: 3,
    minReps: 6,
    maxReps: 8,
    targetRir: 1,
    restSeconds: 150,
  })
}

async function getWorkoutByName(planId: string, workoutName: string) {
  const structure = await fitnessRepository.getPlanStructure(planId)
  const workout = structure.weeks.flatMap((week) => week.days).flatMap((day) => day.workouts).find((item) => item.name === workoutName)
  if (!workout) {
    throw new Error(`Workout ${workoutName} missing`)
  }

  return workout
}

async function getPlannedExerciseByName(planId: string, exerciseName: string) {
  const structure = await fitnessRepository.getPlanStructure(planId)
  const planned = structure.weeks
    .flatMap((week) => week.days)
    .flatMap((day) => day.workouts)
    .flatMap((workout) => workout.exercises)
    .find((exercise) => exercise.exerciseName === exerciseName)
  if (!planned) {
    throw new Error(`Planned exercise ${exerciseName} missing`)
  }

  return planned
}

async function expectWorkoutOrder(planId: string, expected: string[]) {
  const structure = await fitnessRepository.getPlanStructure(planId)
  expect(structure.weeks[0]?.days[0]?.workouts.map((workout) => workout.name)).toEqual(expected)
}

async function expectExerciseOrder(planId: string, expected: string[]) {
  const structure = await fitnessRepository.getPlanStructure(planId)
  expect(structure.weeks[0]?.days[0]?.workouts[0]?.exercises.map((exercise) => exercise.exerciseName)).toEqual(expected)
}
