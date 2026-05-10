import { execute, query } from '@/lib/database'
import { STARTER_FITNESS_EXERCISES, STARTER_FITNESS_PLANS, STARTER_PLAN_STRUCTURES } from '@/features/fitness/fitnessSeed'
import { buildStrongCsvPreview, parseStrongCsvImport, type ParsedStrongCsvWorkout } from '@/features/fitness/fitnessStrongCsv'
import type {
  AddPlanDayInput,
  AddPlanExerciseInput,
  AddPlanWorkoutInput,
  AddUnplannedExerciseInput,
  CreateFitnessExerciseInput,
  CreatePersonalPlanInput,
  FitnessExerciseRecord,
  FitnessExportPayload,
  FitnessImportPreview,
  FitnessImportResult,
  FitnessLastPerformance,
  FitnessLiveSession,
  FinishFitnessSessionInput,
  FitnessPlanDayRecord,
  FitnessPlanExerciseRecord,
  FitnessPlanKind,
  FitnessPlanMoveDirection,
  FitnessPlanRecord,
  FitnessPlanStatus,
  FitnessPlanStructure,
  FitnessPlanWeekRecord,
  FitnessPlanWorkoutRecord,
  FitnessSessionExerciseRecord,
  FitnessSessionExerciseStatus,
  FitnessSessionSetRecord,
  FitnessSessionSetStatus,
  FitnessSessionSetType,
  FitnessSessionStatus,
  FitnessWeightEntryMode,
  FitnessSettingsRecord,
  FitnessStartableWorkout,
  FitnessStrongCsvImportResult,
  ImportFitnessDataOptions,
  LogFitnessSetInput,
  StarterPlanStructureDay,
  UpdateFitnessExerciseInput,
  UpdateFitnessSettingsInput,
  UpdatePersonalPlanInput,
  UpdatePlanDayInput,
  UpdatePlanExerciseInput,
  UpdatePlanWorkoutInput,
} from '@/features/fitness/fitnessTypes'
import { normalizeMuscleGroup, requireMuscleGroup } from '@/features/fitness/fitnessMuscleGroups'
import { normalizeDisplayUnit } from '@/features/fitness/fitnessUnits'

