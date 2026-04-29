import type { FitnessLiveSession, FitnessStartableWorkout } from '@/features/fitness/fitnessTypes'

export interface FitnessWorkoutRecommendation {
  workout: FitnessStartableWorkout
  lastCompletedWorkoutName: string | null
  reason: string
}

export function pickRecommendedWorkout(
  startableWorkouts: FitnessStartableWorkout[],
  completedSessions: FitnessLiveSession[],
): FitnessWorkoutRecommendation | null {
  if (startableWorkouts.length === 0) {
    return null
  }

  const lastCompletedPlannedSession = completedSessions.find((session) => session.status === 'completed' && session.planWorkoutId)
  if (!lastCompletedPlannedSession) {
    return {
      workout: startableWorkouts[0] as FitnessStartableWorkout,
      lastCompletedWorkoutName: null,
      reason: 'Zatiaľ nie je dokončený žiadny plánovaný tréning. Začni prvým pripraveným tréningom.',
    }
  }

  const planWorkouts = lastCompletedPlannedSession.planId
    ? startableWorkouts.filter((workout) => workout.planId === lastCompletedPlannedSession.planId)
    : []
  const sequence = planWorkouts.length > 0 ? planWorkouts : startableWorkouts
  const lastWorkoutIndex = sequence.findIndex((workout) => workout.workoutId === lastCompletedPlannedSession.planWorkoutId)

  if (lastWorkoutIndex === -1) {
    return {
      workout: sequence[0] as FitnessStartableWorkout,
      lastCompletedWorkoutName: lastCompletedPlannedSession.name,
      reason: 'Naposledy dokončený tréning už nie je v tomto pláne. Reštartujem od prvého pripraveného tréningu.',
    }
  }

  const nextIndex = (lastWorkoutIndex + 1) % sequence.length
  return {
    workout: sequence[nextIndex] as FitnessStartableWorkout,
    lastCompletedWorkoutName: lastCompletedPlannedSession.name,
    reason: `Ďalší po ${lastCompletedPlannedSession.name}.`,
  }
}
