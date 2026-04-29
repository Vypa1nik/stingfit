import type { FitnessPlanReadinessIssue, FitnessPlanReadinessReport, FitnessPlanStructure } from '@/features/fitness/fitnessTypes'

export function buildPlanReadinessReport(structure: FitnessPlanStructure): FitnessPlanReadinessReport {
  const blockers: FitnessPlanReadinessIssue[] = []
  const warnings: FitnessPlanReadinessIssue[] = []
  let startableWorkoutCount = 0

  if (structure.weeks.length === 0) {
    blockers.push({ severity: 'blocker', message: 'Plán nemá žiadne týždne.' })
  }

  for (const week of structure.weeks) {
    const trainingDays = week.days.filter((day) => !day.isRestDay)
    if (trainingDays.length === 0) {
      blockers.push({ severity: 'blocker', message: `Týždeň ${week.weekNumber} nemá žiadne tréningové dni.`, weekId: week.id })
    }

    for (const duplicateLabel of findDuplicateLabels(week.days.map((day) => day.label))) {
      warnings.push({ severity: 'warning', message: `Týždeň ${week.weekNumber} má duplicitný názov dňa ${duplicateLabel}.`, weekId: week.id })
    }

    for (const day of week.days) {
      if (day.isRestDay && day.workouts.length > 0) {
        warnings.push({
          severity: 'warning',
          message: `Týždeň ${week.weekNumber} · ${day.label} je označený ako voľno; uložené tréningy sú v Tréningu skryté.`,
          weekId: week.id,
          dayId: day.id,
        })
      }
    }

    for (const day of trainingDays) {
      if (day.workouts.length === 0) {
        blockers.push({
          severity: 'blocker',
          message: `Týždeň ${week.weekNumber} · ${day.label} nemá žiadny tréning.`,
          weekId: week.id,
          dayId: day.id,
        })
        continue
      }

      for (const workout of day.workouts) {
        if (workout.exercises.length === 0) {
          blockers.push({
            severity: 'blocker',
            message: `Týždeň ${week.weekNumber} · ${day.label} · ${workout.name} nemá žiadne cviky.`,
            weekId: week.id,
            dayId: day.id,
            workoutId: workout.id,
          })
        } else {
          startableWorkoutCount += 1
        }
      }
    }
  }

  return {
    ready: blockers.length === 0 && startableWorkoutCount > 0,
    startableWorkoutCount,
    blockers,
    warnings,
  }
}

function findDuplicateLabels(labels: string[]) {
  const seen = new Set<string>()
  const duplicates = new Set<string>()

  for (const label of labels) {
    const normalized = label.trim().toLocaleLowerCase()
    if (!normalized) {
      continue
    }
    if (seen.has(normalized)) {
      duplicates.add(label.trim())
    }
    seen.add(normalized)
  }

  return Array.from(duplicates)
}
