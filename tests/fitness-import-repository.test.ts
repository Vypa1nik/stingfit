import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { STARTER_FITNESS_EXERCISES, STARTER_FITNESS_PLANS } from '@/features/fitness/fitnessSeed'
import { progressRepository } from '@/features/progress/progressRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function createFinishedExportableState() {
  await fitnessRepository.seedStarterData()
  await fitnessRepository.updateSettings({ displayUnit: 'lb' })
  const starter = (await fitnessRepository.listStarterPlans()).find((plan) => plan.name === 'Tlak / Ťah / Nohy')
  if (!starter) {
    throw new Error('PPL starter missing')
  }

  await fitnessRepository.createPersonalPlanFromStarter(starter.id, { name: 'My PPL Block', goal: 'Build muscle' })
  const workout = (await fitnessRepository.listStartableWorkouts()).find((item) => item.workoutName === 'Tlakový deň A')
  if (!workout) {
    throw new Error('Push workout missing')
  }

  const session = await fitnessRepository.startSessionFromPlanWorkout(workout.workoutId)
  await fitnessRepository.logSet(session.exercises[0]!.sets[0]!.id, { weightKg: 100, reps: 8, rir: 1 })
  const finished = await fitnessRepository.finishSession(session.id)
  await progressRepository.upsertBodyMeasurement({
    recordedOn: '2026-05-10',
    bodyweightKg: 83.1,
    waistCm: 85.5,
    chestCm: null,
    bicepsLeftCm: null,
    bicepsRightCm: null,
    thighLeftCm: null,
    thighRightCm: null,
    calfLeftCm: null,
    calfRightCm: null,
    note: 'Exported body record',
    photoUri: null,
  })
  await progressRepository.upsertJournalEntry({
    entryDate: '2026-05-10',
    sessionId: finished.id,
    body: 'Exported journal entry',
    mood: null,
    sleepHours: null,
    energy: 4,
  })
}

describe('fitness import repository', () => {
  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
  })

  afterEach(async () => {
    await resetDatabaseState()
  })

  test('previews a fitness export payload before mutating local data', async () => {
    await createFinishedExportableState()
    const exported = await fitnessRepository.exportFitnessData()

    expect(exported.version).toBe(2)
    expect(exported.bodyMeasurements).toMatchObject([
      { bodyweightKg: 83.1, note: 'Exported body record' },
    ])
    expect(exported.journalEntries).toMatchObject([
      { body: 'Exported journal entry', energy: 4 },
    ])

    const preview = fitnessRepository.previewFitnessImport(exported)

    expect(preview).toMatchObject({
      version: 2,
      displayUnit: 'lb',
      exerciseCount: STARTER_FITNESS_EXERCISES.length,
      starterPlanCount: STARTER_FITNESS_PLANS.length,
      personalPlanCount: 1,
      sessionCount: 1,
      completedSessionCount: 1,
      bodyMeasurementCount: 1,
      journalEntryCount: 1,
    })
  })

  test('rejects invalid fitness import payloads with a useful error', () => {
    expect(() => fitnessRepository.previewFitnessImport({ version: 99 })).toThrow('Unsupported fitness import version')
    expect(() => fitnessRepository.previewFitnessImport({ version: 1, settings: {}, exercises: [] })).toThrow('Fitness import payload is missing plan arrays')
  })

  test('restores a fitness export payload in replace mode', async () => {
    await createFinishedExportableState()
    const exported = await fitnessRepository.exportFitnessData()

    await clearAllData()
    expect(await fitnessRepository.listPersonalPlans()).toHaveLength(0)

    const result = await fitnessRepository.importFitnessData(exported, { mode: 'replace' })

    expect(result).toMatchObject({ mode: 'replace', personalPlanCount: 1, sessionCount: 1 })
    await expect(fitnessRepository.getSettings()).resolves.toMatchObject({ displayUnit: 'lb' })
    expect((await fitnessRepository.listPersonalPlans()).map((plan) => plan.name)).toContain('My PPL Block')
    expect((await fitnessRepository.listCompletedSessions())[0]).toMatchObject({ name: 'Tlakový deň A', status: 'completed' })
    await expect(progressRepository.listBodyMeasurements()).resolves.toMatchObject([
      { bodyweightKg: 83.1, note: 'Exported body record' },
    ])
    await expect(progressRepository.listJournalEntries()).resolves.toMatchObject([
      { body: 'Exported journal entry', energy: 4 },
    ])
  })

  test('keeps existing local data when replace import fails after clearing starts', async () => {
    await createFinishedExportableState()
    const exported = await fitnessRepository.exportFitnessData()
    const corrupted = structuredClone(exported)
    const importedPlan = corrupted.personalPlans[0]?.plan
    if (!importedPlan) {
      throw new Error('Expected export fixture to contain a personal plan')
    }
    importedPlan.status = 'not-a-valid-plan-status' as typeof importedPlan.status

    await expect(
      fitnessRepository.importFitnessData(corrupted, { mode: 'replace' }),
    ).rejects.toThrow()

    await expect(fitnessRepository.getSettings()).resolves.toMatchObject({ displayUnit: 'lb' })
    expect((await fitnessRepository.listPersonalPlans()).map((plan) => plan.name)).toContain('My PPL Block')
    expect((await fitnessRepository.listCompletedSessions())[0]).toMatchObject({ name: 'Tlakový deň A', status: 'completed' })
    await expect(progressRepository.listBodyMeasurements()).resolves.toMatchObject([
      { bodyweightKg: 83.1, note: 'Exported body record' },
    ])
    await expect(progressRepository.listJournalEntries()).resolves.toMatchObject([
      { body: 'Exported journal entry', energy: 4 },
    ])
  })

  test('imports legacy v1 fitness exports with empty progress arrays', async () => {
    await createFinishedExportableState()
    const exported = await fitnessRepository.exportFitnessData()
    const legacyPayload = {
      version: 1 as const,
      exportedAt: exported.exportedAt,
      settings: exported.settings,
      exercises: exported.exercises,
      starterPlans: exported.starterPlans,
      personalPlans: exported.personalPlans,
      sessions: exported.sessions,
    }

    expect(fitnessRepository.previewFitnessImport(legacyPayload)).toMatchObject({
      version: 1,
      bodyMeasurementCount: 0,
      journalEntryCount: 0,
    })

    await clearAllData()
    const result = await fitnessRepository.importFitnessData(legacyPayload, { mode: 'replace' })

    expect(result).toMatchObject({ version: 1, mode: 'replace', sessionCount: 1 })
    await expect(progressRepository.listBodyMeasurements()).resolves.toHaveLength(0)
    await expect(progressRepository.listJournalEntries()).resolves.toHaveLength(0)
  })
})
