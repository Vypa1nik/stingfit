import { describe, expect, test } from 'vitest'

import { getNextBackupNudgeThreshold, shouldShowBackupNudge } from '@/features/fitness/fitnessBackupNudge'

describe('fitness backup nudge cadence', () => {
  test('starts nudging after 30 completed workouts', () => {
    expect(shouldShowBackupNudge(29, 0)).toBe(false)
    expect(shouldShowBackupNudge(30, 0)).toBe(true)
    expect(shouldShowBackupNudge(45, 0)).toBe(true)
  })

  test('waits for the next 30-workout block after dismissal or export', () => {
    expect(getNextBackupNudgeThreshold(0)).toBe(30)
    expect(getNextBackupNudgeThreshold(30)).toBe(60)
    expect(getNextBackupNudgeThreshold(50)).toBe(60)
    expect(shouldShowBackupNudge(59, 30)).toBe(false)
    expect(shouldShowBackupNudge(60, 30)).toBe(true)
  })
})
