import { describe, expect, test } from 'vitest'

import {
  DEMO_FITNESS_SESSION,
  calculateSessionProgress,
  formatRestTime,
  getCurrentExercise,
  getCurrentSet,
} from '@/features/fitness/fitnessDemo'

describe('fitness demo helpers', () => {
  test('selects the active exercise and current set from the demo session', () => {
    const exercise = getCurrentExercise(DEMO_FITNESS_SESSION)
    expect(exercise?.name).toBe('Tlak na lavičke')

    const set = exercise ? getCurrentSet(exercise) : null
    expect(set).toMatchObject({ setNumber: 3, weightKg: 97.5, reps: 8, rir: 1, status: 'current' })
  })

  test('calculates completed set progress across the full session', () => {
    expect(calculateSessionProgress(DEMO_FITNESS_SESSION)).toEqual({
      completedSets: 5,
      totalSets: 15,
      completedExercises: 1,
      totalExercises: 5,
      percent: 33,
    })
  })

  test('formats rest time as digital minutes and seconds', () => {
    expect(formatRestTime(84)).toBe('01:24')
    expect(formatRestTime(9)).toBe('00:09')
  })
})
