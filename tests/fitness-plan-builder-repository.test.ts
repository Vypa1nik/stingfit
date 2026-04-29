import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

describe('fitness plan builder repository', () => {
  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
    await fitnessRepository.seedStarterData()
  })

  afterEach(async () => {
    await resetDatabaseState()
  })

  test('creates a personal plan from the Tlak / Ťah / Nohy starter with week/day/workout structure', async () => {
    const starter = (await fitnessRepository.listStarterPlans()).find((plan) => plan.name === 'Tlak / Ťah / Nohy')
    expect(starter).toBeDefined()

    const plan = await fitnessRepository.createPersonalPlanFromStarter(starter!.id, {
      name: 'My PPL Block',
      goal: 'Build muscle',
    })

    const structure = await fitnessRepository.getPlanStructure(plan.id)

    expect(structure.plan).toMatchObject({ name: 'My PPL Block', kind: 'personal', sourceTemplateId: starter!.id })
    expect(structure.weeks).toHaveLength(1)
    expect(structure.weeks[0]?.days.map((day) => day.label)).toEqual(['Tlak A', 'Ťah A', 'Voľno', 'Nohy', 'Tlak B', 'Voľno', 'Ťah B'])
    expect(structure.weeks[0]?.days[0]?.workouts[0]?.exercises.map((exercise) => exercise.exerciseName)).toContain('Tlak na lavičke')
  })

  test('creates a blank personal plan with one empty week', async () => {
    const plan = await fitnessRepository.createBlankPersonalPlan({ name: 'Blank Strength Block', goal: 'Strength' })
    const structure = await fitnessRepository.getPlanStructure(plan.id)

    expect(structure.weeks).toHaveLength(1)
    expect(structure.weeks[0]?.days).toEqual([])
  })

  test('duplicates a week and creates the next week from an existing week', async () => {
    const starter = (await fitnessRepository.listStarterPlans())[0]
    const plan = await fitnessRepository.createPersonalPlanFromStarter(starter!.id, { name: 'Scale PPL', goal: 'Hypertrophy' })
    const structure = await fitnessRepository.getPlanStructure(plan.id)
    const firstWeek = structure.weeks[0]
    expect(firstWeek).toBeDefined()

    const duplicate = await fitnessRepository.duplicateWeek(firstWeek!.id)
    const next = await fitnessRepository.createNextWeekFromWeek(firstWeek!.id)
    const updated = await fitnessRepository.getPlanStructure(plan.id)

    expect(duplicate.weekNumber).toBe(2)
    expect(next.weekNumber).toBe(3)
    expect(updated.weeks.map((week) => week.weekNumber)).toEqual([1, 2, 3])
    expect(updated.weeks[1]?.days[0]?.workouts[0]?.exercises[0]?.exerciseName).toBe('Tlak na lavičke')
  })

  test('adds and edits a custom day, workout, and planned exercise', async () => {
    const exercise = await fitnessRepository.createExercise({ name: 'Cable Fly', category: 'chest', defaultRestSeconds: 75 })
    const plan = await fitnessRepository.createBlankPersonalPlan({ name: 'Custom Block', goal: 'Chest focus' })
    const structure = await fitnessRepository.getPlanStructure(plan.id)
    const week = structure.weeks[0]
    expect(week).toBeDefined()

    const day = await fitnessRepository.addPlanDay(week!.id, { dayIndex: 0, label: 'Chest Day', isRestDay: false })
    const workout = await fitnessRepository.addPlanWorkout(day.id, { name: 'Chest Builder', notes: 'Controlled reps' })
    const planned = await fitnessRepository.addPlanExercise(workout.id, {
      exerciseId: exercise.id,
      targetSets: 3,
      minReps: 10,
      maxReps: 12,
      targetRir: 2,
      restSeconds: 75,
      notes: 'Squeeze hard',
    })

    const updatedExercise = await fitnessRepository.updatePlanExercise(planned.id, {
      targetSets: 4,
      minReps: 8,
      maxReps: 10,
      targetRir: 1,
      restSeconds: 90,
    })
    await fitnessRepository.setPlanDayRest(day.id, true)

    const updated = await fitnessRepository.getPlanStructure(plan.id)

    expect(updatedExercise).toMatchObject({ targetSets: 4, minReps: 8, maxReps: 10, targetRir: 1, restSeconds: 90 })
    expect(updated.weeks[0]?.days[0]).toMatchObject({ label: 'Chest Day', isRestDay: true })
    expect(updated.weeks[0]?.days[0]?.workouts[0]?.exercises[0]).toMatchObject({ exerciseName: 'Cable Fly', targetSets: 4 })
  })
})
