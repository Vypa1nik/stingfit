import type { FitnessDisplayUnit } from '@/features/fitness/fitnessUnits'

export type FitnessPlanKind = 'starter' | 'personal'
export type FitnessPlanStatus = 'draft' | 'active' | 'archived'
export type FitnessSessionStatus = 'planned' | 'active' | 'completed' | 'abandoned'
export type FitnessSessionExerciseStatus = 'pending' | 'active' | 'done' | 'skipped'
export type FitnessSessionSetStatus = 'planned' | 'completed' | 'skipped'
export type FitnessSessionSetType = 'working' | 'warmup' | 'dropset' | 'myo' | 'failure'
export type FitnessWeightEntryMode = 'total' | 'per_side'
export type FitnessPlanMoveDirection = 'up' | 'down'
export type FitnessMuscleGroup = 'chest' | 'back' | 'quads' | 'hamstrings' | 'glutes' | 'shoulders' | 'biceps' | 'triceps' | 'calves' | 'abs' | 'forearms' | 'other'
export type FitnessMuscleVolumeStatus = 'low' | 'target' | 'high'

export interface FitnessExerciseRecord {
  id: string
  name: string
  category: string
  muscleGroup: FitnessMuscleGroup | null
  defaultRestSeconds: number
  isCustom: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface FitnessPlanRecord {
  id: string
  name: string
  goal: string
  kind: FitnessPlanKind
  sourceTemplateId: string | null
  status: FitnessPlanStatus
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface FitnessPlanExerciseRecord {
  id: string
  planWorkoutId: string
  exerciseId: string
  exerciseName: string
  sortOrder: number
  targetSets: number
  minReps: number
  maxReps: number
  targetRir: number | null
  restSeconds: number
  notes: string
  createdAt: string
  updatedAt: string
}

export interface FitnessPlanWorkoutRecord {
  id: string
  planDayId: string
  name: string
  notes: string
  sortOrder: number
  createdAt: string
  updatedAt: string
  exercises: FitnessPlanExerciseRecord[]
}

export interface FitnessPlanDayRecord {
  id: string
  weekId: string
  dayIndex: number
  label: string
  isRestDay: boolean
  createdAt: string
  updatedAt: string
  workouts: FitnessPlanWorkoutRecord[]
}

export interface FitnessPlanWeekRecord {
  id: string
  planId: string
  weekNumber: number
  notes: string
  createdAt: string
  updatedAt: string
  days: FitnessPlanDayRecord[]
}

export interface FitnessPlanStructure {
  plan: FitnessPlanRecord
  weeks: FitnessPlanWeekRecord[]
}

export interface FitnessStartableWorkout {
  workoutId: string
  workoutName: string
  planId: string
  planName: string
  weekId: string
  weekNumber: number
  dayId: string
  dayLabel: string
  exerciseCount: number
  plannedSetCount: number
  firstExerciseName: string | null
}

export interface FitnessSessionSetRecord {
  id: string
  sessionExerciseId: string
  setNumber: number
  weightKg: number
  reps: number
  rir: number | null
  setType: FitnessSessionSetType
  weightEntryMode: FitnessWeightEntryMode
  leftWeightKg: number | null
  rightWeightKg: number | null
  status: FitnessSessionSetStatus
  completedAt: string | null
  correctedAt?: string | null
  correctionCount?: number
  createdAt: string
  updatedAt: string
}

export interface FitnessLastPerformance {
  weightKg: number
  reps: number
  rir: number | null
  completedAt: string | null
}

export interface FitnessSessionExerciseRecord {
  id: string
  sessionId: string
  exerciseId: string
  nameSnapshot: string
  categorySnapshot?: string | null
  muscleGroupSnapshot?: FitnessMuscleGroup | null
  sortOrder: number
  status: FitnessSessionExerciseStatus
  targetSets: number
  minReps: number
  maxReps: number
  targetRir: number | null
  restSeconds: number
  notes: string
  lastPerformance?: FitnessLastPerformance | null
  createdAt: string
  updatedAt: string
  sets: FitnessSessionSetRecord[]
}

export interface FitnessLiveSession {
  id: string
  planId: string | null
  planWorkoutId: string | null
  name: string
  status: FitnessSessionStatus
  startedAt: string | null
  completedAt: string | null
  notes: string
  sessionRpe: number | null
  energyLevel: number | null
  createdAt: string
  updatedAt: string
  exercises: FitnessSessionExerciseRecord[]
}

export interface FitnessSessionSummary {
  sessionId: string
  name: string
  startedAt: string | null
  completedAt: string | null
  completedSets: number
  totalSets: number
  correctedSetCount: number
  totalCorrections: number
  exerciseCount: number
  totalVolumeKg: number
}

export type FitnessPrEventType = 'estimated_1rm'

export interface FitnessPrEvent {
  exerciseId: string
  exerciseName: string
  type: FitnessPrEventType
  weightKg: number
  reps: number
  estimatedOneRepMaxKg: number
  achievedAt: string | null
  label: string
}

export interface FitnessProgressionHint {
  exerciseId: string
  exerciseName: string
  recommendation: string
  reason: string
}

export interface FitnessOneRepMaxPoint {
  sessionId: string
  sessionName: string
  achievedAt: string | null
  weightKg: number
  reps: number
  estimatedOneRepMaxKg: number
}

export interface FitnessOneRepMaxSeries {
  exerciseId: string
  exerciseName: string
  latestEstimatedOneRepMaxKg: number
  deltaKg: number | null
  points: FitnessOneRepMaxPoint[]
}

export type FitnessTrainingHeatmapIntensity = 0 | 1 | 2 | 3 | 4

export interface FitnessTrainingHeatmapDay {
  date: string
  weekdayIndex: number
  completedWorkoutCount: number
  intensity: FitnessTrainingHeatmapIntensity
}

export interface FitnessTrainingHeatmapWeek {
  weekStart: string
  days: FitnessTrainingHeatmapDay[]
}

export interface FitnessExerciseVolumeSummary {
  exerciseId: string
  exerciseName: string
  totalVolumeKg: number
  completedSets: number
  sessionCount: number
}

export interface FitnessMuscleGroupSummary {
  muscleGroup: FitnessMuscleGroup
  label: string
  totalVolumeKg: number
  completedSets: number
  exerciseCount: number
  weeklySetAverage: number
  latestWeekSets: number
  latestWeekVolumeKg: number
  latestWeekStatus: FitnessMuscleVolumeStatus
  volumeStatus: FitnessMuscleVolumeStatus
}

export interface FitnessProgressSnapshot {
  completedWorkouts: number
  totalVolumeKg: number
  weeklyConsistencyLabel: string
  volumeTrendPercent: number | null
  volumeTrendLabel: string
  sessionSummaries: FitnessSessionSummary[]
  prEvents: FitnessPrEvent[]
  oneRepMaxSeries: FitnessOneRepMaxSeries[]
  trainingHeatmapWeeks: FitnessTrainingHeatmapWeek[]
  exerciseVolumeLeaders: FitnessExerciseVolumeSummary[]
  muscleGroupSummaries: FitnessMuscleGroupSummary[]
  progressionHints: FitnessProgressionHint[]
}

export type FitnessPlanReadinessSeverity = 'blocker' | 'warning'

export interface FitnessPlanReadinessIssue {
  severity: FitnessPlanReadinessSeverity
  message: string
  weekId?: string
  dayId?: string
  workoutId?: string
}

export interface FitnessPlanReadinessReport {
  ready: boolean
  startableWorkoutCount: number
  blockers: FitnessPlanReadinessIssue[]
  warnings: FitnessPlanReadinessIssue[]
}

export interface FitnessSettingsRecord {
  displayUnit: FitnessDisplayUnit
  showGuidance: boolean
  restSoundEnabled: boolean
  restVibrationEnabled: boolean
  updatedAt: string | null
}

export interface UpdateFitnessSettingsInput {
  displayUnit?: FitnessDisplayUnit
  showGuidance?: boolean
  restSoundEnabled?: boolean
  restVibrationEnabled?: boolean
}

export interface FitnessStarterResetResult {
  starterPlanCount: number
  starterExerciseCount: number
}

export interface FitnessExportPayload {
  version: 1
  exportedAt: string
  settings: FitnessSettingsRecord
  exercises: FitnessExerciseRecord[]
  starterPlans: FitnessPlanStructure[]
  personalPlans: FitnessPlanStructure[]
  sessions: FitnessLiveSession[]
}

export type FitnessImportMode = 'replace'

export interface FitnessImportPreview {
  version: 1
  displayUnit: FitnessDisplayUnit
  exerciseCount: number
  starterPlanCount: number
  personalPlanCount: number
  sessionCount: number
  completedSessionCount: number
}

export interface FitnessImportResult extends FitnessImportPreview {
  mode: FitnessImportMode
  importedAt: string
}

export interface ImportFitnessDataOptions {
  mode: FitnessImportMode
}

export interface LogFitnessSetInput {
  weightKg: number
  reps: number
  rir?: number | null
  setType?: FitnessSessionSetType
  weightEntryMode?: FitnessWeightEntryMode
  leftWeightKg?: number | null
  rightWeightKg?: number | null
}

export interface FinishFitnessSessionInput {
  notes?: string
  sessionRpe?: number | null
  energyLevel?: number | null
}

export interface AddUnplannedExerciseInput {
  exerciseId: string
  targetSets?: number
}

export interface CreateFitnessExerciseInput {
  name: string
  category: string
  muscleGroup?: FitnessMuscleGroup | null
  defaultRestSeconds: number
}

export interface UpdateFitnessExerciseInput {
  name?: string
  category?: string
  muscleGroup?: FitnessMuscleGroup | null
  defaultRestSeconds?: number
}

export interface CreatePersonalPlanInput {
  name: string
  goal: string
  sourceTemplateId?: string | null
}

export interface AddPlanDayInput {
  dayIndex: number
  label: string
  isRestDay?: boolean
}

export interface AddPlanWorkoutInput {
  name: string
  notes?: string
}

export interface UpdatePlanDayInput {
  dayIndex?: number
  label?: string
}

export interface UpdatePlanWorkoutInput {
  name?: string
  notes?: string
}

export interface AddPlanExerciseInput {
  exerciseId: string
  targetSets: number
  minReps: number
  maxReps: number
  targetRir?: number | null
  restSeconds: number
  notes?: string
}

export type UpdatePlanExerciseInput = Partial<Pick<AddPlanExerciseInput, 'targetSets' | 'minReps' | 'maxReps' | 'targetRir' | 'restSeconds' | 'notes'>>

export interface StarterPlanStructureExercise {
  exerciseId: string
  targetSets: number
  minReps: number
  maxReps: number
  targetRir: number | null
  restSeconds: number
  notes?: string
}

export interface StarterPlanStructureWorkout {
  name: string
  notes?: string
  exercises: StarterPlanStructureExercise[]
}

export interface StarterPlanStructureDay {
  dayIndex: number
  label: string
  isRestDay: boolean
  workouts: StarterPlanStructureWorkout[]
}

export interface StarterPlanStructure {
  planId: string
  weekNotes: string
  days: StarterPlanStructureDay[]
}
