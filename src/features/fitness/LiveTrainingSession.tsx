import { useState } from 'react'

import { AlertTriangle, CheckCircle2, FastForward, ListPlus, Plus, Trash2, Trophy, Zap } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { RestTimer } from '@/features/fitness/RestTimer'
import { SetLogger } from '@/features/fitness/SetLogger'
import { formatFitnessSetTypeLabel, getFitnessSetTypeBadgeClass } from '@/features/fitness/fitnessSetTypes'
import type { AddUnplannedExerciseInput, FinishFitnessSessionInput, FitnessExerciseRecord, FitnessLiveSession, FitnessSessionSetRecord, LogFitnessSetInput } from '@/features/fitness/fitnessTypes'
import { formatWeight, type FitnessDisplayUnit } from '@/features/fitness/fitnessUnits'
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
  const activeExercise = session.exercises.find((exercise) => exercise.status === 'active') ?? session.exercises.find((exercise) => exercise.status === 'pending')
  const currentSet = activeExercise?.sets.find((set) => set.status === 'planned')
  const completedActiveSets = activeExercise?.sets.filter((set) => set.status === 'completed') ?? []
  const editingSet = completedActiveSets.find((set) => set.id === editingSetId) ?? null
  const lastCompletedSet = activeExercise?.sets.filter((set) => set.status === 'completed' && set.completedAt).sort((a, b) => String(a.completedAt).localeCompare(String(b.completedAt))).at(-1)
  const removableSet = activeExercise ? (activeExercise.sets.filter((set) => set.status === 'planned').at(-1) ?? activeExercise.sets.at(-1)) : undefined
  const selectedUnplannedExerciseId = unplannedExerciseId || exerciseOptions[0]?.id || ''
  const exerciseCount = session.exercises.length
  const plannedSetCount = session.exercises.reduce((sum, exercise) => sum + exercise.targetSets, 0)
  const completedSetCount = session.exercises.flatMap((exercise) => exercise.sets).filter((set) => set.status === 'completed').length
  const totalSets = session.exercises.flatMap((exercise) => exercise.sets).length

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
            <Button className="fitness-action h-fit" onClick={openFinishReview} disabled={isMutating}>Dokončiť tréning</Button>
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
              <Badge className="fitness-badge">Živý tréning</Badge>
              {showGuidance ? <Badge className="fitness-badge">Aktívna snímka tréningu</Badge> : null}
              <span className="text-sm font-semibold text-fitness-yellow/80">{completedSetCount} dokončených · {totalSets} sérií spolu</span>
              <span className="text-sm font-semibold text-fitness-yellow/80">Zobrazená jednotka: {displayUnit}</span>
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-fitness-yellow">{session.name}</p>
              <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl">{activeExercise.nameSnapshot}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-fitness-warm/75">
                Cieľ: {activeExercise.targetSets}×{activeExercise.minReps}–{activeExercise.maxReps} · RIR {activeExercise.targetRir ?? 'voľné'}
              </p>
              {showGuidance ? <p className="mt-2 text-sm font-semibold text-fitness-yellow/80">Zmeny plánu neovplyvnia tento tréning.</p> : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
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
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-fitness-yellow/30 bg-black/70 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Stav cviku</p>
                <p className="mt-2 text-lg font-black text-white">{formatExerciseStatus(activeExercise.status)}</p>
              </div>
              <div className="rounded-2xl border border-fitness-yellow/30 bg-black/70 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Pokrok</p>
                <p className="mt-2 text-lg font-black text-white">{completedSetCount} dokončených</p>
              </div>
              <RestTimer
                seconds={activeExercise.restSeconds}
                startedAt={lastCompletedSet?.completedAt}
                soundEnabled={restSoundEnabled}
                vibrationEnabled={restVibrationEnabled}
              />
            </div>
          </div>

          {currentSet ? (
            <SetLogger key={currentSet.id} set={currentSet} displayUnit={displayUnit} onLog={onLogSet} disabled={isMutating} lastPerformance={activeExercise.lastPerformance ?? null} />
          ) : (
            <div className="rounded-3xl border border-fitness-yellow/40 bg-black/85 p-5">
              <CheckCircle2 className="size-8 text-fitness-yellow" />
              <h2 className="mt-3 text-2xl font-black text-white">Cvik dokončený</h2>
              <p className="mt-2 text-sm text-fitness-warm/70">Preskoč ďalej alebo dokonči tréning, keď sú hotové všetky pohyby.</p>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr,0.9fr]">
        <Card title="Poradie cvikov" description={showGuidance ? 'Snímka z tvojho osobného plánu. História zostane stabilná aj po neskoršej zmene plánu.' : undefined}>
          <div className="space-y-3">
            {session.exercises.map((exercise, index) => (
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
                      {exercise.sets.filter((set) => set.status === 'completed').length}/{exercise.sets.length} sérií · {formatExerciseStatus(exercise.status)}
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
              <Button className="fitness-action" leadingIcon={<Trophy className="size-4" />} onClick={openFinishReview} disabled={isMutating}>
                Dokončiť tréning
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
    </div>
  )
}

interface CompletedSetsEditorProps {
  sets: FitnessSessionSetRecord[]
  editingSet: FitnessSessionSetRecord | null
  displayUnit: FitnessDisplayUnit
  isMutating: boolean
  onStartEdit: (setId: string) => void
  onCancelEdit: () => void
  onSubmitEdit: (setId: string, input: LogFitnessSetInput) => Promise<void>
}

function CompletedSetsEditor({
  sets,
  editingSet,
  displayUnit,
  isMutating,
  onStartEdit,
  onCancelEdit,
  onSubmitEdit,
}: CompletedSetsEditorProps) {
  return (
    <Card title="Dokončené série aktuálneho cviku" description="Ak sa preklikneš vo váhe, RIR alebo type série, oprav záznam bez rušenia tréningu.">
      {sets.length > 0 ? (
        <div className="space-y-3">
          {sets.map((set) => (
            <article key={set.id} className="rounded-2xl border border-fitness-yellow/20 bg-black/70 px-4 py-3 text-fitness-warm">
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
                  <Button variant="secondary" size="sm" onClick={() => onStartEdit(set.id)} disabled={isMutating} aria-label={`Upraviť sériu ${set.setNumber}`}>
                    Upraviť
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
        <p className="text-sm text-fitness-warm/65">Zatiaľ nie je dokončená žiadna séria aktuálneho cviku.</p>
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
  return (
    <Card title="Pridaj prvý cvik" description="Vyber cvik z lokálnej knižnice; StingFit vytvorí série priamo v rýchlom tréningu.">
      {exerciseOptions.length > 0 ? (
        <div className="space-y-3">
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
                targetSets: Math.max(1, Number(targetSets) || 1),
              })
            }}
            disabled={isMutating || !selectedExerciseId}
          >
            Pridať neplánovaný cvik
          </Button>
        </div>
      ) : (
        <p className="text-sm text-fitness-warm/70">Zatiaľ nie sú dostupné žiadne cviky.</p>
      )}
    </Card>
  )
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
    <Card title="Kontrola pred dokončením" description="Zachyť kontext za číslami predtým, než sa táto lokálna snímka uloží do histórie.">
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
