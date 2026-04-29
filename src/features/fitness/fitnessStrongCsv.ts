import type { FitnessStrongCsvPreview } from '@/features/fitness/fitnessTypes'

export interface ParsedStrongCsvSet {
  weightKg: number
  reps: number
  rir: number | null
  sourceOrder: number
}

export interface ParsedStrongCsvExercise {
  name: string
  notes: string
  sets: ParsedStrongCsvSet[]
}

export interface ParsedStrongCsvWorkout {
  name: string
  startedAt: string
  completedAt: string
  notes: string
  exercises: ParsedStrongCsvExercise[]
}

export interface ParsedStrongCsvImport {
  workouts: ParsedStrongCsvWorkout[]
  skippedRowCount: number
}

interface StrongCsvRow {
  date: string
  workoutName: string
  exerciseName: string
  setOrder: number | null
  weightKg: number
  reps: number
  rir: number | null
  notes: string
  workoutNotes: string
  sourceOrder: number
}

const REQUIRED_HEADERS = ['date', 'workout name', 'exercise name', 'weight', 'reps'] as const

export function parseStrongCsvImport(csvText: string): ParsedStrongCsvImport {
  const rows = parseCsvRows(csvText)
  if (rows.length === 0) {
    throw new Error('Strong CSV je prázdny.')
  }

  const headers = rows[0]!.map(normalizeHeader)
  for (const header of REQUIRED_HEADERS) {
    if (!headers.includes(header)) {
      throw new Error(`Strong CSV chýba povinný stĺpec: ${header}`)
    }
  }

  const getCell = (row: string[], header: string) => row[headers.indexOf(header)]?.trim() ?? ''
  const workoutsByKey = new Map<string, { name: string; startedAt: string; notes: string; exercises: Map<string, { name: string; notes: string; sets: StrongCsvRow[] }> }>()
  let skippedRowCount = 0

  for (const [index, row] of rows.slice(1).entries()) {
    const parsed = parseStrongRow(row, getCell, index)
    if (!parsed) {
      skippedRowCount += 1
      continue
    }

    const workoutKey = `${parsed.date}::${parsed.workoutName}`
    const workout = workoutsByKey.get(workoutKey) ?? {
      name: parsed.workoutName,
      startedAt: parsed.date,
      notes: parsed.workoutNotes,
      exercises: new Map<string, { name: string; notes: string; sets: StrongCsvRow[] }>(),
    }
    if (!workout.notes && parsed.workoutNotes) {
      workout.notes = parsed.workoutNotes
    }

    const exerciseKey = parsed.exerciseName.toLocaleLowerCase('sk')
    const exercise = workout.exercises.get(exerciseKey) ?? { name: parsed.exerciseName, notes: parsed.notes, sets: [] }
    if (!exercise.notes && parsed.notes) {
      exercise.notes = parsed.notes
    }
    exercise.sets.push(parsed)
    workout.exercises.set(exerciseKey, exercise)
    workoutsByKey.set(workoutKey, workout)
  }

  const workouts = Array.from(workoutsByKey.values())
    .map((workout) => ({
      name: workout.name,
      startedAt: workout.startedAt,
      completedAt: workout.startedAt,
      notes: workout.notes,
      exercises: Array.from(workout.exercises.values()).map((exercise) => ({
        name: exercise.name,
        notes: exercise.notes,
        sets: [...exercise.sets]
          .sort((a, b) => (a.setOrder ?? a.sourceOrder) - (b.setOrder ?? b.sourceOrder) || a.sourceOrder - b.sourceOrder)
          .map((set, setIndex) => ({
            weightKg: set.weightKg,
            reps: set.reps,
            rir: set.rir,
            sourceOrder: setIndex + 1,
          })),
      })),
    }))
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt) || a.name.localeCompare(b.name, 'sk'))

  if (workouts.length === 0) {
    throw new Error('Strong CSV neobsahuje žiadne importovateľné tréningové série.')
  }

  return { workouts, skippedRowCount }
}

export function buildStrongCsvPreview(csvText: string): FitnessStrongCsvPreview {
  const parsed = parseStrongCsvImport(csvText)
  const exerciseNames = new Set(parsed.workouts.flatMap((workout) => workout.exercises.map((exercise) => exercise.name.toLocaleLowerCase('sk'))))
  const setCount = parsed.workouts.reduce((sum, workout) => sum + workout.exercises.reduce((exerciseSum, exercise) => exerciseSum + exercise.sets.length, 0), 0)

  return {
    source: 'strong',
    workoutCount: parsed.workouts.length,
    exerciseCount: exerciseNames.size,
    setCount,
    skippedRowCount: parsed.skippedRowCount,
  }
}

function parseStrongRow(row: string[], getCell: (row: string[], header: string) => string, sourceOrder: number): StrongCsvRow | null {
  const date = parseStrongDate(getCell(row, 'date'))
  const workoutName = getCell(row, 'workout name') || 'Strong tréning'
  const exerciseName = getCell(row, 'exercise name')
  const reps = parsePositiveNumber(getCell(row, 'reps'))
  const weight = parseNonNegativeNumber(getCell(row, 'weight'))

  if (!date || !exerciseName || reps === null || weight === null) {
    return null
  }

  return {
    date,
    workoutName,
    exerciseName,
    setOrder: parsePositiveNumber(getCell(row, 'set order')),
    weightKg: normalizeWeightKg(weight, getCell(row, 'weight unit')),
    reps: Math.round(reps),
    rir: normalizeRirFromRpe(getCell(row, 'rpe')),
    notes: getCell(row, 'notes'),
    workoutNotes: getCell(row, 'workout notes'),
    sourceOrder,
  }
}

function parseCsvRows(csvText: string) {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false

  for (let index = 0; index < csvText.length; index += 1) {
    const char = csvText[index]
    const next = csvText[index + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      row.push(cell)
      cell = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        index += 1
      }
      row.push(cell)
      if (row.some((value) => value.trim())) {
        rows.push(row)
      }
      row = []
      cell = ''
      continue
    }

    cell += char
  }

  row.push(cell)
  if (row.some((value) => value.trim())) {
    rows.push(row)
  }

  return rows
}

function normalizeHeader(header: string) {
  return header.trim().toLocaleLowerCase('en-US')
}

function parseStrongDate(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(trimmed)
    ? `${trimmed.replace(' ', 'T')}${trimmed.endsWith('Z') ? '' : 'Z'}`
    : /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
      ? `${trimmed}T00:00:00.000Z`
      : trimmed
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function parsePositiveNumber(value: string) {
  const numeric = Number(value.trim().replace(',', '.'))
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null
}

function parseNonNegativeNumber(value: string) {
  const numeric = Number(value.trim().replace(',', '.'))
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : null
}

function normalizeWeightKg(weight: number, unit: string) {
  const normalizedUnit = unit.trim().toLocaleLowerCase('en-US')
  const weightKg = ['lb', 'lbs', 'pound', 'pounds'].includes(normalizedUnit) ? weight * 0.45359237 : weight
  return Math.round(weightKg * 10) / 10
}

function normalizeRirFromRpe(value: string) {
  if (!value.trim()) {
    return null
  }

  const rpe = Number(value.trim().replace(',', '.'))
  if (!Number.isFinite(rpe)) {
    return null
  }

  return Math.max(0, Math.min(10, Math.round(10 - rpe)))
}
