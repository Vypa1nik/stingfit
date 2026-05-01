import { useCallback, useEffect, useState } from 'react'

import { AlertTriangle, CalendarDays, CheckCircle2, ChevronDown, ChevronRight, ChevronUp, CopyPlus, Dumbbell, Plus, Save, Trash2, Zap } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { FITNESS_MUSCLE_GROUPS, formatMuscleGroupLabel } from '@/features/fitness/fitnessMuscleGroups'
import { buildPlanReadinessReport } from '@/features/fitness/fitnessPlanReadiness'
import { getPlanDayStatus, summarizePlanWeek, type FitnessPlanDayStatusTone } from '@/features/fitness/fitnessPlanPresentation'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { useSpaNavigate } from '@/hooks/useSpaNavigate'
import type {
  FitnessExerciseRecord,
  FitnessMuscleGroup,
  FitnessPlanDayRecord,
  FitnessPlanMoveDirection,
  FitnessPlanExerciseRecord,
  FitnessPlanRecord,
  FitnessPlanStructure,
  FitnessPlanWeekRecord,
  FitnessPlanWorkoutRecord,
} from '@/features/fitness/fitnessTypes'

const weekDays = [
  { day: 'Po', workout: 'Tlak A', active: true },
  { day: 'Ut', workout: 'Ťah A', active: false },
  { day: 'St', workout: 'Voľno', active: false },
  { day: 'Št', workout: 'Nohy', active: false },
  { day: 'Pi', workout: 'Tlak B', active: false },
  { day: 'So', workout: 'Voľno', active: false },
  { day: 'Ne', workout: 'Ťah B', active: false },
]

interface PlanExerciseDraft {
  targetSets: string
  minReps: string
  maxReps: string
  targetRir: string
  restSeconds: string
  supersetGroup: string
}

interface AddDayDraft {
  dayNumber: string
  label: string
}

interface AddWorkoutDraft {
  name: string
}

interface DayEditDraft {
  dayNumber: string
  label: string
}

interface WorkoutEditDraft {
  name: string
  notes: string
}

interface AddExerciseDraft extends PlanExerciseDraft {
  exerciseId: string
}

interface CustomExerciseDraft {
  name: string
  category: string
  muscleGroup: FitnessMuscleGroup | ''
  defaultRestSeconds: string
}

interface ExerciseLibraryDraft {
  name: string
  category: string
  muscleGroup: FitnessMuscleGroup | ''
  defaultRestSeconds: string
}

type PlanConfirmation =
  | { kind: 'archiveCustomExercise'; exercise: FitnessExerciseRecord }
  | { kind: 'removePlanExercise'; exercise: FitnessPlanExerciseRecord }
  | { kind: 'removePlanWorkout'; workout: FitnessPlanWorkoutRecord }
  | { kind: 'removePlanDay'; day: FitnessPlanDayRecord }

