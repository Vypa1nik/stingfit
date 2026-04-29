import { useEffect, useRef, useState } from 'react'

import { Timer } from 'lucide-react'

import { formatRestTime } from '@/features/fitness/fitnessDemo'
import { triggerRestCompleteAlert } from '@/features/fitness/restAlerts'

interface RestTimerProps {
  seconds: number
  startedAt?: string | null
  soundEnabled?: boolean
  vibrationEnabled?: boolean
}

export function RestTimer({ seconds, startedAt = null, soundEnabled = true, vibrationEnabled = true }: RestTimerProps) {
  const [now, setNow] = useState(() => Date.now())
  const alertedStartedAtRef = useRef<string | null>(null)
  const remainingSeconds = getRemainingSeconds(seconds, startedAt, now)
  const label = startedAt ? (remainingSeconds > 0 ? 'Pauza beží' : 'Pauza hotová') : 'Cieľ pauzy'

  useEffect(() => {
    if (!startedAt) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [startedAt])

  useEffect(() => {
    if (!startedAt || remainingSeconds > 0 || alertedStartedAtRef.current === startedAt) {
      return
    }

    triggerRestCompleteAlert({ soundEnabled, vibrationEnabled })
    alertedStartedAtRef.current = startedAt
  }, [remainingSeconds, soundEnabled, startedAt, vibrationEnabled])

  return (
    <div className="rounded-2xl border border-fitness-yellow/30 bg-black px-4 py-3 text-fitness-warm">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-sm font-black text-fitness-yellow">
          <Timer className="size-4" /> Pauza
        </span>
        <span className="text-xl font-black text-white">{formatRestTime(remainingSeconds)}</span>
      </div>
      <p className="mt-1 text-xs font-bold text-fitness-yellow/80">{label}</p>
    </div>
  )
}

function getRemainingSeconds(seconds: number, startedAt: string | null, now: number) {
  if (!startedAt) {
    return seconds
  }

  const startedAtMs = new Date(startedAt).getTime()
  if (Number.isNaN(startedAtMs)) {
    return seconds
  }

  const elapsedSeconds = Math.max(0, Math.floor((now - startedAtMs) / 1000))
  return Math.max(0, Math.min(seconds, seconds - elapsedSeconds))
}
