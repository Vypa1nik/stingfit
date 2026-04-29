import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessHistoryPage } from '@/features/fitness/FitnessHistoryPage'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 500))
}

async function createPplPlan() {
  await fitnessRepository.seedStarterData()
  const starter = (await fitnessRepository.listStarterPlans()).find((plan) => plan.name === 'Tlak / Ťah / Nohy')
  if (!starter) {
    throw new Error('PPL starter missing')
  }

  await fitnessRepository.createPersonalPlanFromStarter(starter.id, { name: 'My PPL Block', goal: 'Build muscle' })
}

async function finishWorkout(workoutName: string, weightKg: number) {
  const workout = (await fitnessRepository.listStartableWorkouts()).find((item) => item.workoutName === workoutName)
  if (!workout) {
    throw new Error(`${workoutName} workout missing`)
  }

  const session = await fitnessRepository.startSessionFromPlanWorkout(workout.workoutId)
  const firstSet = session.exercises[0]?.sets[0]
  if (!firstSet) {
    throw new Error(`${workoutName} first set missing`)
  }

  await fitnessRepository.logSet(firstSet.id, { weightKg, reps: 8, rir: 1 })
  await fitnessRepository.finishSession(session.id)
  return session.id
}

describe('fitness history filters', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
    await createPplPlan()
    const olderPushSessionId = await finishWorkout('Tlakový deň A', 90)
    const olderPush = await fitnessRepository.getSessionHistoryDetail(olderPushSessionId)
    await fitnessRepository.updateLoggedSet(olderPush.exercises[0]!.sets[0]!.id, { weightKg: 95, reps: 8, rir: 1 })
    await finishWorkout('Ťahový deň A', 120)
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

  test('matches workout and exercise names when the query omits Slovak accents', async () => {
    await act(async () => {
      root.render(<FitnessHistoryPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    const filterInput = container.querySelector<HTMLInputElement>('input[aria-label="Filter histórie podľa tréningu alebo cviku"]')
    expect(filterInput).toBeTruthy()

    await act(async () => {
      if (filterInput) {
        filterInput.value = 'mrtvy tah'
        filterInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })

    expect(container.querySelector('[data-testid="history-session-list"]')?.textContent).toContain('Ťahový deň A')
    expect(container.querySelector('[data-testid="history-session-list"]')?.textContent).not.toContain('Tlakový deň A')
    expect(container.querySelector('[data-testid="selected-history-session"]')?.textContent).toContain('Mŕtvy ťah')

    await act(async () => {
      if (filterInput) {
        filterInput.value = 'tlakovy den'
        filterInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })

    expect(container.querySelector('[data-testid="history-session-list"]')?.textContent).toContain('Tlakový deň A')
    expect(container.querySelector('[data-testid="history-session-list"]')?.textContent).not.toContain('Ťahový deň A')
  })

  test('clears text and correction filters with one reset control', async () => {
    await act(async () => {
      root.render(<FitnessHistoryPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    const filterInput = container.querySelector<HTMLInputElement>('input[aria-label="Filter histórie podľa tréningu alebo cviku"]')
    expect(filterInput).toBeTruthy()

    await act(async () => {
      if (filterInput) {
        filterInput.value = 'tlak'
        filterInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })

    await act(async () => {
      container.querySelector<HTMLButtonElement>('button[aria-label="Zobraziť iba tréningy s opravami"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(container.querySelector('[data-testid="history-session-list"]')?.textContent).toContain('Tlakový deň A')
    expect(container.querySelector('[data-testid="history-session-list"]')?.textContent).not.toContain('Ťahový deň A')

    await act(async () => {
      container.querySelector<HTMLButtonElement>('button[aria-label="Vymazať filter histórie"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(filterInput?.value).toBe('')
    expect(container.querySelector('[data-testid="history-session-list"]')?.textContent).toContain('Ťahový deň A')
    expect(container.querySelector('[data-testid="history-session-list"]')?.textContent).toContain('Tlakový deň A')
    expect(container.textContent).toContain('Výsledky filtra: 2')
  })

  test('filters by workout or exercise text and can show only corrected workouts', async () => {
    await act(async () => {
      root.render(<FitnessHistoryPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(container.querySelector('[data-testid="history-session-list"]')?.textContent).toContain('Ťahový deň A')
    expect(container.querySelector('[data-testid="history-session-list"]')?.textContent).toContain('Tlakový deň A')

    const filterInput = container.querySelector<HTMLInputElement>('input[aria-label="Filter histórie podľa tréningu alebo cviku"]')
    expect(filterInput).toBeTruthy()

    await act(async () => {
      if (filterInput) {
        filterInput.value = 'Tlak na lavičke'
        filterInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })

    expect(container.textContent).toContain('Výsledky filtra: 1')
    expect(container.querySelector('[data-testid="history-session-list"]')?.textContent).toContain('Tlakový deň A')
    expect(container.querySelector('[data-testid="history-session-list"]')?.textContent).not.toContain('Ťahový deň A')
    expect(container.querySelector('[data-testid="selected-history-session"]')?.textContent).toContain('Tlak na lavičke')

    await act(async () => {
      if (filterInput) {
        filterInput.value = ''
        filterInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })

    const correctedFilter = container.querySelector<HTMLButtonElement>('button[aria-label="Zobraziť iba tréningy s opravami"]')
    expect(correctedFilter).toBeTruthy()

    await act(async () => {
      correctedFilter?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(container.querySelector('[data-testid="history-session-list"]')?.textContent).toContain('Tlakový deň A')
    expect(container.querySelector('[data-testid="history-session-list"]')?.textContent).toContain('Obsahuje opravy')
    expect(container.querySelector('[data-testid="history-session-list"]')?.textContent).not.toContain('Ťahový deň A')

    await act(async () => {
      if (filterInput) {
        filterInput.value = 'nič také'
        filterInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })

    expect(container.textContent).toContain('Žiadne tréningy nezodpovedajú filtru')
  })
})
