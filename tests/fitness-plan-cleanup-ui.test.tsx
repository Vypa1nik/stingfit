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

  test('confirms and removes planned exercises, workouts, and days', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm')

    await act(async () => {
      root.render(<FitnessPlansPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Cable Fly')
    expect(container.textContent).toContain('3×12–15 · RIR 2 · 75s pauza')

    confirmSpy.mockReturnValueOnce(false)
    const cancelRemoveExerciseButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Odstrániť Cable Fly'))
    expect(cancelRemoveExerciseButton).toBeDefined()

    await act(async () => {
      cancelRemoveExerciseButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    let structure = await fitnessRepository.getPlanStructure(planId)
    expect(structure.weeks[0]?.days[0]?.workouts[0]?.exercises).toHaveLength(1)

    confirmSpy.mockReturnValueOnce(true)
    const removeExerciseButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Odstrániť Cable Fly'))
    expect(removeExerciseButton).toBeDefined()

    await act(async () => {
      removeExerciseButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Cable Fly odstránený')
    structure = await fitnessRepository.getPlanStructure(planId)
    expect(structure.weeks[0]?.days[0]?.workouts[0]?.exercises).toEqual([])

    confirmSpy.mockReturnValueOnce(true)
    const removeWorkoutButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Odstrániť tréning Chest Builder'))
    expect(removeWorkoutButton).toBeDefined()

    await act(async () => {
      removeWorkoutButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Tréning odstránený')
    structure = await fitnessRepository.getPlanStructure(planId)
    expect(structure.weeks[0]?.days[0]?.workouts).toEqual([])

    confirmSpy.mockReturnValueOnce(true)
    const removeDayButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Odstrániť deň Chest Day'))
    expect(removeDayButton).toBeDefined()

    await act(async () => {
      removeDayButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Tréningový deň odstránený')
    structure = await fitnessRepository.getPlanStructure(planId)
    expect(structure.weeks[0]?.days).toEqual([])
  })
})
