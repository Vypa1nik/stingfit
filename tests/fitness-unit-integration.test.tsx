import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessDashboard } from '@/features/fitness/FitnessDashboard'
import { FitnessHistoryPage } from '@/features/fitness/FitnessHistoryPage'
import { FitnessStatsPage } from '@/features/fitness/FitnessStatsPage'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 300))
}

async function createPplPlan() {
  await fitnessRepository.seedStarterData()
  const starter = (await fitnessRepository.listStarterPlans()).find((plan) => plan.name === 'Tlak / Ťah / Nohy')
  if (!starter) {
    throw new Error('PPL starter missing')
  }

  await fitnessRepository.createPersonalPlanFromStarter(starter.id, { name: 'My PPL Block', goal: 'Build muscle' })
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

async function startPushDay(container: HTMLDivElement) {
  const startButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Spustiť Tlakový deň A'))
  expect(startButton).toBeDefined()

  await act(async () => {
    startButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await waitForAsyncUi()
  })
}

async function createFinishedLbSession() {
  await createPplPlan()
  await fitnessRepository.updateSettings({ displayUnit: 'lb' })
  const workout = (await fitnessRepository.listStartableWorkouts()).find((item) => item.workoutName === 'Tlakový deň A')
  if (!workout) {
    throw new Error('Tlakový deň A missing')
  }

  const session = await fitnessRepository.startSessionFromPlanWorkout(workout.workoutId)
  const benchPress = session.exercises[0]
  if (!benchPress) {
    throw new Error('Tlak na lavičke missing')
  }

  for (const set of benchPress.sets) {
    await fitnessRepository.logSet(set.id, { weightKg: 100, reps: 8, rir: 1 })
  }
  await fitnessRepository.finishSession(session.id)
}

describe('fitness display unit integration', () => {
  let roots: Root[] = []
  let containers: HTMLDivElement[] = []

  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
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

  test('live logger accepts lb input while storing set weight in kg', async () => {
    await createPplPlan()
    await fitnessRepository.updateSettings({ displayUnit: 'lb' })
    const training = render(<FitnessDashboard />)
    roots.push(training.root)
    containers.push(training.container)

    await act(async () => {
      await waitForAsyncUi()
    })
    await startPushDay(training.container)

    expect(training.container.textContent).toContain('Zobrazená jednotka: lb')
    const weightInput = training.container.querySelector<HTMLInputElement>('input[aria-label="Váha v lb"]')
    expect(weightInput).toBeTruthy()

    await act(async () => {
      if (weightInput) {
        weightInput.value = '220.5'
        weightInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })

    const logButton = Array.from(training.container.querySelectorAll('button')).find((button) => button.textContent?.includes('Zapísať sériu ⚡ pauza'))
    expect(logButton).toBeDefined()

    await act(async () => {
      logButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    const activeSession = await fitnessRepository.getActiveSession()
    expect(activeSession?.exercises[0]?.sets[0]).toMatchObject({ status: 'completed', weightKg: 100 })
  })

  test('history and stats render volume and PR labels in lb when lb is selected', async () => {
    await createFinishedLbSession()

    const history = render(<FitnessHistoryPage />)
    const stats = render(<FitnessStatsPage />)
    roots.push(history.root, stats.root)
    containers.push(history.container, stats.container)

    await act(async () => {
      await waitForAsyncUi()
    })

    expect(history.container.textContent).toContain('5,291 lb')
    expect(history.container.textContent).toContain('220.5 lb × 8')
    expect(stats.container.textContent).toContain('5,291 lb')
    expect(stats.container.textContent).toContain('Tlak na lavičke · 279.3 lb e1RM')
    expect(stats.container.textContent).toContain('Najlepšia séria: 220.5 lb × 8')
  })
})
