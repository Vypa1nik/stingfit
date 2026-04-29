import { describe, expect, test } from 'vitest'

import { pickRecommendedWorkout } from '@/features/fitness/fitnessWorkoutRecommendation'
import type { FitnessLiveSession, FitnessStartableWorkout } from '@/features/fitness/fitnessTypes'

const workouts: FitnessStartableWorkout[] = [
  workout('push-a', 'Tlakový deň A', 'plan-1', 1, 'Tlak A'),
  workout('pull-a', 'Ťahový deň A', 'plan-1', 1, 'Ťah A'),
  workout('legs', 'Nohy', 'plan-1', 1, 'Nohy'),
]

describe('pickRecommendedWorkout', () => {
  test('recommends the first startable workout when there is no completed history', () => {
    const recommendation = pickRecommendedWorkout(workouts, [])

    expect(recommendation?.workout.workoutName).toBe('Tlakový deň A')
    expect(recommendation?.reason).toBe('Zatiaľ nie je dokončený žiadny plánovaný tréning. Začni prvým pripraveným tréningom.')
    expect(recommendation?.lastCompletedWorkoutName).toBeNull()
  })

  test('recommends the next workout after the latest completed planned workout', () => {
    const recommendation = pickRecommendedWorkout(workouts, [completedSession('push-a', 'Tlakový deň A')])

    expect(recommendation?.workout.workoutName).toBe('Ťahový deň A')
    expect(recommendation?.reason).toBe('Ďalší po Tlakový deň A.')
    expect(recommendation?.lastCompletedWorkoutName).toBe('Tlakový deň A')
  })

  test('wraps back to the first workout after the final planned workout', () => {
    const recommendation = pickRecommendedWorkout(workouts, [completedSession('legs', 'Nohy')])

    expect(recommendation?.workout.workoutName).toBe('Tlakový deň A')
    expect(recommendation?.reason).toBe('Ďalší po Nohy.')
  })

  test('restarts the same plan when the last completed workout no longer exists', () => {
    const recommendation = pickRecommendedWorkout(workouts, [completedSession('archived-workout', 'Archived Upper')])

    expect(recommendation?.workout.workoutName).toBe('Tlakový deň A')
    expect(recommendation?.reason).toBe('Naposledy dokončený tréning už nie je v tomto pláne. Reštartujem od prvého pripraveného tréningu.')
  })
})

function workout(workoutId: string, workoutName: string, planId: string, weekNumber: number, dayLabel: string): FitnessStartableWorkout {
  return {
    workoutId,
    workoutName,
    planId,
    planName: 'My PPL Block',
    weekId: `week-${weekNumber}`,
    weekNumber,
    dayId: `day-${dayLabel}`,
    dayLabel,
    exerciseCount: 4,
    plannedSetCount: 12,
    firstExerciseName: 'Tlak na lavičke',
  }
}

function completedSession(planWorkoutId: string, name: string): FitnessLiveSession {
  return {
    id: `session-${planWorkoutId}`,
    planId: 'plan-1',
    planWorkoutId,
    name,
    status: 'completed',
    startedAt: '2026-04-25T10:00:00.000Z',
    completedAt: '2026-04-25T11:00:00.000Z',
    notes: '',
    sessionRpe: null,
    energyLevel: null,
    createdAt: '2026-04-25T10:00:00.000Z',
    updatedAt: '2026-04-25T11:00:00.000Z',
    exercises: [],
  }
}
