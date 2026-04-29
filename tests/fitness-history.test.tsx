import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessHistoryPage } from '@/features/fitness/FitnessHistoryPage'
import { FitnessStatsPage } from '@/features/fitness/FitnessStatsPage'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 300))
}

function render(element: ReactNode) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  act(() => {
    root.render(element)
  })
  return { container, root }
}

async function createFinishedPushSession(weightKg = 100) {
  await fitnessRepository.seedStarterData()
  const starter = (await fitnessRepository.listStarterPlans()).find((plan) => plan.name === 'Tlak / Ťah / Nohy')
  if (!starter) {
    throw new Error('PPL starter missing')
  }

  await fitnessRepository.createPersonalPlanFromStarter(starter.id, { name: 'My PPL Block', goal: 'Build muscle' })
  const workout = (await fitnessRepository.listStartableWorkouts()).find((item) => item.workoutName === 'Tlakový deň A')
  if (!workout) {
    throw new Error('Tlakový deň A workout missing')
  }

  const session = await fitnessRepository.startSessionFromPlanWorkout(workout.workoutId)
  const benchPress = session.exercises[0]
  if (!benchPress) {
    throw new Error('Tlak na lavičke session exercise missing')
  }

  for (const set of benchPress.sets) {
    await fitnessRepository.logSet(set.id, { weightKg, reps: 8, rir: 1 })
  }

  await fitnessRepository.finishSession(session.id, {
    sessionRpe: 8,
    energyLevel: 4,
    notes: 'Fast reps, solid shoulder position.',
  })
}

describe('fitness history and stats UI', () => {
  let roots: Root[] = []
  let containers: HTMLDivElement[] = []

  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
    await createFinishedPushSession()
  })

  afterEach(async () => {
    roots.forEach((root) => {
      act(() => root.unmount())
    })
    containers.forEach((container) => container.remove())
    roots = []
    containers = []
    await resetDatabaseState()
  })

  test('renders completed workouts with volume and workout detail', async () => {
    const history = render(<FitnessHistoryPage />)
    roots.push(history.root)
    containers.push(history.container)

    await act(async () => {
      await waitForAsyncUi()
    })

    expect(history.container.textContent).toContain('Tlakový deň A')
    expect(history.container.textContent).toContain('2,400 kg')
    expect(history.container.textContent).toContain('Tlak na lavičke')
    expect(history.container.textContent).toContain('100 kg × 8')
    expect(history.container.textContent).toContain('3/12 sérií')
    expect(history.container.textContent).toContain('8/10')
    expect(history.container.textContent).toContain('4/5')
    expect(history.container.textContent).toContain('Fast reps, solid shoulder position.')
  })

  test('renders muscle group volume summaries in stats', async () => {
    const stats = render(<FitnessStatsPage />)
    roots.push(stats.root)
    containers.push(stats.container)

    await act(async () => {
      await waitForAsyncUi()
    })

    expect(stats.container.textContent).toContain('Objem podľa svalovej skupiny')
    expect(stats.container.textContent).toContain('Hrudník')
    expect(stats.container.textContent).toContain('3 série')
    expect(stats.container.textContent).toContain('Posledný týždeň')
    expect(stats.container.textContent).toContain('Cieľ 10–20 sérií/týždeň')
    expect(stats.container.textContent).toContain('Pod 10 sérií/týždeň')
    expect(stats.container.querySelector('[data-testid="muscle-group-volume"]')).toBeTruthy()
  })

  test('renders exercise volume leaders in stats', async () => {
    const stats = render(<FitnessStatsPage />)
    roots.push(stats.root)
    containers.push(stats.container)

    await act(async () => {
      await waitForAsyncUi()
    })

    expect(stats.container.textContent).toContain('Objem podľa cviku')
    expect(stats.container.textContent).toContain('Tlak na lavičke')
    expect(stats.container.textContent).toContain('3 série')
    expect(stats.container.querySelector('[data-testid="exercise-volume-leaders"]')).toBeTruthy()
  })

  test('renders the 12-week training consistency heatmap', async () => {
    const stats = render(<FitnessStatsPage />)
    roots.push(stats.root)
    containers.push(stats.container)

    await act(async () => {
      await waitForAsyncUi()
    })

    expect(stats.container.textContent).toContain('Konzistentnosť 12 týždňov')
    expect(stats.container.textContent).toContain('Tréningové dni')
    expect(stats.container.textContent).toContain('Tréningy v okne')
    expect(stats.container.querySelector('[data-testid="training-heatmap"]')).toBeTruthy()
  })

  test('renders 1RM trend chart after repeated exercise sessions', async () => {
    await createFinishedPushSession(105)

    const stats = render(<FitnessStatsPage />)
    roots.push(stats.root)
    containers.push(stats.container)

    await act(async () => {
      await waitForAsyncUi()
    })

    expect(stats.container.textContent).toContain('Krivka 1RM')
    expect(stats.container.textContent).toContain('Tlak na lavičke · 133 kg e1RM')
    expect(stats.container.textContent).toContain('2 body')
    expect(stats.container.textContent).toContain('+6.3 kg')
    expect(stats.container.querySelector('[data-testid="one-rep-max-chart"]')).toBeTruthy()
  })

  test('renders PR events and progression hints from completed sessions', async () => {
    const stats = render(<FitnessStatsPage />)
    roots.push(stats.root)
    containers.push(stats.container)

    await act(async () => {
      await waitForAsyncUi()
    })

    expect(stats.container.textContent).toContain('Dokončené tréningy')
    expect(stats.container.textContent).toContain('1')
    expect(stats.container.textContent).toContain('2,400 kg')
    expect(stats.container.textContent).toContain('Tlak na lavičke · 126.7 kg e1RM')
    expect(stats.container.textContent).toContain('Nabudúce pridaj 2,5 kg')
    expect(stats.container.textContent).toContain('Splnil si 3×8 na Tlak na lavičke s RIR 1.')
  })
})
