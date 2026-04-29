import { describe, expect, test } from 'vitest'

import { buildPlanReadinessReport } from '@/features/fitness/fitnessPlanReadiness'
import type { FitnessPlanDayRecord, FitnessPlanExerciseRecord, FitnessPlanStructure, FitnessPlanWeekRecord, FitnessPlanWorkoutRecord } from '@/features/fitness/fitnessTypes'

const now = '2026-04-25T10:00:00.000Z'

function makeStructure(weeks: FitnessPlanWeekRecord[]): FitnessPlanStructure {
  return {
    plan: {
      id: 'plan-1',
      name: 'Readiness Block',
      goal: 'Build a usable plan',
      kind: 'personal',
      sourceTemplateId: null,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    weeks,
  }
}

function makeWeek(days: FitnessPlanDayRecord[] = []): FitnessPlanWeekRecord {
  return {
    id: 'week-1',
    planId: 'plan-1',
    weekNumber: 1,
    notes: '',
    createdAt: now,
    updatedAt: now,
    days,
  }
}

function makeDay(overrides: Partial<FitnessPlanDayRecord> = {}): FitnessPlanDayRecord {
  return {
    id: overrides.id ?? 'day-1',
    weekId: 'week-1',
    dayIndex: overrides.dayIndex ?? 0,
    label: overrides.label ?? 'Chest Day',
    isRestDay: overrides.isRestDay ?? false,
    createdAt: now,
    updatedAt: now,
    workouts: overrides.workouts ?? [],
  }
}

function makeWorkout(exercises: FitnessPlanExerciseRecord[] = []): FitnessPlanWorkoutRecord {
  return {
    id: 'workout-1',
    planDayId: 'day-1',
    name: 'Chest Builder',
    notes: '',
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
    exercises,
  }
}

function makeExercise(): FitnessPlanExerciseRecord {
  return {
    id: 'planned-bench',
    planWorkoutId: 'workout-1',
    exerciseId: 'bench-press',
    exerciseName: 'Tlak na lavičke',
    sortOrder: 0,
    targetSets: 3,
    minReps: 6,
    maxReps: 8,
    targetRir: 1,
    restSeconds: 150,
    notes: '',
    createdAt: now,
    updatedAt: now,
  }
}

describe('fitness plan readiness', () => {
  test('blocks a blank week with no training days', () => {
    const report = buildPlanReadinessReport(makeStructure([makeWeek()]))

    expect(report).toMatchObject({ ready: false, startableWorkoutCount: 0 })
    expect(report.blockers.map((issue) => issue.message)).toContain('Týždeň 1 nemá žiadne tréningové dni.')
  })

  test('blocks a non-rest day without a workout', () => {
    const report = buildPlanReadinessReport(makeStructure([makeWeek([makeDay()])]))

    expect(report.ready).toBe(false)
    expect(report.blockers.map((issue) => issue.message)).toContain('Týždeň 1 · Chest Day nemá žiadny tréning.')
  })

  test('blocks a workout without exercises', () => {
    const report = buildPlanReadinessReport(makeStructure([makeWeek([makeDay({ workouts: [makeWorkout()] })])]))

    expect(report.ready).toBe(false)
    expect(report.blockers.map((issue) => issue.message)).toContain('Týždeň 1 · Chest Day · Chest Builder nemá žiadne cviky.')
  })

  test('warns about duplicate day labels inside a week', () => {
    const report = buildPlanReadinessReport(makeStructure([
      makeWeek([
        makeDay({ id: 'day-1', dayIndex: 0, label: 'Chest Day', workouts: [makeWorkout([makeExercise()])] }),
        makeDay({ id: 'day-2', dayIndex: 2, label: 'Chest Day', workouts: [makeWorkout([makeExercise()])] }),
      ]),
    ]))

    expect(report.ready).toBe(true)
    expect(report.warnings.map((issue) => issue.message)).toContain('Týždeň 1 má duplicitný názov dňa Chest Day.')
  })

  test('warns when a rest day keeps saved workouts hidden from training', () => {
    const report = buildPlanReadinessReport(makeStructure([
      makeWeek([
        makeDay({ id: 'day-1', dayIndex: 0, label: 'Push Day', workouts: [makeWorkout([makeExercise()])] }),
        makeDay({ id: 'day-2', dayIndex: 1, label: 'Recovery Day', isRestDay: true, workouts: [makeWorkout([makeExercise()])] }),
      ]),
    ]))

    expect(report).toMatchObject({ ready: true, startableWorkoutCount: 1 })
    expect(report.warnings.map((issue) => issue.message)).toContain('Týždeň 1 · Recovery Day je označený ako voľno; uložené tréningy sú v Tréningu skryté.')
  })

  test('marks a valid workout as ready to train', () => {
    const report = buildPlanReadinessReport(makeStructure([makeWeek([makeDay({ workouts: [makeWorkout([makeExercise()])] })])]))

    expect(report).toMatchObject({ ready: true, startableWorkoutCount: 1 })
    expect(report.blockers).toEqual([])
  })
})
