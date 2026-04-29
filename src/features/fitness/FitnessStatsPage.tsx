import { useEffect, useMemo, useState } from 'react'

import { Activity, AlertTriangle, Flame, Trophy, Zap } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { buildProgressSnapshot } from '@/features/fitness/fitnessProgress'
import type { FitnessLiveSession, FitnessMuscleVolumeStatus, FitnessOneRepMaxSeries, FitnessSettingsRecord, FitnessTrainingHeatmapIntensity, FitnessTrainingHeatmapWeek } from '@/features/fitness/fitnessTypes'
import { formatVolumeWeight, formatWeight } from '@/features/fitness/fitnessUnits'
import { useSpaNavigate } from '@/hooks/useSpaNavigate'

export function FitnessStatsPage() {
  const navigate = useSpaNavigate()
  const [sessions, setSessions] = useState<FitnessLiveSession[]>([])
  const [settings, setSettings] = useState<FitnessSettingsRecord>({ displayUnit: 'kg', showGuidance: true, restSoundEnabled: true, restVibrationEnabled: true, updatedAt: null })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadStats() {
      setIsLoading(true)
      setError(null)
      try {
        const [completedSessions, loadedSettings] = await Promise.all([
          fitnessRepository.listCompletedSessions(),
          fitnessRepository.getSettings(),
        ])
        if (!cancelled) {
          setSessions(completedSessions)
          setSettings(loadedSettings)
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Nepodarilo sa načítať tréningové štatistiky.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadStats()

    return () => {
      cancelled = true
    }
  }, [])

  const snapshot = useMemo(() => buildProgressSnapshot(sessions), [sessions])
  const heatmapSummary = useMemo(() => summarizeHeatmap(snapshot.trainingHeatmapWeeks), [snapshot.trainingHeatmapWeeks])

  return (
    <div className="space-y-6">
      <section className="fitness-hero-panel p-6 lg:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="fitness-badge">PR napätie</Badge>
          <span className="text-sm text-fitness-yellow/80">Blesk označuje progres.</span>
        </div>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl">Štatistiky, ktoré motivujú, nie rozptyľujú.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-fitness-warm/75">
          Týždenná konzistentnosť, objem, PR udalosti, odhad 1RM a odporúčania progresu sa odvodzujú z dokončených tréningov.
        </p>
      </section>

      {isLoading ? (
        <Card title="Načítavam štatistiky" description="Počítam lokálny tréningový progres.">
          <div className="rounded-2xl border border-fitness-yellow/20 bg-black px-4 py-4 text-sm text-fitness-warm/70">Nabíjam PR napätie…</div>
        </Card>
      ) : null}

      {error ? (
        <Card title="Chyba štatistík" description="Lokálna databáza vrátila chybu.">
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-4 text-sm text-rose-200">
            <AlertTriangle className="mr-2 inline size-4" />{error}
          </div>
        </Card>
      ) : null}

      {!isLoading && !error && sessions.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="Zatiaľ žiadne štatistiky"
          description="Dokonči tréning a StingFit lokálne vytvorí PR, objem a odporúčania progresu."
          ctaLabel="Prejsť na tréning"
          onCta={() => navigate('/training')}
        />
      ) : null}

      {!isLoading && !error && sessions.length > 0 ? (
        <>
          <section className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
            <Card title="Snímka progresu" description="Prvé užitočné čísla bez ťažkej analytiky.">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-fitness-yellow/30 bg-black p-4 text-fitness-warm">
                  <Trophy className="size-5 text-fitness-yellow" />
                  <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Dokončené tréningy</p>
                  <p className="mt-2 text-3xl font-black text-fitness-yellow">{snapshot.completedWorkouts}</p>
                </div>
                <div className="rounded-2xl border border-fitness-yellow/30 bg-black p-4 text-fitness-warm">
                  <Flame className="size-5 text-fitness-orange" />
                  <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Celkový objem</p>
                  <p className="mt-2 text-3xl font-black text-fitness-yellow">{formatVolumeWeight(snapshot.totalVolumeKg, settings.displayUnit)}</p>
                </div>
                <div className="rounded-2xl border border-fitness-yellow/30 bg-black p-4 text-fitness-warm">
                  <Flame className="size-5 text-fitness-orange" />
                  <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Trend objemu</p>
                  <p className="mt-2 text-3xl font-black text-fitness-yellow">{snapshot.volumeTrendLabel}</p>
                </div>
                <div className="rounded-2xl border border-fitness-yellow/30 bg-black p-4 text-fitness-warm">
                  <Activity className="size-5 text-fitness-yellow" />
                  <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Týždenná konzistentnosť</p>
                  <p className="mt-2 text-3xl font-black text-fitness-yellow">{snapshot.weeklyConsistencyLabel}</p>
                </div>
              </div>
            </Card>

            <Card title="Nedávne PR udalosti" description="Odhadované 1RM PR sa počítajú z dokončených sérií.">
              {snapshot.prEvents.length > 0 ? (
                <div className="space-y-3">
                  {snapshot.prEvents.map((event) => (
                    <div key={`${event.exerciseId}-${event.estimatedOneRepMaxKg}`} className="flex items-center justify-between rounded-2xl border border-fitness-yellow/20 bg-black px-4 py-3 text-fitness-warm">
                      <div>
                        <span className="text-sm font-semibold">{event.exerciseName} · {formatWeight(event.estimatedOneRepMaxKg, settings.displayUnit)} e1RM</span>
                        <p className="mt-1 text-xs text-fitness-warm/60">Najlepšia séria: {formatWeight(event.weightKg, settings.displayUnit)} × {event.reps}</p>
                      </div>
                      <Zap className="size-4 text-fitness-yellow" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-secondary dark:text-text-secondary-dark">Zatiaľ žiadne dokončené série.</p>
              )}
            </Card>
          </section>

          <Card title="Konzistentnosť 12 týždňov" description="Každý štvorček je deň; žltá intenzita ukazuje, koľko tréningov si v daný deň dokončil.">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-fitness-yellow/20 bg-black px-4 py-4 text-fitness-warm">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Tréningové dni</p>
                <p className="mt-2 text-2xl font-black text-fitness-yellow">{formatTrainingDayCount(heatmapSummary.trainingDays)}</p>
              </div>
              <div className="rounded-2xl border border-fitness-yellow/20 bg-black px-4 py-4 text-fitness-warm">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Tréningy v okne</p>
                <p className="mt-2 text-2xl font-black text-fitness-yellow">{formatWorkoutCount(heatmapSummary.workouts)}</p>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto pb-2">
              <div className="inline-flex min-w-max gap-2">
                <div className="grid grid-rows-7 gap-1 pr-1 text-[10px] font-black uppercase text-fitness-warm/45" aria-hidden="true">
                  {['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'].map((day) => <span key={day} className="flex h-4 items-center">{day}</span>)}
                </div>
                <div data-testid="training-heatmap" className="inline-grid grid-flow-col gap-1">
                  {snapshot.trainingHeatmapWeeks.map((week) => (
                    <div key={week.weekStart} className="grid grid-rows-7 gap-1" aria-label={`Týždeň od ${formatHeatmapDate(week.weekStart)}`}>
                      {week.days.map((day) => (
                        <span
                          key={day.date}
                          role="img"
                          aria-label={`${formatHeatmapDate(day.date)}: ${formatWorkoutCount(day.completedWorkoutCount)}`}
                          className={getHeatmapCellClass(day.intensity)}
                          title={`${formatHeatmapDate(day.date)}: ${formatWorkoutCount(day.completedWorkoutCount)}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-fitness-warm/45">
              <span>Menej</span>
              {[0, 1, 2, 3, 4].map((intensity) => <span key={intensity} className={getHeatmapCellClass(intensity as FitnessTrainingHeatmapIntensity)} />)}
              <span>Viac</span>
            </div>
          </Card>

          <Card title="Objem podľa cviku" description="Top cviky podľa pracovného objemu v rovnakom 12-týždňovom okne ako heatmapa.">
            {snapshot.exerciseVolumeLeaders.length > 0 ? (
              <div data-testid="exercise-volume-leaders" className="space-y-3">
                {snapshot.exerciseVolumeLeaders.map((leader) => {
                  const maxVolume = snapshot.exerciseVolumeLeaders[0]?.totalVolumeKg ?? 1
                  const barWidth = Math.max(8, Math.round((leader.totalVolumeKg / maxVolume) * 100))
                  return (
                    <article key={leader.exerciseId} className="rounded-2xl border border-fitness-yellow/20 bg-black px-4 py-4 text-fitness-warm">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h2 className="text-sm font-black text-fitness-yellow">{leader.exerciseName}</h2>
                          <p className="mt-1 text-xs font-bold text-fitness-warm/60">
                            {formatVolumeWeight(leader.totalVolumeKg, settings.displayUnit)} · {formatCompletedSetCount(leader.completedSets)} · {formatSessionCount(leader.sessionCount)}
                          </p>
                        </div>
                        <Flame className="size-4 text-fitness-orange" />
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-fitness-yellow/10">
                        <div className="h-full rounded-full bg-fitness-yellow" style={{ width: `${barWidth}%` }} />
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-text-secondary dark:text-text-secondary-dark">Zapíš pracovné série a StingFit ukáže, kam išiel tvoj objem.</p>
            )}
          </Card>

          <Card title="Objem podľa svalovej skupiny" description="Pracovné série a objem za posledných 12 týždňov podľa lokálnej taxonómie cvikov.">
            {snapshot.muscleGroupSummaries.length > 0 ? (
              <div data-testid="muscle-group-volume" className="grid gap-3 lg:grid-cols-2">
                {snapshot.muscleGroupSummaries.map((summary) => {
                  const maxSets = snapshot.muscleGroupSummaries[0]?.completedSets ?? 1
                  const barWidth = Math.max(8, Math.round((summary.completedSets / maxSets) * 100))
                  return (
                    <article key={summary.muscleGroup} className="rounded-2xl border border-fitness-yellow/20 bg-black px-4 py-4 text-fitness-warm">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h2 className="text-sm font-black text-fitness-yellow">{summary.label}</h2>
                          <p className="mt-1 text-xs font-bold text-fitness-warm/60">
                            {formatCompletedSetCount(summary.completedSets)} · {formatVolumeWeight(summary.totalVolumeKg, settings.displayUnit)} · {formatExerciseCount(summary.exerciseCount)}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-fitness-warm/50">Posledný týždeň: {formatCompletedSetCount(summary.latestWeekSets)} · {formatVolumeWeight(summary.latestWeekVolumeKg, settings.displayUnit)}</p>
                          <p className="mt-1 text-xs font-semibold text-fitness-warm/50">Priemer 12 týždňov: {formatWeeklySetAverage(summary.weeklySetAverage)} · Cieľ 10–20 sérií/týždeň</p>
                        </div>
                        <Badge className={getMuscleVolumeBadgeClass(summary.latestWeekStatus)}>
                          {formatMuscleVolumeStatus(summary.latestWeekStatus)}
                        </Badge>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-fitness-yellow/10">
                        <div className="h-full rounded-full bg-fitness-yellow" style={{ width: `${barWidth}%` }} />
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-text-secondary dark:text-text-secondary-dark">Zapíš pracovné série a StingFit ich rozdelí podľa svalových skupín.</p>
            )}
          </Card>

          <Card title="Krivka 1RM" description="Najlepší odhad 1RM pre rovnaký cvik naprieč dokončenými tréningami.">
            {snapshot.oneRepMaxSeries.length > 0 ? (
              <div className="grid gap-3 lg:grid-cols-3">
                {snapshot.oneRepMaxSeries.map((series) => (
                  <article key={series.exerciseId} className="rounded-2xl border border-fitness-yellow/20 bg-black px-4 py-4 text-fitness-warm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-sm font-black text-fitness-yellow">{series.exerciseName} · {formatWeight(series.latestEstimatedOneRepMaxKg, settings.displayUnit)} e1RM</h2>
                        <p className="mt-1 text-xs font-bold text-fitness-warm/60">
                          {formatTrendPointCount(series.points.length)} · {formatTrendDelta(series.deltaKg, settings.displayUnit)}
                        </p>
                      </div>
                      <Zap className="size-4 text-fitness-yellow" />
                    </div>
                    <OneRepMaxMiniChart series={series} />
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-secondary dark:text-text-secondary-dark">Dokonči rovnaký cvik aspoň dvakrát a StingFit zobrazí lokálnu 1RM krivku.</p>
            )}
          </Card>

          <Card title="Odporúčania progresu" description="Transparentné dôvody; aplikácia nikdy nemení plán automaticky.">
            {snapshot.progressionHints.length > 0 ? (
              <div className="space-y-3">
                {snapshot.progressionHints.map((hint) => (
                  <div key={hint.exerciseId} className="rounded-2xl bg-fitness-yellow px-4 py-4 text-sm font-bold text-black">
                    <p>{hint.exerciseName}: {hint.recommendation}</p>
                    <p className="mt-1 text-xs font-semibold text-black/70">{hint.reason}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-secondary dark:text-text-secondary-dark">Zapíš celé cieľové série na hornej hranici opakovaní a odomkneš odporúčanie.</p>
            )}
          </Card>
        </>
      ) : null}
    </div>
  )
}

function summarizeHeatmap(weeks: FitnessTrainingHeatmapWeek[]) {
  const days = weeks.flatMap((week) => week.days)
  return {
    trainingDays: days.filter((day) => day.completedWorkoutCount > 0).length,
    workouts: days.reduce((sum, day) => sum + day.completedWorkoutCount, 0),
  }
}

function getHeatmapCellClass(intensity: FitnessTrainingHeatmapIntensity) {
  const baseClass = 'block size-4 rounded-[4px] border'
  if (intensity === 0) return `${baseClass} border-fitness-yellow/10 bg-fitness-yellow/5`
  if (intensity === 1) return `${baseClass} border-fitness-yellow/25 bg-fitness-yellow/25`
  if (intensity === 2) return `${baseClass} border-fitness-yellow/40 bg-fitness-yellow/45`
  if (intensity === 3) return `${baseClass} border-fitness-yellow/60 bg-fitness-yellow/70`
  return `${baseClass} border-fitness-yellow bg-fitness-yellow`
}

function formatHeatmapDate(dateKey: string) {
  return new Date(`${dateKey}T00:00:00.000Z`).toLocaleDateString('sk-SK', { day: 'numeric', month: 'short' })
}

function formatTrainingDayCount(count: number) {
  if (count === 1) return '1 deň'
  if (count > 1 && count < 5) return `${count} dni`
  return `${count} dní`
}

function formatWorkoutCount(count: number) {
  if (count === 0) return '0 tréningov'
  if (count === 1) return '1 tréning'
  if (count > 1 && count < 5) return `${count} tréningy`
  return `${count} tréningov`
}

function formatCompletedSetCount(count: number) {
  if (count === 1) return '1 séria'
  if (count > 1 && count < 5) return `${count} série`
  return `${count} sérií`
}

function formatSessionCount(count: number) {
  if (count === 1) return '1 tréning'
  if (count > 1 && count < 5) return `${count} tréningy`
  return `${count} tréningov`
}

function formatExerciseCount(count: number) {
  if (count === 1) return '1 cvik'
  if (count > 1 && count < 5) return `${count} cviky`
  return `${count} cvikov`
}

function formatWeeklySetAverage(value: number) {
  const formatted = Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)
  return `${formatted} série/týždeň`
}

function getMuscleVolumeBadgeClass(status: FitnessMuscleVolumeStatus) {
  if (status === 'low') return 'border border-fitness-orange/40 bg-fitness-orange/15 text-fitness-warm'
  if (status === 'high') return 'border border-rose-500/40 bg-rose-500/15 text-rose-100'
  return 'bg-fitness-yellow text-black'
}

function formatMuscleVolumeStatus(status: FitnessMuscleVolumeStatus) {
  if (status === 'low') return 'Pod 10 sérií/týždeň'
  if (status === 'high') return 'Nad 20 sérií/týždeň'
  return 'Cieľový objem'
}

function OneRepMaxMiniChart({ series }: { series: FitnessOneRepMaxSeries }) {
  const width = 320
  const height = 120
  const padding = 16
  const values = series.points.map((point) => point.estimatedOneRepMaxKg)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const range = maxValue - minValue || 1
  const coordinates = values.map((value, index) => {
    const x = padding + (index / Math.max(1, values.length - 1)) * (width - padding * 2)
    const y = height - padding - ((value - minValue) / range) * (height - padding * 2)
    return { x, y }
  })
  const linePoints = coordinates.map((point) => `${point.x},${point.y}`).join(' ')

  return (
    <svg
      data-testid="one-rep-max-chart"
      role="img"
      aria-label={`Krivka 1RM pre ${series.exerciseName}`}
      viewBox={`0 0 ${width} ${height}`}
      className="mt-4 h-32 w-full text-fitness-yellow"
    >
      <line x1={padding} x2={width - padding} y1={height - padding} y2={height - padding} stroke="currentColor" strokeOpacity="0.18" strokeWidth="2" />
      <polyline points={linePoints} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
      {coordinates.map((point, index) => (
        <circle key={`${series.exerciseId}-${index}`} cx={point.x} cy={point.y} r="5" fill="currentColor" />
      ))}
    </svg>
  )
}

function formatTrendPointCount(count: number) {
  if (count === 1) return '1 bod'
  if (count > 1 && count < 5) return `${count} body`
  return `${count} bodov`
}

function formatTrendDelta(deltaKg: number | null, displayUnit: FitnessSettingsRecord['displayUnit']) {
  if (deltaKg === null) {
    return 'Základ'
  }

  const formatted = formatWeight(deltaKg, displayUnit)
  return deltaKg > 0 ? `+${formatted}` : formatted
}
