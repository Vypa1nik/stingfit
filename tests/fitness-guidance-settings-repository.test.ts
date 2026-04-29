import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

describe('fitness guidance settings repository', () => {
  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
  })

  afterEach(async () => {
    await resetDatabaseState()
  })

  test('defaults guidance on and persists a hidden guidance preference', async () => {
    await expect(fitnessRepository.getSettings()).resolves.toMatchObject({ showGuidance: true })

    const updated = await fitnessRepository.updateSettings({ showGuidance: false })

    expect(updated).toMatchObject({ showGuidance: false })
    await expect(fitnessRepository.getSettings()).resolves.toMatchObject({ showGuidance: false })
  })

  test('defaults rest alerts on and persists sound/vibration preferences', async () => {
    await expect(fitnessRepository.getSettings()).resolves.toMatchObject({
      restSoundEnabled: true,
      restVibrationEnabled: true,
    })

    const updated = await fitnessRepository.updateSettings({ restSoundEnabled: false, restVibrationEnabled: false })

    expect(updated).toMatchObject({ restSoundEnabled: false, restVibrationEnabled: false })
    await expect(fitnessRepository.getSettings()).resolves.toMatchObject({
      restSoundEnabled: false,
      restVibrationEnabled: false,
    })
  })

  test('exports guidance visibility with local fitness settings', async () => {
    await fitnessRepository.seedStarterData()
    await fitnessRepository.updateSettings({ showGuidance: false })

    const exported = await fitnessRepository.exportFitnessData()

    expect(exported.settings).toMatchObject({
      showGuidance: false,
      restSoundEnabled: true,
      restVibrationEnabled: true,
    })
  })
})
