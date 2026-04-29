import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

describe('fitness exercise library repository', () => {
  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
    await fitnessRepository.seedStarterData()
  })

  afterEach(async () => {
    await resetDatabaseState()
  })

  test('edits and archives custom exercises while keeping starter exercises protected', async () => {
    const custom = await fitnessRepository.createExercise({ name: ' Cable Fly ', category: ' chest ', muscleGroup: 'chest', defaultRestSeconds: 75 })

    const updated = await fitnessRepository.updateCustomExercise(custom.id, {
      name: 'Low Cable Fly',
      category: 'upper chest',
      muscleGroup: 'shoulders',
      defaultRestSeconds: 60,
    })

    expect(updated).toMatchObject({
      id: custom.id,
      name: 'Low Cable Fly',
      category: 'upper chest',
      muscleGroup: 'shoulders',
      defaultRestSeconds: 60,
      isCustom: true,
      deletedAt: null,
    })

    await fitnessRepository.archiveCustomExercise(custom.id)
    const visibleExercises = await fitnessRepository.listExercises()
    expect(visibleExercises.some((exercise) => exercise.id === custom.id)).toBe(false)

    const starter = visibleExercises.find((exercise) => exercise.name === 'Tlak na lavičke')
    expect(starter).toBeDefined()

    await expect(fitnessRepository.updateCustomExercise(starter!.id, { name: 'Tlak na lavičke 2' })).rejects.toThrow('Only custom exercises can be edited')
    await expect(fitnessRepository.archiveCustomExercise(starter!.id)).rejects.toThrow('Only custom exercises can be archived')
  })

  test('snapshots explicit muscle group on future sessions and preserves it through export/import', async () => {
    const custom = await fitnessRepository.createExercise({ name: 'Cable Fly', category: 'upper chest', muscleGroup: 'chest', defaultRestSeconds: 75 })
    const quick = await fitnessRepository.startQuickSession()
    const withExercise = await fitnessRepository.addUnplannedExerciseToSession(quick.id, { exerciseId: custom.id, targetSets: 1 })

    expect(withExercise.exercises[0]).toMatchObject({
      nameSnapshot: 'Cable Fly',
      categorySnapshot: 'upper chest',
      muscleGroupSnapshot: 'chest',
    })

    const exported = await fitnessRepository.exportFitnessData()
    expect(exported.exercises.find((exercise) => exercise.id === custom.id)).toMatchObject({ muscleGroup: 'chest' })
    expect(exported.sessions.find((session) => session.id === quick.id)?.exercises[0]).toMatchObject({ muscleGroupSnapshot: 'chest' })

    await fitnessRepository.resetFitnessData()
    await fitnessRepository.importFitnessData(exported, { mode: 'replace' })
    const restoredSession = await fitnessRepository.getLiveSession(quick.id)
    const restoredExercise = (await fitnessRepository.listExercises()).find((exercise) => exercise.id === custom.id)

    expect(restoredExercise).toMatchObject({ muscleGroup: 'chest' })
    expect(restoredSession.exercises[0]).toMatchObject({ muscleGroupSnapshot: 'chest' })
  })

  test('validates custom exercise edits before writing', async () => {
    const custom = await fitnessRepository.createExercise({ name: 'Cable Fly', category: 'chest', defaultRestSeconds: 75 })

    await expect(fitnessRepository.updateCustomExercise(custom.id, { name: ' ' })).rejects.toThrow('Exercise name is required')
    await expect(fitnessRepository.updateCustomExercise(custom.id, { category: ' ' })).rejects.toThrow('Exercise category is required')
    await expect(fitnessRepository.updateCustomExercise(custom.id, { muscleGroup: 'invalid' })).rejects.toThrow('Invalid muscle group')
    await expect(fitnessRepository.updateCustomExercise(custom.id, { defaultRestSeconds: -1 })).rejects.toThrow('Default rest seconds must be a non-negative number')
  })
})
