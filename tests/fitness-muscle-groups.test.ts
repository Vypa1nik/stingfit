import { describe, expect, test } from 'vitest'

import { formatMuscleGroupLabel, resolveMuscleGroup } from '@/features/fitness/fitnessMuscleGroups'

describe('fitness muscle group taxonomy', () => {
  test('maps Slovak starter categories and exercise names to stable muscle groups', () => {
    expect(resolveMuscleGroup({ exerciseName: 'Tlak na lavičke', category: 'hrudník' })).toBe('chest')
    expect(resolveMuscleGroup({ exerciseName: 'Upažovanie', category: 'ramená' })).toBe('shoulders')
    expect(resolveMuscleGroup({ exerciseName: 'Sťahovanie kladky s lanom', category: 'paže' })).toBe('triceps')
    expect(resolveMuscleGroup({ exerciseName: 'Bicepsový zdvih', category: 'paže' })).toBe('biceps')
    expect(resolveMuscleGroup({ exerciseName: 'Rumunský mŕtvy ťah', category: 'nohy' })).toBe('hamstrings')
    expect(resolveMuscleGroup({ exerciseName: 'Drep', category: 'nohy' })).toBe('quads')
    expect(resolveMuscleGroup({ exerciseName: 'Plank', category: 'brucho' })).toBe('abs')
    expect(resolveMuscleGroup({ exerciseName: 'Neznámy cvik', category: 'iné' })).toBe('other')
  })

  test('formats muscle group labels in Slovak', () => {
    expect(formatMuscleGroupLabel('chest')).toBe('Hrudník')
    expect(formatMuscleGroupLabel('hamstrings')).toBe('Hamstringy')
    expect(formatMuscleGroupLabel('other')).toBe('Iné')
  })
})
