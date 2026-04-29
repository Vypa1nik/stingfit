import type { FitnessMuscleGroup } from '@/features/fitness/fitnessTypes'

export const FITNESS_MUSCLE_GROUPS: FitnessMuscleGroup[] = ['chest', 'back', 'quads', 'hamstrings', 'glutes', 'shoulders', 'biceps', 'triceps', 'calves', 'abs', 'forearms', 'other']

const MUSCLE_GROUP_LABELS: Record<FitnessMuscleGroup, string> = {
  chest: 'Hrudník',
  back: 'Chrbát',
  quads: 'Kvadricepsy',
  hamstrings: 'Hamstringy',
  glutes: 'Sedacie svaly',
  shoulders: 'Ramená',
  biceps: 'Biceps',
  triceps: 'Triceps',
  calves: 'Lýtka',
  abs: 'Brucho',
  forearms: 'Predlaktia',
  other: 'Iné',
}

export function formatMuscleGroupLabel(group: FitnessMuscleGroup) {
  return MUSCLE_GROUP_LABELS[group]
}

export function normalizeMuscleGroup(value: unknown): FitnessMuscleGroup | null {
  return typeof value === 'string' && FITNESS_MUSCLE_GROUPS.includes(value as FitnessMuscleGroup) ? value as FitnessMuscleGroup : null
}

export function requireMuscleGroup(value: unknown): FitnessMuscleGroup | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const normalized = normalizeMuscleGroup(value)
  if (!normalized) {
    throw new Error('Invalid muscle group')
  }

  return normalized
}

export function resolveMuscleGroup({ exerciseName, category, muscleGroup }: { exerciseName: string; category?: string | null; muscleGroup?: FitnessMuscleGroup | null }): FitnessMuscleGroup {
  if (muscleGroup) return muscleGroup
  const normalizedName = normalizeTaxonomyText(exerciseName)
  const normalizedCategory = normalizeTaxonomyText(category ?? '')
  const combined = `${normalizedName} ${normalizedCategory}`

  if (matchesAny(combined, ['plank', 'brucho', 'brus', 'abs', 'core'])) return 'abs'
  if (matchesAny(combined, ['lytka', 'calf', 'calves'])) return 'calves'
  if (matchesAny(combined, ['predlakt', 'forearm', 'wrist'])) return 'forearms'
  if (matchesAny(combined, ['biceps', 'curl', 'zdvih'])) return 'biceps'
  if (matchesAny(combined, ['triceps', 'pushdown', 'kladky s lanom', 'lano', 'francuzsky'])) return 'triceps'
  if (matchesAny(normalizedName, ['rumunsky', 'leg curl', 'zakopavanie', 'hamstring'])) return 'hamstrings'
  if (matchesAny(normalizedName, ['hip thrust', 'glute', 'sedac', 'mostik'])) return 'glutes'
  if (matchesAny(normalizedName, ['drep', 'squat', 'leg press', 'predkopavanie', 'quad'])) return 'quads'
  if (matchesAny(normalizedCategory, ['hrudnik', 'chest']) || matchesAny(normalizedName, ['bench', 'tlak na lavicke', 'pec deck'])) return 'chest'
  if (matchesAny(normalizedCategory, ['ramena', 'shoulder']) || matchesAny(normalizedName, ['upazovanie', 'lateral raise', 'overhead press'])) return 'shoulders'
  if (matchesAny(normalizedCategory, ['chrbat', 'back']) || matchesAny(normalizedName, ['pritahy', 'row', 'deadlift', 'mrtvy tah', 'lat pulldown', 'zhyb'])) return 'back'
  if (matchesAny(normalizedCategory, ['nohy', 'legs'])) return 'quads'
  if (matchesAny(normalizedCategory, ['paze', 'arms'])) return 'triceps'

  return 'other'
}

function matchesAny(value: string, needles: string[]) {
  return needles.some((needle) => value.includes(needle))
}

function normalizeTaxonomyText(value: string) {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('sk')
}
