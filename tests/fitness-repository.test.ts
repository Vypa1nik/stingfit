import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { clearAllData, resetDatabaseState } from '@/lib/database'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { STARTER_FITNESS_PLANS } from '@/features/fitness/fitnessSeed'

describe('fitnessRepository', () => {
  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
  })

  afterEach(async () => {
    await resetDatabaseState()
  })

  test('seeds starter exercises and starter plans idempotently', async () => {
    await fitnessRepository.seedStarterData()
    await fitnessRepository.seedStarterData()

    const exercises = await fitnessRepository.listExercises()
    const starterPlans = await fitnessRepository.listStarterPlans()

    expect(exercises.some((exercise) => exercise.name === 'Tlak na lavičke')).toBe(true)
    expect(exercises.some((exercise) => exercise.name === 'Drep')).toBe(true)
    expect(starterPlans.map((plan) => plan.name)).toEqual(STARTER_FITNESS_PLANS.map((plan) => plan.name))
  })

  test('creates custom exercises with trimmed names', async () => {
    const exercise = await fitnessRepository.createExercise({
      name: '  Cable Fly  ',
      category: 'chest',
      defaultRestSeconds: 75,
    })

    expect(exercise).toMatchObject({ name: 'Cable Fly', category: 'chest', defaultRestSeconds: 75, isCustom: true })

    const exercises = await fitnessRepository.listExercises()
    expect(exercises.find((item) => item.id === exercise.id)?.name).toBe('Cable Fly')
  })

  test('creates and lists personal plans separately from starter plans', async () => {
    await fitnessRepository.seedStarterData()
    const starterPlan = (await fitnessRepository.listStarterPlans())[0]

    const created = await fitnessRepository.createPersonalPlan({
      name: '  My Hypertrophy Block  ',
      goal: 'Build muscle',
      sourceTemplateId: starterPlan?.id,
    })

    expect(created).toMatchObject({ name: 'My Hypertrophy Block', goal: 'Build muscle', kind: 'personal', status: 'draft' })

    const personalPlans = await fitnessRepository.listPersonalPlans()
    const starterPlans = await fitnessRepository.listStarterPlans()

    expect(personalPlans.map((plan) => plan.name)).toEqual(['My Hypertrophy Block'])
    expect(starterPlans.map((plan) => plan.name)).toEqual(STARTER_FITNESS_PLANS.map((plan) => plan.name))
  })

  test('creates the eight-week return plan starter structure from the PDF template', async () => {
    await fitnessRepository.seedStarterData()
    const starter = (await fitnessRepository.listStarterPlans()).find((plan) => plan.id === 'starter-navratovy-plan-kristian-8-tyzdnov')
    if (!starter) {
      throw new Error('Return starter missing')
    }

    const created = await fitnessRepository.createPersonalPlanFromStarter(starter.id, {
      name: 'Návratový blok Kristián',
      goal: starter.goal,
    })
    const structure = await fitnessRepository.getPlanStructure(created.id)

    expect(structure.weeks.map((week) => week.weekNumber)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    expect(structure.weeks[0]?.notes).toContain('RPE 6–7')
    expect(structure.weeks[7]?.notes).toContain('deload')
    expect(structure.weeks[0]?.days.map((day) => day.label)).toEqual([
      'Upper A',
      'Lower A',
      'Zóna 2 / chôdza',
      'Upper B',
      'Lower B',
      'Zóna 2 / chôdza',
      'Voľno',
    ])
    expect(structure.weeks[0]?.days[0]?.workouts[0]?.exercises[0]).toMatchObject({
      exerciseName: 'Incline benčpres s veľkou činkou',
      targetSets: 3,
      minReps: 5,
      maxReps: 8,
      targetRir: 3,
    })
    expect(structure.weeks[2]?.days[0]?.workouts[0]?.exercises[0]).toMatchObject({ targetSets: 4, targetRir: 2 })
    expect(structure.weeks[7]?.days[0]?.workouts[0]?.exercises[0]).toMatchObject({ targetSets: 2, targetRir: 4 })
    expect(structure.weeks[7]?.days[4]?.workouts[0]?.exercises[0]?.exerciseName).toBe('Trap bar mŕtvy ťah z vyšších rúčok')
  })

  test('rejects invalid names before writing', async () => {
    await expect(fitnessRepository.createExercise({ name: ' ', category: 'other', defaultRestSeconds: 60 })).rejects.toThrow(
      'Exercise name is required',
    )
    await expect(fitnessRepository.createPersonalPlan({ name: ' ', goal: '' })).rejects.toThrow('Plan name is required')
  })
})
