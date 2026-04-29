import { describe, expect, test } from 'vitest'

import { getPlanDayStatus, summarizePlanWeek } from '@/features/fitness/fitnessPlanPresentation'
import type { FitnessPlanDayRecord, FitnessPlanExerciseRecord, FitnessPlanWeekRecord, FitnessPlanWorkoutRecord } from '@/features/fitness/fitnessTypes'

const now = '2026-04-25T10:00:00.000Z'

describe('fitness plan presentation density helpers', () => {
  test('labels rest days, missing workout days, missing exercise workouts, and ready days', () => {
    expect(getPlanDayStatus(makeDay({ isRestDay: true })).label).toBe('Voľno')
    expect(getPlanDayStatus(makeDay()).label).toBe('Chýba tréning')
    expect(getPlanDayStatus(makeDay({ workouts: [makeWorkout()] })).label).toBe('Chýbajú cviky')
    expect(getPlanDayStatus(makeDay({ workouts: [makeWorkout([makeExercise()])] })).label).toBe('Pripravené')
  })

  test('summarizes a week for compact plan scanning', () => {
    const summary = summarizePlanWeek(makeWeek([
      makeDay({ id: 'day-1', label: 'Push Day', workouts: [makeWorkout([makeExercise()])] }),
      makeDay({ id: 'day-2', label: 'Recovery Day', dayIndex: 1 }),
      makeDay({ id: 'day-3', label: 'Voľno', dayIndex: 2, isRestDay: true }),
      makeDay({ id: 'day-4', label: 'Pull Day', dayIndex: 3, workouts: [makeWorkout()] }),
    ]))

    expect(summary).toMatchObject({
      dayCount: 4,
      restDayCount: 1,
      workoutCount: 2,
      readyWorkoutCount: 1,
      issueCount: 2,
    })
    expect(summary.label).toBe('4 dni · 1 voľno · 2 tréningy · 1 pripravený tréning · 2 problémy')
  })
})

function makeWeek(days: FitnessPlanDayRecord[]): FitnessPlanWeekRecord {
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
