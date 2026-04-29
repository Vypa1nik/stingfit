export type FitnessSetStatus = 'done' | 'current' | 'planned'

export interface FitnessSet {
  id: string
  setNumber: number
  weightKg: number
  reps: number
  rir: number
  status: FitnessSetStatus
}

export interface FitnessExercise {
  id: string
  name: string
  muscleGroup: string
  target: string
  lastPerformance: string
  coachHint: string
  restSeconds: number
  sets: FitnessSet[]
}

export interface FitnessSession {
  id: string
  title: string
  subtitle: string
  startedAt: string
  elapsedMinutes: number
  currentExerciseId: string
  readiness: 'ready' | 'moderate' | 'tired'
  exercises: FitnessExercise[]
  weeklyStats: {
    completedWorkouts: number
    plannedWorkouts: number
    volumeDeltaPercent: number
    personalRecords: number
  }
}

export interface FitnessSessionProgress {
  completedSets: number
  totalSets: number
  completedExercises: number
  totalExercises: number
  percent: number
}

export const DEMO_FITNESS_SESSION: FitnessSession = {
  id: 'session-push-day-demo',
  title: 'Tlakový deň',
  subtitle: 'Hrudník, ramená, tricepsy · zameranie na hypertrofiu',
  startedAt: '2026-04-25T08:45:00.000Z',
  elapsedMinutes: 42,
  currentExerciseId: 'bench-press',
  readiness: 'ready',
  exercises: [
    {
      id: 'activation-circuit',
      name: 'Aktivačný okruh',
      muscleGroup: 'Rozcvičenie',
      target: '3 kolá · kontrolované tempo',
      lastPerformance: 'Dokončené bez nepohodlia v ramene',
      coachHint: 'Drž plynulý pohyb; toto je príprava, nie práca do únavy.',
      restSeconds: 45,
      sets: [
        { id: 'activation-1', setNumber: 1, weightKg: 0, reps: 12, rir: 4, status: 'done' },
        { id: 'activation-2', setNumber: 2, weightKg: 0, reps: 12, rir: 4, status: 'done' },
        { id: 'activation-3', setNumber: 3, weightKg: 0, reps: 12, rir: 3, status: 'done' },
      ],
    },
    {
      id: 'bench-press',
      name: 'Tlak na lavičke',
      muscleGroup: 'Hrudník',
      target: '97.5 kg × 8 · RIR 1',
      lastPerformance: '95 kg × 8 · RIR 1',
      coachHint: 'Skús pridať 2,5 kg, pretože si dvakrát trafil hornú hranicu rozsahu opakovaní.',
      restSeconds: 84,
      sets: [
        { id: 'bench-1', setNumber: 1, weightKg: 95, reps: 8, rir: 2, status: 'done' },
        { id: 'bench-2', setNumber: 2, weightKg: 97.5, reps: 7, rir: 1, status: 'done' },
        { id: 'bench-3', setNumber: 3, weightKg: 97.5, reps: 8, rir: 1, status: 'current' },
      ],
    },
    {
      id: 'incline-db-press',
      name: 'Tlaky s jednoručkami na šikmej lavičke',
      muscleGroup: 'Horná časť hrudníka',
      target: '38 kg × 8–10 · RIR 1–2',
      lastPerformance: '38 kg × 9 · RIR 2',
      coachHint: 'Nechaj rovnakú váhu a pridaj jedno čisté opakovanie oproti minule.',
      restSeconds: 120,
      sets: [
        { id: 'incline-1', setNumber: 1, weightKg: 38, reps: 10, rir: 2, status: 'planned' },
        { id: 'incline-2', setNumber: 2, weightKg: 38, reps: 9, rir: 2, status: 'planned' },
        { id: 'incline-3', setNumber: 3, weightKg: 36, reps: 10, rir: 1, status: 'planned' },
      ],
    },
    {
      id: 'lateral-raise',
      name: 'Upažovanie',
      muscleGroup: 'Ramená',
      target: '14 kg × 12–15 · krátke pauzy',
      lastPerformance: '14 kg × 13 · RIR 2',
      coachHint: 'Nenaháňaj tu váhu; hľadaj čisté napätie v bočnej hlave ramena.',
      restSeconds: 75,
      sets: [
        { id: 'raise-1', setNumber: 1, weightKg: 14, reps: 15, rir: 2, status: 'planned' },
        { id: 'raise-2', setNumber: 2, weightKg: 14, reps: 13, rir: 1, status: 'planned' },
        { id: 'raise-3', setNumber: 3, weightKg: 12, reps: 15, rir: 1, status: 'planned' },
      ],
    },
    {
      id: 'rope-pushdown',
      name: 'Sťahovanie kladky s lanom',
      muscleGroup: 'Triceps',
      target: '32,5 kg × 10–12 · pevné dotiahnutie',
      lastPerformance: '30 kg × 12 · RIR 1',
      coachHint: 'Pridaj váhu len vtedy, ak lakte po tlakoch nepôsobia podráždene.',
      restSeconds: 90,
      sets: [
        { id: 'pushdown-1', setNumber: 1, weightKg: 32.5, reps: 12, rir: 2, status: 'planned' },
        { id: 'pushdown-2', setNumber: 2, weightKg: 32.5, reps: 11, rir: 1, status: 'planned' },
        { id: 'pushdown-3', setNumber: 3, weightKg: 30, reps: 12, rir: 1, status: 'planned' },
      ],
    },
  ],
  weeklyStats: {
    completedWorkouts: 4,
    plannedWorkouts: 5,
    volumeDeltaPercent: 8,
    personalRecords: 3,
  },
}

export function getCurrentExercise(session: FitnessSession): FitnessExercise | null {
  return session.exercises.find((exercise) => exercise.id === session.currentExerciseId) ?? null
}

export function getCurrentSet(exercise: FitnessExercise): FitnessSet | null {
  return exercise.sets.find((set) => set.status === 'current') ?? exercise.sets.find((set) => set.status === 'planned') ?? null
}

export function calculateSessionProgress(session: FitnessSession): FitnessSessionProgress {
  const allSets = session.exercises.flatMap((exercise) => exercise.sets)
  const completedSets = allSets.filter((set) => set.status === 'done').length
  const totalSets = allSets.length
  const completedExercises = session.exercises.filter((exercise) => exercise.sets.every((set) => set.status === 'done')).length
  const percent = totalSets === 0 ? 0 : Math.round((completedSets / totalSets) * 100)

  return {
    completedSets,
    totalSets,
    completedExercises,
    totalExercises: session.exercises.length,
    percent,
  }
}

export function formatRestTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(safeSeconds / 60)
  const seconds = safeSeconds % 60

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}
