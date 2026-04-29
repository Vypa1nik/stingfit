import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { FitnessPlansPage } from '@/features/fitness/FitnessPlansPage'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 500))
}

async function createCleanupPlan() {
  await fitnessRepository.seedStarterData()
  const exercise = await fitnessRepository.createExercise({ name: 'Cable Fly', category: 'chest', defaultRestSeconds: 75 })
  const plan = await fitnessRepository.createBlankPersonalPlan({ name: 'Cleanup Block', goal: 'Fix mistakes fast' })
  const structure = await fitnessRepository.getPlanStructure(plan.id)
  const week = structure.weeks[0]
  if (!week) {
    throw new Error('Week missing')
  }

  const day = await fitnessRepository.addPlanDay(week.id, { dayIndex: 0, label: 'Chest Day' })
  const workout = await fitnessRepository.addPlanWorkout(day.id, { name: 'Chest Builder' })
  await fitnessRepository.addPlanExercise(workout.id, {
    exerciseId: exercise.id,
    targetSets: 3,
    minReps: 12,
    maxReps: 15,
    targetRir: 2,
    restSeconds: 75,
  })

  return plan
}

function findButton(container: HTMLDivElement, label: string, mode: 'exact' | 'includes' = 'includes') {
  const button = Array.from(container.querySelectorAll('button')).find((item) => {
    const text = item.textContent?.trim() ?? ''
    return mode === 'exact' ? text === label : text.includes(label)
  })
  expect(button).toBeDefined()
  return button
}

function clickButton(container: HTMLDivElement, label: string, mode: 'exact' | 'includes' = 'includes') {
  findButton(container, label, mode)?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
}

describe('FitnessPlansPage safe cleanup controls', () => {
  let container: HTMLDivElement
  let root: Root
  let planId: string

  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
    const plan = await createCleanupPlan()
    planId = plan.id
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(async () => {
    act(() => {
      root.unmount()
    })
    container.remove()
    vi.restoreAllMocks()
    await resetDatabaseState()
  })

  test('confirms and removes planned exercises, workouts, and days with custom modals', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm')

    await act(async () => {
      root.render(<FitnessPlansPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Cable Fly')
    expect(container.textContent).toContain('3×12–15 · RIR 2 · 75s pauza')

    await act(async () => {
      clickButton(container, 'Odstrániť Cable Fly')
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Odstrániť Cable Fly z tréningu?')

    await act(async () => {
      clickButton(container, 'Zrušiť', 'exact')
      await waitForAsyncUi()
    })

    let structure = await fitnessRepository.getPlanStructure(planId)
    expect(structure.weeks[0]?.days[0]?.workouts[0]?.exercises).toHaveLength(1)

    await act(async () => {
      clickButton(container, 'Odstrániť Cable Fly')
      await waitForAsyncUi()
    })

    await act(async () => {
      clickButton(container, 'Odstrániť cvik', 'exact')
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Cable Fly odstránený')
    structure = await fitnessRepository.getPlanStructure(planId)
    expect(structure.weeks[0]?.days[0]?.workouts[0]?.exercises).toEqual([])

    await act(async () => {
      clickButton(container, 'Odstrániť tréning Chest Builder')
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Odstrániť tréning Chest Builder?')

    await act(async () => {
      clickButton(container, 'Odstrániť tréning', 'exact')
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Tréning odstránený')
    structure = await fitnessRepository.getPlanStructure(planId)
    expect(structure.weeks[0]?.days[0]?.workouts).toEqual([])

    await act(async () => {
      clickButton(container, 'Odstrániť deň Chest Day')
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Odstrániť deň Chest Day?')

    await act(async () => {
      clickButton(container, 'Odstrániť deň', 'exact')
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Tréningový deň odstránený')
    structure = await fitnessRepository.getPlanStructure(planId)
    expect(structure.weeks[0]?.days).toEqual([])
    expect(confirmSpy).not.toHaveBeenCalled()
  }, 10_000)
})
