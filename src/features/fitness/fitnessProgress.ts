import { formatMuscleGroupLabel, resolveMuscleGroup } from '@/features/fitness/fitnessMuscleGroups'

import type {
  FitnessExerciseVolumeSummary,
  FitnessLiveSession,
  FitnessMuscleGroup,
  FitnessMuscleGroupSummary,
  FitnessMuscleVolumeAction,
  FitnessMuscleVolumeStatus,
  FitnessOneRepMaxPoint,
  FitnessOneRepMaxSeries,
  FitnessPrEvent,
  FitnessProgressSnapshot,
  FitnessProgressionHint,
  FitnessRecoverySignal,
  FitnessSessionExerciseRecord,
  FitnessSessionSetRecord,
  FitnessSessionSummary,
  FitnessTrainingHeatmapIntensity,
  FitnessTrainingHeatmapWeek,
} from '@/features/fitness/fitnessTypes'

interface CompletedSetContext {
  session: FitnessLiveSession
  exercise: FitnessSessionExerciseRecord
  set: FitnessSessionSetRecord
  estimatedOneRepMaxKg: number
}

export function formatKg(value: number) {
  const rounded = Math.round(value * 10) / 10
  return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)} kg`
}

export function formatVolume(value: number) {
  return `${Math.round(value).toLocaleString('en-US')} kg`
}

export function estimateOneRepMaxKg(weightKg: number, reps: number) {
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10
}

export function summarizeSession(session: FitnessLiveSession): FitnessSessionSummary {
  const allSets = session.exercises.flatMap((exercise) => exercise.sets)
  const completedSets = allSets.filter((set) => set.status === 'completed')
  const correctedSets = completedSets.filter(isCorrectedSet)
  const progressSets = completedSets.filter(isProgressSet)
  const totalVolumeKg = progressSets.reduce((sum, set) => sum + set.weightKg * set.reps, 0)
  const totalCorrections = correctedSets.reduce((sum, set) => sum + Math.max(1, set.correctionCount ?? 0), 0)

  return {
    sessionId: session.id,
    name: session.name,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    completedSets: completedSets.length,
    totalSets: allSets.length,
    correctedSetCount: correctedSets.length,
    totalCorrections,
    exerciseCount: session.exercises.length,
    totalVolumeKg,
  }
}

export function buildProgressSnapshot(sessions: FitnessLiveSession[]): FitnessProgressSnapshot {
  const completedSessions = sessions.filter((session) => session.status === 'completed')
  const sessionSummaries = completedSessions.map(summarizeSession)
  const completedSetContexts = completedSessions.flatMap(getCompletedSetContexts)
  const volumeTrend = buildVolumeTrend(sessionSummaries)
  const muscleGroupSummaries = buildMuscleGroupSummaries(completedSessions)

  return {
    completedWorkouts: completedSessions.length,
    totalVolumeKg: sessionSummaries.reduce((sum, summary) => sum + summary.totalVolumeKg, 0),
    weeklyConsistencyLabel: buildWeeklyConsistencyLabel(completedSessions),
    volumeTrendPercent: volumeTrend.percent,
    volumeTrendLabel: volumeTrend.label,
    sessionSummaries,
    prEvents: buildPrEvents(completedSetContexts),
    oneRepMaxSeries: buildOneRepMaxSeries(completedSessions),
    trainingHeatmapWeeks: buildTrainingHeatmapWeeks(completedSessions),
    exerciseVolumeLeaders: buildExerciseVolumeLeaders(completedSessions),
    muscleGroupSummaries,
    recoverySignals: buildRecoverySignals(completedSessions, muscleGroupSummaries),
    progressionHints: buildProgressionHints(completedSessions),
  }
}

function buildTrainingHeatmapWeeks(sessions: FitnessLiveSession[]): FitnessTrainingHeatmapWeek[] {
  const completedDateKeys = sessions
    .filter((session) => session.status === 'completed')
    .map(getSessionDateKey)
    .filter((dateKey): dateKey is string => Boolean(dateKey))

  if (completedDateKeys.length === 0) {
    return []
  }

  const workoutCountByDate = new Map<string, number>()
  for (const dateKey of completedDateKeys) {
    workoutCountByDate.set(dateKey, (workoutCountByDate.get(dateKey) ?? 0) + 1)
  }

  const latestDateKey = [...completedDateKeys].sort().at(-1)!
  const latestDate = dateFromKey(latestDateKey)
  const endDate = addUtcDays(latestDate, 6 - getMondayBasedWeekdayIndex(latestDate))
  const startDate = addUtcDays(endDate, -(12 * 7 - 1))

  return Array.from({ length: 12 }, (_, weekIndex) => {
    const weekStartDate = addUtcDays(startDate, weekIndex * 7)
    return {
      weekStart: formatDateKey(weekStartDate),
      days: Array.from({ length: 7 }, (_, weekdayIndex) => {
        const currentDate = addUtcDays(weekStartDate, weekdayIndex)
        const date = formatDateKey(currentDate)
        const completedWorkoutCount = workoutCountByDate.get(date) ?? 0
        return {
          date,
          weekdayIndex,
          completedWorkoutCount,
          intensity: getHeatmapIntensity(completedWorkoutCount),
        }
      }),
    }
  })
}

function getSessionDateKey(session: FitnessLiveSession) {
  const dateSource = session.completedAt ?? session.startedAt ?? session.updatedAt
  return dateSource ? dateSource.slice(0, 10) : null
}

function dateFromKey(dateKey: string) {
  return new Date(`${dateKey}T00:00:00.000Z`)
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function addUtcDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setUTCDate(nextDate.getUTCDate() + days)
  return nextDate
}

function getMondayBasedWeekdayIndex(date: Date) {
  return (date.getUTCDay() + 6) % 7
}

function getHeatmapIntensity(count: number): FitnessTrainingHeatmapIntensity {
  if (count <= 0) return 0
  if (count >= 4) return 4
  return count as FitnessTrainingHeatmapIntensity
}

function buildExerciseVolumeLeaders(sessions: FitnessLiveSession[]): FitnessExerciseVolumeSummary[] {
  const completedDateKeys = sessions
    .filter((session) => session.status === 'completed')
    .map(getSessionDateKey)
    .filter((dateKey): dateKey is string => Boolean(dateKey))

  if (completedDateKeys.length === 0) {
    return []
  }

  const latestDateKey = [...completedDateKeys].sort().at(-1)!
  const latestDate = dateFromKey(latestDateKey)
  const endDate = addUtcDays(latestDate, 6 - getMondayBasedWeekdayIndex(latestDate))
  const startDate = addUtcDays(endDate, -(12 * 7 - 1))
  const startDateKey = formatDateKey(startDate)
  const endDateKey = formatDateKey(endDate)
  const totalsByExercise = new Map<string, { exerciseName: string; totalVolumeKg: number; completedSets: number; sessionIds: Set<string> }>()

  for (const session of sessions) {
    const sessionDateKey = getSessionDateKey(session)
    if (!sessionDateKey || sessionDateKey < startDateKey || sessionDateKey > endDateKey) {
      continue
    }

    for (const exercise of session.exercises) {
      const completedSets = exercise.sets.filter((set) => set.status === 'completed' && isProgressSet(set))
      if (completedSets.length === 0) {
        continue
      }

      const entry = totalsByExercise.get(exercise.exerciseId) ?? {
        exerciseName: exercise.nameSnapshot,
        totalVolumeKg: 0,
        completedSets: 0,
        sessionIds: new Set<string>(),
      }
      entry.exerciseName = exercise.nameSnapshot
      entry.totalVolumeKg += completedSets.reduce((sum, set) => sum + set.weightKg * set.reps, 0)
      entry.completedSets += completedSets.length
      entry.sessionIds.add(session.id)
      totalsByExercise.set(exercise.exerciseId, entry)
    }
  }

  return Array.from(totalsByExercise.entries())
    .map(([exerciseId, entry]) => ({
      exerciseId,
      exerciseName: entry.exerciseName,
      totalVolumeKg: Math.round(entry.totalVolumeKg * 10) / 10,
      completedSets: entry.completedSets,
      sessionCount: entry.sessionIds.size,
    }))
    .sort((a, b) => b.totalVolumeKg - a.totalVolumeKg || b.completedSets - a.completedSets || a.exerciseName.localeCompare(b.exerciseName, 'sk'))
    .slice(0, 5)
}

function buildMuscleGroupSummaries(sessions: FitnessLiveSession[]): FitnessMuscleGroupSummary[] {
  const completedDateKeys = sessions
    .filter((session) => session.status === 'completed')
    .map(getSessionDateKey)
    .filter((dateKey): dateKey is string => Boolean(dateKey))

  if (completedDateKeys.length === 0) {
    return []
  }

  const latestDateKey = [...completedDateKeys].sort().at(-1)!
  const latestDate = dateFromKey(latestDateKey)
  const endDate = addUtcDays(latestDate, 6 - getMondayBasedWeekdayIndex(latestDate))
  const startDate = addUtcDays(endDate, -(12 * 7 - 1))
  const latestWeekStartKey = formatDateKey(addUtcDays(endDate, -6))
  const startDateKey = formatDateKey(startDate)
  const endDateKey = formatDateKey(endDate)
  const totalsByMuscleGroup = new Map<FitnessMuscleGroup, { totalVolumeKg: number; completedSets: number; latestWeekVolumeKg: number; latestWeekSets: number; exerciseIds: Set<string> }>()

  for (const session of sessions) {
    const sessionDateKey = getSessionDateKey(session)
    if (!sessionDateKey || sessionDateKey < startDateKey || sessionDateKey > endDateKey) {
      continue
    }

    for (const exercise of session.exercises) {
      const completedSets = exercise.sets.filter((set) => set.status === 'completed' && isProgressSet(set))
      if (completedSets.length === 0) {
        continue
      }

      const muscleGroup = resolveMuscleGroup({ exerciseName: exercise.nameSnapshot, category: exercise.categorySnapshot, muscleGroup: exercise.muscleGroupSnapshot })
      const entry = totalsByMuscleGroup.get(muscleGroup) ?? { totalVolumeKg: 0, completedSets: 0, latestWeekVolumeKg: 0, latestWeekSets: 0, exerciseIds: new Set<string>() }
      const setVolumeKg = completedSets.reduce((sum, set) => sum + set.weightKg * set.reps, 0)
      entry.totalVolumeKg += setVolumeKg
      entry.completedSets += completedSets.length
      if (sessionDateKey >= latestWeekStartKey && sessionDateKey <= endDateKey) {
        entry.latestWeekVolumeKg += setVolumeKg
        entry.latestWeekSets += completedSets.length
      }
      entry.exerciseIds.add(exercise.exerciseId)
      totalsByMuscleGroup.set(muscleGroup, entry)
    }
  }

  return Array.from(totalsByMuscleGroup.entries())
    .map(([muscleGroup, entry]) => {
      const weeklySetAverage = Math.round((entry.completedSets / 12) * 10) / 10
      const latestWeekStatus = classifyMuscleVolumeStatus(entry.latestWeekSets)
      const action = buildMuscleVolumeAction(latestWeekStatus, entry.latestWeekSets, weeklySetAverage)
      return {
        muscleGroup,
        label: formatMuscleGroupLabel(muscleGroup),
        totalVolumeKg: Math.round(entry.totalVolumeKg * 10) / 10,
        completedSets: entry.completedSets,
        exerciseCount: entry.exerciseIds.size,
        weeklySetAverage,
        latestWeekSets: entry.latestWeekSets,
        latestWeekVolumeKg: Math.round(entry.latestWeekVolumeKg * 10) / 10,
        latestWeekStatus,
        volumeStatus: latestWeekStatus,
        ...action,
      }
    })
    .sort((a, b) => b.completedSets - a.completedSets || b.totalVolumeKg - a.totalVolumeKg || a.label.localeCompare(b.label, 'sk'))
}

function classifyMuscleVolumeStatus(sets: number): FitnessMuscleVolumeStatus {
  if (sets < 10) return 'low'
  if (sets > 20) return 'high'
  return 'target'
}

function buildMuscleVolumeAction(status: FitnessMuscleVolumeStatus, latestWeekSets: number, weeklySetAverage: number): { action: FitnessMuscleVolumeAction; actionLabel: string; actionReason: string } {
  const latestWeekText = formatWorkingSetCount(latestWeekSets)
  const averageText = formatAverageSetCount(weeklySetAverage)

  if (status === 'high') {
    return {
      action: 'recover',
      actionLabel: 'Zváž regeneráciu',
      actionReason: `Posledný týždeň má ${latestWeekText}, je nad cieľom 10–20 a 12-týždňový priemer ${averageText} dáva kontext. Uber izolácie alebo pridaj ľahší týždeň, ak cítiš únavu.`,
    }
  }

  if (status === 'target') {
    return {
      action: 'hold_volume',
      actionLabel: 'Drž objem',
      actionReason: `Posledný týždeň má ${latestWeekText} a je v cieľovom pásme; 12-týždňový priemer ${averageText} slúži ako kontrola trendu. Drž objem a posúvaj výkon.`,
    }
  }

  if (weeklySetAverage >= 10) {
    return {
      action: 'add_volume',
      actionLabel: 'Pridaj objem',
      actionReason: `Posledný týždeň má ${latestWeekText}, ale 12-týždňový priemer ${averageText} bol v cieľovom pásme. Ak to nebol plánovaný deload, Pridaj 2–4 pracovné série.`,
    }
  }

  return {
    action: 'add_volume',
    actionLabel: 'Pridaj objem',
    actionReason: `Posledný týždeň má ${latestWeekText} a 12-týždňový priemer ${averageText} je pod cieľom. Pridaj 2–4 pracovné série alebo jeden doplnkový cvik.`,
  }
}

function formatWorkingSetCount(count: number) {
  if (count === 1) return '1 pracovná séria'
  if (count > 1 && count < 5) return `${count} pracovné série`
  return `${count} pracovných sérií`
}

function formatAverageSetCount(value: number) {
  const formatted = Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)
  return formatted
}

function buildRecoverySignals(sessions: FitnessLiveSession[], muscleGroupSummaries: FitnessMuscleGroupSummary[]): FitnessRecoverySignal[] {
  const completedDateKeys = sessions
    .filter((session) => session.status === 'completed')
    .map(getSessionDateKey)
    .filter((dateKey): dateKey is string => Boolean(dateKey))

  if (completedDateKeys.length === 0) {
    return []
  }

  const latestDateKey = [...completedDateKeys].sort().at(-1)!
  const latestDate = dateFromKey(latestDateKey)
  const endDate = addUtcDays(latestDate, 6 - getMondayBasedWeekdayIndex(latestDate))
  const latestWeekStartKey = formatDateKey(addUtcDays(endDate, -6))
  const endDateKey = formatDateKey(endDate)
  const latestWeekSessions = sessions.filter((session) => {
    const sessionDateKey = getSessionDateKey(session)
    return session.status === 'completed' && Boolean(sessionDateKey) && sessionDateKey! >= latestWeekStartKey && sessionDateKey! <= endDateKey
  })
  const strain = summarizeRecentStrain(latestWeekSessions)
  const highVolumeMuscleGroups = muscleGroupSummaries
    .filter((summary) => summary.latestWeekStatus === 'high')
    .sort((a, b) => b.latestWeekSets - a.latestWeekSets || b.latestWeekVolumeKg - a.latestWeekVolumeKg || a.label.localeCompare(b.label, 'sk'))
  const signals: FitnessRecoverySignal[] = highVolumeMuscleGroups.map((summary) => {
    const highStrainSuffix = strain.hasHighStrain ? ` Zároveň posledný týždeň hlási ${strain.label}.` : ''
    return {
      id: `high-volume-${summary.muscleGroup}`,
      severity: strain.hasHighStrain ? 'deload' : 'reduce',
      title: strain.hasHighStrain ? 'Regenerácia je pravdepodobne limit' : 'Objem je nad cieľom',
      recommendation: strain.hasHighStrain ? 'Uber objem a zaraď ľahší tréning' : 'Uber objem',
      reason: `${summary.label}: ${formatWorkingSetCount(summary.latestWeekSets)} v poslednom týždni je nad cieľom 10–20.${highStrainSuffix} Najbližší tréning skráť o izolácie alebo uber 2–4 pracovné série.`,
      muscleGroup: summary.muscleGroup,
      muscleGroupLabel: summary.label,
    }
  })

  if (signals.length === 0 && strain.hasHighStrain) {
    signals.push({
      id: 'recent-strain',
      severity: 'watch',
      title: 'Zaraď ľahší tréning',
      recommendation: 'Drž objem a sleduj výkon',
      reason: `Posledný týždeň hlási ${strain.label}. Ak výkon klesá alebo bolí technika, zvoľ ľahší tréning namiesto ďalšieho pridávania objemu.`,
    })
  }

  return signals.slice(0, 3)
}

function summarizeRecentStrain(sessions: FitnessLiveSession[]) {
  const highRpe = sessions
    .map((session) => session.sessionRpe)
    .filter((value): value is number => typeof value === 'number' && value >= 9)
    .sort((a, b) => b - a)[0]
  const lowEnergy = sessions
    .map((session) => session.energyLevel)
    .filter((value): value is number => typeof value === 'number' && value <= 2)
    .sort((a, b) => a - b)[0]
  const parts = [
    highRpe === undefined ? null : `RPE ${highRpe}/10`,
    lowEnergy === undefined ? null : `energia ${lowEnergy}/5`,
  ].filter((part): part is string => Boolean(part))

  return {
    hasHighStrain: parts.length > 0,
    label: parts.join(' a '),
  }
}

function buildOneRepMaxSeries(sessions: FitnessLiveSession[]): FitnessOneRepMaxSeries[] {
  const seriesByExercise = new Map<string, { exerciseName: string; points: FitnessOneRepMaxPoint[] }>()
  const orderedSessions = [...sessions]
    .filter((session) => session.status === 'completed')
    .sort((a, b) => String(a.completedAt ?? a.updatedAt ?? '').localeCompare(String(b.completedAt ?? b.updatedAt ?? '')))

  for (const session of orderedSessions) {
    const bestPointByExercise = new Map<string, { exerciseName: string; point: FitnessOneRepMaxPoint }>()

    for (const exercise of session.exercises) {
      for (const set of exercise.sets) {
        if (set.status !== 'completed' || !isProgressSet(set)) {
          continue
        }

        const estimatedOneRepMaxKg = estimateOneRepMaxKg(set.weightKg, set.reps)
        const currentBest = bestPointByExercise.get(exercise.exerciseId)
        if (!currentBest || estimatedOneRepMaxKg > currentBest.point.estimatedOneRepMaxKg) {
          bestPointByExercise.set(exercise.exerciseId, {
            exerciseName: exercise.nameSnapshot,
            point: {
              sessionId: session.id,
              sessionName: session.name,
              achievedAt: set.completedAt ?? session.completedAt,
              weightKg: set.weightKg,
              reps: set.reps,
              estimatedOneRepMaxKg,
            },
          })
        }
      }
    }

    for (const [exerciseId, entry] of bestPointByExercise) {
      const series = seriesByExercise.get(exerciseId) ?? { exerciseName: entry.exerciseName, points: [] }
      series.exerciseName = entry.exerciseName
      series.points.push(entry.point)
      seriesByExercise.set(exerciseId, series)
    }
  }

  return Array.from(seriesByExercise.entries())
    .filter(([, series]) => series.points.length >= 2)
    .map(([exerciseId, series]) => {
      const latestPoint = series.points.at(-1)!
      const previousPoint = series.points.at(-2) ?? null
      const deltaKg = previousPoint ? Math.round((latestPoint.estimatedOneRepMaxKg - previousPoint.estimatedOneRepMaxKg) * 10) / 10 : null
      return {
        exerciseId,
        exerciseName: series.exerciseName,
        latestEstimatedOneRepMaxKg: latestPoint.estimatedOneRepMaxKg,
        deltaKg,
        points: series.points,
      }
    })
    .sort((a, b) => b.latestEstimatedOneRepMaxKg - a.latestEstimatedOneRepMaxKg)
    .slice(0, 3)
}

function getCompletedSetContexts(session: FitnessLiveSession): CompletedSetContext[] {
  return session.exercises.flatMap((exercise) =>
    exercise.sets
      .filter((set) => set.status === 'completed' && isProgressSet(set))
      .map((set) => ({
        session,
        exercise,
        set,
        estimatedOneRepMaxKg: estimateOneRepMaxKg(set.weightKg, set.reps),
      })),
  )
}

function buildPrEvents(contexts: CompletedSetContext[]): FitnessPrEvent[] {
  const bestByExercise = new Map<string, CompletedSetContext>()

  for (const context of contexts) {
    const currentBest = bestByExercise.get(context.exercise.exerciseId)
    if (!currentBest || compareSetStrength(context, currentBest) > 0) {
      bestByExercise.set(context.exercise.exerciseId, context)
    }
  }

  return Array.from(bestByExercise.values())
    .sort((a, b) => b.estimatedOneRepMaxKg - a.estimatedOneRepMaxKg)
    .map((context): FitnessPrEvent => ({
      exerciseId: context.exercise.exerciseId,
      exerciseName: context.exercise.nameSnapshot,
      type: 'estimated_1rm',
      weightKg: context.set.weightKg,
      reps: context.set.reps,
      estimatedOneRepMaxKg: context.estimatedOneRepMaxKg,
      achievedAt: context.set.completedAt ?? context.session.completedAt,
      label: `${context.exercise.nameSnapshot} · ${formatKg(context.estimatedOneRepMaxKg)} e1RM`,
    }))
}

function compareSetStrength(a: CompletedSetContext, b: CompletedSetContext) {
  if (a.estimatedOneRepMaxKg !== b.estimatedOneRepMaxKg) {
    return a.estimatedOneRepMaxKg - b.estimatedOneRepMaxKg
  }
  if (a.set.weightKg !== b.set.weightKg) {
    return a.set.weightKg - b.set.weightKg
  }
  return a.set.reps - b.set.reps
}

function isProgressSet(set: FitnessSessionSetRecord) {
  return set.setType !== 'warmup'
}

function isCorrectedSet(set: FitnessSessionSetRecord) {
  return Boolean(set.correctedAt) || (set.correctionCount ?? 0) > 0
}

function buildProgressionHints(sessions: FitnessLiveSession[]): FitnessProgressionHint[] {
  const sortedSessions = [...sessions]
    .filter((session) => session.status === 'completed')
    .sort((a, b) => String(b.completedAt ?? b.updatedAt).localeCompare(String(a.completedAt ?? a.updatedAt)))
  const usedExerciseIds = new Set<string>()
  const hints: FitnessProgressionHint[] = []

  for (const session of sortedSessions) {
    for (const exercise of session.exercises) {
      if (usedExerciseIds.has(exercise.exerciseId)) {
        continue
      }

      const hint = buildProgressionHint(session, exercise)
      if (hint) {
        hints.push(hint)
        usedExerciseIds.add(exercise.exerciseId)
      }
    }
  }

  return hints
}

function buildProgressionHint(session: FitnessLiveSession, exercise: FitnessSessionExerciseRecord): FitnessProgressionHint | null {
  const completedSets = exercise.sets.filter((set) => set.status === 'completed' && isProgressSet(set))
  const strainReasons = buildSessionStrainReasons(session)
  const hasHighStrain = strainReasons.length > 0

  if (completedSets.length < exercise.targetSets) {
    if (!hasHighStrain) {
      return null
    }

    return buildRepeatLoadHint(
      exercise,
      `Dokončil si ${completedSets.length}/${exercise.targetSets} cieľových sérií na ${exercise.nameSnapshot} a nahlásil si ${formatReasonList(strainReasons)}. Nechaj váhu stabilnú a najprv dokonči cieľovú prácu.`, 
    )
  }

  const targetSets = completedSets.slice(0, exercise.targetSets)
  const targetRir = exercise.targetRir
  const hitTopRepRange = targetSets.every((set) => set.reps >= exercise.maxReps)
  const hasEnoughRir = targetRir === null || targetSets.every((set) => set.rir !== null && set.rir >= targetRir)
  if (!hitTopRepRange || !hasEnoughRir) {
    if (!hasHighStrain) {
      return null
    }

    return buildRepeatLoadHint(
      exercise,
      `Ešte si nesplnil ${exercise.targetSets}×${exercise.maxReps} na ${exercise.nameSnapshot} a tréning skončil s ${formatReasonList(strainReasons)}. Pred progresom zopakuj rovnakú váhu.`, 
    )
  }

  const minRir = targetSets.reduce<number | null>((lowest, set) => {
    if (set.rir === null) return lowest
    if (lowest === null) return set.rir
    return Math.min(lowest, set.rir)
  }, null)
  const rirReason = minRir === null ? '' : ` s RIR ${minRir}`

  if (hasHighStrain) {
    return {
      exerciseId: exercise.exerciseId,
      exerciseName: exercise.nameSnapshot,
      recommendation: 'Nabudúce podrž váhu',
      reason: `Splnil si ${exercise.targetSets}×${exercise.maxReps} na ${exercise.nameSnapshot}${rirReason}, ale tréning skončil s ${formatReasonList(strainReasons)}. Pred pridaním váhy to zopakuj.`, 
    }
  }

  return {
    exerciseId: exercise.exerciseId,
    exerciseName: exercise.nameSnapshot,
    recommendation: 'Nabudúce pridaj 2,5 kg',
    reason: `Splnil si ${exercise.targetSets}×${exercise.maxReps} na ${exercise.nameSnapshot}${rirReason}.`, 
  }
}

function buildRepeatLoadHint(exercise: FitnessSessionExerciseRecord, reason: string): FitnessProgressionHint {
  return {
    exerciseId: exercise.exerciseId,
    exerciseName: exercise.nameSnapshot,
    recommendation: 'Nabudúce zopakuj váhu',
    reason,
  }
}

function buildSessionStrainReasons(session: FitnessLiveSession) {
  const reasons: string[] = []
  if (session.sessionRpe !== null && session.sessionRpe >= 9) {
    reasons.push(`RPE ${session.sessionRpe}/10`)
  }
  if (session.energyLevel !== null && session.energyLevel <= 2) {
    reasons.push(`energia ${session.energyLevel}/5`)
  }
  return reasons
}

function formatReasonList(reasons: string[]) {
  if (reasons.length <= 1) {
    return reasons[0] ?? 'vysokou záťažou'
  }

  return `${reasons.slice(0, -1).join(', ')} a ${reasons.at(-1)}`
}

function buildVolumeTrend(summaries: FitnessSessionSummary[]) {
  const orderedSummaries = [...summaries].sort((a, b) => String(b.completedAt ?? '').localeCompare(String(a.completedAt ?? '')))
  const latest = orderedSummaries[0]
  const previous = orderedSummaries[1]

  if (!latest || !previous || previous.totalVolumeKg <= 0) {
    return { percent: null, label: 'Základ' }
  }

  const percent = Math.round(((latest.totalVolumeKg - previous.totalVolumeKg) / previous.totalVolumeKg) * 1000) / 10
  const formatted = Number.isInteger(percent) ? percent.toFixed(0) : percent.toFixed(1)
  return { percent, label: `${percent > 0 ? '+' : ''}${formatted}%` }
}

function buildWeeklyConsistencyLabel(sessions: FitnessLiveSession[]) {
  const uniqueTrainingDays = new Set(
    sessions
      .map((session) => session.completedAt ?? session.startedAt)
      .filter((value): value is string => Boolean(value))
      .map((value) => value.slice(0, 10)),
  )

  return `${uniqueTrainingDays.size}/7 dní`
}
