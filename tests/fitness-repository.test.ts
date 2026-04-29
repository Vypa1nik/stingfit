import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { clearAllData, resetDatabaseState } from '@/lib/database'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'

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
    expect(starterPlans.map((plan) => plan.name)).toEqual(['Tlak / Ťah / Nohy', 'Vrch / Spodok', 'Celé telo 3×'])
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
    expect(starterPlans.map((plan) => plan.name)).toEqual(['Tlak / Ťah / Nohy', 'Vrch / Spodok', 'Celé telo 3×'])
  })

  test('rejects invalid names before writing', async () => {
    await expect(fitnessRepository.createExercise({ name: ' ', category: 'other', defaultRestSeconds: 60 })).rejects.toThrow(
      'Exercise name is required',
    )
    await expect(fitnessRepository.createPersonalPlan({ name: ' ', goal: '' })).rejects.toThrow('Plan name is required')
  })
})
