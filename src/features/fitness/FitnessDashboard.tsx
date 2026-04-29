import { useCallback, useEffect, useRef, useState } from 'react'

import { AlertTriangle, Dumbbell, Plus, Zap } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { LiveTrainingSession } from '@/features/fitness/LiveTrainingSession'
import { buildPlanReadinessReport } from '@/features/fitness/fitnessPlanReadiness'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { pickRecommendedWorkout, type FitnessWorkoutRecommendation } from '@/features/fitness/fitnessWorkoutRecommendation'
import type { AddUnplannedExerciseInput, FinishFitnessSessionInput, FitnessExerciseRecord, FitnessLiveSession, FitnessSettingsRecord, FitnessStartableWorkout, LogFitnessSetInput } from '@/features/fitness/fitnessTypes'
import { useSpaNavigate } from '@/hooks/useSpaNavigate'

interface FitnessDashboardProps {
  autoStartQuick?: boolean
}

export function FitnessDashboard({ autoStartQuick = false }: FitnessDashboardProps = {}) {
  const navigate = useSpaNavigate()
  const hasAutoStartedQuickRef = useRef(false)
  const [activeSession, setActiveSession] = useState<FitnessLiveSession | null>(null)
  const [startableWorkouts, setStartableWorkouts] = useState<FitnessStartableWorkout[]>([])
  const [notReadyReasons, setNotReadyReasons] = useState<string[]>([])
  const [recommendedWorkout, setRecommendedWorkout] = useState<FitnessWorkoutRecommendation | null>(null)
  const [exerciseOptions, setExerciseOptions] = useState<FitnessExerciseRecord[]>([])
  const [settings, setSettings] = useState<FitnessSettingsRecord>({
    displayUnit: 'kg',
    showGuidance: true,
    restSoundEnabled: true,
    restVibrationEnabled: true,
    updatedAt: null,
  })
  const [isRecoveryPromptVisible, setIsRecoveryPromptVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [pendingAbandonSessionId, setPendingAbandonSessionId] = useState<string | null>(null)

  const loadTrainingState = useCallback(async () => {
    setError(null)
    await fitnessRepository.seedStarterData()
    const [active, workouts, exercises, loadedSettings, personalPlans, completedSessions] = await Promise.all([
      fitnessRepository.getActiveSession(),
      fitnessRepository.listStartableWorkouts(),
      fitnessRepository.listExercises(),
      fitnessRepository.getSettings(),
      fitnessRepository.listPersonalPlans(),
      fitnessRepository.listCompletedSessions(),
    ])
    let resolvedActive = active
    if (!resolvedActive && autoStartQuick && !hasAutoStartedQuickRef.current) {
      hasAutoStartedQuickRef.current = true
      resolvedActive = await fitnessRepository.startQuickSession()
    }
    const structures = await Promise.all(personalPlans.map((plan) => fitnessRepository.getPlanStructure(plan.id)))
    const readinessReasons = structures.flatMap((structure) => buildPlanReadinessReport(structure).blockers.map((issue) => issue.message))

    setActiveSession(resolvedActive)
    setStartableWorkouts(workouts)
    setNotReadyReasons(readinessReasons)
    setRecommendedWorkout(pickRecommendedWorkout(workouts, completedSessions))
    setExerciseOptions(exercises)
    setSettings(loadedSettings)
    setIsRecoveryPromptVisible(Boolean(resolvedActive) && !autoStartQuick)
  }, [autoStartQuick])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      try {
        await loadTrainingState()
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Nepodarilo sa načítať tréningový stav.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [loadTrainingState])

  const runMutation = async (operation: () => Promise<FitnessLiveSession | null>, message: string) => {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const nextSession = await operation()
      setActiveSession(nextSession)
      setSuccessMessage(message)
      if (!nextSession || nextSession.status !== 'active') {
        await loadTrainingState()
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Tréningová akcia zlyhala.')
    } finally {
      setIsMutating(false)
    }
  }

  const startWorkout = async (workoutId: string) => {
    setIsRecoveryPromptVisible(false)
    await runMutation(() => fitnessRepository.startSessionFromPlanWorkout(workoutId), 'Tréning spustený')
  }

  const logSet = async (setId: string, input: LogFitnessSetInput) => {
    await runMutation(() => fitnessRepository.logSet(setId, input), 'Séria zapísaná')
  }

  const updateSet = async (setId: string, input: LogFitnessSetInput) => {
    await runMutation(() => fitnessRepository.updateLoggedSet(setId, input), 'Séria upravená')
  }

  const addSet = async (sessionExerciseId: string) => {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)
    try {
      await fitnessRepository.addSessionSet(sessionExerciseId)
      const nextSession = activeSession ? await fitnessRepository.getLiveSession(activeSession.id) : await fitnessRepository.getActiveSession()
      setActiveSession(nextSession)
      setSuccessMessage('Séria pridaná')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nepodarilo sa pridať sériu.')
    } finally {
      setIsMutating(false)
    }
  }

  const removeSet = async (setId: string) => {
    await runMutation(() => fitnessRepository.removeSessionSet(setId), 'Séria odstránená')
  }

  const skipExercise = async (sessionExerciseId: string) => {
    await runMutation(() => fitnessRepository.skipSessionExercise(sessionExerciseId), 'Cvik preskočený')
  }

  const addUnplannedExercise = async (sessionId: string, input: AddUnplannedExerciseInput) => {
    await runMutation(() => fitnessRepository.addUnplannedExerciseToSession(sessionId, input), 'Neplánovaný cvik pridaný')
  }

  const finishWorkout = async (sessionId: string, input?: FinishFitnessSessionInput) => {
    await runMutation(() => fitnessRepository.finishSession(sessionId, input), 'Tréning dokončený')
  }

  const requestAbandonWorkout = async (sessionId: string) => {
    setPendingAbandonSessionId(sessionId)
  }

  const confirmAbandonWorkout = async () => {
    if (!pendingAbandonSessionId) {
      return
    }

    const sessionId = pendingAbandonSessionId
    setPendingAbandonSessionId(null)
    await runMutation(() => fitnessRepository.abandonSession(sessionId), 'Tréning zahodený')
  }

  const abandonConfirmationModal = (
    <ConfirmModal
      open={pendingAbandonSessionId !== null}
      title="Zahodiť rozpracovaný tréning?"
      description="Zapísané dáta zostanú v zahodenom tréningovom zázname, ale tréning už nebude aktívny."
      confirmLabel="Áno, zahodiť tréning"
      cancelLabel="Pokračovať v tréningu"
      isConfirming={isMutating}
      onConfirm={() => void confirmAbandonWorkout()}
      onClose={() => setPendingAbandonSessionId(null)}
    />
  )

  const createStarterPlan = async () => {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const starter = (await fitnessRepository.listStarterPlans()).find((plan) => plan.id === 'starter-push-pull-legs')
      if (!starter) {
        throw new Error('Štartovací plán Tlak / Ťah / Nohy nie je dostupný.')
      }
      await fitnessRepository.createPersonalPlanFromStarter(starter.id, { name: 'Môj PPL blok', goal: 'Budovať svaly' })
      setSuccessMessage('Štartovací PPL plán je pripravený')
      await loadTrainingState()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nepodarilo sa pripraviť štartovací plán.')
    } finally {
      setIsMutating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="fitness-hero-panel p-6 lg:p-8">
        <Badge className="fitness-badge">Načítavam tréning</Badge>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.06em] text-white">Nabíjam živý zápisník…</h1>
        <p className="mt-3 text-sm text-fitness-warm/70">Pripravujem lokálne plány a tréningy.</p>
      </div>
    )
  }

  if (activeSession?.status === 'active') {
    if (isRecoveryPromptVisible) {
      const completedSets = activeSession.exercises.flatMap((exercise) => exercise.sets).filter((set) => set.status === 'completed').length
      const totalSets = activeSession.exercises.flatMap((exercise) => exercise.sets).length

      return (
        <>
          <div className="space-y-4">
            {successMessage ? <StatusMessage tone="success" message={successMessage} /> : null}
            {error ? <StatusMessage tone="error" message={error} /> : null}
            <section className="fitness-hero-panel p-6 lg:p-8">
            <Badge className="fitness-badge">Tréning obnovený</Badge>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl">{activeSession.name}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-fitness-warm/75">
              Našli sme aktívny lokálny tréning z predchádzajúceho otvorenia aplikácie. Vedome v ňom pokračuj alebo ho zahoď pred štartom ďalšieho tréningu.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-fitness-yellow/30 bg-black/70 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Pokrok</p>
                <p className="mt-2 text-lg font-black text-white">{completedSets}/{totalSets} sérií</p>
              </div>
              <div className="rounded-2xl border border-fitness-yellow/30 bg-black/70 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Začiatok</p>
                <p className="mt-2 text-lg font-black text-white">{activeSession.startedAt ? new Date(activeSession.startedAt).toLocaleTimeString() : 'Lokálny tréning'}</p>
              </div>
              <div className="rounded-2xl border border-fitness-yellow/30 bg-black/70 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Jednotka</p>
                <p className="mt-2 text-lg font-black text-white">{settings.displayUnit}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button className="fitness-action" leadingIcon={<Zap className="size-4" />} onClick={() => setIsRecoveryPromptVisible(false)} disabled={isMutating}>
                Pokračovať: {activeSession.name}
              </Button>
              <Button variant="danger" leadingIcon={<AlertTriangle className="size-4" />} onClick={() => void requestAbandonWorkout(activeSession.id)} disabled={isMutating}>
                Zahodiť tréning
              </Button>
            </div>
            </section>
          </div>
          {abandonConfirmationModal}
        </>
      )
    }

    return (
      <div className="space-y-4">
        {successMessage ? <StatusMessage tone="success" message={successMessage} /> : null}
        {error ? <StatusMessage tone="error" message={error} /> : null}
        <LiveTrainingSession
          session={activeSession}
          exerciseOptions={exerciseOptions}
          displayUnit={settings.displayUnit}
          showGuidance={settings.showGuidance}
          restSoundEnabled={settings.restSoundEnabled}
          restVibrationEnabled={settings.restVibrationEnabled}
          isMutating={isMutating}
          onLogSet={logSet}
          onUpdateSet={updateSet}
          onAddSet={addSet}
          onRemoveSet={removeSet}
          onSkipExercise={skipExercise}
          onAddUnplannedExercise={addUnplannedExercise}
          onFinish={finishWorkout}
          onAbandon={requestAbandonWorkout}
        />
        {abandonConfirmationModal}
      </div>
    )
  }

  if (startableWorkouts.length === 0) {
    if (notReadyReasons.length > 0) {
      return (
        <div className="space-y-4">
          {successMessage ? <StatusMessage tone="success" message={successMessage} /> : null}
          {error ? <StatusMessage tone="error" message={error} /> : null}
          <section className="fitness-hero-panel p-6 lg:p-8">
            <Badge className="fitness-badge">Tréning zablokovaný</Badge>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl">Plán potrebuje úpravy pred tréningom.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-fitness-warm/75">
              StingFit našiel osobný plán, ale zatiaľ nie je spustiteľný žiadny tréning. Najprv oprav blokery v Plánoch.
            </p>
          </section>
          <NotReadyWorkoutsCard reasons={notReadyReasons} onOpenPlans={() => navigate('/plans')} />
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {successMessage ? <StatusMessage tone="success" message={successMessage} /> : null}
        {error ? <StatusMessage tone="error" message={error} /> : null}
        <EmptyState
          icon={Dumbbell}
          title="Žiadny pripravený osobný plán"
          description="Najprv vytvor štartovací PPL plán a potom spusti prvý plánovaný tréning z Tréningu. Alebo začni bez plánu rýchly tréning."
          ctaLabel="Pripraviť Tlak / Ťah / Nohy"
          onCta={() => void createStarterPlan()}
        />
        <Card title="Rýchly tréning" description="Bez plánu: otvor živý zápisník a pridaj cviky z lokálnej knižnice až vo fitku.">
          <Button className="fitness-action" leadingIcon={<Zap className="size-4" />} onClick={() => navigate('/quick')} disabled={isMutating}>
            Spustiť rýchly tréning
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {successMessage ? <StatusMessage tone="success" message={successMessage} /> : null}
      {error ? <StatusMessage tone="error" message={error} /> : null}

      <section className="fitness-hero-panel relative p-6 lg:p-8">
        <div className="wasp-stripes absolute inset-0 opacity-50" />
        <div className="relative">
          <Badge className="fitness-badge">Nabitý tréning</Badge>
          <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl">
            Vyber plánovaný tréning a spusti živý zápisník.
          </h1>
          <Button className="fitness-action mt-5" leadingIcon={<Zap className="size-4" />} onClick={() => navigate('/quick')} disabled={isMutating}>
            Spustiť rýchly tréning
          </Button>
          {settings.showGuidance ? (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-fitness-warm/75">
              Tréning sa uloží ako snímka plánu. Neskoršie úpravy plánu neprepíšu tréningovú históriu.
            </p>
          ) : null}
        </div>
      </section>

      {recommendedWorkout ? (
        <UpNextWorkoutCard recommendation={recommendedWorkout} showGuidance={settings.showGuidance} isMutating={isMutating} onStartWorkout={startWorkout} />
      ) : null}

      <Card title="Spustiteľné tréningy" description={settings.showGuidance ? 'Najrýchlejšia cesta: spusti ďalší tréning zo svojho osobného plánu.' : undefined}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {startableWorkouts.map((workout) => (
            <article key={workout.workoutId} className="rounded-2xl border border-fitness-yellow/25 bg-black px-4 py-4 text-fitness-warm">
              <div className="flex h-full flex-col gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Týždeň {workout.weekNumber} · {workout.dayLabel}</p>
                  <h2 className="mt-2 text-lg font-black text-fitness-yellow">{workout.workoutName}</h2>
                  <p className="mt-1 text-sm text-fitness-warm/70">{workout.planName}</p>
                  {settings.showGuidance ? (
                    <>
                      <p className="mt-3 text-sm font-semibold text-fitness-warm/80">{formatStartSummary(workout)}</p>
                      <p className="mt-1 text-xs text-fitness-warm/60">Prvý cvik: {workout.firstExerciseName ?? 'Nenastavené'}</p>
                      <p className="mt-2 text-xs font-semibold text-fitness-yellow/80">Štart vytvorí snímku tréningu</p>
                    </>
                  ) : null}
                </div>
                <Button className="fitness-action mt-auto" leadingIcon={<Zap className="size-4" />} onClick={() => void startWorkout(workout.workoutId)} disabled={isMutating}>
                  Spustiť {workout.workoutName}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </Card>

      {notReadyReasons.length > 0 ? <NotReadyWorkoutsCard reasons={notReadyReasons} onOpenPlans={() => navigate('/plans')} /> : null}

      {settings.showGuidance ? (
        <Card title="Kontroly pre zmeny vo fitku" description="Praktické ovládanie je dostupné počas živého tréningu.">
          <div className="grid gap-3 text-sm text-text-secondary dark:text-text-secondary-dark sm:grid-cols-3">
            <div className="rounded-2xl border border-border px-4 py-3 dark:border-border-dark"><Plus className="mb-2 size-5 text-fitness-orange" />Pridať sériu</div>
            <div className="rounded-2xl border border-border px-4 py-3 dark:border-border-dark"><Dumbbell className="mb-2 size-5 text-fitness-orange" />Preskočiť cvik</div>
            <div className="rounded-2xl border border-border px-4 py-3 dark:border-border-dark"><Zap className="mb-2 size-5 text-fitness-orange" />Dokončiť tréning</div>
          </div>
        </Card>
      ) : null}
    </div>
  )
}

function UpNextWorkoutCard({
  recommendation,
  showGuidance,
  isMutating,
  onStartWorkout,
}: {
  recommendation: FitnessWorkoutRecommendation
  showGuidance: boolean
  isMutating: boolean
  onStartWorkout: (workoutId: string) => Promise<void>
}) {
  const { workout } = recommendation

  return (
    <Card title="Nasleduje" description={showGuidance ? 'Odvodené z tvojich lokálne dokončených tréningov. Kontrola zostáva u teba; StingFit iba odporúča.' : undefined}>
      <div className="rounded-3xl border border-fitness-yellow/40 bg-fitness-yellow/10 p-5 text-fitness-warm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Odporúčaný ďalší tréning: {workout.workoutName}</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-fitness-yellow">{workout.workoutName}</h2>
            <p className="mt-2 text-sm text-fitness-warm/70">Týždeň {workout.weekNumber} · {workout.dayLabel} · {workout.planName}</p>
            {showGuidance ? (
              <>
                <p className="mt-3 text-sm font-semibold text-fitness-warm/80">{formatStartSummary(workout)}</p>
                <p className="mt-1 text-xs text-fitness-warm/60">Prvý cvik: {workout.firstExerciseName ?? 'Nenastavené'}</p>
                <p className="mt-2 text-xs font-semibold text-fitness-yellow/80">Štart vytvorí snímku tréningu</p>
              </>
            ) : null}
            {recommendation.lastCompletedWorkoutName ? (
              <p className="mt-3 text-sm font-semibold text-fitness-warm/80">Naposledy dokončené: {recommendation.lastCompletedWorkoutName}</p>
            ) : null}
            <p className="mt-1 text-xs text-fitness-warm/60">{recommendation.reason}</p>
          </div>
          <Zap className="size-8 text-fitness-yellow" />
        </div>
        <Button className="fitness-action mt-5" leadingIcon={<Zap className="size-4" />} onClick={() => void onStartWorkout(workout.workoutId)} disabled={isMutating}>
          Spustiť odporúčaný tréning: {workout.workoutName}
        </Button>
      </div>
    </Card>
  )
}

function formatStartSummary(workout: FitnessStartableWorkout) {
  return `${workout.exerciseCount} ${workout.exerciseCount === 1 ? 'cvik' : workout.exerciseCount < 5 ? 'cviky' : 'cvikov'} · ${workout.plannedSetCount} plánovaných ${workout.plannedSetCount === 1 ? 'séria' : workout.plannedSetCount < 5 ? 'série' : 'sérií'}`
}

function NotReadyWorkoutsCard({ reasons, onOpenPlans }: { reasons: string[]; onOpenPlans: () => void }) {
  return (
    <Card title="Nepripravené tréningy" description="Tieto položky sú v pláne viditeľné, ale v Tréningu sú zablokované, kým ich neopravíš.">
      <div className="space-y-3">
        {reasons.map((reason) => (
          <div key={reason} className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100">
            <AlertTriangle className="mr-2 inline size-4" />{reason}
          </div>
        ))}
        <Button className="fitness-action" leadingIcon={<Zap className="size-4" />} onClick={onOpenPlans}>
          Otvoriť Plány
        </Button>
      </div>
    </Card>
  )
}

function StatusMessage({ tone, message }: { tone: 'success' | 'error'; message: string }) {
  const isError = tone === 'error'
  return (
    <div className={isError ? 'rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200' : 'rounded-2xl border border-fitness-yellow/40 bg-fitness-yellow/10 px-4 py-3 text-sm font-semibold text-fitness-yellow'}>
      {isError ? <AlertTriangle className="mr-2 inline size-4" /> : <Zap className="mr-2 inline size-4" />}
      {message}
    </div>
  )
}
