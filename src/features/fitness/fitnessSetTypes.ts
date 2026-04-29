import type { FitnessSessionSetType } from '@/features/fitness/fitnessTypes'

export const FITNESS_SET_TYPE_OPTIONS: Array<{
  value: FitnessSessionSetType
  label: string
  ariaLabel: string
  description: string
}> = [
  {
    value: 'working',
    label: 'Pracovná',
    ariaLabel: 'Označiť sériu ako pracovnú',
    description: 'Počíta sa do objemu, PR aj progresných odporúčaní.',
  },
  {
    value: 'warmup',
    label: 'Rozcvička',
    ariaLabel: 'Označiť sériu ako rozcvičku',
    description: 'Nezapočíta sa do objemu, PR ani progresných odporúčaní.',
  },
  {
    value: 'dropset',
    label: 'Drop set',
    ariaLabel: 'Označiť sériu ako drop set',
    description: 'Pracovná intenzifikačná séria po znížení váhy.',
  },
  {
    value: 'failure',
    label: 'Do zlyhania',
    ariaLabel: 'Označiť sériu ako do zlyhania',
    description: 'Pracovná séria dotiahnutá na technické alebo svalové zlyhanie.',
  },
  {
    value: 'myo',
    label: 'Myo',
    ariaLabel: 'Označiť sériu ako myo-rep',
    description: 'Pracovná myo-rep alebo rest-pause séria.',
  },
]

const LABELS = new Map(FITNESS_SET_TYPE_OPTIONS.map((option) => [option.value, option.label]))
const DESCRIPTIONS = new Map(FITNESS_SET_TYPE_OPTIONS.map((option) => [option.value, option.description]))

export function normalizeFitnessSetType(value: unknown): FitnessSessionSetType {
  return FITNESS_SET_TYPE_OPTIONS.some((option) => option.value === value) ? value as FitnessSessionSetType : 'working'
}

export function formatFitnessSetTypeLabel(value: unknown) {
  return LABELS.get(normalizeFitnessSetType(value)) ?? 'Pracovná'
}

export function formatFitnessSetTypeDescription(value: unknown) {
  return DESCRIPTIONS.get(normalizeFitnessSetType(value)) ?? DESCRIPTIONS.get('working')!
}

export function getFitnessSetTypeBadgeClass(value: unknown) {
  const setType = normalizeFitnessSetType(value)
  if (setType === 'warmup') {
    return 'border-sky-300/30 bg-sky-300/10 text-sky-100'
  }
  if (setType === 'failure') {
    return 'border-red-400/35 bg-red-500/15 text-red-100'
  }
  if (setType === 'dropset' || setType === 'myo') {
    return 'border-fitness-orange/40 bg-fitness-orange/15 text-fitness-warm'
  }
  return 'border-fitness-yellow/25 bg-fitness-yellow/10 text-fitness-yellow'
}
