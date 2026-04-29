import type { FitnessPlanDayRecord, FitnessPlanWeekRecord } from '@/features/fitness/fitnessTypes'

export type FitnessPlanDayStatusTone = 'ready' | 'rest' | 'warning'

export interface FitnessPlanDayStatus {
  label: 'Pripravené' | 'Voľno' | 'Chýba tréning' | 'Chýbajú cviky'
  tone: FitnessPlanDayStatusTone
}

export interface FitnessPlanWeekSummary {
  dayCount: number
  restDayCount: number
  workoutCount: number
  readyWorkoutCount: number
  issueCount: number
  label: string
}

export function getPlanDayStatus(day: FitnessPlanDayRecord): FitnessPlanDayStatus {
  if (day.isRestDay) {
    return { label: 'Voľno', tone: 'rest' }
  }

  if (day.workouts.length === 0) {
    return { label: 'Chýba tréning', tone: 'warning' }
  }

  if (day.workouts.some((workout) => workout.exercises.length === 0)) {
    return { label: 'Chýbajú cviky', tone: 'warning' }
  }

  return { label: 'Pripravené', tone: 'ready' }
}

export function summarizePlanWeek(week: FitnessPlanWeekRecord): FitnessPlanWeekSummary {
  const dayCount = week.days.length
  const restDayCount = week.days.filter((day) => day.isRestDay).length
  const workoutCount = week.days.reduce((total, day) => total + day.workouts.length, 0)
  const readyWorkoutCount = week.days.reduce((total, day) => {
    if (day.isRestDay) {
      return total
    }

    return total + day.workouts.filter((workout) => workout.exercises.length > 0).length
  }, 0)
  const issueCount = week.days.reduce((total, day) => {
    if (day.isRestDay) {
      return total
    }

    if (day.workouts.length === 0) {
      return total + 1
    }

    return total + day.workouts.filter((workout) => workout.exercises.length === 0).length
  }, 0)

  return {
    dayCount,
    restDayCount,
    workoutCount,
    readyWorkoutCount,
    issueCount,
    label: [
      plural(dayCount, 'deň', 'dni', 'dní'),
      plural(restDayCount, 'voľno', 'voľná', 'voľných'),
      plural(workoutCount, 'tréning', 'tréningy', 'tréningov'),
      plural(readyWorkoutCount, 'pripravený tréning', 'pripravené tréningy', 'pripravených tréningov'),
      plural(issueCount, 'problém', 'problémy', 'problémov'),
    ].join(' · '),
  }
}

function plural(count: number, singular: string, few: string, many: string) {
  if (count === 1) return `${count} ${singular}`
  if (count >= 2 && count <= 4) return `${count} ${few}`
  return `${count} ${many}`
}
