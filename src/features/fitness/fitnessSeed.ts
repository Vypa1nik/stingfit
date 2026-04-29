import type { FitnessExerciseRecord, FitnessPlanRecord, StarterPlanStructure } from '@/features/fitness/fitnessTypes'

const starterTimestamp = '2026-04-25T00:00:00.000Z'

export const STARTER_FITNESS_EXERCISES: FitnessExerciseRecord[] = [
  {
    id: 'exercise-bench-press',
    name: 'Tlak na lavičke',
    category: 'hrudník',
    muscleGroup: 'chest',
    defaultRestSeconds: 150,
    isCustom: false,
    createdAt: starterTimestamp,
    updatedAt: starterTimestamp,
    deletedAt: null,
  },
  {
    id: 'exercise-incline-db-press',
    name: 'Tlaky s jednoručkami na šikmej lavičke',
    category: 'hrudník',
    muscleGroup: 'chest',
    defaultRestSeconds: 120,
    isCustom: false,
    createdAt: starterTimestamp,
    updatedAt: starterTimestamp,
    deletedAt: null,
  },
  {
    id: 'exercise-lateral-raise',
    name: 'Upažovanie',
    category: 'ramená',
    muscleGroup: 'shoulders',
    defaultRestSeconds: 75,
    isCustom: false,
    createdAt: starterTimestamp,
    updatedAt: starterTimestamp,
    deletedAt: null,
  },
  {
    id: 'exercise-deadlift',
    name: 'Mŕtvy ťah',
    category: 'chrbát',
    muscleGroup: 'back',
    defaultRestSeconds: 180,
    isCustom: false,
    createdAt: starterTimestamp,
    updatedAt: starterTimestamp,
    deletedAt: null,
  },
  {
    id: 'exercise-barbell-row',
    name: 'Príťahy veľkej činky v predklone',
    category: 'chrbát',
    muscleGroup: 'back',
    defaultRestSeconds: 120,
    isCustom: false,
    createdAt: starterTimestamp,
    updatedAt: starterTimestamp,
    deletedAt: null,
  },
  {
    id: 'exercise-squat',
    name: 'Drep',
    category: 'nohy',
    muscleGroup: 'quads',
    defaultRestSeconds: 180,
    isCustom: false,
    createdAt: starterTimestamp,
    updatedAt: starterTimestamp,
    deletedAt: null,
  },
  {
    id: 'exercise-romanian-deadlift',
    name: 'Rumunský mŕtvy ťah',
    category: 'nohy',
    muscleGroup: 'hamstrings',
    defaultRestSeconds: 150,
    isCustom: false,
    createdAt: starterTimestamp,
    updatedAt: starterTimestamp,
    deletedAt: null,
  },
  {
    id: 'exercise-rope-pushdown',
    name: 'Sťahovanie kladky s lanom',
    category: 'paže',
    muscleGroup: 'triceps',
    defaultRestSeconds: 90,
    isCustom: false,
    createdAt: starterTimestamp,
    updatedAt: starterTimestamp,
    deletedAt: null,
  },
] as const

export const STARTER_FITNESS_PLANS: FitnessPlanRecord[] = [
  {
    id: 'starter-push-pull-legs',
    name: 'Tlak / Ťah / Nohy',
    goal: 'Hypertrofický split s opakovateľnou týždennou štruktúrou.',
    kind: 'starter',
    sourceTemplateId: null,
    status: 'active',
    createdAt: starterTimestamp,
    updatedAt: starterTimestamp,
    deletedAt: null,
  },
  {
    id: 'starter-upper-lower',
    name: 'Vrch / Spodok',
    goal: 'Vyvážená štvordňová šablóna na silu a svaly.',
    kind: 'starter',
    sourceTemplateId: null,
    status: 'active',
    createdAt: starterTimestamp,
    updatedAt: starterTimestamp,
    deletedAt: null,
  },
  {
    id: 'starter-full-body-3x',
    name: 'Celé telo 3×',
    goal: 'Trojdenný plán na celé telo vhodný pre začiatok.',
    kind: 'starter',
    sourceTemplateId: null,
    status: 'active',
    createdAt: starterTimestamp,
    updatedAt: starterTimestamp,
    deletedAt: null,
  },
] as const

