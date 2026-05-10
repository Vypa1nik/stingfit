import { useMemo, useRef, useState } from 'react'

import { AlertTriangle, CheckCircle2, FastForward, ListPlus, Plus, Trash2, Trophy, Zap } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { RestTimer } from '@/features/fitness/RestTimer'
import { SetLogger } from '@/features/fitness/SetLogger'
import { formatFitnessSetTypeLabel, getFitnessSetTypeBadgeClass } from '@/features/fitness/fitnessSetTypes'
import type { AddUnplannedExerciseInput, FinishFitnessSessionInput, FitnessExerciseRecord, FitnessLiveSession, FitnessSessionSetRecord, LogFitnessSetInput } from '@/features/fitness/fitnessTypes'
import { formatWeight, type FitnessDisplayUnit } from '@/features/fitness/fitnessUnits'
import { sk } from '@/i18n/sk'
import { useUiStore } from '@/lib/uiStore'
import { cn } from '@/lib/utils'

interface LiveTrainingSessionProps {
  session: FitnessLiveSession
  exerciseOptions: FitnessExerciseRecord[]
  displayUnit: FitnessDisplayUnit
  showGuidance?: boolean
  restSoundEnabled?: boolean
  restVibrationEnabled?: boolean
  isMutating?: boolean
  onLogSet: (setId: string, input: LogFitnessSetInput) => Promise<void>
  onUpdateSet: (setId: string, input: LogFitnessSetInput) => Promise<void>
  onDuplicateSet: (setId: string) => Promise<void>
  onSkipSet: (setId: string) => Promise<void>
  onAddSet: (sessionExerciseId: string) => Promise<void>
  onRemoveSet: (setId: string) => Promise<void>
  onSkipExercise: (sessionExerciseId: string) => Promise<void>
  onAddUnplannedExercise: (sessionId: string, input: AddUnplannedExerciseInput) => Promise<void>
  onFinish: (sessionId: string, input?: FinishFitnessSessionInput) => Promise<void>
  onAbandon: (sessionId: string) => Promise<void>
}

