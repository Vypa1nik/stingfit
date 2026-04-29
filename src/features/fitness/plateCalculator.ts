import type { FitnessDisplayUnit } from '@/features/fitness/fitnessUnits'

interface CalculatePlateLoadInput {
  targetWeight: number
  barWeight: number
  unit: FitnessDisplayUnit
}

export interface PlateLoadEntry {
  weight: number
  count: number
}

export interface PlateLoadResult {
  unit: FitnessDisplayUnit
  targetWeight: number
  barWeight: number
  loadedWeight: number
  perSideTarget: number
  remainingPerSide: number
  plates: PlateLoadEntry[]
  isExact: boolean
  isUnderBar: boolean
}

const PLATE_INVENTORY: Record<FitnessDisplayUnit, number[]> = {
  kg: [20, 15, 10, 5, 2.5, 1.25],
  lb: [45, 35, 25, 10, 5, 2.5],
}

export function getDefaultBarWeight(unit: FitnessDisplayUnit) {
  return unit === 'lb' ? 45 : 20
}

export function calculatePlateLoad({ targetWeight, barWeight, unit }: CalculatePlateLoadInput): PlateLoadResult {
  const safeTargetWeight = normalizeWeight(targetWeight)
  const safeBarWeight = normalizeWeight(barWeight)

  if (safeTargetWeight < safeBarWeight) {
    return {
      unit,
      targetWeight: safeTargetWeight,
      barWeight: safeBarWeight,
      loadedWeight: safeBarWeight,
      perSideTarget: 0,
      remainingPerSide: 0,
      plates: [],
      isExact: false,
      isUnderBar: true,
    }
  }

  const perSideTarget = roundWeight((safeTargetWeight - safeBarWeight) / 2)
  let remainingPerSide = perSideTarget
  const plates: PlateLoadEntry[] = []

  for (const plate of PLATE_INVENTORY[unit]) {
    const count = Math.floor((remainingPerSide + Number.EPSILON) / plate)
    if (count <= 0) {
      continue
    }

    plates.push({ weight: plate, count })
    remainingPerSide = roundWeight(remainingPerSide - plate * count)
  }

  const loadedPerSide = roundWeight(perSideTarget - remainingPerSide)
  const loadedWeight = roundWeight(safeBarWeight + loadedPerSide * 2)

  return {
    unit,
    targetWeight: safeTargetWeight,
    barWeight: safeBarWeight,
    loadedWeight,
    perSideTarget,
    remainingPerSide,
    plates,
    isExact: remainingPerSide === 0,
    isUnderBar: false,
  }
}

export function formatPlateLoadSummary(load: PlateLoadResult) {
  if (load.isUnderBar) {
    return `Cieľ je pod váhou tyče · minimum je ${formatPlateNumber(load.barWeight)} ${load.unit}`
  }

  if (!load.isExact) {
    const missingWeight = roundWeight(load.targetWeight - load.loadedWeight)
    return `Najbližšie nižšie: ${formatPlateNumber(load.loadedWeight)} ${load.unit} · chýba ${formatPlateNumber(missingWeight)} ${load.unit}`
  }

  if (load.plates.length === 0) {
    return 'Na stranu: bez kotúčov'
  }

  return `Na stranu: ${load.plates.map((plate) => `${formatPlateNumber(plate.weight)} ${load.unit} × ${plate.count}`).join(' + ')}`
}

export function formatPlateNumber(value: number) {
  const rounded = roundWeight(value)
  return Number.isInteger(rounded) ? rounded.toFixed(0) : String(rounded)
}

function normalizeWeight(value: number) {
  return Number.isFinite(value) ? Math.max(0, roundWeight(value)) : 0
}

function roundWeight(value: number) {
  return Math.round(value * 100) / 100
}