const pushWorkout = (name: string) => ({
  name,
  exercises: [
    { exerciseId: 'exercise-bench-press', targetSets: 3, minReps: 6, maxReps: 8, targetRir: 1, restSeconds: 150 },
    { exerciseId: 'exercise-incline-db-press', targetSets: 3, minReps: 8, maxReps: 10, targetRir: 2, restSeconds: 120 },
    { exerciseId: 'exercise-lateral-raise', targetSets: 3, minReps: 12, maxReps: 15, targetRir: 1, restSeconds: 75 },
    { exerciseId: 'exercise-rope-pushdown', targetSets: 3, minReps: 10, maxReps: 12, targetRir: 1, restSeconds: 90 },
  ],
})

const pullWorkout = (name: string) => ({
  name,
  exercises: [
    { exerciseId: 'exercise-deadlift', targetSets: 3, minReps: 3, maxReps: 5, targetRir: 1, restSeconds: 180 },
    { exerciseId: 'exercise-barbell-row', targetSets: 4, minReps: 6, maxReps: 10, targetRir: 1, restSeconds: 120 },
  ],
})

const legWorkout = { 
  name: 'Nohy',
  exercises: [
    { exerciseId: 'exercise-squat', targetSets: 4, minReps: 5, maxReps: 8, targetRir: 1, restSeconds: 180 },
    { exerciseId: 'exercise-romanian-deadlift', targetSets: 3, minReps: 8, maxReps: 10, targetRir: 2, restSeconds: 150 },
  ],
}

export const STARTER_PLAN_STRUCTURES: StarterPlanStructure[] = [
  {
    planId: 'starter-push-pull-legs',
    weekNotes: 'Štartovací PPL týždeň. Duplikuj ho a škáluj odtiaľto.',
    days: [
      { dayIndex: 0, label: 'Tlak A', isRestDay: false, workouts: [pushWorkout('Tlakový deň A')] },
      { dayIndex: 1, label: 'Ťah A', isRestDay: false, workouts: [pullWorkout('Ťahový deň A')] },
      { dayIndex: 2, label: 'Voľno', isRestDay: true, workouts: [] },
      { dayIndex: 3, label: 'Nohy', isRestDay: false, workouts: [legWorkout] },
      { dayIndex: 4, label: 'Tlak B', isRestDay: false, workouts: [pushWorkout('Tlakový deň B')] },
      { dayIndex: 5, label: 'Voľno', isRestDay: true, workouts: [] },
      { dayIndex: 6, label: 'Ťah B', isRestDay: false, workouts: [pullWorkout('Ťahový deň B')] },
    ],
  },
  {
    planId: 'starter-upper-lower',
    weekNotes: 'Štartovací týždeň vrch/spodok.',
    days: [
      { dayIndex: 0, label: 'Vrch A', isRestDay: false, workouts: [pushWorkout('Vrch A')] },
      { dayIndex: 1, label: 'Voľno', isRestDay: true, workouts: [] },
      { dayIndex: 2, label: 'Spodok A', isRestDay: false, workouts: [legWorkout] },
      { dayIndex: 3, label: 'Voľno', isRestDay: true, workouts: [] },
      { dayIndex: 4, label: 'Vrch B', isRestDay: false, workouts: [pullWorkout('Vrch B')] },
      { dayIndex: 5, label: 'Spodok B', isRestDay: false, workouts: [legWorkout] },
      { dayIndex: 6, label: 'Voľno', isRestDay: true, workouts: [] },
    ],
  },
  {
    planId: 'starter-full-body-3x',
    weekNotes: 'Štartovací trojdňový týždeň na celé telo.',
    days: [
      { dayIndex: 0, label: 'Celé telo A', isRestDay: false, workouts: [pushWorkout('Celé telo A')] },
      { dayIndex: 1, label: 'Voľno', isRestDay: true, workouts: [] },
      { dayIndex: 2, label: 'Celé telo B', isRestDay: false, workouts: [pullWorkout('Celé telo B')] },
      { dayIndex: 3, label: 'Voľno', isRestDay: true, workouts: [] },
      { dayIndex: 4, label: 'Celé telo C', isRestDay: false, workouts: [legWorkout] },
      { dayIndex: 5, label: 'Voľno', isRestDay: true, workouts: [] },
      { dayIndex: 6, label: 'Voľno', isRestDay: true, workouts: [] },
    ],
  },
] as const
