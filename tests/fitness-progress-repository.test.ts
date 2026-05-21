import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { progressRepository } from '@/features/progress/progressRepository'
import { clearAllData, execute, resetDatabaseState } from '@/lib/database'

const NOW = '2026-05-17T08:00:00.000Z'

async function createCompletedSession(id = 'session-progress-1') {
  await execute(
    `INSERT INTO fitness_sessions(
      id, plan_id, plan_workout_id, name, status, started_at, completed_at,
      notes, session_rpe, energy_level, created_at, updated_at
    ) VALUES (?, NULL, NULL, ?, 'completed', ?, ?, '', NULL, NULL, ?, ?)`,
    [id, 'Progress linked workout', NOW, NOW, NOW, NOW],
  )
  return id
}

describe('progressRepository', () => {
  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
  })

  afterEach(async () => {
    await resetDatabaseState()
  })

  test('creates, updates, lists, and deletes body measurements newest first', async () => {
    const older = await progressRepository.upsertBodyMeasurement({
      recordedOn: '2026-05-01',
      bodyweightKg: 82.4,
      waistCm: 86,
      chestCm: null,
      bicepsLeftCm: null,
      bicepsRightCm: null,
      thighLeftCm: null,
      thighRightCm: null,
      calfLeftCm: null,
      calfRightCm: null,
      note: 'baseline',
      photoUri: null,
    })
    const newer = await progressRepository.upsertBodyMeasurement({
      recordedOn: '2026-05-10',
      bodyweightKg: 83.1,
      waistCm: 85.5,
      chestCm: 104,
      bicepsLeftCm: null,
      bicepsRightCm: null,
      thighLeftCm: null,
      thighRightCm: null,
      calfLeftCm: null,
      calfRightCm: null,
      note: 'after push block',
      photoUri: null,
    })

    await expect(progressRepository.listBodyMeasurements()).resolves.toMatchObject([
      { id: newer.id, recordedOn: '2026-05-10', bodyweightKg: 83.1 },
      { id: older.id, recordedOn: '2026-05-01', bodyweightKg: 82.4 },
    ])

    await progressRepository.upsertBodyMeasurement({
      ...older,
      bodyweightKg: 82.8,
      note: 'updated baseline',
    })
    await expect(progressRepository.listBodyMeasurements()).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: older.id, bodyweightKg: 82.8, note: 'updated baseline' }),
      ]),
    )

    await progressRepository.deleteBodyMeasurement(newer.id)
    await expect(progressRepository.listBodyMeasurements()).resolves.toHaveLength(1)
  })

  test('creates, updates, lists, and deletes journal entries newest first', async () => {
    const sessionId = await createCompletedSession()
    const older = await progressRepository.upsertJournalEntry({
      entryDate: '2026-05-01',
      sessionId: null,
      body: 'First journal entry',
      mood: 3,
      sleepHours: 7,
      energy: 3,
    })
    const newer = await progressRepository.upsertJournalEntry({
      entryDate: '2026-05-10',
      sessionId,
      body: 'Linked workout notes',
      mood: 4,
      sleepHours: 8,
      energy: 5,
    })

    await expect(progressRepository.listJournalEntries()).resolves.toMatchObject([
      { id: newer.id, entryDate: '2026-05-10', sessionId, energy: 5 },
      { id: older.id, entryDate: '2026-05-01', sessionId: null, energy: 3 },
    ])

    await progressRepository.upsertJournalEntry({
      ...older,
      body: 'Updated first journal entry',
      energy: 4,
    })
    await expect(progressRepository.listJournalEntries()).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: older.id, body: 'Updated first journal entry', energy: 4 }),
      ]),
    )

    await progressRepository.deleteJournalEntry(older.id)
    await expect(progressRepository.listJournalEntries()).resolves.toHaveLength(1)
  })

  test('keeps journal entries but clears the session link when a session is deleted', async () => {
    const sessionId = await createCompletedSession('session-progress-delete')
    const entry = await progressRepository.upsertJournalEntry({
      entryDate: '2026-05-17',
      sessionId,
      body: 'Linked before delete',
      mood: null,
      sleepHours: null,
      energy: 4,
    })

    await execute(`DELETE FROM fitness_sessions WHERE id = ?`, [sessionId])

    await expect(progressRepository.listJournalEntries()).resolves.toEqual([
      expect.objectContaining({ id: entry.id, sessionId: null, body: 'Linked before delete' }),
    ])
  })
})
