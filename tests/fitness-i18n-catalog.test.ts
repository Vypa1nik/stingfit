import { readFileSync } from 'node:fs'

import { describe, expect, test } from 'vitest'

import { sk } from '@/i18n/sk'

function readText(path: string) {
  return readFileSync(path, 'utf8')
}

describe('Slovak i18n catalog scaffold', () => {
  test('centralizes Phase 3 install, backup, and gesture copy', () => {
    expect(sk.fitness.pwa.installTitle).toBe('Inštalácia aplikácie')
    expect(sk.fitness.pwa.privatePromise).toContain('Bez účtu, cloudu a telemetrie')
    expect(sk.fitness.backupNudge.title).toBe('Čas na lokálnu zálohu')
    expect(sk.fitness.backupNudge.snoozeButton).toBe('Pripomenúť pri ďalších 30')
    expect(sk.fitness.setGestures.completedSetAria(2)).toContain('Séria 2')
    expect(sk.fitness.setGestures.duplicateAria(2)).toBe('Duplikovať sériu 2')
  })

  test('uses the catalog in the Phase 3 user-facing surfaces', () => {
    expect(readText('src/features/fitness/FitnessSettingsPage.tsx')).toContain('sk.fitness.pwa.installTitle')
    expect(readText('src/features/fitness/FitnessDashboard.tsx')).toContain('sk.fitness.backupNudge.title')
    expect(readText('src/features/fitness/LiveTrainingSession.tsx')).toContain('sk.fitness.setGestures.completedSetAria')
  })
})