interface FitnessExerciseRow {
  id: string
  name: string
  category: string
  muscle_group: string | null
  default_rest_seconds: number
  is_custom: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface FitnessPlanRow {
  id: string
  name: string
  goal: string
  kind: FitnessPlanKind
  source_template_id: string | null
  status: FitnessPlanStatus
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface FitnessPlanWeekRow {
  id: string
  plan_id: string
  week_number: number
  notes: string
  created_at: string
  updated_at: string
}

interface FitnessPlanDayRow {
  id: string
  week_id: string
  day_index: number
  label: string
  is_rest_day: number
  created_at: string
  updated_at: string
}

interface FitnessPlanWorkoutRow {
  id: string
  plan_day_id: string
  name: string
  notes: string
  sort_order: number
  created_at: string
  updated_at: string
}

interface FitnessPlanExerciseRow {
  id: string
  plan_workout_id: string
  exercise_id: string
  exercise_name: string
  exercise_category: string
  exercise_muscle_group: string | null
  sort_order: number
  target_sets: number
  min_reps: number
  max_reps: number
  target_rir: number | null
  rest_seconds: number
  notes: string
  superset_group: string | null
  created_at: string
  updated_at: string
}

interface FitnessStartableWorkoutRow {
  workout_id: string
  workout_name: string
  plan_id: string
  plan_name: string
  week_id: string
  week_number: number
  day_id: string
  day_label: string
  exercise_count: number
  planned_set_count: number
  first_exercise_name: string | null
}

interface FitnessSessionRow {
  id: string
  plan_id: string | null
  plan_workout_id: string | null
  name: string
  status: FitnessSessionStatus
  started_at: string | null
  completed_at: string | null
  notes: string
  session_rpe: number | null
  energy_level: number | null
  created_at: string
  updated_at: string
}

interface FitnessSessionExerciseRow {
  id: string
  session_id: string
  exercise_id: string
  name_snapshot: string
  category_snapshot: string | null
  muscle_group_snapshot: string | null
  sort_order: number
  status: FitnessSessionExerciseStatus
  target_sets: number
  min_reps: number
  max_reps: number
  target_rir: number | null
  rest_seconds: number
  notes: string
  superset_group: string | null
  created_at: string
  updated_at: string
}

interface FitnessSessionSetRow {
  id: string
  session_exercise_id: string
  set_number: number
  weight_kg: number
  weight_entry_mode: FitnessWeightEntryMode | null
  left_weight_kg: number | null
  right_weight_kg: number | null
  reps: number
  rir: number | null
  set_type: FitnessSessionSetType | null
  status: FitnessSessionSetStatus
  completed_at: string | null
  corrected_at: string | null
  correction_count: number | null
  created_at: string
  updated_at: string
}

interface FitnessLastPerformanceRow {
  weight_kg: number
  reps: number
  rir: number | null
  completed_at: string | null
}

interface FitnessSettingRow {
  key: string
  value: string
  updated_at: string
}

const starterPlanOrderSql = `CASE id
  WHEN 'starter-push-pull-legs' THEN 0
  WHEN 'starter-upper-lower' THEN 1
  WHEN 'starter-full-body-3x' THEN 2
  ELSE 99
END`

function nowIso() {
  return new Date().toISOString()
}

function toBoolean(value: number) {
  return value === 1
}

function exerciseFromRow(row: FitnessExerciseRow): FitnessExerciseRecord {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    muscleGroup: normalizeMuscleGroup(row.muscle_group),
    defaultRestSeconds: Number(row.default_rest_seconds),
    isCustom: toBoolean(row.is_custom),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  }
}

function planFromRow(row: FitnessPlanRow): FitnessPlanRecord {
  return {
    id: row.id,
    name: row.name,
    goal: row.goal,
    kind: row.kind,
    sourceTemplateId: row.source_template_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  }
}

function weekFromRow(row: FitnessPlanWeekRow, days: FitnessPlanDayRecord[] = []): FitnessPlanWeekRecord {
  return {
    id: row.id,
    planId: row.plan_id,
    weekNumber: Number(row.week_number),
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    days,
  }
}

function dayFromRow(row: FitnessPlanDayRow, workouts: FitnessPlanWorkoutRecord[] = []): FitnessPlanDayRecord {
  return {
    id: row.id,
    weekId: row.week_id,
    dayIndex: Number(row.day_index),
    label: row.label,
    isRestDay: toBoolean(row.is_rest_day),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    workouts,
  }
}

function workoutFromRow(row: FitnessPlanWorkoutRow, exercises: FitnessPlanExerciseRecord[] = []): FitnessPlanWorkoutRecord {
  return {
    id: row.id,
    planDayId: row.plan_day_id,
    name: row.name,
    notes: row.notes,
    sortOrder: Number(row.sort_order),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    exercises,
  }
}

function planExerciseFromRow(row: FitnessPlanExerciseRow): FitnessPlanExerciseRecord {
  return {
    id: row.id,
    planWorkoutId: row.plan_workout_id,
    exerciseId: row.exercise_id,
    exerciseName: row.exercise_name,
    sortOrder: Number(row.sort_order),
    targetSets: Number(row.target_sets),
    minReps: Number(row.min_reps),
    maxReps: Number(row.max_reps),
    targetRir: row.target_rir === null ? null : Number(row.target_rir),
    restSeconds: Number(row.rest_seconds),
    notes: row.notes,
    supersetGroup: normalizeSupersetGroup(row.superset_group),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function startableWorkoutFromRow(row: FitnessStartableWorkoutRow): FitnessStartableWorkout {
  return {
    workoutId: row.workout_id,
    workoutName: row.workout_name,
    planId: row.plan_id,
    planName: row.plan_name,
    weekId: row.week_id,
    weekNumber: Number(row.week_number),
    dayId: row.day_id,
    dayLabel: row.day_label,
    exerciseCount: Number(row.exercise_count),
    plannedSetCount: Number(row.planned_set_count),
    firstExerciseName: row.first_exercise_name,
  }
}

function sessionSetFromRow(row: FitnessSessionSetRow): FitnessSessionSetRecord {
  return {
    id: row.id,
    sessionExerciseId: row.session_exercise_id,
    setNumber: Number(row.set_number),
    weightKg: Number(row.weight_kg),
    reps: Number(row.reps),
    rir: row.rir === null ? null : Number(row.rir),
    setType: normalizeSetType(row.set_type),
    weightEntryMode: normalizeWeightEntryMode(row.weight_entry_mode),
    leftWeightKg: normalizeNullableWeight(row.left_weight_kg),
    rightWeightKg: normalizeNullableWeight(row.right_weight_kg),
    status: row.status,
    completedAt: row.completed_at,
    correctedAt: row.corrected_at,
    correctionCount: Number(row.correction_count ?? 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function sessionExerciseFromRow(
  row: FitnessSessionExerciseRow,
  sets: FitnessSessionSetRecord[] = [],
  lastPerformance: FitnessLastPerformance | null = null,
): FitnessSessionExerciseRecord {
  return {
    id: row.id,
    sessionId: row.session_id,
    exerciseId: row.exercise_id,
    nameSnapshot: row.name_snapshot,
    categorySnapshot: row.category_snapshot,
    muscleGroupSnapshot: normalizeMuscleGroup(row.muscle_group_snapshot),
    sortOrder: Number(row.sort_order),
    status: row.status,
    targetSets: Number(row.target_sets),
    minReps: Number(row.min_reps),
    maxReps: Number(row.max_reps),
    targetRir: row.target_rir === null ? null : Number(row.target_rir),
    restSeconds: Number(row.rest_seconds),
    notes: row.notes,
    supersetGroup: normalizeSupersetGroup(row.superset_group),
    lastPerformance,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    sets,
  }
}

function sessionFromRow(row: FitnessSessionRow, exercises: FitnessSessionExerciseRecord[] = []): FitnessLiveSession {
  return {
    id: row.id,
    planId: row.plan_id,
    planWorkoutId: row.plan_workout_id,
    name: row.name,
    status: row.status,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    notes: row.notes,
    sessionRpe: row.session_rpe === null ? null : Number(row.session_rpe),
    energyLevel: row.energy_level === null ? null : Number(row.energy_level),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    exercises,
  }
}

function requireName(value: string, message: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    throw new Error(message)
  }

  return trimmed
}

function normalizeNonNegativeInteger(value: number, message: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(message)
  }

  return Math.round(value)
}

function normalizePositiveInteger(value: number, message: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(message)
  }

  return Math.round(value)
}

function normalizeDayIndex(value: number) {
  const dayIndex = normalizeNonNegativeInteger(value, 'Day index must be between 0 and 6')
  if (dayIndex > 6) {
    throw new Error('Day index must be between 0 and 6')
  }

  return dayIndex
}

function normalizeRepRange(minReps: number, maxReps: number) {
  const min = normalizePositiveInteger(minReps, 'Minimum reps must be greater than zero')
  const max = normalizePositiveInteger(maxReps, 'Maximum reps must be greater than zero')
  if (min > max) {
    throw new Error('Minimum reps cannot be greater than maximum reps')
  }

  return { min, max }
}

const FITNESS_SET_TYPES = ['working', 'warmup', 'dropset', 'myo', 'failure'] as const satisfies readonly FitnessSessionSetType[]
const FITNESS_WEIGHT_ENTRY_MODES = ['total', 'per_side'] as const satisfies readonly FitnessWeightEntryMode[]

function normalizeSetType(value: unknown): FitnessSessionSetType {
  return FITNESS_SET_TYPES.includes(value as FitnessSessionSetType) ? value as FitnessSessionSetType : 'working'
}

function normalizeWeightEntryMode(value: unknown): FitnessWeightEntryMode {
  return FITNESS_WEIGHT_ENTRY_MODES.includes(value as FitnessWeightEntryMode) ? value as FitnessWeightEntryMode : 'total'
}

function normalizeSupersetGroup(value: unknown) {
  if (value === undefined || value === null) {
    return null
  }

  const normalized = String(value).trim().toUpperCase().replace(/\s+/g, '')
  return normalized ? normalized.slice(0, 12) : null
}

function normalizeNullableWeight(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return null
  }

  const numeric = Number(value)
  return Number.isFinite(numeric) ? Math.max(0, numeric) : null
}

function normalizeLoggedWeight(input: LogFitnessSetInput) {
  const mode = normalizeWeightEntryMode(input.weightEntryMode)
  if (mode === 'per_side') {
    const leftWeightKg = normalizeNullableWeight(input.leftWeightKg) ?? 0
    const rightWeightKg = normalizeNullableWeight(input.rightWeightKg) ?? 0
    return {
      weightKg: Math.max(0, leftWeightKg + rightWeightKg),
      weightEntryMode: mode,
      leftWeightKg,
      rightWeightKg,
    }
  }

  const numericWeightKg = Number(input.weightKg)
  return {
    weightKg: Number.isFinite(numericWeightKg) ? Math.max(0, numericWeightKg) : 0,
    weightEntryMode: 'total' as const,
    leftWeightKg: null,
    rightWeightKg: null,
  }
}

function normalizeTargetRir(value: number | null | undefined) {
  if (value === undefined || value === null) {
    return null
  }

  return normalizeNonNegativeInteger(value, 'Target RIR must be a non-negative number')
}

function normalizeNullableRating(value: number | null | undefined, min: number, max: number, message: string) {
  if (value === undefined || value === null) {
    return null
  }

  if (!Number.isFinite(value)) {
    throw new Error(message)
  }

  const rounded = Math.round(value)
  if (rounded < min || rounded > max) {
    throw new Error(message)
  }

  return rounded
}

async function insertStarterExercise(exercise: FitnessExerciseRecord) {
  await execute(
    `INSERT INTO fitness_exercises(
      id, name, category, muscle_group, default_rest_seconds, is_custom, created_at, updated_at, deleted_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      category = excluded.category,
      muscle_group = excluded.muscle_group,
      default_rest_seconds = excluded.default_rest_seconds,
      is_custom = excluded.is_custom,
      updated_at = excluded.updated_at,
      deleted_at = excluded.deleted_at`,
    [
      exercise.id,
      exercise.name,
      exercise.category,
      exercise.muscleGroup,
      exercise.defaultRestSeconds,
      exercise.isCustom ? 1 : 0,
      exercise.createdAt,
      exercise.updatedAt,
      exercise.deletedAt,
    ],
  )
}

async function insertStarterPlan(plan: FitnessPlanRecord) {
  await execute(
    `INSERT INTO fitness_plans(
      id, name, goal, kind, source_template_id, status, created_at, updated_at, deleted_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      goal = excluded.goal,
      kind = excluded.kind,
      source_template_id = excluded.source_template_id,
      status = excluded.status,
      updated_at = excluded.updated_at,
      deleted_at = excluded.deleted_at`,
    [plan.id, plan.name, plan.goal, plan.kind, plan.sourceTemplateId, plan.status, plan.createdAt, plan.updatedAt, plan.deletedAt],
  )
}

async function getExerciseRow(exerciseId: string) {
  const rows = await query<FitnessExerciseRow>(`SELECT * FROM fitness_exercises WHERE id = ? AND deleted_at IS NULL`, [exerciseId])
  const row = rows[0]
  if (!row) {
    throw new Error('Fitness exercise not found')
  }

  return row
}

async function getPlanRow(planId: string) {
  const rows = await query<FitnessPlanRow>(`SELECT * FROM fitness_plans WHERE id = ? AND deleted_at IS NULL`, [planId])
  const row = rows[0]
  if (!row) {
    throw new Error('Fitness plan not found')
  }

  return row
}

async function getAnyPlanRow(planId: string) {
  const rows = await query<FitnessPlanRow>(`SELECT * FROM fitness_plans WHERE id = ?`, [planId])
  const row = rows[0]
  if (!row) {
    throw new Error('Fitness plan not found')
  }

  return row
}

function requirePersonalPlan(row: FitnessPlanRow) {
  if (row.kind !== 'personal') {
    throw new Error('Only personal plans can be changed.')
  }
}

async function getWeekRow(weekId: string) {
  const rows = await query<FitnessPlanWeekRow>(`SELECT * FROM fitness_plan_weeks WHERE id = ?`, [weekId])
  const row = rows[0]
  if (!row) {
    throw new Error('Fitness plan week not found')
  }

  return row
}

async function getPlanDayRow(dayId: string) {
  const rows = await query<FitnessPlanDayRow>(`SELECT * FROM fitness_plan_days WHERE id = ?`, [dayId])
  const row = rows[0]
  if (!row) {
    throw new Error('Fitness plan day not found')
  }

  return row
}

async function getPlanWorkoutRow(workoutId: string) {
  const rows = await query<FitnessPlanWorkoutRow>(`SELECT * FROM fitness_plan_workouts WHERE id = ?`, [workoutId])
  const row = rows[0]
  if (!row) {
    throw new Error('Fitness plan workout not found')
  }

  return row
}

async function getPlanExerciseRow(planExerciseId: string) {
  const rows = await query<FitnessPlanExerciseRow>(
    `SELECT fpe.*, fe.name AS exercise_name
     FROM fitness_plan_exercises fpe
     JOIN fitness_exercises fe ON fe.id = fpe.exercise_id
     WHERE fpe.id = ?`,
    [planExerciseId],
  )
  const row = rows[0]
  if (!row) {
    throw new Error('Fitness plan exercise not found')
  }

  return row
}

async function getMaxWeekNumber(planId: string) {
  const rows = await query<{ max_week: number | null }>(`SELECT MAX(week_number) AS max_week FROM fitness_plan_weeks WHERE plan_id = ?`, [planId])
  return Number(rows[0]?.max_week ?? 0)
}

async function getNextWorkoutSortOrder(dayId: string) {
  const rows = await query<{ max_sort: number | null }>(`SELECT MAX(sort_order) AS max_sort FROM fitness_plan_workouts WHERE plan_day_id = ?`, [dayId])
  return Number(rows[0]?.max_sort ?? -1) + 1
}

async function getNextPlanExerciseSortOrder(workoutId: string) {
  const rows = await query<{ max_sort: number | null }>(`SELECT MAX(sort_order) AS max_sort FROM fitness_plan_exercises WHERE plan_workout_id = ?`, [workoutId])
  return Number(rows[0]?.max_sort ?? -1) + 1
}

async function insertWeek(planId: string, weekNumber: number, notes: string) {
  const timestamp = nowIso()
  const id = crypto.randomUUID()
  await execute(
    `INSERT INTO fitness_plan_weeks(id, plan_id, week_number, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, planId, weekNumber, notes, timestamp, timestamp],
  )
  const rows = await query<FitnessPlanWeekRow>(`SELECT * FROM fitness_plan_weeks WHERE id = ?`, [id])
  return weekFromRow(rows[0] as FitnessPlanWeekRow)
}

async function insertDay(weekId: string, input: AddPlanDayInput) {
  const timestamp = nowIso()
  const id = crypto.randomUUID()
  const label = requireName(input.label, 'Plan day label is required')
  const dayIndex = normalizeDayIndex(input.dayIndex)
  await execute(
    `INSERT INTO fitness_plan_days(id, week_id, day_index, label, is_rest_day, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, weekId, dayIndex, label, input.isRestDay ? 1 : 0, timestamp, timestamp],
  )
  const rows = await query<FitnessPlanDayRow>(`SELECT * FROM fitness_plan_days WHERE id = ?`, [id])
  return dayFromRow(rows[0] as FitnessPlanDayRow)
}

async function insertWorkout(dayId: string, input: AddPlanWorkoutInput) {
  const timestamp = nowIso()
  const id = crypto.randomUUID()
  const name = requireName(input.name, 'Workout name is required')
  const sortOrder = await getNextWorkoutSortOrder(dayId)
  await execute(
    `INSERT INTO fitness_plan_workouts(id, plan_day_id, name, notes, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, dayId, name, input.notes?.trim() ?? '', sortOrder, timestamp, timestamp],
  )
  const rows = await query<FitnessPlanWorkoutRow>(`SELECT * FROM fitness_plan_workouts WHERE id = ?`, [id])
  return workoutFromRow(rows[0] as FitnessPlanWorkoutRow)
}

async function moveSiblingSortOrder<T extends { id: string }>(
  rows: T[],
  itemId: string,
  direction: FitnessPlanMoveDirection,
  updateSortOrder: (row: T, sortOrder: number, timestamp: string) => Promise<void>,
) {
  const currentIndex = rows.findIndex((row) => row.id === itemId)
  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
  if (currentIndex === -1 || targetIndex < 0 || targetIndex >= rows.length) {
    return
  }

  const reordered = [...rows]
  const current = reordered[currentIndex]
  const target = reordered[targetIndex]
  if (!current || !target) {
    return
  }
  reordered[currentIndex] = target
  reordered[targetIndex] = current

  const timestamp = nowIso()
  for (const [sortOrder, row] of reordered.entries()) {
    await updateSortOrder(row, sortOrder, timestamp)
  }
}

async function insertPlanExercise(workoutId: string, input: AddPlanExerciseInput) {
  const timestamp = nowIso()
  const id = crypto.randomUUID()
  const targetSets = normalizePositiveInteger(input.targetSets, 'Target sets must be greater than zero')
  const { min, max } = normalizeRepRange(input.minReps, input.maxReps)
  const restSeconds = normalizeNonNegativeInteger(input.restSeconds, 'Rest seconds must be a non-negative number')
  const targetRir = normalizeTargetRir(input.targetRir)
  const supersetGroup = normalizeSupersetGroup(input.supersetGroup)
  const sortOrder = await getNextPlanExerciseSortOrder(workoutId)

  await execute(
    `INSERT INTO fitness_plan_exercises(
      id, plan_workout_id, exercise_id, sort_order, target_sets, min_reps, max_reps, target_rir, rest_seconds, notes, superset_group, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, workoutId, input.exerciseId, sortOrder, targetSets, min, max, targetRir, restSeconds, input.notes?.trim() ?? '', supersetGroup, timestamp, timestamp],
  )

  return planExerciseFromRow(await getPlanExerciseRow(id))
}

async function copyStarterStructure(planId: string, starterPlanId: string) {
  const structure = STARTER_PLAN_STRUCTURES.find((entry) => entry.planId === starterPlanId)
  const week = await insertWeek(planId, 1, structure?.weekNotes ?? '')

  if (!structure) {
    return week
  }

  for (const dayTemplate of structure.days) {
    await copyTemplateDay(week.id, dayTemplate)
  }

  return week
}

async function copyTemplateDay(weekId: string, dayTemplate: StarterPlanStructureDay) {
  const day = await insertDay(weekId, {
    dayIndex: dayTemplate.dayIndex,
    label: dayTemplate.label,
    isRestDay: dayTemplate.isRestDay,
  })

  for (const workoutTemplate of dayTemplate.workouts) {
    const workout = await insertWorkout(day.id, {
      name: workoutTemplate.name,
      notes: workoutTemplate.notes ?? '',
    })

    for (const exerciseTemplate of workoutTemplate.exercises) {
      await insertPlanExercise(workout.id, exerciseTemplate)
    }
  }

  return day
}

async function copyWeekToNumber(sourceWeekId: string, targetWeekNumber: number) {
  const sourceWeek = await getWeekRow(sourceWeekId)
  const copiedWeek = await insertWeek(sourceWeek.plan_id, targetWeekNumber, sourceWeek.notes)
  const days = await query<FitnessPlanDayRow>(`SELECT * FROM fitness_plan_days WHERE week_id = ? ORDER BY day_index ASC`, [sourceWeekId])

  for (const dayRow of days) {
    const copiedDay = await insertDay(copiedWeek.id, {
      dayIndex: Number(dayRow.day_index),
      label: dayRow.label,
      isRestDay: toBoolean(dayRow.is_rest_day),
    })
    const workouts = await query<FitnessPlanWorkoutRow>(`SELECT * FROM fitness_plan_workouts WHERE plan_day_id = ? ORDER BY sort_order ASC`, [dayRow.id])

    for (const workoutRow of workouts) {
      const copiedWorkout = await insertWorkout(copiedDay.id, {
        name: workoutRow.name,
        notes: workoutRow.notes,
      })
      const exercises = await query<FitnessPlanExerciseRow>(
        `SELECT fpe.*, fe.name AS exercise_name
         FROM fitness_plan_exercises fpe
         JOIN fitness_exercises fe ON fe.id = fpe.exercise_id
         WHERE fpe.plan_workout_id = ?
         ORDER BY fpe.sort_order ASC`,
        [workoutRow.id],
      )

      for (const exercise of exercises) {
        await insertPlanExercise(copiedWorkout.id, {
          exerciseId: exercise.exercise_id,
          targetSets: Number(exercise.target_sets),
          minReps: Number(exercise.min_reps),
          maxReps: Number(exercise.max_reps),
          targetRir: exercise.target_rir,
          restSeconds: Number(exercise.rest_seconds),
          notes: exercise.notes,
          supersetGroup: normalizeSupersetGroup(exercise.superset_group),
        })
      }
    }
  }

  return copiedWeek
}

function settingsFromRows(rows: FitnessSettingRow[]): FitnessSettingsRecord {
  const settings = new Map(rows.map((row) => [row.key, row]))
  const displayUnitRow = settings.get('display_unit')
  const guidanceRow = settings.get('show_guidance')
  const restSoundRow = settings.get('rest_sound')
  const restVibrationRow = settings.get('rest_vibration')
  return {
    displayUnit: normalizeDisplayUnit(displayUnitRow?.value),
    showGuidance: guidanceRow?.value === undefined ? true : guidanceRow.value !== '0',
    restSoundEnabled: restSoundRow?.value === undefined ? true : restSoundRow.value !== '0',
    restVibrationEnabled: restVibrationRow?.value === undefined ? true : restVibrationRow.value !== '0',
    updatedAt: displayUnitRow?.updated_at ?? guidanceRow?.updated_at ?? restSoundRow?.updated_at ?? restVibrationRow?.updated_at ?? null,
  }
}

async function getFitnessSettings(): Promise<FitnessSettingsRecord> {
  const rows = await query<FitnessSettingRow>(`SELECT * FROM fitness_settings WHERE key IN ('display_unit', 'show_guidance', 'rest_sound', 'rest_vibration')`)
  return settingsFromRows(rows)
}

function lastPerformanceFromRow(row: FitnessLastPerformanceRow): FitnessLastPerformance {
  return {
    weightKg: Number(row.weight_kg),
    reps: Number(row.reps),
    rir: row.rir === null ? null : Number(row.rir),
    completedAt: row.completed_at,
  }
}

async function getLastPerformanceForExercise(exerciseId: string, currentSessionId: string): Promise<FitnessLastPerformance | null> {
  const rows = await query<FitnessLastPerformanceRow>(
    `SELECT
       fitness_sets.weight_kg,
       fitness_sets.reps,
       fitness_sets.rir,
       fitness_sets.completed_at
     FROM fitness_sets
     JOIN fitness_session_exercises ON fitness_session_exercises.id = fitness_sets.session_exercise_id
     JOIN fitness_sessions ON fitness_sessions.id = fitness_session_exercises.session_id
     WHERE fitness_session_exercises.exercise_id = ?
       AND fitness_sessions.id <> ?
       AND fitness_sessions.status = 'completed'
       AND fitness_sets.status = 'completed'
       AND fitness_sets.set_type <> 'warmup'
     ORDER BY COALESCE(fitness_sets.completed_at, fitness_sessions.completed_at, fitness_sets.updated_at) DESC
     LIMIT 1`,
    [exerciseId, currentSessionId],
  )

  return rows[0] ? lastPerformanceFromRow(rows[0]) : null
}

async function upsertFitnessSetting(key: string, value: string) {
  const timestamp = nowIso()
  await execute(
    `INSERT INTO fitness_settings(key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    [key, value, timestamp],
  )
}

async function getLiveSessionById(sessionId: string): Promise<FitnessLiveSession> {
  const sessionRows = await query<FitnessSessionRow>(`SELECT * FROM fitness_sessions WHERE id = ?`, [sessionId])
  const sessionRow = sessionRows[0]
  if (!sessionRow) {
    throw new Error('Fitness session not found')
  }

  const exerciseRows = await query<FitnessSessionExerciseRow>(
    `SELECT * FROM fitness_session_exercises WHERE session_id = ? ORDER BY sort_order ASC`,
    [sessionId],
  )
  const exercises: FitnessSessionExerciseRecord[] = []

  for (const exerciseRow of exerciseRows) {
    const setRows = await query<FitnessSessionSetRow>(
      `SELECT * FROM fitness_sets WHERE session_exercise_id = ? ORDER BY set_number ASC`,
      [exerciseRow.id],
    )
    const lastPerformance = await getLastPerformanceForExercise(exerciseRow.exercise_id, sessionId)
    exercises.push(sessionExerciseFromRow(exerciseRow, setRows.map(sessionSetFromRow), lastPerformance))
  }

  return sessionFromRow(sessionRow, exercises)
}

async function getSessionIdForExercise(sessionExerciseId: string) {
  const rows = await query<{ session_id: string }>(`SELECT session_id FROM fitness_session_exercises WHERE id = ?`, [sessionExerciseId])
  const sessionId = rows[0]?.session_id
  if (!sessionId) {
    throw new Error('Fitness session exercise not found')
  }

  return sessionId
}

async function getSessionExerciseIdForSet(setId: string) {
  const rows = await query<{ session_exercise_id: string }>(`SELECT session_exercise_id FROM fitness_sets WHERE id = ?`, [setId])
  const sessionExerciseId = rows[0]?.session_exercise_id
  if (!sessionExerciseId) {
    throw new Error('Fitness session set not found')
  }

  return sessionExerciseId
}

async function getNextSessionExerciseSortOrder(sessionId: string) {
  const rows = await query<{ max_sort: number | null }>(`SELECT MAX(sort_order) AS max_sort FROM fitness_session_exercises WHERE session_id = ?`, [sessionId])
  return Number(rows[0]?.max_sort ?? -1) + 1
}

async function getNextSessionSetNumber(sessionExerciseId: string) {
  const rows = await query<{ max_set: number | null }>(`SELECT MAX(set_number) AS max_set FROM fitness_sets WHERE session_exercise_id = ?`, [sessionExerciseId])
  return Number(rows[0]?.max_set ?? 0) + 1
}

async function activateNextPendingExercise(sessionId: string) {
  const activeRows = await query<{ id: string }>(
    `SELECT id FROM fitness_session_exercises WHERE session_id = ? AND status = 'active' LIMIT 1`,
    [sessionId],
  )
  if (activeRows.length > 0) {
    return
  }

  const nextRows = await query<{ id: string }>(
    `SELECT id FROM fitness_session_exercises WHERE session_id = ? AND status = 'pending' ORDER BY sort_order ASC LIMIT 1`,
    [sessionId],
  )
  const nextId = nextRows[0]?.id
  if (nextId) {
    await execute(`UPDATE fitness_session_exercises SET status = 'active', updated_at = ? WHERE id = ?`, [nowIso(), nextId])
  }
}

async function advanceAfterLoggedSet(sessionExerciseId: string) {
  const exerciseRows = await query<FitnessSessionExerciseRow>(`SELECT * FROM fitness_session_exercises WHERE id = ?`, [sessionExerciseId])
  const exercise = exerciseRows[0]
  if (!exercise) {
    throw new Error('Fitness session exercise not found')
  }

  const plannedRows = await query<{ count: number }>(
    `SELECT COUNT(*) AS count FROM fitness_sets WHERE session_exercise_id = ? AND status = 'planned'`,
    [sessionExerciseId],
  )
  const hasPlannedSets = Number(plannedRows[0]?.count ?? 0) > 0
  const timestamp = nowIso()

  if (!hasPlannedSets) {
    await execute(`UPDATE fitness_session_exercises SET status = 'done', updated_at = ? WHERE id = ?`, [timestamp, sessionExerciseId])
  }

  const supersetGroup = normalizeSupersetGroup(exercise.superset_group)
  if (supersetGroup) {
    const nextRows = await query<{ id: string }>(
      `SELECT fse.id
       FROM fitness_session_exercises fse
       WHERE fse.session_id = ?
       AND fse.id <> ?
       AND fse.superset_group = ?
       AND fse.status IN ('pending', 'active')
       AND EXISTS (SELECT 1 FROM fitness_sets fs WHERE fs.session_exercise_id = fse.id AND fs.status = 'planned')
       ORDER BY CASE WHEN fse.sort_order > ? THEN 0 ELSE 1 END, fse.sort_order ASC
       LIMIT 1`,
      [exercise.session_id, sessionExerciseId, supersetGroup, Number(exercise.sort_order)],
    )
    const nextSupersetExerciseId = nextRows[0]?.id
    if (nextSupersetExerciseId) {
      if (hasPlannedSets) {
        await execute(`UPDATE fitness_session_exercises SET status = 'pending', updated_at = ? WHERE id = ?`, [timestamp, sessionExerciseId])
      }
      await execute(`UPDATE fitness_session_exercises SET status = 'active', updated_at = ? WHERE id = ?`, [timestamp, nextSupersetExerciseId])
      return
    }
  }

  if (!hasPlannedSets) {
    await activateNextPendingExercise(exercise.session_id)
  }
}

async function insertSessionSet(
  sessionExerciseId: string,
  setNumber: number,
  weightKg: number,
  reps: number,
  rir: number | null,
  setType: FitnessSessionSetType = 'working',
  weightEntryMode: FitnessWeightEntryMode = 'total',
  leftWeightKg: number | null = null,
  rightWeightKg: number | null = null,
) {
  const timestamp = nowIso()
  const id = crypto.randomUUID()
  await execute(
    `INSERT INTO fitness_sets(
      id, session_exercise_id, set_number, weight_kg, weight_entry_mode, left_weight_kg, right_weight_kg, reps, rir, set_type, status, completed_at, corrected_at, correction_count, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'planned', NULL, NULL, 0, ?, ?)`,
    [id, sessionExerciseId, setNumber, weightKg, weightEntryMode, leftWeightKg, rightWeightKg, reps, rir, setType, timestamp, timestamp],
  )
  const rows = await query<FitnessSessionSetRow>(`SELECT * FROM fitness_sets WHERE id = ?`, [id])
  return sessionSetFromRow(rows[0] as FitnessSessionSetRow)
}

async function renumberSets(sessionExerciseId: string) {
  const rows = await query<{ id: string }>(`SELECT id FROM fitness_sets WHERE session_exercise_id = ? ORDER BY set_number ASC, created_at ASC`, [sessionExerciseId])
  for (const [index, row] of rows.entries()) {
    await execute(`UPDATE fitness_sets SET set_number = ?, updated_at = ? WHERE id = ?`, [index + 1, nowIso(), row.id])
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseFitnessImportPayload(payload: unknown): FitnessExportPayload {
  if (!isRecord(payload)) {
    throw new Error('Fitness import payload must be a JSON object')
  }

  if (payload.version !== 1) {
    throw new Error('Unsupported fitness import version')
  }

  if (!Array.isArray(payload.starterPlans) || !Array.isArray(payload.personalPlans)) {
    throw new Error('Fitness import payload is missing plan arrays')
  }

  if (!Array.isArray(payload.exercises) || !Array.isArray(payload.sessions)) {
    throw new Error('Fitness import payload is missing fitness arrays')
  }

  if (!isRecord(payload.settings)) {
    throw new Error('Fitness import payload is missing settings')
  }

  const settings = {
    displayUnit: normalizeDisplayUnit(payload.settings.displayUnit),
    showGuidance: typeof payload.settings.showGuidance === 'boolean' ? payload.settings.showGuidance : true,
    restSoundEnabled: typeof payload.settings.restSoundEnabled === 'boolean' ? payload.settings.restSoundEnabled : true,
    restVibrationEnabled: typeof payload.settings.restVibrationEnabled === 'boolean' ? payload.settings.restVibrationEnabled : true,
    updatedAt: typeof payload.settings.updatedAt === 'string' ? payload.settings.updatedAt : null,
  }

  return {
    version: 1,
    exportedAt: typeof payload.exportedAt === 'string' ? payload.exportedAt : nowIso(),
    settings,
    exercises: payload.exercises as FitnessExportPayload['exercises'],
    starterPlans: payload.starterPlans as FitnessExportPayload['starterPlans'],
    personalPlans: payload.personalPlans as FitnessExportPayload['personalPlans'],
    sessions: payload.sessions as FitnessExportPayload['sessions'],
  }
}

function buildFitnessImportPreview(payload: unknown): FitnessImportPreview {
  const parsed = parseFitnessImportPayload(payload)
  return {
    version: 1,
    displayUnit: parsed.settings.displayUnit,
    exerciseCount: parsed.exercises.length,
    starterPlanCount: parsed.starterPlans.length,
    personalPlanCount: parsed.personalPlans.length,
    sessionCount: parsed.sessions.length,
    completedSessionCount: parsed.sessions.filter((session) => session.status === 'completed').length,
  }
}

async function clearFitnessTablesForImport() {
  for (const table of [
    'fitness_sets',
    'fitness_session_exercises',
    'fitness_sessions',
    'fitness_plan_exercises',
    'fitness_plan_workouts',
    'fitness_plan_days',
    'fitness_plan_weeks',
    'fitness_plans',
    'fitness_exercises',
    'fitness_settings',
  ]) {
    await execute(`DELETE FROM ${table}`)
  }
}

async function insertExerciseForImport(exercise: FitnessExerciseRecord) {
  await execute(
    `INSERT OR REPLACE INTO fitness_exercises(
      id, name, category, muscle_group, default_rest_seconds, is_custom, created_at, updated_at, deleted_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      exercise.id,
      exercise.name,
      exercise.category,
      normalizeMuscleGroup(exercise.muscleGroup),
      exercise.defaultRestSeconds,
      exercise.isCustom ? 1 : 0,
      exercise.createdAt,
      exercise.updatedAt,
      exercise.deletedAt,
    ],
  )
}

async function insertPlanStructureForImport(structure: FitnessPlanStructure) {
  const plan = structure.plan
  await execute(
    `INSERT OR REPLACE INTO fitness_plans(
      id, name, goal, kind, source_template_id, status, created_at, updated_at, deleted_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [plan.id, plan.name, plan.goal, plan.kind, plan.sourceTemplateId, plan.status, plan.createdAt, plan.updatedAt, plan.deletedAt],
  )

  for (const week of structure.weeks) {
    await execute(
      `INSERT OR REPLACE INTO fitness_plan_weeks(id, plan_id, week_number, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [week.id, week.planId, week.weekNumber, week.notes, week.createdAt, week.updatedAt],
    )

    for (const day of week.days) {
      await execute(
        `INSERT OR REPLACE INTO fitness_plan_days(id, week_id, day_index, label, is_rest_day, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [day.id, day.weekId, day.dayIndex, day.label, day.isRestDay ? 1 : 0, day.createdAt, day.updatedAt],
      )

      for (const workout of day.workouts) {
        await execute(
          `INSERT OR REPLACE INTO fitness_plan_workouts(id, plan_day_id, name, notes, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [workout.id, workout.planDayId, workout.name, workout.notes, workout.sortOrder, workout.createdAt, workout.updatedAt],
        )

        for (const exercise of workout.exercises) {
          await execute(
            `INSERT OR REPLACE INTO fitness_plan_exercises(
              id, plan_workout_id, exercise_id, sort_order, target_sets, min_reps, max_reps, target_rir, rest_seconds, notes, superset_group, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              exercise.id,
              exercise.planWorkoutId,
              exercise.exerciseId,
              exercise.sortOrder,
              exercise.targetSets,
              exercise.minReps,
              exercise.maxReps,
              exercise.targetRir,
              exercise.restSeconds,
              exercise.notes,
              normalizeSupersetGroup(exercise.supersetGroup),
              exercise.createdAt,
              exercise.updatedAt,
            ],
          )
        }
      }
    }
  }
}

async function getOrCreateImportedExercise(exerciseName: string) {
  const existingRows = await query<FitnessExerciseRow>(
    `SELECT * FROM fitness_exercises WHERE deleted_at IS NULL AND lower(name) = lower(?) ORDER BY is_custom ASC, created_at ASC LIMIT 1`,
    [exerciseName],
  )
  const existing = existingRows[0]
  if (existing) {
    return exerciseFromRow(existing)
  }

  const timestamp = nowIso()
  const id = crypto.randomUUID()
  await execute(
    `INSERT INTO fitness_exercises(id, name, category, muscle_group, default_rest_seconds, is_custom, created_at, updated_at, deleted_at)
     VALUES (?, ?, 'importované', NULL, 120, 1, ?, ?, NULL)`,
    [id, exerciseName.trim(), timestamp, timestamp],
  )
  const rows = await query<FitnessExerciseRow>(`SELECT * FROM fitness_exercises WHERE id = ?`, [id])
  return exerciseFromRow(rows[0] as FitnessExerciseRow)
}

async function insertStrongCsvWorkout(workout: ParsedStrongCsvWorkout) {
  const timestamp = nowIso()
  const sessionId = crypto.randomUUID()
  await execute(
    `INSERT INTO fitness_sessions(id, plan_id, plan_workout_id, name, status, started_at, completed_at, notes, session_rpe, energy_level, created_at, updated_at)
     VALUES (?, NULL, NULL, ?, 'completed', ?, ?, ?, NULL, NULL, ?, ?)`,
    [sessionId, workout.name, workout.startedAt, workout.completedAt, workout.notes, timestamp, timestamp],
  )

  for (const [exerciseIndex, parsedExercise] of workout.exercises.entries()) {
    const exercise = await getOrCreateImportedExercise(parsedExercise.name)
    const sessionExerciseId = crypto.randomUUID()
    const reps = parsedExercise.sets.map((set) => set.reps)
    const minReps = reps.length > 0 ? Math.min(...reps) : 1
    const maxReps = reps.length > 0 ? Math.max(...reps) : minReps
    await execute(
      `INSERT INTO fitness_session_exercises(
        id, session_id, exercise_id, name_snapshot, category_snapshot, muscle_group_snapshot, sort_order, status, target_sets, min_reps, max_reps, target_rir, rest_seconds, notes, superset_group, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'done', ?, ?, ?, NULL, ?, ?, NULL, ?, ?)`,
      [
        sessionExerciseId,
        sessionId,
        exercise.id,
        exercise.name,
        exercise.category,
        normalizeMuscleGroup(exercise.muscleGroup),
        exerciseIndex,
        parsedExercise.sets.length,
        minReps,
        maxReps,
        exercise.defaultRestSeconds,
        parsedExercise.notes,
        timestamp,
        timestamp,
      ],
    )

    for (const [setIndex, set] of parsedExercise.sets.entries()) {
      const setId = crypto.randomUUID()
      await execute(
        `INSERT INTO fitness_sets(
          id, session_exercise_id, set_number, weight_kg, weight_entry_mode, left_weight_kg, right_weight_kg, reps, rir, set_type, status, completed_at, corrected_at, correction_count, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'total', NULL, NULL, ?, ?, 'working', 'completed', ?, NULL, 0, ?, ?)`,
        [setId, sessionExerciseId, setIndex + 1, set.weightKg, set.reps, set.rir, workout.completedAt, timestamp, timestamp],
      )
    }
  }
}

async function insertSessionForImport(session: FitnessLiveSession) {
  await execute(
    `INSERT OR REPLACE INTO fitness_sessions(id, plan_id, plan_workout_id, name, status, started_at, completed_at, notes, session_rpe, energy_level, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      session.id,
      session.planId,
      session.planWorkoutId,
      session.name,
      session.status,
      session.startedAt,
      session.completedAt,
      session.notes,
      session.sessionRpe ?? null,
      session.energyLevel ?? null,
      session.createdAt,
      session.updatedAt,
    ],
  )

  for (const exercise of session.exercises) {
    await execute(
      `INSERT OR REPLACE INTO fitness_session_exercises(
        id, session_id, exercise_id, name_snapshot, category_snapshot, muscle_group_snapshot, sort_order, status, target_sets, min_reps, max_reps, target_rir, rest_seconds, notes, superset_group, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        exercise.id,
        exercise.sessionId,
        exercise.exerciseId,
        exercise.nameSnapshot,
        exercise.categorySnapshot ?? null,
        normalizeMuscleGroup(exercise.muscleGroupSnapshot),
        exercise.sortOrder,
        exercise.status,
        exercise.targetSets,
        exercise.minReps,
        exercise.maxReps,
        exercise.targetRir,
        exercise.restSeconds,
        exercise.notes,
        normalizeSupersetGroup(exercise.supersetGroup),
        exercise.createdAt,
        exercise.updatedAt,
      ],
    )

    for (const set of exercise.sets) {
      const importedWeightEntryMode = normalizeWeightEntryMode(set.weightEntryMode)
      const importedLeftWeightKg = importedWeightEntryMode === 'per_side' ? normalizeNullableWeight(set.leftWeightKg) ?? 0 : null
      const importedRightWeightKg = importedWeightEntryMode === 'per_side' ? normalizeNullableWeight(set.rightWeightKg) ?? 0 : null
      const importedTotalWeightKg = Number(set.weightKg)
      const importedPerSideWeightKg = (importedLeftWeightKg ?? 0) + (importedRightWeightKg ?? 0)
      const importedWeightKg = importedWeightEntryMode === 'per_side'
        ? importedPerSideWeightKg
        : Number.isFinite(importedTotalWeightKg) ? Math.max(0, importedTotalWeightKg) : 0
      const importedCorrectionCount = Math.max(0, Math.round(Number(set.correctionCount ?? 0) || 0))
      await execute(
        `INSERT OR REPLACE INTO fitness_sets(
          id, session_exercise_id, set_number, weight_kg, weight_entry_mode, left_weight_kg, right_weight_kg, reps, rir, set_type, status, completed_at, corrected_at, correction_count, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          set.id,
          set.sessionExerciseId,
          set.setNumber,
          importedWeightKg,
          importedWeightEntryMode,
          importedLeftWeightKg,
          importedRightWeightKg,
          set.reps,
          set.rir,
          normalizeSetType(set.setType),
          set.status,
          set.completedAt,
          set.correctedAt ?? null,
          importedCorrectionCount,
          set.createdAt,
          set.updatedAt,
        ],
      )
    }
  }
}

export const fitnessRepository = {
  resetFitnessData: async () => {
    await execute(`DELETE FROM fitness_sets`)
    await execute(`DELETE FROM fitness_session_exercises`)
    await execute(`DELETE FROM fitness_sessions`)
    await execute(`DELETE FROM fitness_plan_exercises`)
    await execute(`DELETE FROM fitness_plan_workouts`)
    await execute(`DELETE FROM fitness_plan_days`)
    await execute(`DELETE FROM fitness_plan_weeks`)
    await execute(`DELETE FROM fitness_plans`)
    await execute(`DELETE FROM fitness_exercises`)
    await execute(`DELETE FROM fitness_settings`)
  },

  seedStarterData: async () => {
    for (const exercise of STARTER_FITNESS_EXERCISES) {
      await insertStarterExercise(exercise)
    }

    for (const plan of STARTER_FITNESS_PLANS) {
      await insertStarterPlan(plan)
    }
  },

  resetStarterData: async () => {
    await execute(`DELETE FROM fitness_plans WHERE kind = 'starter'`)
    await fitnessRepository.seedStarterData()
    const [starterPlanRows, starterExerciseRows] = await Promise.all([
      query<{ count: number }>(`SELECT COUNT(*) AS count FROM fitness_plans WHERE kind = 'starter' AND deleted_at IS NULL`),
      query<{ count: number }>(`SELECT COUNT(*) AS count FROM fitness_exercises WHERE is_custom = 0 AND deleted_at IS NULL`),
    ])

    return {
      starterPlanCount: Number(starterPlanRows[0]?.count ?? 0),
      starterExerciseCount: Number(starterExerciseRows[0]?.count ?? 0),
    }
  },

  getSettings: async () => getFitnessSettings(),

  updateSettings: async (input: UpdateFitnessSettingsInput) => {
    if (input.displayUnit !== undefined) {
      await upsertFitnessSetting('display_unit', normalizeDisplayUnit(input.displayUnit))
    }
    if (input.showGuidance !== undefined) {
      await upsertFitnessSetting('show_guidance', input.showGuidance ? '1' : '0')
    }
    if (input.restSoundEnabled !== undefined) {
      await upsertFitnessSetting('rest_sound', input.restSoundEnabled ? '1' : '0')
    }
    if (input.restVibrationEnabled !== undefined) {
      await upsertFitnessSetting('rest_vibration', input.restVibrationEnabled ? '1' : '0')
    }

    return getFitnessSettings()
  },

  listExercises: async () => {
    const rows = await query<FitnessExerciseRow>(
      `SELECT * FROM fitness_exercises WHERE deleted_at IS NULL ORDER BY is_custom ASC, name COLLATE NOCASE ASC`,
    )
    return rows.map(exerciseFromRow)
  },

  createExercise: async (input: CreateFitnessExerciseInput) => {
    const name = requireName(input.name, 'Exercise name is required')
    const category = requireName(input.category, 'Exercise category is required')
    const muscleGroup = requireMuscleGroup(input.muscleGroup)
    const defaultRestSeconds = normalizeNonNegativeInteger(input.defaultRestSeconds, 'Default rest seconds must be a non-negative number')
    const timestamp = nowIso()
    const id = crypto.randomUUID()

    await execute(
      `INSERT INTO fitness_exercises(
        id, name, category, muscle_group, default_rest_seconds, is_custom, created_at, updated_at, deleted_at
      ) VALUES (?, ?, ?, ?, ?, 1, ?, ?, NULL)`,
      [id, name, category, muscleGroup, defaultRestSeconds, timestamp, timestamp],
    )

    const rows = await query<FitnessExerciseRow>(`SELECT * FROM fitness_exercises WHERE id = ?`, [id])
    return exerciseFromRow(rows[0] as FitnessExerciseRow)
  },

  updateCustomExercise: async (exerciseId: string, input: UpdateFitnessExerciseInput) => {
    const current = await getExerciseRow(exerciseId)
    if (!toBoolean(current.is_custom)) {
      throw new Error('Only custom exercises can be edited')
    }

    const name = input.name === undefined ? current.name : requireName(input.name, 'Exercise name is required')
    const category = input.category === undefined ? current.category : requireName(input.category, 'Exercise category is required')
    const muscleGroup = input.muscleGroup === undefined ? normalizeMuscleGroup(current.muscle_group) : requireMuscleGroup(input.muscleGroup)
    const defaultRestSeconds = input.defaultRestSeconds === undefined
      ? Number(current.default_rest_seconds)
      : normalizeNonNegativeInteger(input.defaultRestSeconds, 'Default rest seconds must be a non-negative number')
    const timestamp = nowIso()

    await execute(
      `UPDATE fitness_exercises
       SET name = ?, category = ?, muscle_group = ?, default_rest_seconds = ?, updated_at = ?
       WHERE id = ?`,
      [name, category, muscleGroup, defaultRestSeconds, timestamp, exerciseId],
    )

    return exerciseFromRow(await getExerciseRow(exerciseId))
  },

  archiveCustomExercise: async (exerciseId: string) => {
    const current = await getExerciseRow(exerciseId)
    if (!toBoolean(current.is_custom)) {
      throw new Error('Only custom exercises can be archived')
    }

    const timestamp = nowIso()
    await execute(`UPDATE fitness_exercises SET deleted_at = ?, updated_at = ? WHERE id = ?`, [timestamp, timestamp, exerciseId])
  },

  listStarterPlans: async () => {
    const rows = await query<FitnessPlanRow>(
      `SELECT * FROM fitness_plans WHERE kind = 'starter' AND deleted_at IS NULL ORDER BY ${starterPlanOrderSql} ASC`,
    )
    return rows.map(planFromRow)
  },

  listPersonalPlans: async () => {
    const rows = await query<FitnessPlanRow>(
      `SELECT * FROM fitness_plans WHERE kind = 'personal' AND deleted_at IS NULL ORDER BY created_at ASC`,
    )
    return rows.map(planFromRow)
  },

  createPersonalPlan: async (input: CreatePersonalPlanInput) => {
    const name = requireName(input.name, 'Plan name is required')
    const goal = input.goal.trim()
    const timestamp = nowIso()
    const id = crypto.randomUUID()

    await execute(
      `INSERT INTO fitness_plans(
        id, name, goal, kind, source_template_id, status, created_at, updated_at, deleted_at
      ) VALUES (?, ?, ?, 'personal', ?, 'draft', ?, ?, NULL)`,
      [id, name, goal, input.sourceTemplateId ?? null, timestamp, timestamp],
    )

    const rows = await query<FitnessPlanRow>(`SELECT * FROM fitness_plans WHERE id = ?`, [id])
    return planFromRow(rows[0] as FitnessPlanRow)
  },

  createBlankPersonalPlan: async (input: CreatePersonalPlanInput) => {
    const plan = await fitnessRepository.createPersonalPlan(input)
    await insertWeek(plan.id, 1, '')
    return plan
  },

  updatePersonalPlan: async (planId: string, patch: UpdatePersonalPlanInput) => {
    const current = await getPlanRow(planId)
    requirePersonalPlan(current)
    const name = patch.name === undefined ? current.name : requireName(patch.name, 'Plan name is required')
    const goal = patch.goal === undefined ? current.goal : patch.goal.trim()
    const timestamp = nowIso()

    await execute(
      `UPDATE fitness_plans SET name = ?, goal = ?, updated_at = ? WHERE id = ?`,
      [name, goal, timestamp, planId],
    )

    return planFromRow(await getPlanRow(planId))
  },

  activatePersonalPlan: async (planId: string) => {
    const current = await getPlanRow(planId)
    requirePersonalPlan(current)
    const timestamp = nowIso()

    await execute(
      `UPDATE fitness_plans
       SET status = CASE WHEN id = ? THEN 'active' ELSE 'draft' END,
           updated_at = CASE WHEN id = ? OR status = 'active' THEN ? ELSE updated_at END
       WHERE kind = 'personal' AND deleted_at IS NULL`,
      [planId, planId, timestamp],
    )

    return planFromRow(await getPlanRow(planId))
  },

  archivePersonalPlan: async (planId: string) => {
    const current = await getPlanRow(planId)
    requirePersonalPlan(current)
    const timestamp = nowIso()

    await execute(
      `UPDATE fitness_plans SET status = 'archived', deleted_at = ?, updated_at = ? WHERE id = ?`,
      [timestamp, timestamp, planId],
    )

    return planFromRow(await getAnyPlanRow(planId))
  },

  createPersonalPlanFromStarter: async (starterPlanId: string, input: CreatePersonalPlanInput) => {
    const starter = planFromRow(await getPlanRow(starterPlanId))
    if (starter.kind !== 'starter') {
      throw new Error('Source plan must be a starter plan')
    }

    const plan = await fitnessRepository.createPersonalPlan({
      name: input.name,
      goal: input.goal,
      sourceTemplateId: starterPlanId,
    })
    await copyStarterStructure(plan.id, starterPlanId)
    return plan
  },

  getPlanStructure: async (planId: string): Promise<FitnessPlanStructure> => {
    const plan = planFromRow(await getPlanRow(planId))
    const weekRows = await query<FitnessPlanWeekRow>(`SELECT * FROM fitness_plan_weeks WHERE plan_id = ? ORDER BY week_number ASC`, [planId])
    const weeks: FitnessPlanWeekRecord[] = []

    for (const weekRow of weekRows) {
      const dayRows = await query<FitnessPlanDayRow>(`SELECT * FROM fitness_plan_days WHERE week_id = ? ORDER BY day_index ASC`, [weekRow.id])
      const days: FitnessPlanDayRecord[] = []

      for (const dayRow of dayRows) {
        const workoutRows = await query<FitnessPlanWorkoutRow>(
          `SELECT * FROM fitness_plan_workouts WHERE plan_day_id = ? ORDER BY sort_order ASC`,
          [dayRow.id],
        )
        const workouts: FitnessPlanWorkoutRecord[] = []

        for (const workoutRow of workoutRows) {
          const exerciseRows = await query<FitnessPlanExerciseRow>(
            `SELECT fpe.*, fe.name AS exercise_name
             FROM fitness_plan_exercises fpe
             JOIN fitness_exercises fe ON fe.id = fpe.exercise_id
             WHERE fpe.plan_workout_id = ?
             ORDER BY fpe.sort_order ASC`,
            [workoutRow.id],
          )
          workouts.push(workoutFromRow(workoutRow, exerciseRows.map(planExerciseFromRow)))
        }

        days.push(dayFromRow(dayRow, workouts))
      }

      weeks.push(weekFromRow(weekRow, days))
    }

    return { plan, weeks }
  },

  duplicateWeek: async (weekId: string) => {
    const sourceWeek = await getWeekRow(weekId)
    const targetWeekNumber = (await getMaxWeekNumber(sourceWeek.plan_id)) + 1
    return copyWeekToNumber(weekId, targetWeekNumber)
  },

  createNextWeekFromWeek: async (weekId: string) => {
    const sourceWeek = await getWeekRow(weekId)
    const targetWeekNumber = (await getMaxWeekNumber(sourceWeek.plan_id)) + 1
    return copyWeekToNumber(weekId, targetWeekNumber)
  },

  addPlanDay: async (weekId: string, input: AddPlanDayInput) => insertDay(weekId, input),

  setPlanDayRest: async (dayId: string, isRestDay: boolean) => {
    const timestamp = nowIso()
    await execute(`UPDATE fitness_plan_days SET is_rest_day = ?, updated_at = ? WHERE id = ?`, [isRestDay ? 1 : 0, timestamp, dayId])
    const rows = await query<FitnessPlanDayRow>(`SELECT * FROM fitness_plan_days WHERE id = ?`, [dayId])
    const row = rows[0]
    if (!row) {
      throw new Error('Fitness plan day not found')
    }

    return dayFromRow(row)
  },

  addPlanWorkout: async (dayId: string, input: AddPlanWorkoutInput) => insertWorkout(dayId, input),

  updatePlanDay: async (dayId: string, patch: UpdatePlanDayInput) => {
    const current = await getPlanDayRow(dayId)
    const label = patch.label === undefined ? current.label : requireName(patch.label, 'Plan day label is required')
    const dayIndex = patch.dayIndex === undefined ? Number(current.day_index) : normalizeDayIndex(patch.dayIndex)
    const timestamp = nowIso()

    await execute(
      `UPDATE fitness_plan_days SET day_index = ?, label = ?, updated_at = ? WHERE id = ?`,
      [dayIndex, label, timestamp, dayId],
    )

    return dayFromRow(await getPlanDayRow(dayId))
  },

  updatePlanWorkout: async (workoutId: string, patch: UpdatePlanWorkoutInput) => {
    const current = await getPlanWorkoutRow(workoutId)
    const name = patch.name === undefined ? current.name : requireName(patch.name, 'Workout name is required')
    const notes = patch.notes === undefined ? current.notes : patch.notes.trim()
    const timestamp = nowIso()

    await execute(
      `UPDATE fitness_plan_workouts SET name = ?, notes = ?, updated_at = ? WHERE id = ?`,
      [name, notes, timestamp, workoutId],
    )

    return workoutFromRow(await getPlanWorkoutRow(workoutId))
  },

  movePlanWorkout: async (workoutId: string, direction: FitnessPlanMoveDirection) => {
    const workout = await getPlanWorkoutRow(workoutId)
    const siblings = await query<FitnessPlanWorkoutRow>(
      `SELECT * FROM fitness_plan_workouts WHERE plan_day_id = ? ORDER BY sort_order ASC, created_at ASC`,
      [workout.plan_day_id],
    )

    await moveSiblingSortOrder(siblings, workoutId, direction, async (row, sortOrder, timestamp) => {
      await execute(`UPDATE fitness_plan_workouts SET sort_order = ?, updated_at = ? WHERE id = ?`, [sortOrder, timestamp, row.id])
    })

    return workoutFromRow(await getPlanWorkoutRow(workoutId))
  },

  addPlanExercise: async (workoutId: string, input: AddPlanExerciseInput) => insertPlanExercise(workoutId, input),

  movePlanExercise: async (planExerciseId: string, direction: FitnessPlanMoveDirection) => {
    const planExercise = await getPlanExerciseRow(planExerciseId)
    const siblings = await query<FitnessPlanExerciseRow>(
      `SELECT fpe.*, fe.name AS exercise_name
       FROM fitness_plan_exercises fpe
       JOIN fitness_exercises fe ON fe.id = fpe.exercise_id
       WHERE fpe.plan_workout_id = ?
       ORDER BY fpe.sort_order ASC, fpe.created_at ASC`,
      [planExercise.plan_workout_id],
    )

    await moveSiblingSortOrder(siblings, planExerciseId, direction, async (row, sortOrder, timestamp) => {
      await execute(`UPDATE fitness_plan_exercises SET sort_order = ?, updated_at = ? WHERE id = ?`, [sortOrder, timestamp, row.id])
    })

    return planExerciseFromRow(await getPlanExerciseRow(planExerciseId))
  },

  updatePlanExercise: async (planExerciseId: string, patch: UpdatePlanExerciseInput) => {
    const current = planExerciseFromRow(await getPlanExerciseRow(planExerciseId))
    const targetSets = patch.targetSets === undefined ? current.targetSets : normalizePositiveInteger(patch.targetSets, 'Target sets must be greater than zero')
    const minReps = patch.minReps ?? current.minReps
    const maxReps = patch.maxReps ?? current.maxReps
    const { min, max } = normalizeRepRange(minReps, maxReps)
    const targetRir = patch.targetRir === undefined ? current.targetRir : normalizeTargetRir(patch.targetRir)
    const restSeconds = patch.restSeconds === undefined ? current.restSeconds : normalizeNonNegativeInteger(patch.restSeconds, 'Rest seconds must be a non-negative number')
    const notes = patch.notes === undefined ? current.notes : patch.notes.trim()
    const supersetGroup = patch.supersetGroup === undefined ? current.supersetGroup ?? null : normalizeSupersetGroup(patch.supersetGroup)
    const timestamp = nowIso()

    await execute(
      `UPDATE fitness_plan_exercises
       SET target_sets = ?, min_reps = ?, max_reps = ?, target_rir = ?, rest_seconds = ?, notes = ?, superset_group = ?, updated_at = ?
       WHERE id = ?`,
      [targetSets, min, max, targetRir, restSeconds, notes, supersetGroup, timestamp, planExerciseId],
    )

    return planExerciseFromRow(await getPlanExerciseRow(planExerciseId))
  },

  removePlanExercise: async (planExerciseId: string) => {
    await getPlanExerciseRow(planExerciseId)
    await execute(`DELETE FROM fitness_plan_exercises WHERE id = ?`, [planExerciseId])
  },

  removePlanWorkout: async (planWorkoutId: string) => {
    const rows = await query<FitnessPlanWorkoutRow>(`SELECT * FROM fitness_plan_workouts WHERE id = ?`, [planWorkoutId])
    if (!rows[0]) {
      throw new Error('Fitness plan workout not found')
    }

    await execute(`DELETE FROM fitness_plan_exercises WHERE plan_workout_id = ?`, [planWorkoutId])
    await execute(`DELETE FROM fitness_plan_workouts WHERE id = ?`, [planWorkoutId])
  },

  removePlanDay: async (planDayId: string) => {
    const rows = await query<FitnessPlanDayRow>(`SELECT * FROM fitness_plan_days WHERE id = ?`, [planDayId])
    if (!rows[0]) {
      throw new Error('Fitness plan day not found')
    }

    await execute(
      `DELETE FROM fitness_plan_exercises
       WHERE plan_workout_id IN (SELECT id FROM fitness_plan_workouts WHERE plan_day_id = ?)`,
      [planDayId],
    )
    await execute(`DELETE FROM fitness_plan_workouts WHERE plan_day_id = ?`, [planDayId])
    await execute(`DELETE FROM fitness_plan_days WHERE id = ?`, [planDayId])
  },

  listStartableWorkouts: async () => {
    const rows = await query<FitnessStartableWorkoutRow>(
      `SELECT
        fpw.id AS workout_id,
        fpw.name AS workout_name,
        fp.id AS plan_id,
        fp.name AS plan_name,
        fpweek.id AS week_id,
        fpweek.week_number AS week_number,
        fpd.id AS day_id,
        fpd.label AS day_label,
        (SELECT COUNT(*) FROM fitness_plan_exercises fpe WHERE fpe.plan_workout_id = fpw.id) AS exercise_count,
        (SELECT COALESCE(SUM(fpe.target_sets), 0) FROM fitness_plan_exercises fpe WHERE fpe.plan_workout_id = fpw.id) AS planned_set_count,
        (
          SELECT fe.name
          FROM fitness_plan_exercises fpe
          JOIN fitness_exercises fe ON fe.id = fpe.exercise_id
          WHERE fpe.plan_workout_id = fpw.id
          ORDER BY fpe.sort_order ASC
          LIMIT 1
        ) AS first_exercise_name
       FROM fitness_plan_workouts fpw
       JOIN fitness_plan_days fpd ON fpd.id = fpw.plan_day_id
       JOIN fitness_plan_weeks fpweek ON fpweek.id = fpd.week_id
       JOIN fitness_plans fp ON fp.id = fpweek.plan_id
       WHERE fp.kind = 'personal'
       AND fp.deleted_at IS NULL
       AND (
         NOT EXISTS (
           SELECT 1
           FROM fitness_plans active_fp
           WHERE active_fp.kind = 'personal'
             AND active_fp.status = 'active'
             AND active_fp.deleted_at IS NULL
         )
         OR fp.status = 'active'
       )
       AND fpd.is_rest_day = 0
       AND EXISTS (SELECT 1 FROM fitness_plan_exercises fpe WHERE fpe.plan_workout_id = fpw.id)
       ORDER BY fp.created_at ASC, fpweek.week_number ASC, fpd.day_index ASC, fpw.sort_order ASC`,
    )
    return rows.map(startableWorkoutFromRow)
  },

  startSessionFromPlanWorkout: async (planWorkoutId: string) => {
    const activeRows = await query<{ id: string }>(`SELECT id FROM fitness_sessions WHERE status = 'active' ORDER BY started_at DESC, created_at DESC LIMIT 1`)
    if (activeRows.length > 0) {
      throw new Error('Finish or abandon the active workout before starting another.')
    }

    const workoutRows = await query<{
      workout_id: string
      workout_name: string
      plan_id: string
    }>(
      `SELECT fpw.id AS workout_id, fpw.name AS workout_name, fp.id AS plan_id
       FROM fitness_plan_workouts fpw
       JOIN fitness_plan_days fpd ON fpd.id = fpw.plan_day_id
       JOIN fitness_plan_weeks fpweek ON fpweek.id = fpd.week_id
       JOIN fitness_plans fp ON fp.id = fpweek.plan_id
       WHERE fpw.id = ? AND fp.deleted_at IS NULL`,
      [planWorkoutId],
    )
    const workout = workoutRows[0]
    if (!workout) {
      throw new Error('Plan workout not found')
    }

    const planExercises = await query<FitnessPlanExerciseRow>(
      `SELECT fpe.*, fe.name AS exercise_name, fe.category AS exercise_category, fe.muscle_group AS exercise_muscle_group
       FROM fitness_plan_exercises fpe
       JOIN fitness_exercises fe ON fe.id = fpe.exercise_id
       WHERE fpe.plan_workout_id = ?
       ORDER BY fpe.sort_order ASC`,
      [planWorkoutId],
    )
    if (planExercises.length === 0) {
      throw new Error('Plan workout has no exercises')
    }

    const timestamp = nowIso()
    const sessionId = crypto.randomUUID()
    await execute(
      `INSERT INTO fitness_sessions(id, plan_id, plan_workout_id, name, status, started_at, completed_at, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'active', ?, NULL, '', ?, ?)`,
      [sessionId, workout.plan_id, workout.workout_id, workout.workout_name, timestamp, timestamp, timestamp],
    )

    for (const [exerciseIndex, exercise] of planExercises.entries()) {
      const sessionExerciseId = crypto.randomUUID()
      await execute(
        `INSERT INTO fitness_session_exercises(
          id, session_id, exercise_id, name_snapshot, category_snapshot, muscle_group_snapshot, sort_order, status, target_sets, min_reps, max_reps, target_rir, rest_seconds, notes, superset_group, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sessionExerciseId,
          sessionId,
          exercise.exercise_id,
          exercise.exercise_name,
          exercise.exercise_category,
          normalizeMuscleGroup(exercise.exercise_muscle_group),
          exerciseIndex,
          exerciseIndex === 0 ? 'active' : 'pending',
          Number(exercise.target_sets),
          Number(exercise.min_reps),
          Number(exercise.max_reps),
          exercise.target_rir,
          Number(exercise.rest_seconds),
          exercise.notes,
          normalizeSupersetGroup(exercise.superset_group),
          timestamp,
          timestamp,
        ],
      )

      for (let setNumber = 1; setNumber <= Number(exercise.target_sets); setNumber += 1) {
        await insertSessionSet(sessionExerciseId, setNumber, 0, Number(exercise.max_reps), exercise.target_rir)
      }
    }

    return getLiveSessionById(sessionId)
  },

  startQuickSession: async () => {
    const activeRows = await query<{ id: string }>(`SELECT id FROM fitness_sessions WHERE status = 'active' ORDER BY started_at DESC, created_at DESC LIMIT 1`)
    if (activeRows.length > 0) {
      throw new Error('Finish or abandon the active workout before starting another.')
    }

    const timestamp = nowIso()
    const sessionId = crypto.randomUUID()
    await execute(
      `INSERT INTO fitness_sessions(id, plan_id, plan_workout_id, name, status, started_at, completed_at, notes, created_at, updated_at)
       VALUES (?, NULL, NULL, 'Rýchly tréning', 'active', ?, NULL, '', ?, ?)`,
      [sessionId, timestamp, timestamp, timestamp],
    )

    return getLiveSessionById(sessionId)
  },

  getActiveSession: async () => {
    const rows = await query<FitnessSessionRow>(
      `SELECT * FROM fitness_sessions WHERE status = 'active' ORDER BY started_at DESC, created_at DESC LIMIT 1`,
    )
    const row = rows[0]
    return row ? getLiveSessionById(row.id) : null
  },

  getLiveSession: async (sessionId: string) => getLiveSessionById(sessionId),

  abandonSession: async (sessionId: string) => {
    const session = await getLiveSessionById(sessionId)
    if (session.status !== 'active') {
      throw new Error('Only active fitness sessions can be abandoned')
    }

    const timestamp = nowIso()
    await execute(
      `UPDATE fitness_sets
       SET status = 'skipped', updated_at = ?
       WHERE status = 'planned'
       AND session_exercise_id IN (SELECT id FROM fitness_session_exercises WHERE session_id = ?)`,
      [timestamp, sessionId],
    )
    await execute(
      `UPDATE fitness_session_exercises
       SET status = 'skipped', updated_at = ?
       WHERE session_id = ? AND status IN ('active', 'pending')`,
      [timestamp, sessionId],
    )
    await execute(
      `UPDATE fitness_sessions
       SET status = 'abandoned', completed_at = ?, updated_at = ?
       WHERE id = ?`,
      [timestamp, timestamp, sessionId],
    )

    return getLiveSessionById(sessionId)
  },

  listCompletedSessions: async () => {
    const rows = await query<FitnessSessionRow>(
      `SELECT * FROM fitness_sessions WHERE status = 'completed' ORDER BY completed_at DESC, started_at DESC, created_at DESC`,
    )
    const sessions: FitnessLiveSession[] = []
    for (const row of rows) {
      sessions.push(await getLiveSessionById(row.id))
    }

    return sessions
  },

  getSessionHistoryDetail: async (sessionId: string) => {
    const session = await getLiveSessionById(sessionId)
    if (session.status === 'active' || session.status === 'planned') {
      throw new Error('Fitness session is not finished yet')
    }

    return session
  },

  exportFitnessData: async (): Promise<FitnessExportPayload> => {
    const [settings, exercises, starterPlans, personalPlans, sessionRows] = await Promise.all([
      getFitnessSettings(),
      fitnessRepository.listExercises(),
      fitnessRepository.listStarterPlans(),
      fitnessRepository.listPersonalPlans(),
      query<FitnessSessionRow>(`SELECT * FROM fitness_sessions ORDER BY created_at ASC`),
    ])

    const [starterPlanStructures, personalPlanStructures, sessions] = await Promise.all([
      Promise.all(starterPlans.map((plan) => fitnessRepository.getPlanStructure(plan.id))),
      Promise.all(personalPlans.map((plan) => fitnessRepository.getPlanStructure(plan.id))),
      Promise.all(sessionRows.map((session) => getLiveSessionById(session.id))),
    ])

    return {
      version: 1,
      exportedAt: nowIso(),
      settings,
      exercises,
      starterPlans: starterPlanStructures,
      personalPlans: personalPlanStructures,
      sessions,
    }
  },

  previewFitnessImport: (payload: unknown) => buildFitnessImportPreview(payload),

  previewStrongCsvImport: (csvText: string) => buildStrongCsvPreview(csvText),

  importStrongCsvData: async (csvText: string): Promise<FitnessStrongCsvImportResult> => {
    const parsed = parseStrongCsvImport(csvText)
    for (const workout of parsed.workouts) {
      await insertStrongCsvWorkout(workout)
    }

    return {
      ...buildStrongCsvPreview(csvText),
      mode: 'append',
      importedAt: nowIso(),
    }
  },

  importFitnessData: async (payload: unknown, options: ImportFitnessDataOptions): Promise<FitnessImportResult> => {
    if (options.mode !== 'replace') {
      throw new Error('Unsupported fitness import mode')
    }

    const parsed = parseFitnessImportPayload(payload)
    const preview = buildFitnessImportPreview(parsed)
    await clearFitnessTablesForImport()

    for (const exercise of parsed.exercises) {
      await insertExerciseForImport(exercise)
    }
    for (const structure of parsed.starterPlans) {
      await insertPlanStructureForImport(structure)
    }
    for (const structure of parsed.personalPlans) {
      await insertPlanStructureForImport(structure)
    }
    for (const session of parsed.sessions) {
      await insertSessionForImport(session)
    }
    await upsertFitnessSetting('display_unit', parsed.settings.displayUnit)
    await upsertFitnessSetting('show_guidance', parsed.settings.showGuidance ? '1' : '0')
    await upsertFitnessSetting('rest_sound', parsed.settings.restSoundEnabled ? '1' : '0')
    await upsertFitnessSetting('rest_vibration', parsed.settings.restVibrationEnabled ? '1' : '0')

    return {
      ...preview,
      mode: options.mode,
      importedAt: nowIso(),
    }
  },

  logSet: async (setId: string, input: LogFitnessSetInput) => {
    const sessionExerciseId = await getSessionExerciseIdForSet(setId)
    const { weightKg, weightEntryMode, leftWeightKg, rightWeightKg } = normalizeLoggedWeight(input)
    const reps = normalizeNonNegativeInteger(input.reps, 'Reps must be a non-negative number')
    const rir = normalizeTargetRir(input.rir)
    const setType = normalizeSetType(input.setType)
    const timestamp = nowIso()
    await execute(
      `UPDATE fitness_sets
       SET weight_kg = ?, weight_entry_mode = ?, left_weight_kg = ?, right_weight_kg = ?, reps = ?, rir = ?, set_type = ?, status = 'completed', completed_at = ?, corrected_at = NULL, correction_count = 0, updated_at = ?
       WHERE id = ?`,
      [weightKg, weightEntryMode, leftWeightKg, rightWeightKg, reps, rir, setType, timestamp, timestamp, setId],
    )
    await advanceAfterLoggedSet(sessionExerciseId)
    return getLiveSessionById(await getSessionIdForExercise(sessionExerciseId))
  },

  updateLoggedSet: async (setId: string, input: LogFitnessSetInput) => {
    const sessionExerciseId = await getSessionExerciseIdForSet(setId)
    const existingRows = await query<FitnessSessionSetRow>(`SELECT * FROM fitness_sets WHERE id = ?`, [setId])
    const existing = existingRows[0]
    if (!existing || existing.status !== 'completed') {
      throw new Error('Only completed sets can be edited.')
    }

    const { weightKg, weightEntryMode, leftWeightKg, rightWeightKg } = normalizeLoggedWeight(input)
    const reps = normalizeNonNegativeInteger(input.reps, 'Reps must be a non-negative number')
    const rir = normalizeTargetRir(input.rir)
    const setType = normalizeSetType(input.setType)
    const timestamp = nowIso()
    const correctionCount = Math.max(0, Math.round(Number(existing.correction_count ?? 0) || 0)) + 1
    await execute(
      `UPDATE fitness_sets
       SET weight_kg = ?, weight_entry_mode = ?, left_weight_kg = ?, right_weight_kg = ?, reps = ?, rir = ?, set_type = ?, corrected_at = ?, correction_count = ?, updated_at = ?
       WHERE id = ?`,
      [weightKg, weightEntryMode, leftWeightKg, rightWeightKg, reps, rir, setType, timestamp, correctionCount, timestamp, setId],
    )

    return getLiveSessionById(await getSessionIdForExercise(sessionExerciseId))
  },

  duplicateSessionSet: async (setId: string) => {
    const sessionExerciseId = await getSessionExerciseIdForSet(setId)
    const rows = await query<FitnessSessionSetRow>(`SELECT * FROM fitness_sets WHERE id = ?`, [setId])
    const sourceSet = rows[0]
    if (!sourceSet || sourceSet.status !== 'completed') {
      throw new Error('Only completed sets can be duplicated.')
    }

    await insertSessionSet(
      sessionExerciseId,
      await getNextSessionSetNumber(sessionExerciseId),
      Number(sourceSet.weight_kg ?? 0),
      Number(sourceSet.reps ?? 0),
      sourceSet.rir,
      normalizeSetType(sourceSet.set_type),
      normalizeWeightEntryMode(sourceSet.weight_entry_mode),
      normalizeNullableWeight(sourceSet.left_weight_kg),
      normalizeNullableWeight(sourceSet.right_weight_kg),
    )

    return getLiveSessionById(await getSessionIdForExercise(sessionExerciseId))
  },

  skipSessionSet: async (setId: string) => {
    const sessionExerciseId = await getSessionExerciseIdForSet(setId)
    const existingRows = await query<FitnessSessionSetRow>(`SELECT * FROM fitness_sets WHERE id = ?`, [setId])
    const existing = existingRows[0]
    if (!existing) {
      throw new Error('Fitness session set not found')
    }

    const timestamp = nowIso()
    await execute(
      `UPDATE fitness_sets
       SET status = 'skipped', completed_at = NULL, corrected_at = NULL, correction_count = 0, updated_at = ?
       WHERE id = ?`,
      [timestamp, setId],
    )

    const plannedRows = await query<{ count: number }>(
      `SELECT COUNT(*) AS count FROM fitness_sets WHERE session_exercise_id = ? AND status = 'planned'`,
      [sessionExerciseId],
    )
    if (Number(plannedRows[0]?.count ?? 0) === 0) {
      const sessionId = await getSessionIdForExercise(sessionExerciseId)
      await execute(`UPDATE fitness_session_exercises SET status = 'done', updated_at = ? WHERE id = ? AND status = 'active'`, [timestamp, sessionExerciseId])
      await activateNextPendingExercise(sessionId)
      return getLiveSessionById(sessionId)
    }

    return getLiveSessionById(await getSessionIdForExercise(sessionExerciseId))
  },

  addSessionSet: async (sessionExerciseId: string) => {
    const lastCompletedRows = await query<FitnessSessionSetRow>(
      `SELECT * FROM fitness_sets WHERE session_exercise_id = ? AND status = 'completed' ORDER BY completed_at DESC, set_number DESC LIMIT 1`,
      [sessionExerciseId],
    )
    const lastRows = await query<FitnessSessionSetRow>(
      `SELECT * FROM fitness_sets WHERE session_exercise_id = ? ORDER BY set_number DESC LIMIT 1`,
      [sessionExerciseId],
    )
    const exerciseRows = await query<FitnessSessionExerciseRow>(`SELECT * FROM fitness_session_exercises WHERE id = ?`, [sessionExerciseId])
    const exercise = exerciseRows[0]
    if (!exercise) {
      throw new Error('Fitness session exercise not found')
    }
    const last = lastCompletedRows[0] ?? lastRows[0]
    return insertSessionSet(
      sessionExerciseId,
      await getNextSessionSetNumber(sessionExerciseId),
      Number(last?.weight_kg ?? 0),
      Number(last?.reps ?? exercise.max_reps),
      last?.rir ?? exercise.target_rir,
      normalizeSetType(last?.set_type),
      normalizeWeightEntryMode(last?.weight_entry_mode),
      normalizeNullableWeight(last?.left_weight_kg),
      normalizeNullableWeight(last?.right_weight_kg),
    )
  },

  removeSessionSet: async (setId: string) => {
    const sessionExerciseId = await getSessionExerciseIdForSet(setId)
    await execute(`DELETE FROM fitness_sets WHERE id = ?`, [setId])
    await renumberSets(sessionExerciseId)
    return getLiveSessionById(await getSessionIdForExercise(sessionExerciseId))
  },

  skipSessionExercise: async (sessionExerciseId: string) => {
    const sessionId = await getSessionIdForExercise(sessionExerciseId)
    const timestamp = nowIso()
    await execute(`UPDATE fitness_session_exercises SET status = 'skipped', updated_at = ? WHERE id = ?`, [timestamp, sessionExerciseId])
    await execute(`UPDATE fitness_sets SET status = 'skipped', updated_at = ? WHERE session_exercise_id = ? AND status = 'planned'`, [timestamp, sessionExerciseId])
    await activateNextPendingExercise(sessionId)
    return getLiveSessionById(sessionId)
  },

  addUnplannedExerciseToSession: async (sessionId: string, input: AddUnplannedExerciseInput) => {
    const exerciseRows = await query<FitnessExerciseRow>(`SELECT * FROM fitness_exercises WHERE id = ? AND deleted_at IS NULL`, [input.exerciseId])
    const exercise = exerciseRows[0]
    if (!exercise) {
      throw new Error('Fitness exercise not found')
    }
    const activeRows = await query<{ count: number }>(
      `SELECT COUNT(*) AS count FROM fitness_session_exercises WHERE session_id = ? AND status = 'active'`,
      [sessionId],
    )
    const targetSets = normalizePositiveInteger(input.targetSets ?? 3, 'Target sets must be greater than zero')
    const timestamp = nowIso()
    const sessionExerciseId = crypto.randomUUID()
    await execute(
      `INSERT INTO fitness_session_exercises(
        id, session_id, exercise_id, name_snapshot, category_snapshot, muscle_group_snapshot, sort_order, status, target_sets, min_reps, max_reps, target_rir, rest_seconds, notes, superset_group, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 8, 12, 2, ?, '', NULL, ?, ?)`,
      [
        sessionExerciseId,
        sessionId,
        exercise.id,
        exercise.name,
        exercise.category,
        normalizeMuscleGroup(exercise.muscle_group),
        await getNextSessionExerciseSortOrder(sessionId),
        Number(activeRows[0]?.count ?? 0) > 0 ? 'pending' : 'active',
        targetSets,
        Number(exercise.default_rest_seconds),
        timestamp,
        timestamp,
      ],
    )
    for (let setNumber = 1; setNumber <= targetSets; setNumber += 1) {
      await insertSessionSet(sessionExerciseId, setNumber, 0, 12, 2)
    }

    return getLiveSessionById(sessionId)
  },

  finishSession: async (sessionId: string, input: FinishFitnessSessionInput = {}) => {
    const session = await getLiveSessionById(sessionId)
    const timestamp = nowIso()
    const notes = input.notes === undefined ? session.notes : input.notes.trim()
    const sessionRpe = input.sessionRpe === undefined
      ? session.sessionRpe
      : normalizeNullableRating(input.sessionRpe, 1, 10, 'RPE tréningu musí byť medzi 1 a 10')
    const energyLevel = input.energyLevel === undefined
      ? session.energyLevel
      : normalizeNullableRating(input.energyLevel, 1, 5, 'Energia musí byť medzi 1 a 5')

    await execute(
      `UPDATE fitness_sessions
       SET status = 'completed', completed_at = ?, notes = ?, session_rpe = ?, energy_level = ?, updated_at = ?
       WHERE id = ?`,
      [timestamp, notes, sessionRpe, energyLevel, timestamp, sessionId],
    )
    return getLiveSessionById(sessionId)
  },
}