export function LiveTrainingSession({
  session,
  exerciseOptions,
  displayUnit,
  showGuidance = true,
  restSoundEnabled = true,
  restVibrationEnabled = true,
  isMutating = false,
  onLogSet,
  onUpdateSet,
  onDuplicateSet,
  onSkipSet,
  onAddSet,
  onRemoveSet,
  onSkipExercise,
  onAddUnplannedExercise,
  onFinish,
  onAbandon,
}: LiveTrainingSessionProps) {
  const [unplannedExerciseId, setUnplannedExerciseId] = useState(exerciseOptions[0]?.id ?? '')
  const [unplannedTargetSets, setUnplannedTargetSets] = useState('3')
  const [isFinishReviewOpen, setIsFinishReviewOpen] = useState(false)
  const [finishRpe, setFinishRpe] = useState(session.sessionRpe === null ? '8' : String(session.sessionRpe))
  const [finishEnergy, setFinishEnergy] = useState(session.energyLevel === null ? '3' : String(session.energyLevel))
  const [finishNotes, setFinishNotes] = useState(session.notes)
  const [editingSetId, setEditingSetId] = useState<string | null>(null)
  const [optimisticLoggedSets, setOptimisticLoggedSets] = useState<Record<string, FitnessSessionSetRecord>>({})
  const pushToast = useUiStore((state) => state.pushToast)

  const visibleOptimisticLoggedSets = useMemo(
    () => pruneResolvedOptimisticSets(optimisticLoggedSets, session),
    [optimisticLoggedSets, session],
  )
  const visibleSession = useMemo(
    () => applyOptimisticLoggedSets(session, visibleOptimisticLoggedSets),
    [session, visibleOptimisticLoggedSets],
  )
  const activeExercise = visibleSession.exercises.find((exercise) => exercise.status === 'active') ?? visibleSession.exercises.find((exercise) => exercise.status === 'pending')
  const activeSupersetExercises = activeExercise?.supersetGroup
    ? visibleSession.exercises.filter((exercise) => exercise.supersetGroup === activeExercise.supersetGroup)
    : []
  const isActiveSuperset = activeSupersetExercises.length > 1
  const currentSet = activeExercise?.sets.find((set) => set.status === 'planned')
  const completedActiveSets = activeExercise?.sets.filter((set) => set.status === 'completed') ?? []
  const editingSet = completedActiveSets.find((set) => set.id === editingSetId) ?? null
  const lastCompletedSet = activeExercise?.sets.filter((set) => set.status === 'completed' && set.completedAt).sort((a, b) => String(a.completedAt).localeCompare(String(b.completedAt))).at(-1)
  const removableSet = activeExercise ? (activeExercise.sets.filter((set) => set.status === 'planned').at(-1) ?? activeExercise.sets.at(-1)) : undefined
  const selectedUnplannedExerciseId = unplannedExerciseId || exerciseOptions[0]?.id || ''
  const exerciseCount = visibleSession.exercises.length
  const plannedSetCount = visibleSession.exercises.reduce((sum, exercise) => sum + exercise.targetSets, 0)
  const completedSetCount = visibleSession.exercises.flatMap((exercise) => exercise.sets).filter((set) => set.status === 'completed').length
  const totalSets = visibleSession.exercises.flatMap((exercise) => exercise.sets).length

  const openFinishReview = () => {
    setFinishRpe(session.sessionRpe === null ? '8' : String(session.sessionRpe))
    setFinishEnergy(session.energyLevel === null ? '3' : String(session.energyLevel))
    setFinishNotes(session.notes)
    setIsFinishReviewOpen(true)
  }

  const submitFinishReview = async () => {
    await onFinish(session.id, {
      notes: finishNotes,
      sessionRpe: optionalNumber(finishRpe),
      energyLevel: optionalNumber(finishEnergy),
    })
  }

  const submitOptimisticSetLog = async (setId: string, input: LogFitnessSetInput) => {
    const sourceSet = session.exercises
      .flatMap((exercise) => exercise.sets)
      .find((set) => set.id === setId)
    if (!sourceSet) {
      await onLogSet(setId, input)
      return
    }

    setOptimisticLoggedSets((current) => ({
      ...current,
      [setId]: createOptimisticLoggedSet(sourceSet, input),
    }))

    try {
      await onLogSet(setId, input)
    } catch (cause) {
      setOptimisticLoggedSets((current) => removeOptimisticSet(current, setId))
      pushToast({
        tone: 'error',
        title: 'Séria sa neuložila',
        description:
          cause instanceof Error
            ? cause.message
            : 'StingFit nedokázal uložiť sériu.',
      })
    }
  }

  const submitSetEdit = async (setId: string, input: LogFitnessSetInput) => {
    await onUpdateSet(setId, input)
    setEditingSetId(null)
  }

  if (!activeExercise) {
    return (
      <div className="space-y-6">
        <section className="fitness-hero-panel p-6 lg:p-8">
          <Badge className="fitness-badge">{session.exercises.length === 0 ? 'Rýchly tréning' : 'Tréning pripravený na dokončenie'}</Badge>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.06em] text-white">{session.name}</h1>
          <p className="mt-3 text-sm text-fitness-warm/70">
            {session.exercises.length === 0 ? 'Pridaj prvý cvik z lokálnej knižnice a začni zapisovať série bez plánu.' : 'Všetky cviky sú hotové alebo preskočené.'}
          </p>
          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr,auto]">
            <QuickAddExerciseCard
              sessionId={session.id}
              exerciseOptions={exerciseOptions}
              selectedExerciseId={selectedUnplannedExerciseId}
              targetSets={unplannedTargetSets}
              isMutating={isMutating}
              onExerciseChange={setUnplannedExerciseId}
              onTargetSetsChange={setUnplannedTargetSets}
              onAddUnplannedExercise={onAddUnplannedExercise}
            />
            <div className="flex flex-col gap-3 lg:items-end">
              <Button className="fitness-action h-fit" onClick={() => void onFinish(session.id)} disabled={isMutating}>Dokončiť tréning</Button>
              <Button variant="secondary" className="h-fit" onClick={openFinishReview} disabled={isMutating}>Pridať krátku kontrolu</Button>
            </div>
          </div>
          {isFinishReviewOpen ? (
            <div className="mt-6">
              <FinishCheckInPanel
                sessionRpe={finishRpe}
                energyLevel={finishEnergy}
                notes={finishNotes}
                isMutating={isMutating}
                onSessionRpeChange={setFinishRpe}
                onEnergyLevelChange={setFinishEnergy}
                onNotesChange={setFinishNotes}
                onSubmit={submitFinishReview}
                onCancel={() => setIsFinishReviewOpen(false)}
              />
            </div>
          ) : null}
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="fitness-hero-panel relative">
        <div className="wasp-stripes absolute inset-0 opacity-50" />
        <div className="relative grid gap-6 p-6 lg:grid-cols-[1.35fr,0.95fr] lg:p-8">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="fitness-badge">Teraz robíš</Badge>
              {showGuidance ? <Badge className="fitness-badge">Aktívna snímka tréningu</Badge> : null}
              {isActiveSuperset ? <Badge className="fitness-badge">Superset {activeExercise.supersetGroup}</Badge> : null}
              <span className="text-sm font-semibold text-fitness-yellow/80">{completedSetCount} dokončených · {totalSets} sérií spolu</span>
              <span className="text-sm font-semibold text-fitness-yellow/80">Zobrazená jednotka: {displayUnit}</span>
            </div>
            <div className="rounded-3xl border border-fitness-yellow/35 bg-black/75 p-5">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-fitness-yellow">Teraz robíš</p>
              <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl">{activeExercise.nameSnapshot}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-fitness-warm/75">
                Stačí zapísať aktuálnu sériu. Poradie cvikov, doplnkové akcie a plán sú nižšie, keď ich budeš potrebovať.
              </p>
              {showGuidance ? <p className="mt-2 text-sm font-semibold text-fitness-yellow/80">Zmeny plánu neovplyvnia tento tréning.</p> : null}
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-fitness-yellow/30 bg-black/70 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Ďalšia séria</p>
                  <p className="mt-2 text-lg font-black text-white">{currentSet ? `Séria ${currentSet.setNumber} z ${activeExercise.sets.length}` : 'Cvik dokončený'}</p>
                </div>
                <div className="rounded-2xl border border-fitness-yellow/30 bg-black/70 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Cieľ</p>
                  <p className="mt-2 text-lg font-black text-white">{activeExercise.minReps}–{activeExercise.maxReps} opak.</p>
                  <p className="mt-1 text-xs font-semibold text-fitness-warm/60">RIR {activeExercise.targetRir ?? 'voľné'}</p>
                </div>
                <div className="rounded-2xl border border-fitness-yellow/30 bg-black/70 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Hotovo</p>
                  <p className="mt-2 text-lg font-black text-white">{completedActiveSets.length}/{activeExercise.sets.length} sérií</p>
                </div>
              </div>
            </div>
            <details className="rounded-2xl border border-fitness-yellow/20 bg-black/60 p-4 text-fitness-warm">
              <summary className="cursor-pointer text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow">Prehľad tréningu</summary>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-fitness-yellow/30 bg-black/70 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Cviky</p>
                  <p className="mt-2 text-lg font-black text-white">{exerciseCount} {exerciseCount === 1 ? 'cvik' : exerciseCount < 5 ? 'cviky' : 'cvikov'}</p>
                </div>
                <div className="rounded-2xl border border-fitness-yellow/30 bg-black/70 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Plánované série</p>
                  <p className="mt-2 text-lg font-black text-white">{plannedSetCount} plánovaných {plannedSetCount === 1 ? 'séria' : plannedSetCount < 5 ? 'série' : 'sérií'}</p>
                </div>
                <div className="rounded-2xl border border-fitness-yellow/30 bg-black/70 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Dokončené série</p>
                  <p className="mt-2 text-lg font-black text-white">{completedSetCount} dokončených {completedSetCount === 1 ? 'séria' : completedSetCount < 5 ? 'série' : 'sérií'}</p>
                </div>
              </div>
            </details>
            {isActiveSuperset ? (
              <SupersetTransitionCard group={activeExercise.supersetGroup ?? ''} exercises={activeSupersetExercises.map((exercise) => exercise.nameSnapshot)} />
            ) : (
              <RestTimer
                seconds={activeExercise.restSeconds}
                startedAt={lastCompletedSet?.completedAt}
                soundEnabled={restSoundEnabled}
                vibrationEnabled={restVibrationEnabled}
              />
            )}
          </div>

          {currentSet ? (
            <SetLogger key={currentSet.id} set={currentSet} displayUnit={displayUnit} onLog={submitOptimisticSetLog} disabled={isMutating} lastPerformance={activeExercise.lastPerformance ?? null} />
          ) : (
            <div className="rounded-3xl border border-fitness-yellow/40 bg-black/85 p-5">
              <CheckCircle2 className="size-8 text-fitness-yellow" />
              <h2 className="mt-3 text-2xl font-black text-white">Cvik dokončený</h2>
              <p className="mt-2 text-sm text-fitness-warm/70">Preskoč ďalej alebo dokonči tréning, keď sú hotové všetky pohyby.</p>
            </div>
          )}
        </div>
      </section>

      <details className="rounded-3xl border border-fitness-yellow/20 bg-black/55 p-4 text-fitness-warm">
        <summary className="cursor-pointer text-sm font-black uppercase tracking-[0.16em] text-fitness-yellow">Celý tréning a akcie</summary>
        <p className="mt-2 text-sm text-fitness-warm/65">Otvor, keď chceš preskočiť cvik, pridať sériu, pozrieť poradie alebo dokončiť tréning.</p>
        <section className="mt-4 grid gap-6 xl:grid-cols-[1.4fr,0.9fr]">
        <Card title="Poradie cvikov" description={showGuidance ? 'Snímka z tvojho osobného plánu. História zostane stabilná aj po neskoršej zmene plánu.' : undefined}>
          <div className="space-y-3">
            {visibleSession.exercises.map((exercise, index) => (
              <article
                key={exercise.id}
                className={cn(
                  'rounded-2xl border px-4 py-4',
                  exercise.status === 'active' ? 'border-fitness-yellow bg-fitness-yellow/10' : 'border-fitness-yellow/20 bg-black/70',
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-black text-fitness-yellow">{index + 1}. {exercise.nameSnapshot}</h3>
                    <p className="mt-1 text-xs text-fitness-warm/65">
                      {exercise.sets.filter((set) => set.status === 'completed').length}/{exercise.sets.length} sérií · {formatExerciseStatus(exercise.status)}{exercise.supersetGroup ? ` · Superset ${exercise.supersetGroup}` : ''}
                    </p>
                  </div>
                  {exercise.status === 'active' ? <Badge className="fitness-badge">Aktívny</Badge> : null}
                </div>
              </article>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <CompletedSetsEditor
            sets={completedActiveSets}
            editingSet={editingSet}
            displayUnit={displayUnit}
            isMutating={isMutating}
            onStartEdit={setEditingSetId}
            onDuplicateSet={onDuplicateSet}
            onSkipSet={onSkipSet}
            onCancelEdit={() => setEditingSetId(null)}
            onSubmitEdit={submitSetEdit}
          />

          <Card title="Rýchle akcie" description={showGuidance ? 'Praktické ovládanie pre reálne zmeny vo fitku.' : undefined}>
            <div className="grid gap-3">
              <Button variant="secondary" leadingIcon={<Plus className="size-4" />} onClick={() => onAddSet(activeExercise.id)} disabled={isMutating}>
                Pridať sériu
              </Button>
              {removableSet && activeExercise.sets.length > 1 ? (
                <Button variant="secondary" leadingIcon={<Trash2 className="size-4" />} onClick={() => onRemoveSet(removableSet.id)} disabled={isMutating}>
                  Odstrániť sériu {removableSet.setNumber}
                </Button>
              ) : null}
              <Button variant="secondary" leadingIcon={<FastForward className="size-4" />} onClick={() => onSkipExercise(activeExercise.id)} disabled={isMutating}>
                Preskočiť cvik
              </Button>
              <Button className="fitness-action" leadingIcon={<Trophy className="size-4" />} onClick={() => void onFinish(session.id)} disabled={isMutating}>
                Dokončiť tréning
              </Button>
              <Button variant="secondary" leadingIcon={<Trophy className="size-4" />} onClick={openFinishReview} disabled={isMutating}>
                Pridať krátku kontrolu
              </Button>
              <Button variant="danger" leadingIcon={<AlertTriangle className="size-4" />} onClick={() => onAbandon(session.id)} disabled={isMutating}>
                Zahodiť tréning
              </Button>
            </div>
          </Card>

          {isFinishReviewOpen ? (
            <FinishCheckInPanel
              sessionRpe={finishRpe}
              energyLevel={finishEnergy}
              notes={finishNotes}
              isMutating={isMutating}
              onSessionRpeChange={setFinishRpe}
              onEnergyLevelChange={setFinishEnergy}
              onNotesChange={setFinishNotes}
              onSubmit={submitFinishReview}
              onCancel={() => setIsFinishReviewOpen(false)}
            />
          ) : null}

          <Card title="Pridať neplánovaný cvik" description={showGuidance ? 'Pre výmenu stroja, pumpu alebo doplnky bez úpravy plánu uprostred tréningu.' : undefined}>
            {exerciseOptions.length > 0 ? (
              <div className="space-y-3">
                <label className="block text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">
                  Cvik
                  <select
                    aria-label="Neplánovaný cvik"
                    className="mt-2 w-full rounded-2xl border border-fitness-yellow/30 bg-black px-3 py-3 text-sm font-bold text-fitness-warm outline-none focus:border-fitness-yellow"
                    value={selectedUnplannedExerciseId}
                    onChange={(event) => setUnplannedExerciseId(event.target.value)}
                  >
                    {exerciseOptions.map((exercise) => (
                      <option key={exercise.id} value={exercise.id}>{exercise.name}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">
                  Cieľové série
                  <input
                    aria-label="Cieľové série pre neplánovaný cvik"
                    className="mt-2 w-full rounded-2xl border border-fitness-yellow/30 bg-black px-3 py-3 text-sm font-bold text-fitness-warm outline-none focus:border-fitness-yellow"
                    inputMode="numeric"
                    value={unplannedTargetSets}
                    onInput={(event) => setUnplannedTargetSets(event.currentTarget.value)}
                  />
                </label>
                <Button
                  variant="secondary"
                  leadingIcon={<ListPlus className="size-4" />}
                  onClick={() => {
                    if (!selectedUnplannedExerciseId) return
                    void onAddUnplannedExercise(session.id, {
                      exerciseId: selectedUnplannedExerciseId,
                      targetSets: Math.max(1, Number(unplannedTargetSets) || 1),
                    })
                  }}
                  disabled={isMutating || !selectedUnplannedExerciseId}
                >
                  Pridať neplánovaný cvik
                </Button>
              </div>
            ) : (
              <p className="text-sm text-fitness-warm/70">Zatiaľ nie sú dostupné žiadne cviky.</p>
            )}
          </Card>

          {showGuidance ? (
            <Card title="Trénerská pripomienka" description="Krátka pripomienka techniky pre aktuálnu sériu.">
              <div className="rounded-2xl bg-fitness-yellow px-4 py-4 text-sm font-bold text-black">
                <Zap className="mr-2 inline size-4" /> Najprv zapíš čisté opakovania. Váhu zvyšuj až po stabilnom splnení cieľa s rezervou.
              </div>
            </Card>
          ) : null}
        </div>
        </section>
      </details>
    </div>
  )
}

function SupersetTransitionCard({ group, exercises }: { group: string; exercises: string[] }) {
  return (
    <div className="rounded-2xl border border-fitness-yellow/30 bg-black/70 p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Superset {group}</p>
      <p className="mt-2 text-lg font-black text-white">Bez pauzy medzi cvikmi</p>
      <p className="mt-1 text-xs font-semibold leading-5 text-fitness-warm/60">Striedaj: {exercises.join(' ↔ ')}</p>
    </div>
  )
}

function applyOptimisticLoggedSets(
  session: FitnessLiveSession,
  optimisticLoggedSets: Record<string, FitnessSessionSetRecord>,
): FitnessLiveSession {
  if (Object.keys(optimisticLoggedSets).length === 0) {
    return session
  }

  return {
    ...session,
    exercises: session.exercises.map((exercise) => ({
      ...exercise,
      sets: exercise.sets.map((set) => optimisticLoggedSets[set.id] ?? set),
    })),
  }
}

function pruneResolvedOptimisticSets(
  optimisticLoggedSets: Record<string, FitnessSessionSetRecord>,
  session: FitnessLiveSession,
) {
  if (Object.keys(optimisticLoggedSets).length === 0) {
    return optimisticLoggedSets
  }

  const realSets = new Map(
    session.exercises.flatMap((exercise) =>
      exercise.sets.map((set) => [set.id, set.status] as const),
    ),
  )
  let changed = false
  const next: Record<string, FitnessSessionSetRecord> = {}

  for (const [setId, optimisticSet] of Object.entries(optimisticLoggedSets)) {
    if (realSets.get(setId) === 'planned') {
      next[setId] = optimisticSet
    } else {
      changed = true
    }
  }

  return changed ? next : optimisticLoggedSets
}

function removeOptimisticSet(
  optimisticLoggedSets: Record<string, FitnessSessionSetRecord>,
  setId: string,
) {
  if (!optimisticLoggedSets[setId]) {
    return optimisticLoggedSets
  }

  const next = { ...optimisticLoggedSets }
  delete next[setId]
  return next
}

function createOptimisticLoggedSet(
  sourceSet: FitnessSessionSetRecord,
  input: LogFitnessSetInput,
): FitnessSessionSetRecord {
  const timestamp = new Date().toISOString()
  return {
    ...sourceSet,
    weightKg: input.weightKg,
    reps: input.reps,
    rir: input.rir ?? null,
    setType: input.setType ?? sourceSet.setType,
    weightEntryMode: input.weightEntryMode ?? sourceSet.weightEntryMode,
    leftWeightKg: input.leftWeightKg ?? null,
    rightWeightKg: input.rightWeightKg ?? null,
    status: 'completed',
    completedAt: timestamp,
    updatedAt: timestamp,
  }
}

interface CompletedSetsEditorProps {
  sets: FitnessSessionSetRecord[]
  editingSet: FitnessSessionSetRecord | null
  displayUnit: FitnessDisplayUnit
  isMutating: boolean
  onStartEdit: (setId: string) => void
  onDuplicateSet: (setId: string) => Promise<void>
  onSkipSet: (setId: string) => Promise<void>
  onCancelEdit: () => void
  onSubmitEdit: (setId: string, input: LogFitnessSetInput) => Promise<void>
}

function CompletedSetsEditor({
  sets,
  editingSet,
  displayUnit,
  isMutating,
  onStartEdit,
  onDuplicateSet,
  onSkipSet,
  onCancelEdit,
  onSubmitEdit,
}: CompletedSetsEditorProps) {
  const swipeStartRef = useRef<{ setId: string; x: number } | null>(null)
  const swipeThresholdPx = 72

  const startSwipe = (setId: string, x: number) => {
    if (isMutating) {
      return
    }
    swipeStartRef.current = { setId, x }
  }

  const finishSwipe = (setId: string, x: number) => {
    const swipeStart = swipeStartRef.current
    if (!swipeStart || swipeStart.setId !== setId || isMutating) {
      swipeStartRef.current = null
      return
    }

    const deltaX = x - swipeStart.x
    swipeStartRef.current = null
    if (Math.abs(deltaX) < swipeThresholdPx) {
      return
    }

    if (deltaX > 0) {
      void onDuplicateSet(setId)
      return
    }

    void onSkipSet(setId)
  }

  return (
    <Card title={sk.fitness.setGestures.completedSetsTitle} description={sk.fitness.setGestures.completedSetsDescription}>
      {sets.length > 0 ? (
        <div className="space-y-3">
          {sets.map((set) => (
            <article
              key={set.id}
              data-testid={`completed-set-${set.setNumber}`}
              className="touch-pan-y select-none rounded-2xl border border-fitness-yellow/20 bg-black/70 px-4 py-3 text-fitness-warm"
              aria-label={sk.fitness.setGestures.completedSetAria(set.setNumber)}
              onMouseDown={(event) => startSwipe(set.id, event.clientX)}
              onMouseUp={(event) => finishSwipe(set.id, event.clientX)}
              onTouchStart={(event) => startSwipe(set.id, event.changedTouches[0]?.clientX ?? 0)}
              onTouchEnd={(event) => finishSwipe(set.id, event.changedTouches[0]?.clientX ?? 0)}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Séria {set.setNumber}</p>
                  <p className="mt-1 text-sm font-black text-fitness-warm">{formatCompletedSetSummary(set, displayUnit)}</p>
                  {formatPerSideWeight(set, displayUnit) ? (
                    <p className="mt-1 text-xs font-bold text-fitness-yellow/80">{formatPerSideWeight(set, displayUnit)}</p>
                  ) : null}
                  {formatCorrectionBadge(set) ? (
                    <p className="mt-1 text-xs font-bold text-fitness-orange">{formatCorrectionBadge(set)}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn('rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em]', getFitnessSetTypeBadgeClass(set.setType))}>
                    {formatFitnessSetTypeLabel(set.setType)}
                  </span>
                  <Button variant="secondary" size="sm" onClick={() => void onDuplicateSet(set.id)} disabled={isMutating} aria-label={sk.fitness.setGestures.duplicateAria(set.setNumber)}>
                    {sk.fitness.setGestures.duplicateButton}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => void onSkipSet(set.id)} disabled={isMutating} aria-label={sk.fitness.setGestures.skipAria(set.setNumber)}>
                    {sk.fitness.setGestures.skipButton}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => onStartEdit(set.id)} disabled={isMutating} aria-label={sk.fitness.setGestures.editAria(set.setNumber)}>
                    {sk.fitness.setGestures.editButton}
                  </Button>
                </div>
              </div>
            </article>
          ))}

          {editingSet ? (
            <SetLogger
              key={`edit-${editingSet.id}`}
              set={editingSet}
              displayUnit={displayUnit}
              onLog={onSubmitEdit}
              disabled={isMutating}
              titleLabel="Oprava série"
              submitLabel="Uložiť opravu série"
              showLastPerformance={false}
              showRestCue={false}
              armRestSignal={false}
              sticky={false}
              onCancel={onCancelEdit}
            />
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-fitness-warm/65">{sk.fitness.setGestures.emptyCompletedSets}</p>
      )}
    </Card>
  )
}

function formatCorrectionBadge(set: FitnessSessionSetRecord) {
  const correctionCount = set.correctionCount ?? 0
  return correctionCount > 0 ? `Opravené ${correctionCount}×` : null
}

function formatCompletedSetSummary(set: FitnessSessionSetRecord, displayUnit: FitnessDisplayUnit) {
  return `${formatWeight(set.weightKg, displayUnit)} × ${set.reps}${set.rir === null ? '' : ` · RIR ${set.rir}`}`
}

function formatPerSideWeight(set: FitnessSessionSetRecord, displayUnit: FitnessDisplayUnit) {
  if (set.weightEntryMode !== 'per_side' || set.leftWeightKg === null || set.leftWeightKg === undefined || set.rightWeightKg === null || set.rightWeightKg === undefined) {
    return null
  }

  return `Ľ ${formatWeightValue(set.leftWeightKg, displayUnit)} / P ${formatWeightValue(set.rightWeightKg, displayUnit)} ${displayUnit}`
}

function formatWeightValue(weightKg: number, displayUnit: FitnessDisplayUnit) {
  return formatWeight(weightKg, displayUnit).replace(` ${displayUnit}`, '')
}

interface QuickAddExerciseCardProps {
  sessionId: string
  exerciseOptions: FitnessExerciseRecord[]
  selectedExerciseId: string
  targetSets: string
  isMutating: boolean
  onExerciseChange: (exerciseId: string) => void
  onTargetSetsChange: (targetSets: string) => void
  onAddUnplannedExercise: (sessionId: string, input: AddUnplannedExerciseInput) => Promise<void>
}

const QUICK_SESSION_EXERCISE_ORDER = [
  'Tlak na lavičke',
  'Drep',
  'Mŕtvy ťah',
  'Príťahy veľkej činky v predklone',
]

function QuickAddExerciseCard({
  sessionId,
  exerciseOptions,
  selectedExerciseId,
  targetSets,
  isMutating,
  onExerciseChange,
  onTargetSetsChange,
  onAddUnplannedExercise,
}: QuickAddExerciseCardProps) {
  const quickExerciseOptions = [...exerciseOptions]
    .sort((left, right) => getQuickExerciseOrder(left.name) - getQuickExerciseOrder(right.name) || left.name.localeCompare(right.name, 'sk'))
    .slice(0, 4)
  const parsedTargetSets = Math.max(1, Number(targetSets) || 1)

  return (
    <Card title="Rýchly štart bez plánu" description="Pridaj prvý cvik jedným ťuknutím. Pokročilý výber otvor iba vtedy, keď potrebuješ iný cvik alebo počet sérií.">
      {exerciseOptions.length > 0 ? (
        <div className="space-y-4">
          <div className="rounded-3xl border border-fitness-yellow/30 bg-black p-4 text-fitness-warm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Najčastejšie cviky</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {quickExerciseOptions.map((exercise) => (
                <Button
                  key={exercise.id}
                  className="justify-start"
                  variant="secondary"
                  leadingIcon={<Zap className="size-4" />}
                  onClick={() => void onAddUnplannedExercise(sessionId, { exerciseId: exercise.id, targetSets: parsedTargetSets })}
                  disabled={isMutating}
                >
                  Začať: {exercise.name}
                </Button>
              ))}
            </div>
          </div>

          <details className="rounded-2xl border border-fitness-yellow/20 bg-black/60 p-4 text-fitness-warm">
            <summary className="cursor-pointer text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow">Pokročilý výber cviku</summary>
            <div className="mt-4 space-y-3">
              <label className="block text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">
                Cvik
                <select
                  aria-label="Neplánovaný cvik"
                  className="mt-2 w-full rounded-2xl border border-fitness-yellow/30 bg-black px-3 py-3 text-sm font-bold text-fitness-warm outline-none focus:border-fitness-yellow"
                  value={selectedExerciseId}
                  onChange={(event) => onExerciseChange(event.target.value)}
                >
                  {exerciseOptions.map((exercise) => (
                    <option key={exercise.id} value={exercise.id}>{exercise.name}</option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">
                Cieľové série
                <input
                  aria-label="Cieľové série pre neplánovaný cvik"
                  className="mt-2 w-full rounded-2xl border border-fitness-yellow/30 bg-black px-3 py-3 text-sm font-bold text-fitness-warm outline-none focus:border-fitness-yellow"
                  inputMode="numeric"
                  value={targetSets}
                  onInput={(event) => onTargetSetsChange(event.currentTarget.value)}
                />
              </label>
              <Button
                variant="secondary"
                leadingIcon={<ListPlus className="size-4" />}
                onClick={() => {
                  if (!selectedExerciseId) return
                  void onAddUnplannedExercise(sessionId, {
                    exerciseId: selectedExerciseId,
                    targetSets: parsedTargetSets,
                  })
                }}
                disabled={isMutating || !selectedExerciseId}
              >
                Pridať neplánovaný cvik
              </Button>
            </div>
          </details>
        </div>
      ) : (
        <p className="text-sm text-fitness-warm/70">Zatiaľ nie sú dostupné žiadne cviky.</p>
      )}
    </Card>
  )
}

function getQuickExerciseOrder(exerciseName: string) {
  const index = QUICK_SESSION_EXERCISE_ORDER.indexOf(exerciseName)
  return index === -1 ? QUICK_SESSION_EXERCISE_ORDER.length : index
}

interface FinishCheckInPanelProps {
  sessionRpe: string
  energyLevel: string
  notes: string
  isMutating: boolean
  onSessionRpeChange: (value: string) => void
  onEnergyLevelChange: (value: string) => void
  onNotesChange: (value: string) => void
  onSubmit: () => Promise<void>
  onCancel: () => void
}

function FinishCheckInPanel({
  sessionRpe,
  energyLevel,
  notes,
  isMutating,
  onSessionRpeChange,
  onEnergyLevelChange,
  onNotesChange,
  onSubmit,
  onCancel,
}: FinishCheckInPanelProps) {
  return (
    <Card title="Krátka kontrola pred uložením" description="Voliteľné: pridaj RPE, energiu a poznámku iba vtedy, keď ti to pomôže pri ďalšom tréningu.">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">
            RPE tréningu
            <input
              aria-label="RPE tréningu"
              className="mt-2 w-full rounded-2xl border border-fitness-yellow/30 bg-black px-3 py-3 text-lg font-black text-fitness-yellow outline-none focus:border-fitness-yellow"
              inputMode="numeric"
              min={1}
              max={10}
              value={sessionRpe}
              onInput={(event) => onSessionRpeChange(event.currentTarget.value)}
            />
          </label>
          <label className="block text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">
            Energia
            <input
              aria-label="Energia"
              className="mt-2 w-full rounded-2xl border border-fitness-yellow/30 bg-black px-3 py-3 text-lg font-black text-fitness-yellow outline-none focus:border-fitness-yellow"
              inputMode="numeric"
              min={1}
              max={5}
              value={energyLevel}
              onInput={(event) => onEnergyLevelChange(event.currentTarget.value)}
            />
          </label>
        </div>

        <label className="block text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">
          Poznámky k tréningu
          <textarea
            aria-label="Poznámky k tréningu"
            className="mt-2 min-h-24 w-full rounded-2xl border border-fitness-yellow/30 bg-black px-3 py-3 text-sm font-bold text-fitness-warm outline-none focus:border-fitness-yellow"
            value={notes}
            onInput={(event) => onNotesChange(event.currentTarget.value)}
            placeholder="Spánok, bolesť, pumpa, technika, výmena stroja…"
          />
        </label>

        <div className="flex flex-wrap gap-3">
          <Button className="fitness-action" leadingIcon={<Trophy className="size-4" />} onClick={() => void onSubmit()} disabled={isMutating}>
            Uložiť kontrolu a dokončiť
          </Button>
          <Button variant="secondary" onClick={onCancel} disabled={isMutating}>
            Pokračovať v tréningu
          </Button>
        </div>
      </div>
    </Card>
  )
}

function optionalNumber(value: string) {
  const trimmed = value.trim()
  return trimmed ? Number(trimmed) : null
}

function formatExerciseStatus(status: string) {
  if (status === 'active') return 'aktívny'
  if (status === 'pending') return 'čaká'
  if (status === 'done') return 'hotovo'
  if (status === 'skipped') return 'preskočený'
  return status
}
