import { describe, expect, test } from 'vitest'

import { calculatePlateLoad, formatPlateLoadSummary } from '@/features/fitness/plateCalculator'

describe('fitness plate calculator', () => {
  test('calculates exact kg plates per side from target and bar weight', () => {
    const load = calculatePlateLoad({ targetWeight: 102.5, barWeight: 20, unit: 'kg' })

    expect(load).toMatchObject({
      unit: 'kg',
      targetWeight: 102.5,
      barWeight: 20,
      loadedWeight: 102.5,
      perSideTarget: 41.25,
      remainingPerSide: 0,
      isExact: true,
      isUnderBar: false,
    })
    expect(load.plates).toEqual([
      { weight: 20, count: 2 },
      { weight: 1.25, count: 1 },
    ])
    expect(formatPlateLoadSummary(load)).toBe('Na stranu: 20 kg × 2 + 1.25 kg × 1')
  })

  test('reports closest lower load when exact target cannot be built', () => {
    const load = calculatePlateLoad({ targetWeight: 103, barWeight: 20, unit: 'kg' })

    expect(load.loadedWeight).toBe(102.5)
    expect(load.remainingPerSide).toBe(0.25)
    expect(load.isExact).toBe(false)
    expect(formatPlateLoadSummary(load)).toBe('Najbližšie nižšie: 102.5 kg · chýba 0.5 kg')
  })

  test('uses lb plate inventory and protects targets below the bar', () => {
    expect(calculatePlateLoad({ targetWeight: 135, barWeight: 45, unit: 'lb' }).plates).toEqual([
      { weight: 45, count: 1 },
    ])

    const underBar = calculatePlateLoad({ targetWeight: 30, barWeight: 45, unit: 'lb' })
    expect(underBar).toMatchObject({ loadedWeight: 45, isExact: false, isUnderBar: true, plates: [] })
    expect(formatPlateLoadSummary(underBar)).toBe('Cieľ je pod váhou tyče · minimum je 45 lb')
  })
})
