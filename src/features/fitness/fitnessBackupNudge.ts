export const FITNESS_BACKUP_NUDGE_INTERVAL = 30
export const FITNESS_BACKUP_NUDGE_STORAGE_KEY = 'stingfit.backupNudge.dismissedCompletedSessions'

function normalizeCompletedSessionCount(value: number | null | undefined) {
  if (!Number.isFinite(value ?? 0)) {
    return 0
  }

  return Math.max(0, Math.floor(Number(value ?? 0)))
}

export function getNextBackupNudgeThreshold(dismissedCompletedSessionCount: number | null | undefined) {
  const dismissedCount = normalizeCompletedSessionCount(dismissedCompletedSessionCount)
  if (dismissedCount < FITNESS_BACKUP_NUDGE_INTERVAL) {
    return FITNESS_BACKUP_NUDGE_INTERVAL
  }

  return (Math.floor(dismissedCount / FITNESS_BACKUP_NUDGE_INTERVAL) + 1) * FITNESS_BACKUP_NUDGE_INTERVAL
}

export function shouldShowBackupNudge(completedSessionCount: number, dismissedCompletedSessionCount: number | null | undefined) {
  return normalizeCompletedSessionCount(completedSessionCount) >= getNextBackupNudgeThreshold(dismissedCompletedSessionCount)
}
