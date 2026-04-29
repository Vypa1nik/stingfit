import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

const STRONG_CSV = `Date,Workout Name,Exercise Name,Set Order,Weight,Weight Unit,Reps,RPE,Notes,Workout Notes
2026-04-25 10:00:00,Push A,Bench Press,1,225,lb,5,8,,Imported from Strong
2026-04-25 10:00:00,Push A,Bench Press,2,230,lb,4,9,,Imported from Strong
2026-04-25 10:00:00,Push A,Cable Fly,1,30,kg,12,7,slow eccentric,Imported from Strong
2026-04-27 18:30:00,Pull B,Barbell Row,1,100,kg,8,,,
`

describe('Strong CSV fitness import', () => {
  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
  })

  afterEach(async () => {
    await resetDatabaseState()
  })

  test('previews Strong CSV without mutating local fitness data', async () => {
    const preview = fitnessRepository.previewStrongCsvImport(STRONG_CSV)

    expect(preview).toMatchObject({
      source: 'strong',
      workoutCount: 2,
      exerciseCount: 3,
      setCount: 4,
      skippedRowCount: 0,
    })
    await expect(fitnessRepository.listCompletedSessions()).resolves.toHaveLength(0)
  })

  test('imports Strong CSV as completed local workout history', async () => {
    const result = await fitnessRepository.importStrongCsvData(STRONG_CSV)

    expect(result).toMatchObject({ mode: 'append', workoutCount: 2, exerciseCount: 3, setCount: 4 })

    const exercises = await fitnessRepository.listExercises()
    expect(exercises.map((exercise) => exercise.name)).toEqual(expect.arrayContaining(['Bench Press', 'Cable Fly', 'Barbell Row']))
    expect(exercises.find((exercise) => exercise.name === 'Bench Press')).toMatchObject({ isCustom: true, category: 'importované' })

    const sessions = await fitnessRepository.listCompletedSessions()
    expect(sessions).toHaveLength(2)
    expect(sessions.map((session) => session.name)).toEqual(['Pull B', 'Push A'])

    const push = sessions.find((session) => session.name === 'Push A')
    expect(push).toMatchObject({ planId: null, planWorkoutId: null, status: 'completed', notes: 'Imported from Strong' })
    expect(push?.exercises[0]).toMatchObject({ nameSnapshot: 'Bench Press', targetSets: 2, status: 'done' })
    expect(push?.exercises[0]?.sets[0]).toMatchObject({
      status: 'completed',
      setNumber: 1,
      weightKg: 102.1,
      reps: 5,
      rir: 2,
      setType: 'working',
    })
    expect(push?.exercises[0]?.sets[1]).toMatchObject({ weightKg: 104.3, reps: 4, rir: 1 })
    expect(push?.exercises[1]).toMatchObject({ nameSnapshot: 'Cable Fly', targetSets: 1 })
    expect(push?.exercises[1]?.sets[0]).toMatchObject({ weightKg: 30, reps: 12, rir: 3 })
  })
})
