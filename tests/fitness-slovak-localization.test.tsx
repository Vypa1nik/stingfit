import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessDashboard } from '@/features/fitness/FitnessDashboard'
import { LiveTrainingSession } from '@/features/fitness/LiveTrainingSession'
import { SetLogger } from '@/features/fitness/SetLogger'
import { WorkoutHistoryDetail } from '@/features/fitness/WorkoutHistoryDetail'
import { STARTER_FITNESS_EXERCISES, STARTER_FITNESS_PLANS, STARTER_PLAN_STRUCTURES } from '@/features/fitness/fitnessSeed'
import type { FitnessLiveSession, FitnessSessionSetRecord } from '@/features/fitness/fitnessTypes'
import { VIEW_NAV_ITEMS } from '@/lib/constants'
import { clearAllData, resetDatabaseState } from '@/lib/database'
import { SHORTCUTS } from '@/lib/shortcuts'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 1000))
}

function readProjectFile(path: string) {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

function makeLocalizedCopySession(): FitnessLiveSession {
  const createdAt = '2026-04-25T10:00:00.000Z'
  return {
    id: 'localized-copy-session',
    planId: 'plan-1',
    planWorkoutId: 'workout-1',
    name: 'Tlakový deň A',
    status: 'active',
    startedAt: createdAt,
    completedAt: null,
    notes: '',
    sessionRpe: 8,
    energyLevel: 4,
    createdAt,
    updatedAt: createdAt,
    exercises: [
      {
        id: 'session-exercise-1',
        sessionId: 'localized-copy-session',
        exerciseId: 'bench-press',
        nameSnapshot: 'Tlak na lavičke',
        sortOrder: 0,
        status: 'active',
        targetSets: 3,
        minReps: 8,
        maxReps: 10,
        targetRir: 1,
        restSeconds: 120,
        notes: '',
        createdAt,
        updatedAt: createdAt,
        sets: [
          {
            id: 'set-1',
            sessionExerciseId: 'session-exercise-1',
            setNumber: 1,
            weightKg: 100,
            reps: 8,
            rir: 1,
            status: 'planned',
            completedAt: null,
            createdAt,
            updatedAt: createdAt,
          },
        ],
      },
    ],
  }
}

describe('Slovak StingFit localization', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(async () => {
    act(() => {
      root.unmount()
    })
    container.remove()
    await resetDatabaseState()
  })

  test('uses Slovak labels for primary navigation and shortcuts', () => {
    expect(VIEW_NAV_ITEMS.map((item) => item.label)).toEqual(['Tréning', 'Plány', 'História', 'Štatistiky'])
    expect(SHORTCUTS.map((shortcut) => shortcut.label)).toContain('Spustiť tréning')
    expect(SHORTCUTS.map((shortcut) => shortcut.label)).toContain('Vytvoriť plán')
  })

  test('ships Slovak starter plan and exercise names', () => {
    expect(STARTER_FITNESS_PLANS.map((plan) => plan.name)).toEqual(['Tlak / Ťah / Nohy', 'Vrch / Spodok', 'Celé telo 3×'])
    expect(STARTER_FITNESS_EXERCISES.map((exercise) => exercise.name)).toContain('Tlak na lavičke')
    expect(STARTER_PLAN_STRUCTURES[0]?.days.map((day) => day.label)).toEqual(['Tlak A', 'Ťah A', 'Voľno', 'Nohy', 'Tlak B', 'Voľno', 'Ťah B'])
    expect(STARTER_PLAN_STRUCTURES[0]?.days[0]?.workouts[0]?.name).toBe('Tlakový deň A')
  })

  test('renders the first training empty state in Slovak', async () => {
    await act(async () => {
      root.render(<FitnessDashboard />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Začni úplne jednoducho')
    expect(container.textContent).toContain('3 dni / týždeň')
    expect(container.textContent).toContain('Neviem, vyber za mňa')
    expect(container.textContent).not.toContain('Prepare Push / Pull / Legs')
  })

  test('renders the mobile set logger controls in Slovak', async () => {
    const plannedSet: FitnessSessionSetRecord = {
      id: 'set-1',
      sessionExerciseId: 'session-exercise-1',
      setNumber: 1,
      weightKg: 50,
      reps: 8,
      rir: 1,
      status: 'planned',
      completedAt: null,
      createdAt: '2026-04-25T00:00:00.000Z',
      updatedAt: '2026-04-25T00:00:00.000Z',
    }

    await act(async () => {
      root.render(<SetLogger set={plannedSet} displayUnit="kg" onLog={async () => undefined} />)
    })

    expect(container.textContent).toContain('Aktuálna séria')
    expect(container.textContent).toContain('Ovládanie jedným palcom')
    expect(container.textContent).toContain('Zapísať sériu ⚡ pauza')
    expect(container.textContent).not.toContain('Current set')
    expect(container.textContent).not.toContain('Log set')
  })

  test('renders live training and history copy without avoidable English', async () => {
    const session = makeLocalizedCopySession()

    await act(async () => {
      root.render(
        <LiveTrainingSession
          session={session}
          exerciseOptions={[]}
          displayUnit="kg"
          onLogSet={async () => undefined}
          onAddSet={async () => undefined}
          onRemoveSet={async () => undefined}
          onSkipExercise={async () => undefined}
          onAddUnplannedExercise={async () => undefined}
          onFinish={async () => undefined}
          onAbandon={async () => undefined}
        />,
      )
    })

    expect(container.textContent).toContain('Aktívna snímka tréningu')
    expect(container.textContent).toContain('aktívny')
    expect(container.textContent).not.toContain('Aktívna snímka session')
    expect(container.textContent).not.toContain('High-Voltage')
    expect(container.textContent).not.toContain('active')

    await act(async () => {
      root.render(<WorkoutHistoryDetail session={{ ...session, status: 'completed', completedAt: '2026-04-25T11:00:00.000Z' }} />)
    })

    expect(container.textContent).toContain('Snímka tréningu')
    expect(container.textContent).toContain('RPE tréningu')
    expect(container.textContent).not.toContain('Snímka session')
    expect(container.textContent).not.toContain('Session RPE')
    expect(container.textContent).not.toMatch(/\bsession\b/i)
  })

  test('keeps high-visibility source copy free of avoidable English', () => {
    const source = [
      'src/features/fitness/FitnessDashboard.tsx',
      'src/features/fitness/FitnessPlansPage.tsx',
      'src/features/fitness/FitnessSettingsPage.tsx',
      'src/features/fitness/FitnessHistoryPage.tsx',
      'src/features/fitness/FitnessStatsPage.tsx',
      'src/features/fitness/LiveTrainingSession.tsx',
      'src/features/fitness/WorkoutHistoryDetail.tsx',
    ].map(readProjectFile).join('\n')

    for (const phrase of [
      'High-Voltage',
      'snímka session',
      'Snímka session',
      'Aktívna snímka session',
      'Dokončená session',
      'Session RPE',
      'Lokálna session',
      'sessions sú',
      'sessions z',
      'dokončených sessions',
      'DELETE FITNESS',
      'tips',
      'Pridať tréningový deň to week',
      'Pridať tréning to {day.label}',
      'Loading StingFit tunnel',
      'Tunnel not reachable',
      'Try again',
      'Open in Safari',
    ]) {
      expect(source).not.toContain(phrase)
    }

    expect(source).not.toMatch(/label="Day"/)
    expect(source).not.toMatch(/>\s*Name\s*</)
    expect(source).not.toMatch(/>\s*Category\s*</)
    expect(source).toContain('RPE tréningu')
    expect(source).toContain('Aktívna snímka tréningu')
  })
})
