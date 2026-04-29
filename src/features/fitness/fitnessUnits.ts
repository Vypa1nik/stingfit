export type FitnessDisplayUnit = 'kg' | 'lb'

const KG_TO_LB = 2.2046226218

export function normalizeDisplayUnit(value: unknown): FitnessDisplayUnit {
  return value === 'lb' ? 'lb' : 'kg'
}

export function convertWeightFromKg(weightKg: number, unit: FitnessDisplayUnit) {
  const converted = unit === 'lb' ? weightKg * KG_TO_LB : weightKg
  return roundToOneDecimal(converted)
}

export function convertWeightToKg(weight: number, unit: FitnessDisplayUnit) {
  const converted = unit === 'lb' ? weight / KG_TO_LB : weight
  return roundToOneDecimal(converted)
}

export function formatWeight(weightKg: number, unit: FitnessDisplayUnit) {
  return `${formatNumber(convertWeightFromKg(weightKg, unit))} ${unit}`
}

export function formatVolumeWeight(totalWeightKg: number, unit: FitnessDisplayUnit) {
  return `${Math.round(convertWeightFromKg(totalWeightKg, unit)).toLocaleString('en-US')} ${unit}`
}

function roundToOneDecimal(value: number) {
  return Math.round(value * 10) / 10
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)
}
