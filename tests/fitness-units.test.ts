import { describe, expect, test } from 'vitest'

import { convertWeightFromKg, convertWeightToKg, formatVolumeWeight, formatWeight, normalizeDisplayUnit } from '@/features/fitness/fitnessUnits'

describe('fitness unit helpers', () => {
  test('normalizes unsupported display units to kg', () => {
    expect(normalizeDisplayUnit('kg')).toBe('kg')
    expect(normalizeDisplayUnit('lb')).toBe('lb')
    expect(normalizeDisplayUnit('stone')).toBe('kg')
    expect(normalizeDisplayUnit(null)).toBe('kg')
  })

  test('converts stored kg values for lb display and back to kg storage', () => {
    expect(convertWeightFromKg(100, 'kg')).toBe(100)
    expect(convertWeightFromKg(100, 'lb')).toBe(220.5)
    expect(convertWeightToKg(220.46226218, 'lb')).toBe(100)
    expect(convertWeightToKg(100, 'kg')).toBe(100)
  })

  test('formats weight labels with the selected display unit', () => {
    expect(formatWeight(100, 'kg')).toBe('100 kg')
    expect(formatWeight(100, 'lb')).toBe('220.5 lb')
    expect(formatWeight(97.5, 'kg')).toBe('97.5 kg')
  })

  test('formats total volume labels with the selected display unit', () => {
    expect(formatVolumeWeight(2400, 'kg')).toBe('2,400 kg')
    expect(formatVolumeWeight(2400, 'lb')).toBe('5,291 lb')
  })
})
