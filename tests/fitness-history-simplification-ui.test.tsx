import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessHistoryPage } from '@/features/fitness/FitnessHistoryPage'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 500))
}

function findButton(container: HTMLDivElement, label: string) {
  const button = Array.from(container.querySelectorAll('button')).find((item) => item.textContent?.includes(label))
  expect(button).toBeDefined()
  return button
}

async function createFinishedWorkout() {
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
  const firstSet = session.exercises[0]?.sets[0]
  if (!firstSet) {
    throw new Error('First bench press set missing')
  }

  await fitnessRepository.logSet(firstSet.id, { weightKg: 100, reps: 8, rir: 1 })
  await fitnessRepository.finishSession(session.id)
}

describe('FitnessHistoryPage simplified history result', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(async () => {
    window.history.replaceState(null, '', '/#/history')
    await resetDatabaseState()
    await clearAllData()
    await createFinishedWorkout()
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

  test('shows the latest workout result before filters and dense history controls', async () => {
    await act(async () => {
      root.render(<FitnessHistoryPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Posledný výsledok')
    expect(container.textContent).toContain('Hotovo: Tlakový deň A')
    expect(container.textContent).toContain('Objem')
    expect(container.textContent).toContain('800 kg')
    expect(container.textContent).toContain('Série')
    expect(container.textContent).toContain('1/12')
    expect(container.textContent).toContain('Najlepší zápis')
    expect(container.textContent).toContain('Tlak na lavičke · 100 kg × 8')

    const advancedHistory = Array.from(container.querySelectorAll('details')).find((details) => details.textContent?.includes('Vybrať starší tréning alebo filtrovať'))
    expect(advancedHistory).toBeDefined()
    expect(advancedHistory?.hasAttribute('open')).toBe(false)
    expect(advancedHistory?.textContent).toContain('Filter histórie')
  })

  test('labels the latest result as the just-finished workout after finish handoff', async () => {
    window.history.replaceState(null, '', '/#/history?from=finish')

    await act(async () => {
      root.render(<FitnessHistoryPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Práve dokončený tréning')
    expect(container.textContent).toContain('Toto je tvoj práve dokončený tréning.')
    expect(container.textContent).toContain('Čo spraviť nabudúce')
    expect(container.textContent).toContain('Ak čísla sedia, nemusíš robiť nič.')
    expect(container.textContent).toContain('Nabudúce ťa čaká: Ťahový deň A')

    await act(async () => {
      findButton(container, 'Otvoriť Tréning')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(window.location.hash).toBe('#/training')
  })
})
