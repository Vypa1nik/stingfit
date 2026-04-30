import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessDashboard } from '@/features/fitness/FitnessDashboard'
import { FitnessHistoryPage } from '@/features/fitness/FitnessHistoryPage'
import { FitnessPlansPage } from '@/features/fitness/FitnessPlansPage'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 500))
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

async function createPplPlan() {
  await fitnessRepository.seedStarterData()
  const starter = (await fitnessRepository.listStarterPlans()).find((plan) => plan.name === 'Tlak / Ťah / Nohy')
  if (!starter) {
    throw new Error('PPL starter missing')
  }

  await fitnessRepository.createPersonalPlanFromStarter(starter.id, { name: 'My PPL Block', goal: 'Build muscle' })
}

async function createFinishedPushSession() {
  const workout = (await fitnessRepository.listStartableWorkouts()).find((item) => item.workoutName === 'Tlakový deň A')
  if (!workout) {
    throw new Error('Tlakový deň A missing')
  }

  const session = await fitnessRepository.startSessionFromPlanWorkout(workout.workoutId)
  await fitnessRepository.finishSession(session.id)
}

describe('fitness optional guidance visibility', () => {
  let roots: Root[] = []
  let containers: HTMLDivElement[] = []

  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
    await createPplPlan()
    await createFinishedPushSession()
    await fitnessRepository.updateSettings({ showGuidance: false })
  })

  afterEach(async () => {
    roots.forEach((root) => act(() => root.unmount()))
    containers.forEach((container) => container.remove())
    roots = []
    containers = []
    await resetDatabaseState()
  })

  test('hides optional guidance panels across training, plans, and history', async () => {
    const training = render(<FitnessDashboard />)
    roots.push(training.root)
    containers.push(training.container)
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(training.container.textContent).toContain('Spustiť Ťahový deň A')
    expect(training.container.textContent).not.toContain('Štart vytvorí snímku tréningu')
    expect(training.container.textContent).not.toContain('4 cviky · 12 plánovaných sérií')

    const plans = render(<FitnessPlansPage />)
    roots.push(plans.root)
    containers.push(plans.container)
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(plans.container.textContent).toContain('Šablóna chránená')
    expect(plans.container.textContent).not.toContain('Na úpravy vytvor osobnú kópiu.')
    expect(plans.container.textContent).not.toContain('Iba budúce tréningy')
    expect(plans.container.textContent).not.toContain('Úpravy plánu ovplyvnia iba budúce tréningy.')

    const history = render(<FitnessHistoryPage />)
    roots.push(history.root)
    containers.push(history.container)
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(history.container.textContent).toContain('Detail tréningu')
    expect(history.container.textContent).not.toContain('Snímka tréningu')
    expect(history.container.textContent).not.toContain('Úpravy plánu nemenia tento tréning.')
  })
})