export function FitnessPlansPage() {
  const navigate = useSpaNavigate()
  const [starterPlans, setStarterPlans] = useState<FitnessPlanRecord[]>([])
  const [personalPlans, setPersonalPlans] = useState<FitnessPlanRecord[]>([])
  const [exerciseOptions, setExerciseOptions] = useState<FitnessExerciseRecord[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [selectedStructure, setSelectedStructure] = useState<FitnessPlanStructure | null>(null)
  const [showGuidance, setShowGuidance] = useState(true)
  const [exerciseDrafts, setExerciseDrafts] = useState<Record<string, PlanExerciseDraft>>({})
  const [dayDrafts, setDayDrafts] = useState<Record<string, AddDayDraft>>({})
  const [workoutDrafts, setWorkoutDrafts] = useState<Record<string, AddWorkoutDraft>>({})
  const [dayEditDrafts, setDayEditDrafts] = useState<Record<string, DayEditDraft>>({})
  const [workoutEditDrafts, setWorkoutEditDrafts] = useState<Record<string, WorkoutEditDraft>>({})
  const [addExerciseDrafts, setAddExerciseDrafts] = useState<Record<string, AddExerciseDraft>>({})
  const [customExerciseDrafts, setCustomExerciseDrafts] = useState<Record<string, CustomExerciseDraft>>({})
  const [exerciseLibraryDrafts, setExerciseLibraryDrafts] = useState<Record<string, ExerciseLibraryDraft>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [pendingConfirmation, setPendingConfirmation] = useState<PlanConfirmation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const loadPlans = useCallback(async (preferredPlanId?: string | null) => {
    setError(null)
    await fitnessRepository.seedStarterData()
    const [starter, personal, exercises, loadedSettings] = await Promise.all([
      fitnessRepository.listStarterPlans(),
      fitnessRepository.listPersonalPlans(),
      fitnessRepository.listExercises(),
      fitnessRepository.getSettings(),
    ])
    setStarterPlans(starter)
    setPersonalPlans(personal)
    setExerciseOptions(exercises)
    setShowGuidance(loadedSettings.showGuidance)
    setExerciseLibraryDrafts(buildExerciseLibraryDrafts(exercises))

    const nextSelectedPlanId = preferredPlanId ?? personal[0]?.id ?? null
    if (!nextSelectedPlanId || !personal.some((plan) => plan.id === nextSelectedPlanId)) {
      setSelectedPlanId(null)
      setSelectedStructure(null)
      setExerciseDrafts({})
      setDayEditDrafts({})
      setWorkoutEditDrafts({})
      return
    }

    const structure = await fitnessRepository.getPlanStructure(nextSelectedPlanId)
    setSelectedPlanId(nextSelectedPlanId)
    setSelectedStructure(structure)
    setExerciseDrafts(buildExerciseDrafts(structure))
    setDayEditDrafts(buildDayEditDrafts(structure))
    setWorkoutEditDrafts(buildWorkoutEditDrafts(structure))
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      try {
        await loadPlans()
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Nepodarilo sa načítať tréningové plány.')
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
  }, [loadPlans])

  const createFromStarter = async (starter: FitnessPlanRecord) => {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const plan = await fitnessRepository.createPersonalPlanFromStarter(starter.id, {
        name: createPersonalPlanName(starter),
        goal: createPersonalPlanGoal(starter),
      })
      setSuccessMessage(`Osobný plán vytvorený zo šablóny ${starter.name}.`)
      await loadPlans(plan.id)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nepodarilo sa vytvoriť osobný plán.')
    } finally {
      setIsMutating(false)
    }
  }

  const createFromPpl = async () => {
    const starter = starterPlans.find((plan) => plan.id === 'starter-push-pull-legs')
    if (!starter) {
      setError('Štartovací plán Tlak / Ťah / Nohy zatiaľ nie je dostupný.')
      return
    }

    await createFromStarter(starter)
  }

  const createBlank = async () => {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const plan = await fitnessRepository.createBlankPersonalPlan({ name: 'Prázdny silový blok', goal: 'Sila' })
      setSuccessMessage('Prázdny osobný plán vytvorený.')
      await loadPlans(plan.id)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nepodarilo sa vytvoriť prázdny plán.')
    } finally {
      setIsMutating(false)
    }
  }

  const selectPlan = async (planId: string) => {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)
    try {
      await loadPlans(planId)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nepodarilo sa otvoriť editor plánu.')
    } finally {
      setIsMutating(false)
    }
  }

  const duplicateWeek = async (weekId: string, weekNumber: number) => {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)
    try {
      await fitnessRepository.duplicateWeek(weekId)
      setSuccessMessage('Týždeň duplikovaný')
      await loadPlans(selectedPlanId)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Nepodarilo sa duplikovať týždeň ${weekNumber}.`)
    } finally {
      setIsMutating(false)
    }
  }

  const updateExerciseDraft = (exerciseId: string, key: keyof PlanExerciseDraft, value: string) => {
    setExerciseDrafts((current) => ({
      ...current,
      [exerciseId]: {
        ...current[exerciseId],
        [key]: value,
      },
    }))
  }

  const updateDayDraft = (weekId: string, key: keyof AddDayDraft, value: string) => {
    setDayDrafts((current) => ({
      ...current,
      [weekId]: {
        dayNumber: current[weekId]?.dayNumber ?? '',
        label: current[weekId]?.label ?? '',
        [key]: value,
      },
    }))
  }

  const updateWorkoutDraft = (dayId: string, value: string) => {
    setWorkoutDrafts((current) => ({
      ...current,
      [dayId]: { name: value },
    }))
  }

  const updateDayEditDraft = (dayId: string, key: keyof DayEditDraft, value: string) => {
    setDayEditDrafts((current) => ({
      ...current,
      [dayId]: {
        ...current[dayId],
        [key]: value,
      },
    }))
  }

  const updateWorkoutEditDraft = (workoutId: string, key: keyof WorkoutEditDraft, value: string) => {
    setWorkoutEditDrafts((current) => ({
      ...current,
      [workoutId]: {
        ...current[workoutId],
        [key]: value,
      },
    }))
  }

  const updateAddExerciseDraft = (workoutId: string, key: keyof AddExerciseDraft, value: string) => {
    setAddExerciseDrafts((current) => ({
      ...current,
      [workoutId]: {
        ...defaultAddExerciseDraft(exerciseOptions),
        ...current[workoutId],
        [key]: value,
      },
    }))
  }

  const updateCustomExerciseDraft = (workoutId: string, key: keyof CustomExerciseDraft, value: string) => {
    setCustomExerciseDrafts((current) => ({
      ...current,
      [workoutId]: {
        ...defaultCustomExerciseDraft(),
        ...current[workoutId],
        [key]: value,
      },
    }))
  }

  const updateExerciseLibraryDraft = (exerciseId: string, key: keyof ExerciseLibraryDraft, value: string) => {
    setExerciseLibraryDrafts((current) => ({
      ...current,
      [exerciseId]: {
        ...current[exerciseId],
        [key]: value,
      },
    }))
  }

  const saveCustomExercise = async (exercise: FitnessExerciseRecord) => {
    const draft = exerciseLibraryDrafts[exercise.id]
    if (!draft) {
      return
    }

    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const updated = await fitnessRepository.updateCustomExercise(exercise.id, {
        name: draft.name,
        category: draft.category,
        muscleGroup: draft.muscleGroup || null,
        defaultRestSeconds: Number(draft.defaultRestSeconds),
      })
      setSuccessMessage(`${updated.name} aktualizovaný`)
      await loadPlans(selectedPlanId)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Nepodarilo sa aktualizovať ${exercise.name}.`)
    } finally {
      setIsMutating(false)
    }
  }

  const archiveCustomExercise = async (exercise: FitnessExerciseRecord) => {
    setPendingConfirmation({ kind: 'archiveCustomExercise', exercise })
  }

  const confirmArchiveCustomExercise = async (exercise: FitnessExerciseRecord) => {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)
    try {
      await fitnessRepository.archiveCustomExercise(exercise.id)
      setSuccessMessage(`${exercise.name} archivovaný`)
      await loadPlans(selectedPlanId)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Nepodarilo sa archivovať ${exercise.name}.`)
    } finally {
      setIsMutating(false)
      setPendingConfirmation(null)
    }
  }

  const addTrainingDay = async (week: FitnessPlanWeekRecord) => {
    const fallbackDayNumber = getNextAvailableDayNumber(week)
    const draft = dayDrafts[week.id]
    const dayNumber = Number(draft?.dayNumber || fallbackDayNumber)
    const label = (draft?.label ?? '').trim() || `Deň ${dayNumber}`

    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)
    try {
      await fitnessRepository.addPlanDay(week.id, {
        dayIndex: dayNumber - 1,
        label,
        isRestDay: false,
      })
      setSuccessMessage('Tréningový deň pridaný')
      await loadPlans(selectedPlanId)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Nepodarilo sa pridať tréningový deň do týždňa ${week.weekNumber}.`)
    } finally {
      setIsMutating(false)
    }
  }

  const addWorkout = async (day: FitnessPlanDayRecord) => {
    const name = (workoutDrafts[day.id]?.name ?? '').trim()

    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)
    try {
      await fitnessRepository.addPlanWorkout(day.id, { name })
      setSuccessMessage('Tréning pridaný')
      await loadPlans(selectedPlanId)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Nepodarilo sa pridať tréning do ${day.label}.`)
    } finally {
      setIsMutating(false)
    }
  }

  const saveDayDetails = async (day: FitnessPlanDayRecord) => {
    const draft = dayEditDrafts[day.id] ?? dayToEditDraft(day)

    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const updated = await fitnessRepository.updatePlanDay(day.id, {
        dayIndex: Number(draft.dayNumber) - 1,
        label: draft.label,
      })
      setSuccessMessage(`${updated.label} aktualizovaný`)
      await loadPlans(selectedPlanId)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Nepodarilo sa aktualizovať ${day.label}.`)
    } finally {
      setIsMutating(false)
    }
  }

  const saveWorkoutDetails = async (workout: FitnessPlanWorkoutRecord) => {
    const draft = workoutEditDrafts[workout.id] ?? workoutToEditDraft(workout)

    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const updated = await fitnessRepository.updatePlanWorkout(workout.id, {
        name: draft.name,
        notes: draft.notes,
      })
      setSuccessMessage(`${updated.name} aktualizovaný`)
      await loadPlans(selectedPlanId)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Nepodarilo sa aktualizovať ${workout.name}.`)
    } finally {
      setIsMutating(false)
    }
  }

  const moveWorkoutInDay = async (workout: FitnessPlanWorkoutRecord, direction: FitnessPlanMoveDirection) => {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const moved = await fitnessRepository.movePlanWorkout(workout.id, direction)
      setSuccessMessage(`${moved.name} posunutý ${formatMoveDirection(direction)}`)
      await loadPlans(selectedPlanId)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Nepodarilo sa posunúť ${workout.name}.`)
    } finally {
      setIsMutating(false)
    }
  }

  const moveExerciseInWorkout = async (exercise: FitnessPlanExerciseRecord, direction: FitnessPlanMoveDirection) => {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const moved = await fitnessRepository.movePlanExercise(exercise.id, direction)
      setSuccessMessage(`${moved.exerciseName} posunutý ${formatMoveDirection(direction)}`)
      await loadPlans(selectedPlanId)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Nepodarilo sa posunúť ${exercise.exerciseName}.`)
    } finally {
      setIsMutating(false)
    }
  }

  const addExerciseToWorkout = async (workout: FitnessPlanWorkoutRecord) => {
    const draft = {
      ...defaultAddExerciseDraft(exerciseOptions),
      ...addExerciseDrafts[workout.id],
    }
    const exercise = exerciseOptions.find((item) => item.id === draft.exerciseId)

    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)
    try {
      await fitnessRepository.addPlanExercise(workout.id, {
        exerciseId: draft.exerciseId,
        targetSets: Number(draft.targetSets),
        minReps: Number(draft.minReps),
        maxReps: Number(draft.maxReps),
        targetRir: draft.targetRir.trim() ? Number(draft.targetRir) : null,
        restSeconds: Number(draft.restSeconds),
        supersetGroup: draft.supersetGroup,
      })
      setSuccessMessage(`${exercise?.name ?? 'Cvik'} pridaný do ${workout.name}`)
      await loadPlans(selectedPlanId)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Nepodarilo sa pridať cvik do ${workout.name}.`)
    } finally {
      setIsMutating(false)
    }
  }

  const createCustomExerciseForWorkout = async (workout: FitnessPlanWorkoutRecord) => {
    const draft = {
      ...defaultCustomExerciseDraft(),
      ...customExerciseDrafts[workout.id],
    }

    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const exercise = await fitnessRepository.createExercise({
        name: draft.name,
        category: draft.category,
        muscleGroup: draft.muscleGroup || null,
        defaultRestSeconds: Number(draft.defaultRestSeconds),
      })
      setSuccessMessage(`${exercise.name} vytvorený v knižnici cvikov`)
      await loadPlans(selectedPlanId)
      setAddExerciseDrafts((current) => ({
        ...current,
        [workout.id]: {
          ...defaultAddExerciseDraft([exercise]),
          ...current[workout.id],
          exerciseId: exercise.id,
          restSeconds: String(exercise.defaultRestSeconds),
        },
      }))
      setCustomExerciseDrafts((current) => ({
        ...current,
        [workout.id]: defaultCustomExerciseDraft(),
      }))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Nepodarilo sa vytvoriť vlastný cvik pre ${workout.name}.`)
    } finally {
      setIsMutating(false)
    }
  }

  const saveExerciseTargets = async (exercise: FitnessPlanExerciseRecord) => {
    const draft = exerciseDrafts[exercise.id]
    if (!draft) {
      return
    }

    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)
    try {
      await fitnessRepository.updatePlanExercise(exercise.id, {
        targetSets: Number(draft.targetSets),
        minReps: Number(draft.minReps),
        maxReps: Number(draft.maxReps),
        targetRir: draft.targetRir.trim() ? Number(draft.targetRir) : null,
        restSeconds: Number(draft.restSeconds),
        supersetGroup: draft.supersetGroup,
      })
      setSuccessMessage(`Ciele pre ${exercise.exerciseName} aktualizované`)
      await loadPlans(selectedPlanId)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Nepodarilo sa aktualizovať ${exercise.exerciseName}.`)
    } finally {
      setIsMutating(false)
    }
  }

  const removePlanExercise = async (exercise: FitnessPlanExerciseRecord) => {
    setPendingConfirmation({ kind: 'removePlanExercise', exercise })
  }

  const confirmRemovePlanExercise = async (exercise: FitnessPlanExerciseRecord) => {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)
    try {
      await fitnessRepository.removePlanExercise(exercise.id)
      setSuccessMessage(`${exercise.exerciseName} odstránený`)
      await loadPlans(selectedPlanId)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Nepodarilo sa odstrániť ${exercise.exerciseName}.`)
    } finally {
      setIsMutating(false)
      setPendingConfirmation(null)
    }
  }

  const removePlanWorkout = async (workout: FitnessPlanWorkoutRecord) => {
    setPendingConfirmation({ kind: 'removePlanWorkout', workout })
  }

  const confirmRemovePlanWorkout = async (workout: FitnessPlanWorkoutRecord) => {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)
    try {
      await fitnessRepository.removePlanWorkout(workout.id)
      setSuccessMessage('Tréning odstránený')
      await loadPlans(selectedPlanId)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Nepodarilo sa odstrániť tréning ${workout.name}.`)
    } finally {
      setIsMutating(false)
      setPendingConfirmation(null)
    }
  }

  const removePlanDay = async (day: FitnessPlanDayRecord) => {
    setPendingConfirmation({ kind: 'removePlanDay', day })
  }

  const confirmRemovePlanDay = async (day: FitnessPlanDayRecord) => {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)
    try {
      await fitnessRepository.removePlanDay(day.id)
      setSuccessMessage('Tréningový deň odstránený')
      await loadPlans(selectedPlanId)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Nepodarilo sa odstrániť deň ${day.label}.`)
    } finally {
      setIsMutating(false)
      setPendingConfirmation(null)
    }
  }

  const toggleDayRest = async (day: FitnessPlanDayRecord) => {
    const nextIsRestDay = !day.isRestDay
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)
    try {
      await fitnessRepository.setPlanDayRest(day.id, nextIsRestDay)
      setSuccessMessage(`${day.label} označený ako ${nextIsRestDay ? 'voľno' : 'tréning'}`)
      await loadPlans(selectedPlanId)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Nepodarilo sa aktualizovať ${day.label}.`)
    } finally {
      setIsMutating(false)
    }
  }

  const confirmPendingPlanAction = async () => {
    if (!pendingConfirmation) {
      return
    }

    if (pendingConfirmation.kind === 'archiveCustomExercise') {
      await confirmArchiveCustomExercise(pendingConfirmation.exercise)
      return
    }
    if (pendingConfirmation.kind === 'removePlanExercise') {
      await confirmRemovePlanExercise(pendingConfirmation.exercise)
      return
    }
    if (pendingConfirmation.kind === 'removePlanWorkout') {
      await confirmRemovePlanWorkout(pendingConfirmation.workout)
      return
    }
    await confirmRemovePlanDay(pendingConfirmation.day)
  }

  const fullBodyStarterPlan = starterPlans.find((plan) => plan.id === 'starter-full-body-3x')
  const confirmationCopy = getPlanConfirmationCopy(pendingConfirmation)

  return (
    <>
      <div className="space-y-6">
      <section className="fitness-hero-panel p-6 lg:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="fitness-badge">Tvorba plánov</Badge>
          <span className="text-sm text-fitness-yellow/80">Postav, duplikuj, škáluj, trénuj.</span>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-fitness-yellow">Tvorba osobného plánu</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl">
              Rozpíš si vlastný plán po týždňoch a dňoch.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-fitness-warm/75">
              Začni zo štartovacieho rozdelenia alebo z prázdneho plánu. StingFit škáluje cez jasné odporúčania, nie skrytú automatiku.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button className="fitness-action" leadingIcon={<Zap className="size-4" />} onClick={createFromPpl} disabled={isLoading || isMutating}>
                Vytvoriť z Tlak / Ťah / Nohy
              </Button>
              <Button
                variant="secondary"
                className="border-fitness-yellow/40 bg-black text-fitness-yellow hover:bg-fitness-yellow hover:text-black"
                leadingIcon={<CopyPlus className="size-4" />}
                onClick={createBlank}
                disabled={isLoading || isMutating}
              >
                Vytvoriť prázdny plán
              </Button>
            </div>
          </div>
          <div className="rounded-3xl border border-fitness-yellow/30 bg-black/70 p-4">
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((item) => (
                <div
                  key={item.day}
                  className={item.active ? 'rounded-2xl bg-fitness-yellow p-3 text-center text-black' : 'rounded-2xl border border-fitness-yellow/25 bg-fitness-surface p-3 text-center text-fitness-yellow'}
                >
                  <p className="text-xs font-black uppercase">{item.day}</p>
                  <p className="mt-2 text-xs font-semibold">{item.workout}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr,0.9fr]">
        <Card
          title="Štartovacie šablóny"
          description={isLoading ? 'Načítavam lokálne štartovacie plány…' : `Štartovacie šablóny pripravené: ${starterPlans.length}`}
        >
          {error ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>
          ) : null}
          {successMessage ? (
            <div className="mb-3 rounded-2xl border border-fitness-yellow/40 bg-fitness-yellow/10 px-4 py-3 text-sm font-semibold text-fitness-yellow">
              {successMessage}
            </div>
          ) : null}
          {isLoading ? (
            <div className="rounded-2xl border border-fitness-yellow/20 bg-black px-4 py-4 text-sm text-fitness-warm/70">Načítavam štartovacie plány…</div>
          ) : (
            <div className="grid gap-3">
              {starterPlans.map((plan) => (
                <article key={plan.id} className="rounded-2xl border border-fitness-yellow/20 bg-black px-4 py-4 text-fitness-warm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-black text-fitness-yellow">{plan.name}</h3>
                      <p className="mt-1 text-sm text-fitness-warm/70">{plan.goal}</p>
                      {showGuidance ? <p className="mt-2 text-xs font-semibold text-fitness-warm/55">Na úpravy vytvor osobnú kópiu.</p> : null}
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <Badge className="bg-fitness-yellow text-black">Šablóna chránená</Badge>
                      <Button
                        variant="secondary"
                        aria-label={`Vytvoriť osobný plán zo šablóny ${plan.name}`}
                        onClick={() => void createFromStarter(plan)}
                        disabled={isLoading || isMutating}
                      >
                        Vytvoriť osobnú kópiu
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Card>

        <Card title="Osobné plány" description={isLoading ? 'Kontrolujem lokálne plány…' : `Osobné plány: ${personalPlans.length}`}>
          {personalPlans.length === 0 && !isLoading ? (
            <div className="rounded-2xl border border-dashed border-fitness-yellow/30 bg-fitness-yellow/10 px-4 py-4 text-sm text-text-secondary dark:text-text-secondary-dark">
              Zatiaľ nemáš osobné plány. Vytvor plán z Tlak / Ťah / Nohy alebo začni prázdnym plánom.
            </div>
          ) : null}
          <div className="grid gap-3">
            {personalPlans.map((plan) => (
              <article key={plan.id} className={plan.id === selectedPlanId ? 'rounded-2xl border border-fitness-yellow bg-fitness-yellow/10 px-4 py-4 text-fitness-warm' : 'rounded-2xl border border-fitness-yellow/20 bg-black px-4 py-4 text-fitness-warm'}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-fitness-yellow">{plan.name}</h3>
                    <p className="mt-1 text-sm text-fitness-warm/70">{plan.goal || 'Cieľ zatiaľ nie je nastavený.'}</p>
                  </div>
                  <Button variant="secondary" onClick={() => void selectPlan(plan.id)} disabled={isLoading || isMutating}>
                    Otvoriť editor
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </Card>
      </section>

      {selectedStructure ? (
        <BeginnerPlanSummary
          structure={selectedStructure}
          isMutating={isMutating}
          onOpenTraining={() => navigate('/training')}
          onCompleteFromStarter={fullBodyStarterPlan ? () => void createFromStarter(fullBodyStarterPlan) : undefined}
        />
      ) : null}

      <details className="rounded-3xl border border-fitness-yellow/25 bg-black/55 p-4 text-fitness-warm">
        <summary className="cursor-pointer text-sm font-black uppercase tracking-[0.16em] text-fitness-yellow">Pokročilé úpravy plánu</summary>
        <p className="mt-2 text-sm text-fitness-warm/65">Otvor iba vtedy, keď chceš meniť týždne, dni, cviky, série, RIR alebo pauzy.</p>
        <div className="mt-4 space-y-6">
          <PlanEditor
            structure={selectedStructure}
            exerciseOptions={exerciseOptions}
            drafts={exerciseDrafts}
            dayDrafts={dayDrafts}
            workoutDrafts={workoutDrafts}
            dayEditDrafts={dayEditDrafts}
            workoutEditDrafts={workoutEditDrafts}
            addExerciseDrafts={addExerciseDrafts}
            customExerciseDrafts={customExerciseDrafts}
            isLoading={isLoading}
            isMutating={isMutating}
            showGuidance={showGuidance}
            onDuplicateWeek={duplicateWeek}
            onAddDay={addTrainingDay}
            onDayDraftChange={updateDayDraft}
            onAddWorkout={addWorkout}
            onWorkoutDraftChange={updateWorkoutDraft}
            onDayEditDraftChange={updateDayEditDraft}
            onWorkoutEditDraftChange={updateWorkoutEditDraft}
            onSaveDayDetails={saveDayDetails}
            onSaveWorkoutDetails={saveWorkoutDetails}
            onMoveWorkout={moveWorkoutInDay}
            onMoveExercise={moveExerciseInWorkout}
            onAddExercise={addExerciseToWorkout}
            onAddExerciseDraftChange={updateAddExerciseDraft}
            onCreateCustomExercise={createCustomExerciseForWorkout}
            onCustomExerciseDraftChange={updateCustomExerciseDraft}
            onRemoveDay={removePlanDay}
            onToggleDayRest={toggleDayRest}
            onRemoveWorkout={removePlanWorkout}
            onRemoveExercise={removePlanExercise}
            onDraftChange={updateExerciseDraft}
            onSaveTargets={saveExerciseTargets}
          />

          <ExerciseLibrary
            exercises={exerciseOptions}
            drafts={exerciseLibraryDrafts}
            isLoading={isLoading}
            isMutating={isMutating}
            onDraftChange={updateExerciseLibraryDraft}
            onSaveCustomExercise={saveCustomExercise}
            onArchiveCustomExercise={archiveCustomExercise}
          />

          <Card title="Akcie plánu" description="Štruktúra plánu je pripravená na detailný editor.">
            <div className="grid gap-3 text-sm text-text-secondary dark:text-text-secondary-dark">
              <div className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3 dark:border-border-dark">
                <CalendarDays className="size-5 text-fitness-orange" />
                <span>Duplikuj týždeň, vytvor ďalší týždeň, pridaj voľný deň.</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3 dark:border-border-dark">
                <Dumbbell className="size-5 text-fitness-orange" />
                <span>Uprav tréningové cviky, ciele, RIR a pauzy.</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3 dark:border-border-dark">
                <Plus className="size-5 text-fitness-orange" />
                <span>Pridaj vlastný tréningový deň do osobného plánu.</span>
              </div>
            </div>
          </Card>
        </div>
      </details>
      </div>

      {confirmationCopy ? (
        <ConfirmModal
          open={Boolean(pendingConfirmation)}
          title={confirmationCopy.title}
          description={confirmationCopy.description}
          confirmLabel={confirmationCopy.confirmLabel}
          warningText={confirmationCopy.warningText}
          isConfirming={isMutating}
          onConfirm={() => void confirmPendingPlanAction()}
          onClose={() => setPendingConfirmation(null)}
        />
      ) : null}
    </>
  )
}

function createPersonalPlanName(starter: FitnessPlanRecord) {
  if (starter.id === 'starter-push-pull-legs') {
    return 'Môj PPL blok'
  }

  return `Môj plán ${starter.name}`
}

function createPersonalPlanGoal(starter: FitnessPlanRecord) {
  if (starter.id === 'starter-push-pull-legs') {
    return 'Budovať svaly'
  }

  return starter.goal
}

function BeginnerPlanSummary({
  structure,
  isMutating,
  onOpenTraining,
  onCompleteFromStarter,
}: {
  structure: FitnessPlanStructure
  isMutating: boolean
  onOpenTraining: () => void
  onCompleteFromStarter?: () => void
}) {
  const summary = summarizeBeginnerPlan(structure)
  const readiness = buildPlanReadinessReport(structure)

  return (
    <Card title="Môj plán bez stresu" description={readiness.ready ? 'Toto je všetko, čo potrebuješ vedieť pred prvým tréningom.' : 'Plán najprv dostavaj z hotovej šablóny alebo v pokročilých úpravách.'}>
      <div className={readiness.ready ? 'rounded-3xl border border-fitness-yellow/35 bg-fitness-yellow/10 p-5 text-fitness-warm' : 'rounded-3xl border border-rose-500/35 bg-rose-500/10 p-5 text-fitness-warm'}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge className={readiness.ready ? 'bg-fitness-yellow text-black' : 'bg-rose-500 text-white'}>{readiness.ready ? 'Pripravené' : 'Treba dostavať'}</Badge>
            <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-fitness-yellow">{structure.plan.name}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-fitness-warm/75">
              {readiness.ready ? 'Nemusíš nič upravovať. Prejdi do Tréning, spusti prvý tréning a plán rieš až vtedy, keď ti niečo začne vadiť.' : 'Tento plán ešte nie je spustiteľný. Ak nechceš skladať dni a cviky ručne, dostavaj ho z jednoduchej 3-dňovej šablóny.'}
            </p>
          </div>
          {readiness.ready ? (
            <Button className="fitness-action" leadingIcon={<Zap className="size-4" />} onClick={onOpenTraining}>
              Prejsť na Tréning
            </Button>
          ) : onCompleteFromStarter ? (
            <Button className="fitness-action" leadingIcon={<CopyPlus className="size-4" />} onClick={onCompleteFromStarter} disabled={isMutating}>
              Dostavať z Celé telo 3×
            </Button>
          ) : null}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-fitness-yellow/25 bg-black/70 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Rytmus</p>
            <p className="mt-2 text-lg font-black text-white">{formatTrainingDayCount(summary.trainingDayCount)}</p>
          </div>
          <div className="rounded-2xl border border-fitness-yellow/25 bg-black/70 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Týždeň</p>
            <p className="mt-2 text-lg font-black text-white">{formatWorkoutCount(summary.workoutCount)}</p>
          </div>
          <div className="rounded-2xl border border-fitness-yellow/25 bg-black/70 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Prvý tréning</p>
            <p className="mt-2 text-lg font-black text-white">{summary.firstWorkoutName ?? 'Pripravený v Tréningu'}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}

function summarizeBeginnerPlan(structure: FitnessPlanStructure) {
  const days = structure.weeks.flatMap((week) => week.days)
  const trainingDays = days.filter((day) => !day.isRestDay && day.workouts.length > 0)
  const workouts = trainingDays.flatMap((day) => day.workouts)

  return {
    trainingDayCount: trainingDays.length,
    workoutCount: workouts.length,
    firstWorkoutName: workouts[0]?.name ?? null,
  }
}

function formatTrainingDayCount(count: number) {
  if (count === 1) return '1 tréningový deň'
  if (count > 1 && count < 5) return `${count} tréningové dni`
  return `${count} tréningových dní`
}

function formatWorkoutCount(count: number) {
  if (count === 1) return '1 tréning'
  if (count > 1 && count < 5) return `${count} tréningy`
  return `${count} tréningov`
}

function getPlanConfirmationCopy(confirmation: PlanConfirmation | null) {
  if (!confirmation) {
    return null
  }

  if (confirmation.kind === 'archiveCustomExercise') {
    return {
      title: `Archivovať ${confirmation.exercise.name}?`,
      description: 'Existujúce plány si ponechajú svoje snímky, ale cvik sa skryje z budúceho výberu v knižnici.',
      confirmLabel: 'Archivovať cvik',
      warningText: 'Archivácia nevymaže historické tréningy ani snímky plánov. Cvik sa iba prestane ponúkať pre budúce plánovanie.',
    }
  }
  if (confirmation.kind === 'removePlanExercise') {
    return {
      title: `Odstrániť ${confirmation.exercise.exerciseName} z tréningu?`,
      description: 'Cvik sa odstráni iba z tohto plánovaného tréningu. Dokončené tréningy a knižnica cvikov zostanú nezmenené.',
      confirmLabel: 'Odstrániť cvik',
      warningText: 'Táto úprava ovplyvní iba budúcu snímku plánu. Tréningová história zostáva lokálne zachovaná.',
    }
  }
  if (confirmation.kind === 'removePlanWorkout') {
    return {
      title: `Odstrániť tréning ${confirmation.workout.name}?`,
      description: 'Plánované cviky v tomto tréningu sa odstránia tiež. Ostatné tréningy v dni zostanú zachované.',
      confirmLabel: 'Odstrániť tréning',
      warningText: 'Odstránenie mení iba osobný plán do budúcna. Dokončené tréningy sa neprepisujú.',
    }
  }

  return {
    title: `Odstrániť deň ${confirmation.day.label}?`,
    description: 'Tréningy a plánované cviky v tento deň sa odstránia tiež. Ostatné dni týždňa zostanú zachované.',
    confirmLabel: 'Odstrániť deň',
    warningText: 'Odstránenie dňa mení iba plánovaciu štruktúru. História tréningov zostáva nedotknutá.',
  }
}

function ExerciseLibrary({
  exercises,
  drafts,
  isLoading,
  isMutating,
  onDraftChange,
  onSaveCustomExercise,
  onArchiveCustomExercise,
}: {
  exercises: FitnessExerciseRecord[]
  drafts: Record<string, ExerciseLibraryDraft>
  isLoading: boolean
  isMutating: boolean
  onDraftChange: (exerciseId: string, key: keyof ExerciseLibraryDraft, value: string) => void
  onSaveCustomExercise: (exercise: FitnessExerciseRecord) => Promise<void>
  onArchiveCustomExercise: (exercise: FitnessExerciseRecord) => Promise<void>
}) {
  return (
    <Card title="Knižnica cvikov" description="Spravuj lokálne cviky. Štartovacie cviky sú chránené; vlastné cviky môžeš upraviť alebo archivovať.">
      {isLoading ? (
        <div className="rounded-2xl border border-fitness-yellow/20 bg-black px-4 py-4 text-sm text-fitness-warm/70">Načítavam knižnicu cvikov…</div>
      ) : null}

      {!isLoading && exercises.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-fitness-yellow/30 bg-fitness-yellow/10 px-4 py-4 text-sm text-text-secondary dark:text-text-secondary-dark">
          Zatiaľ žiadne cviky. Vlastný cvik vytvor z editora tréningu.
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2">
        {exercises.map((exercise) => (
          <ExerciseLibraryRow
            key={exercise.id}
            exercise={exercise}
            draft={drafts[exercise.id]}
            isMutating={isMutating}
            onDraftChange={onDraftChange}
            onSaveCustomExercise={onSaveCustomExercise}
            onArchiveCustomExercise={onArchiveCustomExercise}
          />
        ))}
      </div>
    </Card>
  )
}

function ExerciseLibraryRow({
  exercise,
  draft,
  isMutating,
  onDraftChange,
  onSaveCustomExercise,
  onArchiveCustomExercise,
}: {
  exercise: FitnessExerciseRecord
  draft: ExerciseLibraryDraft | undefined
  isMutating: boolean
  onDraftChange: (exerciseId: string, key: keyof ExerciseLibraryDraft, value: string) => void
  onSaveCustomExercise: (exercise: FitnessExerciseRecord) => Promise<void>
  onArchiveCustomExercise: (exercise: FitnessExerciseRecord) => Promise<void>
}) {
  const currentDraft = draft ?? exerciseToLibraryDraft(exercise)

  if (!exercise.isCustom) {
    return (
      <article className="rounded-2xl border border-fitness-yellow/20 bg-black px-4 py-4 text-fitness-warm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-fitness-yellow">{exercise.name}</h3>
            <p className="mt-1 text-xs text-fitness-warm/65">{exercise.category} · {formatExerciseMuscleGroup(exercise)} · {exercise.defaultRestSeconds}s predvolená pauza</p>
          </div>
          <Badge className="bg-fitness-yellow text-black">Štartovací cvik chránený</Badge>
        </div>
      </article>
    )
  }

  return (
    <article className="rounded-2xl border border-fitness-yellow/30 bg-fitness-yellow/10 px-4 py-4 text-fitness-warm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-fitness-yellow">{exercise.name}</h3>
          <p className="mt-1 text-xs text-fitness-warm/65">Vlastné · {exercise.category} · {formatExerciseMuscleGroup(exercise)} · {exercise.defaultRestSeconds}s predvolená pauza</p>
        </div>
        <Badge className="bg-fitness-orange text-black">Vlastné</Badge>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr,0.8fr,0.8fr,0.45fr]">
        <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-fitness-yellow/70">
          Názov
          <input
            aria-label={`Názov cviku ${exercise.name}`}
            className="mt-2 w-full rounded-2xl border border-fitness-yellow/30 bg-black px-3 py-3 text-sm font-black text-fitness-yellow outline-none focus:border-fitness-yellow"
            value={currentDraft.name}
            onInput={(event) => onDraftChange(exercise.id, 'name', event.currentTarget.value)}
          />
        </label>
        <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-fitness-yellow/70">
          Kategória
          <input
            aria-label={`Kategória cviku ${exercise.name}`}
            className="mt-2 w-full rounded-2xl border border-fitness-yellow/30 bg-black px-3 py-3 text-sm font-black text-fitness-yellow outline-none focus:border-fitness-yellow"
            value={currentDraft.category}
            onInput={(event) => onDraftChange(exercise.id, 'category', event.currentTarget.value)}
          />
        </label>
        <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-fitness-yellow/70">
          Svalová skupina
          <select
            aria-label={`Svalová skupina cviku ${exercise.name}`}
            className="mt-2 w-full rounded-2xl border border-fitness-yellow/30 bg-black px-3 py-3 text-sm font-black text-fitness-yellow outline-none focus:border-fitness-yellow"
            value={currentDraft.muscleGroup}
            onChange={(event) => onDraftChange(exercise.id, 'muscleGroup', event.target.value)}
          >
            <option value="">Automaticky z kategórie</option>
            {FITNESS_MUSCLE_GROUPS.map((group) => (
              <option key={group} value={group}>{formatMuscleGroupLabel(group)}</option>
            ))}
          </select>
        </label>
        <TargetInput
          label="Pauza"
          ariaLabel={`Predvolená pauza v sekundách pre ${exercise.name}`}
          value={currentDraft.defaultRestSeconds}
          onChange={(value) => onDraftChange(exercise.id, 'defaultRestSeconds', value)}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button className="fitness-action" leadingIcon={<Save className="size-4" />} onClick={() => void onSaveCustomExercise(exercise)} disabled={isMutating}>
          Uložiť {exercise.name}
        </Button>
        <Button variant="danger" leadingIcon={<Trash2 className="size-4" />} onClick={() => void onArchiveCustomExercise(exercise)} disabled={isMutating}>
          Archivovať {exercise.name}
        </Button>
      </div>
    </article>
  )
}

function PlanEditor({
  structure,
  exerciseOptions,
  drafts,
  dayDrafts,
  workoutDrafts,
  dayEditDrafts,
  workoutEditDrafts,
  addExerciseDrafts,
  customExerciseDrafts,
  isLoading,
  isMutating,
  showGuidance,
  onDuplicateWeek,
  onAddDay,
  onDayDraftChange,
  onAddWorkout,
  onWorkoutDraftChange,
  onDayEditDraftChange,
  onWorkoutEditDraftChange,
  onSaveDayDetails,
  onSaveWorkoutDetails,
  onMoveWorkout,
  onMoveExercise,
  onAddExercise,
  onAddExerciseDraftChange,
  onCreateCustomExercise,
  onCustomExerciseDraftChange,
  onRemoveDay,
  onToggleDayRest,
  onRemoveWorkout,
  onRemoveExercise,
  onDraftChange,
  onSaveTargets,
}: {
  structure: FitnessPlanStructure | null
  exerciseOptions: FitnessExerciseRecord[]
  drafts: Record<string, PlanExerciseDraft>
  dayDrafts: Record<string, AddDayDraft>
  workoutDrafts: Record<string, AddWorkoutDraft>
  dayEditDrafts: Record<string, DayEditDraft>
  workoutEditDrafts: Record<string, WorkoutEditDraft>
  addExerciseDrafts: Record<string, AddExerciseDraft>
  customExerciseDrafts: Record<string, CustomExerciseDraft>
  isLoading: boolean
  isMutating: boolean
  showGuidance: boolean
  onDuplicateWeek: (weekId: string, weekNumber: number) => Promise<void>
  onAddDay: (week: FitnessPlanWeekRecord) => Promise<void>
  onDayDraftChange: (weekId: string, key: keyof AddDayDraft, value: string) => void
  onAddWorkout: (day: FitnessPlanDayRecord) => Promise<void>
  onWorkoutDraftChange: (dayId: string, value: string) => void
  onDayEditDraftChange: (dayId: string, key: keyof DayEditDraft, value: string) => void
  onWorkoutEditDraftChange: (workoutId: string, key: keyof WorkoutEditDraft, value: string) => void
  onSaveDayDetails: (day: FitnessPlanDayRecord) => Promise<void>
  onSaveWorkoutDetails: (workout: FitnessPlanWorkoutRecord) => Promise<void>
  onMoveWorkout: (workout: FitnessPlanWorkoutRecord, direction: FitnessPlanMoveDirection) => Promise<void>
  onMoveExercise: (exercise: FitnessPlanExerciseRecord, direction: FitnessPlanMoveDirection) => Promise<void>
  onAddExercise: (workout: FitnessPlanWorkoutRecord) => Promise<void>
  onAddExerciseDraftChange: (workoutId: string, key: keyof AddExerciseDraft, value: string) => void
  onCreateCustomExercise: (workout: FitnessPlanWorkoutRecord) => Promise<void>
  onCustomExerciseDraftChange: (workoutId: string, key: keyof CustomExerciseDraft, value: string) => void
  onRemoveDay: (day: FitnessPlanDayRecord) => Promise<void>
  onToggleDayRest: (day: FitnessPlanDayRecord) => Promise<void>
  onRemoveWorkout: (workout: FitnessPlanWorkoutRecord) => Promise<void>
  onRemoveExercise: (exercise: FitnessPlanExerciseRecord) => Promise<void>
  onDraftChange: (exerciseId: string, key: keyof PlanExerciseDraft, value: string) => void
  onSaveTargets: (exercise: FitnessPlanExerciseRecord) => Promise<void>
}) {
  const [collapsedWeekIds, setCollapsedWeekIds] = useState<Set<string>>(() => new Set())
  const [collapsedDayIds, setCollapsedDayIds] = useState<Set<string>>(() => new Set())

  const toggleWeekCollapse = (weekId: string) => setCollapsedWeekIds((current) => toggleIdInSet(current, weekId))
  const toggleDayCollapse = (dayId: string) => setCollapsedDayIds((current) => toggleIdInSet(current, dayId))

  return (
    <Card title="Editor plánu" description={structure ? `${structure.plan.name}: uprav lokálnu snímku plánu pred tréningom.` : 'Vyber alebo vytvor osobný plán a uprav týždne, dni a ciele cvikov.'}>
      {isLoading ? (
        <div className="rounded-2xl border border-fitness-yellow/20 bg-black px-4 py-4 text-sm text-fitness-warm/70">Načítavam editor plánu…</div>
      ) : null}

      {!isLoading && !structure ? (
        <div className="rounded-2xl border border-dashed border-fitness-yellow/30 bg-fitness-yellow/10 px-4 py-4 text-sm text-text-secondary dark:text-text-secondary-dark">
          Nie je vybraný osobný plán. Vytvor plán a odomkneš duplikovanie týždňov aj úpravu cieľov cvikov.
        </div>
      ) : null}

      {structure ? (
        <div className="space-y-5">
          <div className="rounded-3xl border border-fitness-yellow/30 bg-black p-5 text-fitness-warm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Vybraný osobný plán</p>
            <h2 className="mt-2 text-2xl font-black text-fitness-yellow">{structure.plan.name}</h2>
            <p className="mt-2 text-sm text-fitness-warm/70">{structure.plan.goal || 'Cieľ nie je nastavený.'}</p>
          </div>

          {showGuidance ? (
            <div className="rounded-3xl border border-fitness-yellow/30 bg-fitness-yellow/10 p-5 text-fitness-warm">
              <Badge className="bg-fitness-yellow text-black">Iba budúce tréningy</Badge>
              <h3 className="mt-3 text-lg font-black text-white">Úpravy plánu ovplyvnia iba budúce tréningy.</h3>
              <p className="mt-2 text-sm leading-6 text-fitness-warm/70">
                Dokončené tréningy zostávajú ako snímky tréningu. Zmena plánu neprepíše tréningovú históriu.
              </p>
            </div>
          ) : null}

          <PlanReadinessCard structure={structure} />

          {structure.weeks.map((week) => {
            const weekSummary = summarizePlanWeek(week)
            const isWeekCollapsed = collapsedWeekIds.has(week.id)

            return (
              <section key={week.id} className="rounded-3xl border border-fitness-yellow/20 bg-black/80 p-4 text-fitness-warm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black text-fitness-yellow">Týždeň {week.weekNumber}</h3>
                    <p className="mt-1 text-xs text-fitness-warm/60">{weekSummary.label}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      leadingIcon={isWeekCollapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
                      aria-expanded={!isWeekCollapsed}
                      onClick={() => toggleWeekCollapse(week.id)}
                      disabled={isMutating}
                    >
                      {isWeekCollapsed ? `Rozbaliť týždeň ${week.weekNumber}` : `Zbaliť týždeň ${week.weekNumber}`}
                    </Button>
                    <Button variant="secondary" leadingIcon={<CopyPlus className="size-4" />} onClick={() => void onDuplicateWeek(week.id, week.weekNumber)} disabled={isMutating}>
                      Duplikovať týždeň {week.weekNumber}
                    </Button>
                  </div>
                </div>

                <WeekOverview week={week} />

                {!isWeekCollapsed ? (
                  <>
                    <div className="mt-4">
                      <AddDayForm
                        week={week}
                        draft={dayDrafts[week.id]}
                        isMutating={isMutating}
                        onDraftChange={onDayDraftChange}
                        onAddDay={onAddDay}
                      />
                    </div>

                    <div className="mt-4 grid gap-3 lg:grid-cols-2">
                      {week.days.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-fitness-yellow/30 bg-fitness-yellow/10 px-4 py-4 text-sm text-fitness-warm/70">
                          Tento týždeň zatiaľ nemá dni. Pridaj tréningový deň vyššie a začni skladať plán.
                        </div>
                      ) : null}

                      {week.days.map((day) => {
                        const dayStatus = getPlanDayStatus(day)
                        const isDayCollapsed = collapsedDayIds.has(day.id)

                        return (
                          <article key={day.id} className="rounded-2xl border border-fitness-yellow/20 bg-fitness-surface p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Deň {day.dayIndex + 1}</p>
                                <h4 className="mt-1 text-lg font-black text-fitness-yellow">{day.label}</h4>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <DayStatusBadge tone={dayStatus.tone}>{dayStatus.label}</DayStatusBadge>
                                <Button
                                  variant="secondary"
                                  leadingIcon={isDayCollapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
                                  aria-expanded={!isDayCollapsed}
                                  onClick={() => toggleDayCollapse(day.id)}
                                  disabled={isMutating}
                                >
                                  {isDayCollapsed ? `Rozbaliť ${day.label}` : `Zbaliť ${day.label}`}
                                </Button>
                                <Button variant="secondary" leadingIcon={day.isRestDay ? <Dumbbell className="size-4" /> : <CalendarDays className="size-4" />} onClick={() => void onToggleDayRest(day)} disabled={isMutating}>
                                  {day.isRestDay ? `Označiť ${day.label} ako tréning` : `Označiť ${day.label} ako voľno`}
                                </Button>
                                <Button variant="danger" leadingIcon={<Trash2 className="size-4" />} onClick={() => void onRemoveDay(day)} disabled={isMutating}>
                                  Odstrániť deň {day.label}
                                </Button>
                              </div>
                            </div>

                            {!isDayCollapsed ? (
                              <>
                                <DayDetailsEditor
                                  day={day}
                                  draft={dayEditDrafts[day.id]}
                                  isMutating={isMutating}
                                  onDraftChange={onDayEditDraftChange}
                                  onSaveDayDetails={onSaveDayDetails}
                                />

                                <div className="mt-4 space-y-3">
                                  {day.isRestDay ? (
                                    <p className="rounded-2xl border border-fitness-yellow/25 bg-fitness-yellow/10 px-4 py-3 text-sm font-semibold text-fitness-yellow">
                                      Voľný deň: uložené tréningy zostanú v pláne, ale v Tréningu sú skryté, kým deň neoznačíš ako tréning.
                                    </p>
                                  ) : null}
                                  {!day.isRestDay ? (
                                    <AddWorkoutForm
                                      day={day}
                                      draft={workoutDrafts[day.id]}
                                      isMutating={isMutating}
                                      onDraftChange={onWorkoutDraftChange}
                                      onAddWorkout={onAddWorkout}
                                    />
                                  ) : null}
                                  {day.workouts.length === 0 ? (
                                    <p className="text-sm text-fitness-warm/60">V tento deň nie sú žiadne tréningy.</p>
                                  ) : null}
                                  {day.workouts.map((workout, workoutIndex) => (
                                    <div key={workout.id} className="rounded-2xl border border-fitness-yellow/20 bg-black p-4">
                                      <div className="flex flex-wrap items-center justify-between gap-3">
                                        <h5 className="text-sm font-black text-fitness-yellow">{workout.name}</h5>
                                        <div className="flex flex-wrap gap-2">
                                          <Button variant="secondary" size="sm" leadingIcon={<ChevronUp className="size-4" />} onClick={() => void onMoveWorkout(workout, 'up')} disabled={isMutating || workoutIndex === 0}>
                                            Posunúť {workout.name} hore
                                          </Button>
                                          <Button variant="secondary" size="sm" leadingIcon={<ChevronDown className="size-4" />} onClick={() => void onMoveWorkout(workout, 'down')} disabled={isMutating || workoutIndex === day.workouts.length - 1}>
                                            Posunúť {workout.name} dole
                                          </Button>
                                          <Button variant="danger" leadingIcon={<Trash2 className="size-4" />} onClick={() => void onRemoveWorkout(workout)} disabled={isMutating}>
                                            Odstrániť tréning {workout.name}
                                          </Button>
                                        </div>
                                      </div>
                                      <WorkoutDetailsEditor
                                        workout={workout}
                                        draft={workoutEditDrafts[workout.id]}
                                        isMutating={isMutating}
                                        onDraftChange={onWorkoutEditDraftChange}
                                        onSaveWorkoutDetails={onSaveWorkoutDetails}
                                      />
                                      <div className="mt-3 space-y-3">
                                        <AddExerciseForm
                                          workout={workout}
                                          exerciseOptions={exerciseOptions}
                                          draft={addExerciseDrafts[workout.id]}
                                          customDraft={customExerciseDrafts[workout.id]}
                                          isMutating={isMutating}
                                          onDraftChange={onAddExerciseDraftChange}
                                          onCustomDraftChange={onCustomExerciseDraftChange}
                                          onCreateCustomExercise={onCreateCustomExercise}
                                          onAddExercise={onAddExercise}
                                        />
                                        {workout.exercises.map((exercise, exerciseIndex) => (
                                          <PlanExerciseEditor
                                            key={exercise.id}
                                            exercise={exercise}
                                            draft={drafts[exercise.id]}
                                            isMutating={isMutating}
                                            canMoveUp={exerciseIndex > 0}
                                            canMoveDown={exerciseIndex < workout.exercises.length - 1}
                                            onDraftChange={onDraftChange}
                                            onSaveTargets={onSaveTargets}
                                            onMoveExercise={onMoveExercise}
                                            onRemoveExercise={onRemoveExercise}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </>
                            ) : (
                              <p className="mt-4 rounded-2xl border border-fitness-yellow/20 bg-black/60 px-4 py-3 text-sm text-fitness-warm/65">
                                Detaily {day.label} sú zbalené. Stav: {dayStatus.label}.
                              </p>
                            )}
                          </article>
                        )
                      })}
                    </div>
                  </>
                ) : null}
              </section>
            )
          })}
        </div>
      ) : null}
    </Card>
  )
}

function WeekOverview({ week }: { week: FitnessPlanWeekRecord }) {
  const summary = summarizePlanWeek(week)

  return (
    <div className="mt-4 rounded-2xl border border-fitness-yellow/25 bg-fitness-yellow/10 px-4 py-3 text-fitness-warm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Týždeň {week.weekNumber} prehľad</p>
          <p className="mt-1 text-sm font-semibold text-fitness-warm/75">{summary.label}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-fitness-yellow text-black">{summary.readyWorkoutCount} pripravené</Badge>
          {summary.issueCount > 0 ? <Badge className="bg-rose-500 text-white">{summary.issueCount} problém{summary.issueCount === 1 ? '' : 'y'}</Badge> : <Badge className="bg-emerald-400 text-black">Bez problémov</Badge>}
        </div>
      </div>
    </div>
  )
}

function DayStatusBadge({ tone, children }: { tone: FitnessPlanDayStatusTone; children: string }) {
  const className = tone === 'ready'
    ? 'bg-emerald-400 text-black'
    : tone === 'rest'
      ? 'bg-fitness-yellow text-black'
      : 'bg-rose-500 text-white'

  return <Badge className={className}>{children}</Badge>
}

function PlanReadinessCard({ structure }: { structure: FitnessPlanStructure }) {
  const report = buildPlanReadinessReport(structure)

  return (
    <div className={report.ready ? 'rounded-3xl border border-fitness-yellow/40 bg-fitness-yellow/10 p-5 text-fitness-warm' : 'rounded-3xl border border-rose-500/40 bg-rose-500/10 p-5 text-fitness-warm'}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Pripravenosť plánu</p>
          <h3 className="mt-2 text-2xl font-black text-white">{report.ready ? 'Pripravené na tréning' : 'Pred tréningom treba opravy'}</h3>
          <p className="mt-2 text-sm text-fitness-warm/70">Spustiteľné tréningy: {report.startableWorkoutCount}</p>
        </div>
        {report.ready ? <CheckCircle2 className="size-7 text-fitness-yellow" /> : <AlertTriangle className="size-7 text-rose-300" />}
      </div>

      {report.blockers.length > 0 ? (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-200/80">Opraviť pred štartom</p>
          {report.blockers.map((issue) => (
            <div key={issue.message} className="rounded-2xl border border-rose-400/30 bg-black/70 px-4 py-3 text-sm font-semibold text-rose-100">
              {issue.message}
            </div>
          ))}
        </div>
      ) : null}

      {report.warnings.length > 0 ? (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Upozornenia</p>
          {report.warnings.map((issue) => (
            <div key={issue.message} className="rounded-2xl border border-fitness-yellow/30 bg-black/70 px-4 py-3 text-sm font-semibold text-fitness-yellow">
              {issue.message}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function DayDetailsEditor({
  day,
  draft,
  isMutating,
  onDraftChange,
  onSaveDayDetails,
}: {
  day: FitnessPlanDayRecord
  draft: DayEditDraft | undefined
  isMutating: boolean
  onDraftChange: (dayId: string, key: keyof DayEditDraft, value: string) => void
  onSaveDayDetails: (day: FitnessPlanDayRecord) => Promise<void>
}) {
  const currentDraft = draft ?? dayToEditDraft(day)

  return (
    <div className="mt-4 rounded-2xl border border-fitness-yellow/20 bg-black/60 p-3">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Upraviť detaily dňa</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-[0.35fr,1fr,auto]">
        <TargetInput
          label="Deň"
          ariaLabel={`Číslo dňa pre ${day.label}`}
          value={currentDraft.dayNumber}
          onChange={(value) => onDraftChange(day.id, 'dayNumber', value)}
        />
        <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-fitness-yellow/70">
          Názov
          <input
            aria-label={`Názov dňa pre ${day.label}`}
            className="mt-2 w-full rounded-2xl border border-fitness-yellow/30 bg-black px-3 py-3 text-sm font-black text-fitness-yellow outline-none focus:border-fitness-yellow"
            value={currentDraft.label}
            onInput={(event) => onDraftChange(day.id, 'label', event.currentTarget.value)}
          />
        </label>
        <Button className="fitness-action self-end" leadingIcon={<Save className="size-4" />} onClick={() => void onSaveDayDetails(day)} disabled={isMutating}>
          Uložiť {day.label}
        </Button>
      </div>
    </div>
  )
}

function WorkoutDetailsEditor({
  workout,
  draft,
  isMutating,
  onDraftChange,
  onSaveWorkoutDetails,
}: {
  workout: FitnessPlanWorkoutRecord
  draft: WorkoutEditDraft | undefined
  isMutating: boolean
  onDraftChange: (workoutId: string, key: keyof WorkoutEditDraft, value: string) => void
  onSaveWorkoutDetails: (workout: FitnessPlanWorkoutRecord) => Promise<void>
}) {
  const currentDraft = draft ?? workoutToEditDraft(workout)

  return (
    <div className="mt-3 rounded-2xl border border-fitness-yellow/20 bg-fitness-yellow/10 p-3">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Upraviť detaily tréningu</p>
      {workout.notes ? <p className="mt-2 text-xs font-semibold text-fitness-warm/70">{workout.notes}</p> : null}
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr,1.3fr,auto]">
        <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-fitness-yellow/70">
          Názov tréningu
          <input
            aria-label={`Názov tréningu pre ${workout.name}`}
            className="mt-2 w-full rounded-2xl border border-fitness-yellow/30 bg-black px-3 py-3 text-sm font-black text-fitness-yellow outline-none focus:border-fitness-yellow"
            value={currentDraft.name}
            onInput={(event) => onDraftChange(workout.id, 'name', event.currentTarget.value)}
          />
        </label>
        <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-fitness-yellow/70">
          Poznámky
          <textarea
            aria-label={`Poznámky k tréningu ${workout.name}`}
            className="mt-2 min-h-12 w-full rounded-2xl border border-fitness-yellow/30 bg-black px-3 py-3 text-sm font-semibold text-fitness-yellow outline-none focus:border-fitness-yellow"
            value={currentDraft.notes}
            onInput={(event) => onDraftChange(workout.id, 'notes', event.currentTarget.value)}
          />
        </label>
        <Button className="fitness-action self-end" leadingIcon={<Save className="size-4" />} onClick={() => void onSaveWorkoutDetails(workout)} disabled={isMutating}>
          Uložiť {workout.name}
        </Button>
      </div>
    </div>
  )
}

function AddDayForm({
  week,
  draft,
  isMutating,
  onDraftChange,
  onAddDay,
}: {
  week: FitnessPlanWeekRecord
  draft: AddDayDraft | undefined
  isMutating: boolean
  onDraftChange: (weekId: string, key: keyof AddDayDraft, value: string) => void
  onAddDay: (week: FitnessPlanWeekRecord) => Promise<void>
}) {
  const fallbackDayNumber = getNextAvailableDayNumber(week)

  return (
    <div className="rounded-2xl border border-fitness-yellow/20 bg-fitness-yellow/10 p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Pridať tréningový deň</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-[0.35fr,1fr,auto]">
        <TargetInput
          label="Deň"
          ariaLabel={`Číslo dňa pre týždeň ${week.weekNumber}`}
          value={draft?.dayNumber ?? String(fallbackDayNumber)}
          onChange={(value) => onDraftChange(week.id, 'dayNumber', value)}
        />
        <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-fitness-yellow/70">
          Názov
          <input
            aria-label={`Názov dňa pre týždeň ${week.weekNumber}`}
            className="mt-2 w-full rounded-2xl border border-fitness-yellow/30 bg-black px-3 py-3 text-sm font-black text-fitness-yellow outline-none focus:border-fitness-yellow"
            value={draft?.label ?? ''}
            onInput={(event) => onDraftChange(week.id, 'label', event.currentTarget.value)}
            placeholder="Hrudník"
          />
        </label>
        <Button className="fitness-action self-end" leadingIcon={<Plus className="size-4" />} onClick={() => void onAddDay(week)} disabled={isMutating}>
          Pridať tréningový deň do týždňa {week.weekNumber}
        </Button>
      </div>
    </div>
  )
}

function AddWorkoutForm({
  day,
  draft,
  isMutating,
  onDraftChange,
  onAddWorkout,
}: {
  day: FitnessPlanDayRecord
  draft: AddWorkoutDraft | undefined
  isMutating: boolean
  onDraftChange: (dayId: string, value: string) => void
  onAddWorkout: (day: FitnessPlanDayRecord) => Promise<void>
}) {
  return (
    <div className="rounded-2xl border border-fitness-yellow/20 bg-black/70 p-3">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Pridať tréning</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr,auto]">
        <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-fitness-yellow/70">
          Názov tréningu
          <input
            aria-label={`Názov tréningu pre ${day.label}`}
            className="mt-2 w-full rounded-2xl border border-fitness-yellow/30 bg-black px-3 py-3 text-sm font-black text-fitness-yellow outline-none focus:border-fitness-yellow"
            value={draft?.name ?? ''}
            onInput={(event) => onDraftChange(day.id, event.currentTarget.value)}
            placeholder="Hrudníkový tréning"
          />
        </label>
        <Button variant="secondary" className="self-end" leadingIcon={<Plus className="size-4" />} onClick={() => void onAddWorkout(day)} disabled={isMutating}>
          Pridať tréning do {day.label}
        </Button>
      </div>
    </div>
  )
}

function AddExerciseForm({
  workout,
  exerciseOptions,
  draft,
  customDraft,
  isMutating,
  onDraftChange,
  onCustomDraftChange,
  onCreateCustomExercise,
  onAddExercise,
}: {
  workout: FitnessPlanWorkoutRecord
  exerciseOptions: FitnessExerciseRecord[]
  draft: AddExerciseDraft | undefined
  customDraft: CustomExerciseDraft | undefined
  isMutating: boolean
  onDraftChange: (workoutId: string, key: keyof AddExerciseDraft, value: string) => void
  onCustomDraftChange: (workoutId: string, key: keyof CustomExerciseDraft, value: string) => void
  onCreateCustomExercise: (workout: FitnessPlanWorkoutRecord) => Promise<void>
  onAddExercise: (workout: FitnessPlanWorkoutRecord) => Promise<void>
}) {
  const currentCustomDraft = { ...defaultCustomExerciseDraft(), ...customDraft }
  const currentDraft = { ...defaultAddExerciseDraft(exerciseOptions), ...draft }

  return (
    <div className="rounded-2xl border border-dashed border-fitness-yellow/30 bg-fitness-yellow/10 p-3">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Pridať cvik</p>
      <div className="mt-3 rounded-2xl border border-fitness-yellow/20 bg-black/70 p-3">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">Vytvoriť chýbajúci cvik</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr,0.7fr,0.7fr,0.45fr]">
          <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-fitness-yellow/70">
            Názov
            <input
              aria-label={`Názov vlastného cviku pre ${workout.name}`}
              className="mt-2 w-full rounded-2xl border border-fitness-yellow/30 bg-black px-3 py-3 text-sm font-black text-fitness-yellow outline-none focus:border-fitness-yellow"
              value={currentCustomDraft.name}
              onInput={(event) => onCustomDraftChange(workout.id, 'name', event.currentTarget.value)}
              placeholder="Rozpažovanie na kladke"
            />
          </label>
          <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-fitness-yellow/70">
            Kategória
            <input
              aria-label={`Kategória vlastného cviku pre ${workout.name}`}
              className="mt-2 w-full rounded-2xl border border-fitness-yellow/30 bg-black px-3 py-3 text-sm font-black text-fitness-yellow outline-none focus:border-fitness-yellow"
              value={currentCustomDraft.category}
              onInput={(event) => onCustomDraftChange(workout.id, 'category', event.currentTarget.value)}
              placeholder="hrudník"
            />
          </label>
          <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-fitness-yellow/70">
            Svalová skupina
            <select
              aria-label={`Svalová skupina vlastného cviku pre ${workout.name}`}
              className="mt-2 w-full rounded-2xl border border-fitness-yellow/30 bg-black px-3 py-3 text-sm font-black text-fitness-yellow outline-none focus:border-fitness-yellow"
              value={currentCustomDraft.muscleGroup}
              onChange={(event) => onCustomDraftChange(workout.id, 'muscleGroup', event.target.value)}
            >
              <option value="">Automaticky z kategórie</option>
              {FITNESS_MUSCLE_GROUPS.map((group) => (
                <option key={group} value={group}>{formatMuscleGroupLabel(group)}</option>
              ))}
            </select>
          </label>
          <TargetInput
            label="Pauza"
            ariaLabel={`Predvolená pauza vlastného cviku v sekundách pre ${workout.name}`}
            value={currentCustomDraft.defaultRestSeconds}
            onChange={(value) => onCustomDraftChange(workout.id, 'defaultRestSeconds', value)}
          />
        </div>
        <Button variant="secondary" className="mt-3" leadingIcon={<Plus className="size-4" />} onClick={() => void onCreateCustomExercise(workout)} disabled={isMutating}>
          Vytvoriť vlastný cvik pre {workout.name}
        </Button>
      </div>
      {exerciseOptions.length === 0 ? (
        <p className="mt-2 text-sm text-fitness-warm/60">Zatiaľ nie sú dostupné žiadne cviky.</p>
      ) : (
        <div className="mt-3 space-y-3">
          <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-fitness-yellow/70">
            Cvik
            <select
              aria-label={`Cvik pre ${workout.name}`}
              className="mt-2 w-full rounded-2xl border border-fitness-yellow/30 bg-black px-3 py-3 text-sm font-black text-fitness-yellow outline-none focus:border-fitness-yellow"
              value={currentDraft.exerciseId}
              onChange={(event) => onDraftChange(workout.id, 'exerciseId', event.target.value)}
            >
              {exerciseOptions.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>{exercise.name}</option>
              ))}
            </select>
          </label>
          <div className="grid gap-3 sm:grid-cols-5">
            <TargetInput label="Série" ariaLabel={`Cieľové série pre nový cvik v ${workout.name}`} value={currentDraft.targetSets} onChange={(value) => onDraftChange(workout.id, 'targetSets', value)} />
            <TargetInput label="Min. opak." ariaLabel={`Minimum opakovaní pre nový cvik v ${workout.name}`} value={currentDraft.minReps} onChange={(value) => onDraftChange(workout.id, 'minReps', value)} />
            <TargetInput label="Max. opak." ariaLabel={`Maximum opakovaní pre nový cvik v ${workout.name}`} value={currentDraft.maxReps} onChange={(value) => onDraftChange(workout.id, 'maxReps', value)} />
            <TargetInput label="RIR" ariaLabel={`Cieľové RIR pre nový cvik v ${workout.name}`} value={currentDraft.targetRir} onChange={(value) => onDraftChange(workout.id, 'targetRir', value)} />
            <TargetInput label="Pauza" ariaLabel={`Pauza v sekundách pre nový cvik v ${workout.name}`} value={currentDraft.restSeconds} onChange={(value) => onDraftChange(workout.id, 'restSeconds', value)} />
          </div>
          <Button variant="secondary" leadingIcon={<Plus className="size-4" />} onClick={() => void onAddExercise(workout)} disabled={isMutating || !currentDraft.exerciseId}>
            Pridať cvik do {workout.name}
          </Button>
        </div>
      )}
    </div>
  )
}

function PlanExerciseEditor({
  exercise,
  draft,
  isMutating,
  canMoveUp,
  canMoveDown,
  onDraftChange,
  onSaveTargets,
  onMoveExercise,
  onRemoveExercise,
}: {
  exercise: FitnessPlanExerciseRecord
  draft: PlanExerciseDraft | undefined
  isMutating: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  onDraftChange: (exerciseId: string, key: keyof PlanExerciseDraft, value: string) => void
  onSaveTargets: (exercise: FitnessPlanExerciseRecord) => Promise<void>
  onMoveExercise: (exercise: FitnessPlanExerciseRecord, direction: FitnessPlanMoveDirection) => Promise<void>
  onRemoveExercise: (exercise: FitnessPlanExerciseRecord) => Promise<void>
}) {
  const currentDraft = draft ?? exerciseToDraft(exercise)

  return (
    <article className="rounded-2xl border border-fitness-yellow/20 bg-black/80 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h6 className="text-sm font-black text-fitness-yellow">{exercise.exerciseName}</h6>
          <p className="mt-1 text-xs font-bold text-fitness-warm/70">{formatPlanExerciseTarget(exercise)}</p>
        </div>
        <Dumbbell className="size-4 text-fitness-orange" />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-6">
        <TargetInput label="Série" ariaLabel={`Cieľové série pre ${exercise.exerciseName}`} value={currentDraft.targetSets} onChange={(value) => onDraftChange(exercise.id, 'targetSets', value)} />
        <TargetInput label="Min. opak." ariaLabel={`Minimum opakovaní pre ${exercise.exerciseName}`} value={currentDraft.minReps} onChange={(value) => onDraftChange(exercise.id, 'minReps', value)} />
        <TargetInput label="Max. opak." ariaLabel={`Maximum opakovaní pre ${exercise.exerciseName}`} value={currentDraft.maxReps} onChange={(value) => onDraftChange(exercise.id, 'maxReps', value)} />
        <TargetInput label="RIR" ariaLabel={`Cieľové RIR pre ${exercise.exerciseName}`} value={currentDraft.targetRir} onChange={(value) => onDraftChange(exercise.id, 'targetRir', value)} />
        <TargetInput label="Pauza" ariaLabel={`Pauza v sekundách pre ${exercise.exerciseName}`} value={currentDraft.restSeconds} onChange={(value) => onDraftChange(exercise.id, 'restSeconds', value)} />
        <SupersetGroupInput ariaLabel={`Superset skupina pre ${exercise.exerciseName}`} value={currentDraft.supersetGroup} onChange={(value) => onDraftChange(exercise.id, 'supersetGroup', value)} />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button className="fitness-action" leadingIcon={<Save className="size-4" />} onClick={() => void onSaveTargets(exercise)} disabled={isMutating}>
          Uložiť ciele pre {exercise.exerciseName}
        </Button>
        <Button variant="secondary" size="sm" leadingIcon={<ChevronUp className="size-4" />} onClick={() => void onMoveExercise(exercise, 'up')} disabled={isMutating || !canMoveUp}>
          Posunúť {exercise.exerciseName} hore
        </Button>
        <Button variant="secondary" size="sm" leadingIcon={<ChevronDown className="size-4" />} onClick={() => void onMoveExercise(exercise, 'down')} disabled={isMutating || !canMoveDown}>
          Posunúť {exercise.exerciseName} dole
        </Button>
        <Button variant="danger" leadingIcon={<Trash2 className="size-4" />} onClick={() => void onRemoveExercise(exercise)} disabled={isMutating}>
          Odstrániť {exercise.exerciseName}
        </Button>
      </div>
    </article>
  )
}

function SupersetGroupInput({ ariaLabel, value, onChange }: { ariaLabel: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-fitness-yellow/70">
      Superset
      <input
        aria-label={ariaLabel}
        className="mt-2 w-full rounded-2xl border border-fitness-yellow/30 bg-black px-3 py-3 text-sm font-black uppercase text-fitness-yellow outline-none focus:border-fitness-yellow"
        value={value}
        onInput={(event) => onChange(event.currentTarget.value)}
        placeholder="A"
      />
    </label>
  )
}

function TargetInput({ label, ariaLabel, value, onChange }: { label: string; ariaLabel: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-fitness-yellow/70">
      {label}
      <input
        aria-label={ariaLabel}
        className="mt-2 w-full rounded-2xl border border-fitness-yellow/30 bg-black px-3 py-3 text-sm font-black text-fitness-yellow outline-none focus:border-fitness-yellow"
        inputMode="numeric"
        value={value}
        onInput={(event) => onChange(event.currentTarget.value)}
      />
    </label>
  )
}

function buildExerciseDrafts(structure: FitnessPlanStructure) {
  const drafts: Record<string, PlanExerciseDraft> = {}
  for (const week of structure.weeks) {
    for (const day of week.days) {
      for (const workout of day.workouts) {
        for (const exercise of workout.exercises) {
          drafts[exercise.id] = exerciseToDraft(exercise)
        }
      }
    }
  }
  return drafts
}

function buildDayEditDrafts(structure: FitnessPlanStructure) {
  const drafts: Record<string, DayEditDraft> = {}
  for (const week of structure.weeks) {
    for (const day of week.days) {
      drafts[day.id] = dayToEditDraft(day)
    }
  }
  return drafts
}

function buildWorkoutEditDrafts(structure: FitnessPlanStructure) {
  const drafts: Record<string, WorkoutEditDraft> = {}
  for (const week of structure.weeks) {
    for (const day of week.days) {
      for (const workout of day.workouts) {
        drafts[workout.id] = workoutToEditDraft(workout)
      }
    }
  }
  return drafts
}

function dayToEditDraft(day: FitnessPlanDayRecord): DayEditDraft {
  return {
    dayNumber: String(day.dayIndex + 1),
    label: day.label,
  }
}

function workoutToEditDraft(workout: FitnessPlanWorkoutRecord): WorkoutEditDraft {
  return {
    name: workout.name,
    notes: workout.notes,
  }
}

function exerciseToDraft(exercise: FitnessPlanExerciseRecord): PlanExerciseDraft {
  return {
    targetSets: String(exercise.targetSets),
    minReps: String(exercise.minReps),
    maxReps: String(exercise.maxReps),
    targetRir: exercise.targetRir === null ? '' : String(exercise.targetRir),
    restSeconds: String(exercise.restSeconds),
    supersetGroup: exercise.supersetGroup ?? '',
  }
}

function buildExerciseLibraryDrafts(exercises: FitnessExerciseRecord[]) {
  const drafts: Record<string, ExerciseLibraryDraft> = {}
  for (const exercise of exercises) {
    drafts[exercise.id] = exerciseToLibraryDraft(exercise)
  }
  return drafts
}

function exerciseToLibraryDraft(exercise: FitnessExerciseRecord): ExerciseLibraryDraft {
  return {
    name: exercise.name,
    category: exercise.category,
    muscleGroup: exercise.muscleGroup ?? '',
    defaultRestSeconds: String(exercise.defaultRestSeconds),
  }
}

function defaultAddExerciseDraft(exerciseOptions: FitnessExerciseRecord[]): AddExerciseDraft {
  return {
    exerciseId: exerciseOptions[0]?.id ?? '',
    targetSets: '3',
    minReps: '8',
    maxReps: '12',
    targetRir: '2',
    restSeconds: String(exerciseOptions[0]?.defaultRestSeconds ?? 120),
    supersetGroup: '',
  }
}

function defaultCustomExerciseDraft(): CustomExerciseDraft {
  return {
    name: '',
    category: 'vlastné',
    muscleGroup: '',
    defaultRestSeconds: '90',
  }
}

function formatExerciseMuscleGroup(exercise: FitnessExerciseRecord) {
  return exercise.muscleGroup ? formatMuscleGroupLabel(exercise.muscleGroup) : 'svalová skupina automaticky'
}

function getNextAvailableDayNumber(week: FitnessPlanWeekRecord) {
  const used = new Set(week.days.map((day) => day.dayIndex))
  for (let index = 0; index <= 6; index += 1) {
    if (!used.has(index)) {
      return index + 1
    }
  }

  return 7
}

function formatPlanExerciseTarget(exercise: FitnessPlanExerciseRecord) {
  const superset = exercise.supersetGroup ? ` · Superset ${exercise.supersetGroup}` : ''
  return `${exercise.targetSets}×${exercise.minReps}–${exercise.maxReps} · RIR ${exercise.targetRir ?? 'voľné'} · ${exercise.restSeconds}s pauza${superset}`
}

function formatMoveDirection(direction: FitnessPlanMoveDirection) {
  return direction === 'up' ? 'hore' : 'dole'
}

function toggleIdInSet(current: Set<string>, id: string) {
  const next = new Set(current)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }

  return next
}
