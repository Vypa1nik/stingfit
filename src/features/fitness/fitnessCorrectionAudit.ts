export function formatCorrectedSetSummary(count: number) {
  if (count === 1) return '1 opravená séria'
  if (count > 1 && count < 5) return `${count} opravené série`
  return `${count} opravených sérií`
}

export function formatTotalCorrectionSummary(count: number) {
  if (count === 1) return '1 oprava celkovo'
  if (count > 1 && count < 5) return `${count} opravy celkovo`
  return `${count} opráv celkovo`
}

export function shouldShowTotalCorrectionSummary(correctedSetCount: number, totalCorrections: number) {
  return totalCorrections > correctedSetCount
}
